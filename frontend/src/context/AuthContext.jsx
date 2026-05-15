import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentAuthUser,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  signupWithEmail,
  subscribeToAuthChanges,
} from "../firebase/auth";
import { createOrUpdateUserProfile, getUserProfile } from "../firebase/firestore";

const AuthContext = createContext(null);

function mergeUser(authUser, profile) {
  if (!authUser) return null;

  return {
    ...authUser,
    full_name: profile?.full_name || authUser.full_name || "",
    bio: profile?.bio || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    linkedin_url: profile?.linkedin_url || "",
    github_url: profile?.github_url || "",
    portfolio_url: profile?.portfolio_url || "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setChecking(false);
        return;
      }

      const profile = await getUserProfile(firebaseUser.uid);
      const merged = mergeUser(firebaseUser, profile);
      localStorage.setItem("user", JSON.stringify(merged));
      setUser(merged);
      setChecking(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function bootstrap() {
      const current = await getCurrentAuthUser();
      if (!current) {
        setChecking(false);
        return;
      }

      const profile = await getUserProfile(current.uid);
      const merged = mergeUser(current, profile);
      localStorage.setItem("user", JSON.stringify(merged));
      setUser(merged);
      setChecking(false);
    }

    bootstrap();
  }, []);

  async function signup(payload) {
    const data = await signupWithEmail(payload);

    await createOrUpdateUserProfile(data.user.uid, {
      full_name: payload.fullName || data.user.full_name || "",
      email: data.user.email,
    });

    const profile = await getUserProfile(data.user.uid);
    const merged = mergeUser(data.user, profile);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(merged));
    setUser(merged);

    return {
      token: data.token,
      user: merged,
    };
  }

  async function login(payload) {
    const data = await loginWithEmail(payload);
    const profile = await getUserProfile(data.user.uid);
    const merged = mergeUser(data.user, profile);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(merged));
    setUser(merged);

    return {
      token: data.token,
      user: merged,
    };
  }

  async function loginGoogle() {
    const data = await loginWithGoogle();

    await createOrUpdateUserProfile(data.user.uid, {
      full_name: data.user.full_name || "",
      email: data.user.email,
      photo_url: data.user.photo_url || "",
    });

    const profile = await getUserProfile(data.user.uid);
    const merged = mergeUser(data.user, profile);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(merged));
    setUser(merged);

    return {
      token: data.token,
      user: merged,
    };
  }

  async function logout() {
    await logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  async function refreshCurrentUser() {
    const current = await getCurrentAuthUser();
    if (!current) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      return null;
    }

    const profile = await getUserProfile(current.uid);
    const merged = mergeUser(current, profile);
    localStorage.setItem("user", JSON.stringify(merged));
    setUser(merged);
    return merged;
  }

  async function updateUserProfile(profileData) {
    if (!user?.uid) {
      throw new Error("User session expired. Please login again.");
    }

    await createOrUpdateUserProfile(user.uid, profileData);
    return refreshCurrentUser();
  }

  const value = useMemo(
    () => ({
      user,
      checking,
      signup,
      login,
      loginGoogle,
      logout,
      refreshCurrentUser,
      updateUserProfile,
    }),
    [user, checking]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

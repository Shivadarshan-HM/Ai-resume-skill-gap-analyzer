import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "./config";

function mapFirebaseUser(user) {
  if (!user) return null;

  return {
    id: user.uid,
    uid: user.uid,
    email: user.email || "",
    full_name: user.displayName || "",
    email_verified: Boolean(user.emailVerified),
    photo_url: user.photoURL || "",
    provider_id: user.providerData?.[0]?.providerId || "password",
  };
}

export async function signupWithEmail({ fullName, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (fullName?.trim()) {
    await updateProfile(credential.user, { displayName: fullName.trim() });
    await credential.user.reload();
  }

  const idToken = await credential.user.getIdToken();
  return {
    token: idToken,
    user: mapFirebaseUser(auth.currentUser || credential.user),
  };
}

export async function loginWithEmail({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await credential.user.getIdToken();

  return {
    token: idToken,
    user: mapFirebaseUser(credential.user),
  };
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const idToken = await credential.user.getIdToken();

  return {
    token: idToken,
    user: mapFirebaseUser(credential.user),
  };
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getCurrentAuthUser() {
  const current = auth.currentUser;
  if (!current) return null;

  await current.reload();
  return mapFirebaseUser(auth.currentUser || current);
}

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }

    await user.reload();
    callback(mapFirebaseUser(auth.currentUser || user));
  });
}

export async function requestPasswordReset(email) {
  await sendPasswordResetEmail(auth, email);
  return {
    message: "Password reset link sent to your email.",
  };
}

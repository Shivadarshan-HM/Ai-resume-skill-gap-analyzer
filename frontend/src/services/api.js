import {
  getCurrentAuthUser,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  requestPasswordReset,
  signupWithEmail,
} from "../firebase/auth";
import {
  addChatMessage,
  createOrUpdateUserProfile,
  createResumeAnalysis,
  getChatMessages,
  getLatestResumeAnalysis,
  getUserProfile,
} from "../firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

function toUserMessage(err, fallback) {
  return err?.message || fallback;
}

function createOtp(email) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const key = `signup_otp_${email.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify({ otp, expiresAt: Date.now() + 10 * 60 * 1000 }));
  return otp;
}

function validateOtp(email, otp) {
  const key = `signup_otp_${email.toLowerCase()}`;
  const raw = localStorage.getItem(key);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw);
    const isValid = parsed.otp === otp && Date.now() <= parsed.expiresAt;
    if (isValid) {
      localStorage.removeItem(key);
    }
    return isValid;
  } catch {
    return false;
  }
}

async function ensureMergedUser(user) {
  const profile = await getUserProfile(user.uid);

  return {
    ...user,
    full_name: profile?.full_name || user.full_name || "",
    bio: profile?.bio || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    linkedin_url: profile?.linkedin_url || "",
    github_url: profile?.github_url || "",
    portfolio_url: profile?.portfolio_url || "",
  };
}

async function requireUser() {
  const user = await getCurrentAuthUser();
  if (!user) {
    throw new Error("Please login to continue.");
  }
  return user;
}

// ==================== ANALYZE ====================

export async function analyzeResume({ resume, role }) {
  try {
    const user = await requireUser();
    const analysis = await createResumeAnalysis(user.uid, {
      resumeText: resume,
      role,
      prompt: "",
      fileName: "text-input",
    });

    return analysis;
  } catch (err) {
    throw new Error(toUserMessage(err, "Analysis failed."));
  }
}

export async function analyzeResumeUpload({ file, role, prompt }) {
  try {
    const user = await requireUser();
    let resumeText = "";
    let storagePath = null;

    if (file?.type?.startsWith("text/") || file?.name?.toLowerCase().endsWith(".txt")) {
      resumeText = await file.text();
    }

    // If file is a binary (PDF/DOCX) upload it to Firebase Storage so the
    // backend AI processing can fetch and extract text server-side.
    if (file && !(file?.type?.startsWith("text/") || file?.name?.toLowerCase().endsWith(".txt"))) {
      const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}_${file.name}`);
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      await uploadBytes(storageRef, bytes, { contentType: file.type });
      storagePath = storageRef.fullPath;
    }

    const analysis = await createResumeAnalysis(user.uid, {
      resumeText,
      role,
      prompt,
      fileName: file?.name || "resume-file",
      storagePath,
    });

    return analysis;
  } catch (err) {
    throw new Error(toUserMessage(err, "Upload analysis failed."));
  }
}

export async function getLatestAnalysis() {
  try {
    const user = await requireUser();
    return getLatestResumeAnalysis(user.uid);
  } catch (err) {
    throw new Error(toUserMessage(err, "Unable to load analysis."));
  }
}

// ==================== AUTH ====================

export async function sendOtp({ email }) {
  if (!email?.trim()) {
    throw new Error("Email is required.");
  }

  const otp = createOtp(email);
  return {
    message: `OTP sent to ${email}`,
    otp,
  };
}

export async function verifyOtp({ email, otp }) {
  const valid = validateOtp(email, otp);
  if (!valid) {
    throw new Error("Invalid or expired OTP.");
  }

  return {
    verified: true,
  };
}

export async function register({ fullName, email, password, otp }) {
  try {
    if (!validateOtp(email, otp)) {
      throw new Error("Invalid or expired OTP.");
    }

    const data = await signupWithEmail({ fullName, email, password });
    await createOrUpdateUserProfile(data.user.uid, {
      full_name: fullName || data.user.full_name || "",
      email: data.user.email,
    });

    const mergedUser = await ensureMergedUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(mergedUser));

    return {
      token: data.token,
      user: mergedUser,
    };
  } catch (err) {
    throw new Error(toUserMessage(err, "Registration failed."));
  }
}

export async function login({ email, password }) {
  try {
    const data = await loginWithEmail({ email, password });
    const mergedUser = await ensureMergedUser(data.user);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(mergedUser));

    return {
      token: data.token,
      user: mergedUser,
    };
  } catch (err) {
    throw new Error(toUserMessage(err, "Login failed."));
  }
}

export async function googleAuth() {
  try {
    const data = await loginWithGoogle();
    await createOrUpdateUserProfile(data.user.uid, {
      full_name: data.user.full_name || "",
      email: data.user.email,
      photo_url: data.user.photo_url || "",
    });

    const mergedUser = await ensureMergedUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(mergedUser));

    return {
      token: data.token,
      user: mergedUser,
    };
  } catch (err) {
    throw new Error(toUserMessage(err, "Google login failed."));
  }
}

export async function getCurrentUser() {
  try {
    const user = await getCurrentAuthUser();
    if (!user) {
      throw new Error("Session expired. Please login again.");
    }

    const mergedUser = await ensureMergedUser(user);
    return { user: mergedUser };
  } catch (err) {
    throw new Error(toUserMessage(err, "Session validation failed."));
  }
}

export async function logout() {
  try {
    await logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (err) {
    throw new Error(toUserMessage(err, "Logout failed."));
  }
}

// ==================== PROFILE ====================

export async function saveProfile(profileForm) {
  try {
    const user = await requireUser();
    const saved = await createOrUpdateUserProfile(user.uid, profileForm);
    const merged = {
      ...(await ensureMergedUser(user)),
      ...saved,
    };
    localStorage.setItem("user", JSON.stringify(merged));
    return { user: merged };
  } catch (err) {
    throw new Error(toUserMessage(err, "Failed to update profile."));
  }
}

// ==================== CHAT ====================

function buildChatReply({ message, analysisData }) {
  const normalized = message.toLowerCase();
  const missing = analysisData?.missing_skills || [];
  const found = analysisData?.found_skills || [];
  const role = analysisData?.role || analysisData?.target_role || "your target role";

  if (normalized.includes("ats")) {
    return `To improve ATS score for ${role}, use role keywords in project bullets, add measurable outcomes, and keep section headings standard (Summary, Skills, Experience, Projects).`;
  }

  if (normalized.includes("missing") || normalized.includes("gap")) {
    if (!missing.length) {
      return "Great news: I do not see critical missing skills in your latest analysis. Focus on stronger impact bullets and quantified achievements.";
    }
    return `Top missing skills are ${missing.slice(0, 4).join(", ")}. Add one project bullet for each using action + tool + measurable result format.`;
  }

  if (normalized.includes("project")) {
    return `Build 2 portfolio projects for ${role}: one core implementation project and one production-style project with auth, CRUD, and deployment. Mention stack and outcomes clearly.`;
  }

  if (found.length) {
    return `You already show strengths in ${found.slice(0, 4).join(", ")}. Next step: rewrite bullets to quantify impact and include role-specific keywords from job descriptions.`;
  }

  return "Start by tailoring your summary to the target role, then align skills and project bullets with role-specific keywords for better recruiter and ATS matching.";
}

export async function chatWithAssistant({ message, analysisData }) {
  try {
    const user = await requireUser();
    await addChatMessage(user.uid, { role: "user", content: message });

    const reply = buildChatReply({ message, analysisData });
    await addChatMessage(user.uid, { role: "assistant", content: reply });

    return { reply };
  } catch (err) {
    throw new Error(toUserMessage(err, "Unable to process chat message."));
  }
}

export async function getChatHistory() {
  try {
    const user = await requireUser();
    return await getChatMessages(user.uid, 40);
  } catch (err) {
    throw new Error(toUserMessage(err, "Unable to load chat history."));
  }
}

// ==================== FORGOT PASSWORD ====================

export async function forgotPasswordSendOtp({ email }) {
  try {
    const otp = createOtp(`forgot_${email}`);
    return {
      message: "OTP generated for password reset.",
      otp,
    };
  } catch (err) {
    throw new Error(toUserMessage(err, "Failed to send reset email."));
  }
}

export async function forgotPasswordVerifyOtp({ email, otp }) {
  const valid = validateOtp(`forgot_${email}`, otp);
  if (!valid) {
    throw new Error("Invalid or expired OTP.");
  }

  return {
    reset_token: "firebase-email-reset",
  };
}

export async function resetPassword({ email }) {
  try {
    await requestPasswordReset(email);
    return {
      success: true,
      message: "Use the reset link sent to your email to complete password update.",
    };
  } catch (err) {
    throw new Error(toUserMessage(err, "Password reset failed."));
  }
}

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://ai-resume-skill-gap-analyzer-axsq.onrender.com";

function getToken() {
  return localStorage.getItem("token");
}

// ==================== ANALYZE ====================

// Text analyze
export async function analyzeResume({ resume, role }) {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ resume, role }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Analysis failed.");
  return data;
}

// File upload analyze
export async function analyzeResumeUpload({ file, role, prompt }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("role", role);
  if (prompt) formData.append("prompt", prompt);

  const res = await fetch(`${BASE_URL}/analyze-resume`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload analysis failed.");
  return data;
}

// ==================== AUTH ====================

// Register
export async function register({ fullName, email, password, otp }) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
      otp,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed.");
  return data;
}

// Send OTP (signup)
export async function sendOtp({ email }) {
  const res = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "OTP send failed.");
  return data;
}

// Login
export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed.");
  return data;
}

// Verify OTP (signup)
export async function verifyOtp({ email, otp }) {
  const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "OTP verification failed.");
  return data;
}

// ==================== FORGOT PASSWORD ====================

// Send OTP
export async function forgotPasswordSendOtp({ email }) {
  const res = await fetch(`${BASE_URL}/auth/forgot-password/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send OTP.");
  return data;
}

// Verify OTP
export async function forgotPasswordVerifyOtp({ email, otp }) {
  const res = await fetch(`${BASE_URL}/auth/forgot-password/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "OTP verification failed.");
  return data;
}

// Reset Password
export async function resetPassword({ email, resetToken, newPassword }) {
  const res = await fetch(`${BASE_URL}/auth/forgot-password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      reset_token: resetToken,
      new_password: newPassword,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Password reset failed.");
  return data;
}
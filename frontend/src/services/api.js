const BASE_URL = "http://127.0.0.1:5000";

function getToken() {
  return localStorage.getItem("token");
}

// Resume text analyze karo (text wala)
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

// Resume file upload karke analyze karo
export async function analyzeResumeUpload({ file, role, prompt }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("role", role);
  if (prompt) formData.append("prompt", prompt);

  const res = await fetch(`${BASE_URL}/analyze-resume`, {  // ← fixed: was /analyze-upload
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

// Register
export async function register({ fullName, email, password }) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed.");
  return data;
}

// Send OTP
export async function sendOtp({ email }) {
  const res = await fetch(`${BASE_URL}/send-otp`, {
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
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed.");
  return data;
}

// Verify OTP
export async function verifyOtp({ email, otp }) {
  const res = await fetch(`${BASE_URL}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "OTP verification failed.");
  return data;
}

// Forgot Password - Send OTP
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

// Forgot Password - Verify OTP
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

// Forgot Password - Reset
export async function resetPassword({ email, resetToken, newPassword }) {
  const res = await fetch(`${BASE_URL}/auth/forgot-password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, reset_token: resetToken, new_password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Password reset failed.");
  return data;
}

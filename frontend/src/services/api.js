const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://ai-resume-skill-gap-analyzer-axsq.onrender.com";

function getToken() {
  return localStorage.getItem("token");
}

async function parseResponse(res, fallbackError) {
  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error || fallbackError);
  }

  if (!data) {
    throw new Error("Invalid server response.");
  }

  return data;
}

function toFriendlyNetworkError(err) {
  const msg = (err && err.message ? err.message : "").toLowerCase();
  if (msg.includes("failed to fetch") || msg.includes("networkerror")) {
    return "Unable to reach server. Check API URL, backend health, and CORS origins.";
  }
  return err?.message || "Request failed.";
}

async function safeFetch(url, options, fallbackError) {
  try {
    const res = await fetch(url, options);
    return await parseResponse(res, fallbackError);
  } catch (err) {
    throw new Error(toFriendlyNetworkError(err));
  }
}

// ==================== ANALYZE ====================

// Text analyze
export async function analyzeResume({ resume, role }) {
  return safeFetch(
    `${BASE_URL}/analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ resume, role }),
    },
    "Analysis failed."
  );
}

// File upload analyze
export async function analyzeResumeUpload({ file, role, prompt }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("role", role);
  if (prompt) formData.append("prompt", prompt);

  return safeFetch(
    `${BASE_URL}/analyze-resume`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    },
    "Upload analysis failed."
  );
}

// ==================== AUTH ====================

// Register
export async function register({ fullName, email, password, otp }) {
  return safeFetch(
    `${BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        otp,
      }),
    },
    "Registration failed."
  );
}

// Send OTP (signup)
export async function sendOtp({ email }) {
  return safeFetch(
    `${BASE_URL}/auth/send-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
    "OTP send failed."
  );
}

// Login
export async function login({ email, password }) {
  return safeFetch(
    `${BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    "Login failed."
  );
}

// Verify OTP (signup)
export async function verifyOtp({ email, otp }) {
  return safeFetch(
    `${BASE_URL}/auth/verify-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    },
    "OTP verification failed."
  );
}

export async function googleAuth(payload) {
  return safeFetch(
    `${BASE_URL}/auth/google`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Google login failed."
  );
}

export async function getCurrentUser() {
  return safeFetch(
    `${BASE_URL}/auth/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
    "Session validation failed."
  );
}

// ==================== FORGOT PASSWORD ====================

// Send OTP
export async function forgotPasswordSendOtp({ email }) {
  return safeFetch(
    `${BASE_URL}/auth/forgot-password/send-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
    "Failed to send OTP."
  );
}

// Verify OTP
export async function forgotPasswordVerifyOtp({ email, otp }) {
  return safeFetch(
    `${BASE_URL}/auth/forgot-password/verify-otp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    },
    "OTP verification failed."
  );
}

// Reset Password
export async function resetPassword({ email, resetToken, newPassword }) {
  return safeFetch(
    `${BASE_URL}/auth/forgot-password/reset`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        reset_token: resetToken,
        new_password: newPassword,
      }),
    },
    "Password reset failed."
  );
}

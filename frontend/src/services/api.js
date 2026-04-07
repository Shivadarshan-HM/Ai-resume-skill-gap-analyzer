const BASE_URL = "http://127.0.0.1:5001";

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

  const res = await fetch(`${BASE_URL}/analyze-upload`, {
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

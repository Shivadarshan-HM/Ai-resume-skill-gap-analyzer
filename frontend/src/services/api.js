const API_URL = "http://127.0.0.1:5000/analyze";
const ANALYZE_UPLOAD_URL = "http://127.0.0.1:5000/analyze-resume";

export async function analyzeResume(payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Failed to analyze resume.");
  }

  return response.json();
}

export async function analyzeResumeUpload({ file, prompt, role }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("prompt", prompt || "");
  formData.append("role", role || "");

  const response = await fetch(ANALYZE_UPLOAD_URL, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Failed to analyze uploaded resume.");
  }

  return response.json();
}

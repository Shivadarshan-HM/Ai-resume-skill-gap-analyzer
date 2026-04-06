const API_URL = "http://127.0.0.1:5000/analyze";

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

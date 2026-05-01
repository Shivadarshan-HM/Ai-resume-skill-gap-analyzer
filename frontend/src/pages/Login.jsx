import React, { useState } from "react";

// 🔥 Use your live backend URL directly (no localhost fallback)
const API_URL = "https://ai-resume-skill-gap-analyzer-axsq.onrender.com";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= LOGIN =================
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      console.log("🚀 Calling:", `${API_URL}/auth/login`);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("✅ Response:", data);

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Save auth
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Login successful!");

      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(data.user);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Server not reachable.");
    } finally {
      setLoading(false);
    }
  }

  // ================= UI =================
  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2>Login</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  card: {
    padding: 20,
    border: "1px solid #ddd",
    borderRadius: 10,
    width: 300,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  button: {
    padding: 10,
    borderRadius: 6,
    background: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};
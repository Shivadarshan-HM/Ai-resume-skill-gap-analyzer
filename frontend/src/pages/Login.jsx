import { useState } from "react";
import { motion } from "framer-motion";

const API_URL = "http://127.0.0.1:5000";

function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (isRegister && !fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const body = isRegister
        ? { full_name: fullName, email, password }
        : { email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      // JWT token aur user localStorage mein save karo
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess(isRegister ? "Account created! Redirecting..." : "Login successful! Redirecting...");

      // Dashboard pe redirect karo
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(data.user);
      }, 1000);

    } catch {
      setError("Unable to connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7fbff_0%,#eef3f8_40%,#e6f2ff_100%)] px-4 py-6 sm:px-8 sm:py-10">
      <motion.div
        className="pointer-events-none fixed -left-14 top-24 h-44 w-44 rounded-full bg-blue-200/45 blur-3xl"
        animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none fixed right-8 top-1/3 h-52 w-52 rounded-full bg-cyan-200/35 blur-3xl"
        animate={{ y: [0, 12, 0], x: [0, -10, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      <motion.section
        className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-xl backdrop-blur-sm transition duration-300 hover:shadow-2xl lg:grid-cols-2"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative flex flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-7 sm:p-10 lg:p-12">
          <button
            type="button"
            className="w-fit rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-gray-50"
          >
            AI Analyzer
          </button>

          <div className="mx-auto mt-10 w-full max-w-[380px] lg:mt-16">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
              {isRegister ? "Create an account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isRegister ? "Sign up and get started" : "Sign in to your account"}
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {isRegister && (
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">Full Name</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aditya Sharma"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition duration-300 focus:ring-2 focus:ring-blue-400"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-500">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aditya@gmail.com"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition duration-300 focus:ring-2 focus:ring-blue-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-500">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="**************"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition duration-300 focus:ring-2 focus:ring-blue-400"
                />
              </label>

              {error && (
                <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {success}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md transition duration-300 disabled:opacity-70"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
              </motion.button>
            </form>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 lg:mt-auto">
            <p>
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(""); setSuccess(""); }}
                className="font-semibold text-slate-700 underline underline-offset-2"
              >
                {isRegister ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>

        <motion.div
          className="relative hidden p-4 lg:block"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
        >
          <motion.div
            className="relative h-full overflow-hidden rounded-3xl"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/15 via-transparent to-slate-900/25" />
            <div className="absolute left-6 top-6 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-slate-800 shadow-xl backdrop-blur-md">
              <p className="text-sm font-semibold">Resume Screening Sprint</p>
              <p className="mt-1 text-xs text-slate-600">09:30 AM - 10:00 AM</p>
            </div>
            <div className="absolute right-7 top-1/3 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-xl backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">Top Matches</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">89%</p>
            </div>
            <div className="absolute bottom-8 left-8 rounded-2xl border border-white/40 bg-white/75 px-5 py-4 text-slate-800 shadow-xl backdrop-blur-md">
              <p className="text-sm font-semibold">AI Resume Insights</p>
              <p className="mt-1 text-xs text-slate-600">Skill coverage and role-fit summary</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
    </main>
  );
}

export default Login;

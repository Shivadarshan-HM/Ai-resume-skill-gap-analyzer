import { useState } from "react";
import { motion } from "framer-motion";

const API_URL = "http://127.0.0.1:5000";

// mode: "login" | "register" | "forgot"
// step: 1 = form, 2 = otp, 3 = new password (only for forgot)

function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function reset(newMode) {
    setMode(newMode);
    setStep(1);
    setError("");
    setSuccess("");
    setOtp("");
    setFullName("");
    setEmail("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setResetToken("");
  }

  // ── REGISTER ──────────────────────────────────────────
  async function handleSendOtp(event) {
    event.preventDefault();
    setError("");
    if (!fullName.trim() || !email.trim() || !password.trim()) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send OTP."); return; }
      setSuccess(`OTP sent to ${email}! Check your inbox.`);
      setStep(2);
    } catch { setError("Unable to connect to server."); } finally { setLoading(false); }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    if (!otp.trim()) { setError("Please enter the OTP."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: fullName, email, password, otp }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Account created! Redirecting...");
      setTimeout(() => { if (onLoginSuccess) onLoginSuccess(data.user); }, 1000);
    } catch { setError("Unable to connect to server."); } finally { setLoading(false); }
  }

  // ── LOGIN ──────────────────────────────────────────────
  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError("Email and password are required."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => { if (onLoginSuccess) onLoginSuccess(data.user); }, 1000);
    } catch { setError("Unable to connect to server."); } finally { setLoading(false); }
  }

  // ── FORGOT PASSWORD ────────────────────────────────────
  async function handleForgotSendOtp(event) {
    event.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/send-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send OTP."); return; }
      setSuccess(`OTP sent to ${email}! Check your inbox.`);
      setStep(2);
    } catch { setError("Unable to connect to server."); } finally { setLoading(false); }
  }

  async function handleForgotVerifyOtp(event) {
    event.preventDefault();
    setError("");
    if (!otp.trim()) { setError("Please enter the OTP."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid OTP."); return; }
      setResetToken(data.reset_token);
      setSuccess("OTP verified! Set your new password.");
      setStep(3);
    } catch { setError("Unable to connect to server."); } finally { setLoading(false); }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setError("");
    if (!newPassword.trim()) { setError("Password is required."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/reset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, reset_token: resetToken, new_password: newPassword }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Password reset failed."); return; }
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => reset("login"), 1500);
    } catch { setError("Unable to connect to server."); } finally { setLoading(false); }
  }

  // ── TITLE & SUBTITLE ──────────────────────────────────
  const title = {
    login: "Welcome back",
    register: step === 1 ? "Create an account" : "Verify your email",
    forgot: step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "Set New Password"
  }[mode];

  const subtitle = {
    login: "Sign in to your account",
    register: step === 1 ? "Sign up and get started" : `OTP sent to ${email}`,
    forgot: step === 1 ? "Enter your email to receive OTP" : step === 2 ? `OTP sent to ${email}` : "Enter your new password"
  }[mode];

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7fbff_0%,#eef3f8_40%,#e6f2ff_100%)] px-4 py-6 sm:px-8 sm:py-10">
      <motion.div className="pointer-events-none fixed -left-14 top-24 h-44 w-44 rounded-full bg-blue-200/45 blur-3xl" animate={{ y: [0, -14, 0] }} transition={{ duration: 11, repeat: Infinity }} />
      <motion.div className="pointer-events-none fixed right-8 top-1/3 h-52 w-52 rounded-full bg-cyan-200/35 blur-3xl" animate={{ y: [0, 12, 0] }} transition={{ duration: 13, repeat: Infinity }} />

      <motion.section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-xl backdrop-blur-sm lg:grid-cols-2" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="relative flex flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-7 sm:p-10 lg:p-12">
          <button type="button" className="w-fit rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">AI Analyzer</button>

          <div className="mx-auto mt-10 w-full max-w-[380px] lg:mt-16">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>

            {/* ── LOGIN FORM ── */}
            {mode === "login" && (
              <form className="mt-8 space-y-4" onSubmit={handleLogin}>
                <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@gmail.com" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400" /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Password</span>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400" /></label>
                <div className="text-right">
                  <button type="button" onClick={() => reset("forgot")} className="text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800">Forgot Password?</button>
                </div>
                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
                <motion.button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md disabled:opacity-70" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {loading ? "Please wait..." : "Sign in"}
                </motion.button>
              </form>
            )}

            {/* ── REGISTER STEP 1 ── */}
            {mode === "register" && step === 1 && (
              <form className="mt-8 space-y-4" onSubmit={handleSendOtp}>
                <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Full Name</span>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your Name" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400" /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@gmail.com" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400" /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Password</span>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400" /></label>
                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                <motion.button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md disabled:opacity-70" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </motion.button>
              </form>
            )}

            {/* ── REGISTER STEP 2 ── */}
            {mode === "register" && step === 2 && (
              <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
                <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Enter 6-digit OTP</span>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="_ _ _ _ _ _" maxLength={6} className="h-14 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-center text-2xl font-bold tracking-[0.5em] text-slate-700 outline-none focus:ring-2 focus:ring-blue-400" /></label>
                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                <motion.button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md disabled:opacity-70" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </motion.button>
                <button type="button" onClick={() => { setStep(1); setError(""); setSuccess(""); }} className="w-full text-center text-sm text-slate-500 underline">Back</button>
              </form>
            )}

            {/* ── FORGOT STEP 1: EMAIL ── */}
            {mode === "forgot" && step === 1 && (
              <form className="mt-8 space-y-4" onSubmit={handleForgotSendOtp}>
                <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Registered Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@gmail.com" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400" /></label>
                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                <motion.button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md disabled:opacity-70" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </motion.button>
                <button type="button" onClick={() => reset("login")} className="w-full text-center text-sm text-slate-500 underline">Back to Login</button>
              </form>
            )}

            {/* ── FORGOT STEP 2: OTP ── */}
            {mode === "forgot" && step === 2 && (
              <form className="mt-8 space-y-4" onSubmit={handleForgotVerifyOtp}>
                {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
                <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Enter 6-digit OTP</span>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="_ _ _ _ _ _" maxLength={6} className="h-14 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-center text-2xl font-bold tracking-[0.5em] text-slate-700 outline-none focus:ring-2 focus:ring-blue-400" /></label>
                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                <motion.button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md disabled:opacity-70" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </motion.button>
                <button type="button" onClick={() => { setStep(1); setError(""); setSuccess(""); }} className="w-full text-center text-sm text-slate-500 underline">Back</button>
              </form>
            )}

            {/* ── FORGOT STEP 3: NEW PASSWORD ── */}
            {mode === "forgot" && step === 3 && (
              <form className="mt-8 space-y-4" onSubmit={handleResetPassword}>
                {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
                <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">New Password</span>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400" /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Confirm Password</span>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400" /></label>
                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                <motion.button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md disabled:opacity-70" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {loading ? "Resetting..." : "Reset Password"}
                </motion.button>
              </form>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 lg:mt-auto">
            {mode !== "forgot" && (
              <p>{mode === "register" ? "Already have an account?" : "Don't have an account?"}{" "}
                <button type="button" onClick={() => reset(mode === "register" ? "login" : "register")} className="font-semibold text-slate-700 underline underline-offset-2">
                  {mode === "register" ? "Sign in" : "Sign up"}
                </button>
              </p>
            )}
          </div>
        </div>

        <motion.div className="relative hidden p-4 lg:block" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}>
          <div className="relative h-full overflow-hidden rounded-3xl" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center" }}>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/15 via-transparent to-slate-900/25" />
            <div className="absolute left-6 top-6 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-xl backdrop-blur-md">
              <p className="text-sm font-semibold text-slate-800">Resume Screening Sprint</p>
              <p className="mt-1 text-xs text-slate-600">09:30 AM - 10:00 AM</p>
            </div>
            <div className="absolute right-7 top-1/3 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-xl backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">Top Matches</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">89%</p>
            </div>
            <div className="absolute bottom-8 left-8 rounded-2xl border border-white/40 bg-white/75 px-5 py-4 shadow-xl backdrop-blur-md">
              <p className="text-sm font-semibold text-slate-800">AI Resume Insights</p>
              <p className="mt-1 text-xs text-slate-600">Skill coverage and role-fit summary</p>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}

export default Login;

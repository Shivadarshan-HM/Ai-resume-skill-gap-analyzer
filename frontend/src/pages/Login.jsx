import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

const TRUST_POINTS = [
  "OTP-secured signup",
  "Resume-role AI insights",
  "ATS-friendly guidance"
];

function loadGoogleScript(callback) {
  if (window.google) { callback(); return; }
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.body.appendChild(script);
}

function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(true);
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadGoogleScript(() => {
      window.google?.accounts?.id?.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
    });
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const mode = (query.get("mode") || "").toLowerCase();
    if (mode === "signin") { setIsRegister(false); setStep(1); setError(""); setSuccess(""); setOtp(""); return; }
    if (mode === "signup") { setIsRegister(true); setStep(1); setError(""); setSuccess(""); setOtp(""); }
  }, [location.search]);

  async function handleGoogleResponse(response) {
    setOauthLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Google login failed."); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Google login successful! Redirecting...");
      setTimeout(() => { if (onLoginSuccess) onLoginSuccess(data.user); }, 800);
    } catch { setError("Unable to connect to server."); }
    finally { setOauthLoading(false); }
  }

  function handleGoogleClick() {
    if (!GOOGLE_CLIENT_ID) { setError("Google Client ID not configured."); return; }
    window.google?.accounts?.id?.prompt();
  }

  async function handleSendOtp(event) {
    event.preventDefault(); setError("");
    if (!fullName.trim() || !email.trim() || !password.trim()) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send OTP."); return; }
      setSuccess(`OTP sent to ${email}! Check your inbox.`); setStep(2);
    } catch { setError("Unable to connect to server."); } finally { setLoading(false); }
  }

  async function handleRegister(event) {
    event.preventDefault(); setError("");
    if (!otp.trim()) { setError("Please enter the OTP."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: fullName, email, password, otp }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); return; }
      localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Account created! Redirecting...");
      setTimeout(() => { if (onLoginSuccess) onLoginSuccess(data.user); }, 1000);
    } catch { setError("Unable to connect to server."); } finally { setLoading(false); }
  }

  async function handleLogin(event) {
    event.preventDefault(); setError("");
    if (!email.trim() || !password.trim()) { setError("Email and password are required."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); return; }
      localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => { if (onLoginSuccess) onLoginSuccess(data.user); }, 1000);
    } catch { setError("Unable to connect to server."); } finally { setLoading(false); }
  }

  function switchMode() { setIsRegister(!isRegister); setStep(1); setError(""); setSuccess(""); setOtp(""); }

  const GoogleButton = () => (
    <div className="mt-6 space-y-3">
      <div className="relative flex items-center">
        <div className="flex-1 border-t border-slate-200" />
        <span className="mx-3 text-xs text-slate-400">or continue with</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>
      <motion.button
        type="button"
        onClick={handleGoogleClick}
        disabled={oauthLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
      >
        {oauthLoading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        Continue with Google
      </motion.button>
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_8%,#cbeeff_0%,transparent_30%),radial-gradient(circle_at_82%_12%,#daf2ff_0%,transparent_34%),linear-gradient(145deg,#f9fcff_0%,#edf6fc_42%,#e9f6ff_100%)] px-4 py-6 sm:px-8 sm:py-10">
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-slate-200/60">
        <div className="h-full w-full bg-gradient-to-r from-sky-500 to-cyan-500" />
      </div>

      <motion.div className="pointer-events-none fixed -left-14 top-24 h-44 w-44 rounded-full bg-blue-200/45 blur-3xl" animate={{ y: [0, -14, 0] }} transition={{ duration: 11, repeat: Infinity }} />
      <motion.div className="pointer-events-none fixed right-8 top-1/3 h-52 w-52 rounded-full bg-cyan-200/35 blur-3xl" animate={{ y: [0, 12, 0] }} transition={{ duration: 13, repeat: Infinity }} />

      <motion.section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 shadow-xl backdrop-blur-sm lg:grid-cols-[1.05fr_1fr]" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="relative flex flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-7 sm:p-10 lg:p-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <img src="/cvisionary-logo.svg" alt="CVisionary" className="h-8 w-8 rounded-full object-cover" />
              <span className="text-sm font-semibold text-slate-700">CVisionary</span>
            </div>
            <Link to="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-200 hover:text-sky-700">Back to Home</Link>
          </div>

          <div className="mt-8 rounded-2xl border border-sky-100 bg-[linear-gradient(110deg,#ffffff_0%,#f3fbff_55%,#ecf8ff_100%)] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-sky-700">Secure Access</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TRUST_POINTS.map((item) => (
                <span key={item} className="rounded-full border border-sky-100 bg-white px-3 py-1 text-xs font-medium text-slate-700">{item}</span>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-8 w-full max-w-[390px] lg:mt-12">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
              {isRegister ? (step === 1 ? "Create an account" : "Verify your email") : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isRegister ? (step === 1 ? "Sign up and get started" : `OTP sent to ${email}`) : "Sign in to your account"}
            </p>

            {isRegister && step === 1 && (
              <>
                <form className="mt-8 space-y-4" onSubmit={handleSendOtp}>
                  <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Full Name</span>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="User Name" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
                  <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Email</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@gmail.com" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
                  <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Password</span>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
                  {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                  <motion.button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-sm font-semibold text-white shadow-md shadow-cyan-200 disabled:opacity-70" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </motion.button>
                </form>
                <GoogleButton />
              </>
            )}

            {isRegister && step === 2 && (
              <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
                <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Enter 6-digit OTP</span>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="_ _ _ _ _ _" maxLength={6} className="h-14 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-center text-2xl font-bold tracking-[0.5em] text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                <motion.button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-sm font-semibold text-white shadow-md shadow-cyan-200 disabled:opacity-70" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </motion.button>
                <button type="button" onClick={() => { setStep(1); setError(""); setSuccess(""); }} className="w-full text-center text-sm text-slate-500 underline">Back</button>
              </form>
            )}

            {!isRegister && (
              <>
                <form className="mt-8 space-y-4" onSubmit={handleLogin}>
                  <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Email</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@gmail.com" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
                  <label className="block"><span className="mb-2 block text-xs font-medium text-slate-500">Password</span>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
                  {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                  {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
                  <motion.button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-sm font-semibold text-white shadow-md shadow-cyan-200 disabled:opacity-70" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {loading ? "Please wait..." : "Sign in"}
                  </motion.button>
                  <p className="text-right text-sm text-slate-500">
                    <Link to="/forgot-password" className="font-medium text-sky-700 underline underline-offset-2">Forgot Password?</Link>
                  </p>
                </form>
                <GoogleButton />
              </>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 lg:mt-auto">
            <p>{isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button type="button" onClick={switchMode} className="font-semibold text-slate-700 underline underline-offset-2">{isRegister ? "Sign in" : "Sign up"}</button>
            </p>
          </div>
        </div>

        <motion.div className="relative hidden p-4 lg:block" animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }}>
          <div className="relative h-full overflow-hidden rounded-3xl bg-[linear-gradient(150deg,#0b1220_0%,#0a3f63_58%,#0891b2_100%)] p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Premium Workspace</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">Career momentum starts here</h3>
            <p className="mt-3 text-sm leading-6 text-cyan-50/90">Use smart analysis and guided recommendations to build a recruiter-ready profile.</p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-white/25 bg-white/10 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.12em] text-cyan-100">Profile Confidence</p>
                <p className="mt-1 text-2xl font-semibold">89%</p>
              </div>
              <div className="rounded-2xl border border-white/25 bg-white/10 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.12em] text-cyan-100">Missing Skills Focus</p>
                <p className="mt-1 text-sm text-cyan-50">System Design, AWS, Testing Strategy</p>
              </div>
              <div className="rounded-2xl border border-white/25 bg-white/10 p-4 text-white">
                <p className="text-xs uppercase tracking-[0.12em] text-cyan-100">Next Action</p>
                <p className="mt-1 text-sm text-cyan-50">Create one impact-focused project bullet today.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </main>
  );
}

export default Login;

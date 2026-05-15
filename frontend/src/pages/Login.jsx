import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { googleAuth, login, register, sendOtp } from "../services/api";

const TRUST_POINTS = [
  "OTP-secured signup",
  "AI resume-role matching",
  "ATS-friendly optimization guidance",
];

function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(true);
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const mode = (query.get("mode") || "").toLowerCase();

    if (mode === "signin") {
      setIsRegister(false);
      setStep(1);
      setError("");
      setSuccess("");
      setOtp("");
      return;
    }

    if (mode === "signup") {
      setIsRegister(true);
      setStep(1);
      setError("");
      setSuccess("");
      setOtp("");
    }
  }, [location.search]);

  async function handleGoogleClick() {
    setOauthLoading(true);
    setError("");

    try {
      const data = await googleAuth();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Google login successful! Redirecting...");
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(data.user);
      }, 800);
    } catch (err) {
      setError(err.message || "Unable to connect to server.");
    } finally {
      setOauthLoading(false);
    }
  }

  async function handleSendOtp(event) {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const data = await sendOtp({ email });
      const otpHint = data?.otp ? ` OTP: ${data.otp}` : "";
      setSuccess(`OTP sent to ${email}! Check your inbox.${otpHint}`);
      setStep(2);
    } catch (err) {
      setError(err.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const data = await register({ fullName, email, password, otp });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Account created! Redirecting...");
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(data.user);
      }, 1000);
    } catch (err) {
      setError(err.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const data = await login({ email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(data.user);
      }, 1000);
    } catch (err) {
      setError(err.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsRegister(!isRegister);
    setStep(1);
    setError("");
    setSuccess("");
    setOtp("");
    setPassword("");
  }

  const isSignIn = !isRegister;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_14%_16%,#d7f5ff_0%,transparent_34%),radial-gradient(circle_at_82%_8%,#d9f4e8_0%,transparent_38%),linear-gradient(140deg,#f8fcff_0%,#ecf5fa_44%,#e6f1ff_100%)] px-4 py-8 sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute -left-14 top-16 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute right-4 top-1/4 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_30px_80px_rgba(8,47,73,0.17)] backdrop-blur-xl lg:grid-cols-[1fr_1.1fr]"
      >
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 p-10 text-white lg:block">
          <div className="absolute -right-16 -top-10 h-52 w-52 rounded-full border border-cyan-300/30" />
          <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="CVisionary" className="h-12 w-12 rounded-2xl border border-white/20 object-cover" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/85">CVisionary</p>
                <h2 className="text-2xl font-semibold">Career Intelligence Hub</h2>
              </div>
            </div>

            <p className="mt-10 max-w-sm text-sm leading-6 text-slate-200">
              Build stronger resumes, uncover real skill gaps, and align your profile with the exact job outcomes you want.
            </p>

            <ul className="mt-8 space-y-3">
              {TRUST_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm">
                  <span className="inline-block h-2 w-2 rounded-full bg-cyan-300" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-auto rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.17em] text-cyan-200/80">Why teams choose CVisionary</p>
              <p className="mt-2 text-sm text-slate-200">Premium AI insights with practical action steps you can apply today.</p>
            </div>
          </div>
        </aside>

        <div className="p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h1 className="text-3xl font-semibold text-slate-900">
                {isSignIn ? "Welcome back" : step === 1 ? "Create account" : "Verify your email"}
              </h1>
              <button
                type="button"
                onClick={switchMode}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700"
              >
                {isSignIn ? "Sign Up" : "Sign In"}
              </button>
            </div>

            <p className="mb-6 text-sm text-slate-500">
              {isSignIn
                ? "Continue your AI-guided resume journey."
                : step === 1
                  ? "Create a secure account and get personalized role-match insights."
                  : `We sent an OTP to ${email}.`}
            </p>

            {isSignIn ? (
              <form className="space-y-4" onSubmit={handleLogin}>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Password</span>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-14 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                <div className="flex items-center justify-end">
                  <Link to="/forgot-password" className="text-sm font-medium text-cyan-700 hover:text-cyan-800">
                    Forgot password?
                  </Link>
                </div>

                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-700 to-sky-500 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:opacity-95 disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <div className="relative py-1">
                  <div className="h-px w-full bg-slate-200" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs uppercase tracking-[0.12em] text-slate-400">
                    or
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={oauthLoading}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-cyan-300 disabled:opacity-70"
                >
                  <span className="text-base">G</span>
                  {oauthLoading ? "Connecting..." : "Continue with Google"}
                </button>
              </form>
            ) : step === 1 ? (
              <form className="space-y-4" onSubmit={handleSendOtp}>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Full Name</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Password</span>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-14 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-700 to-sky-500 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:opacity-95 disabled:opacity-70"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleRegister}>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">One-Time Password</span>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="_ _ _ _ _ _"
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-center text-2xl font-semibold tracking-[0.45em] text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </label>

                {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
                {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-700 to-sky-500 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:opacity-95 disabled:opacity-70"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700"
                >
                  Edit details
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.section>
    </main>
  );
}

export default Login;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
  resetPassword,
} from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSendOtp(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordSendOtp({ email });
      setSuccess("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("Please enter OTP.");
      return;
    }

    setLoading(true);
    try {
      const data = await forgotPasswordVerifyOtp({ email, otp });
      setResetToken(data.reset_token || "");
      setSuccess("OTP verified. Set your new password.");
      setStep(3);
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, resetToken, newPassword });
      setSuccess("Password reset successfully. Redirecting to sign in...");
      setTimeout(() => navigate("/login?mode=signin"), 1200);
    } catch (err) {
      setError(err.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_8%,#cbeeff_0%,transparent_30%),radial-gradient(circle_at_82%_12%,#daf2ff_0%,transparent_34%),linear-gradient(145deg,#f9fcff_0%,#edf6fc_42%,#e9f6ff_100%)] px-4 py-6 sm:px-8 sm:py-10">
      <motion.section
        className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-xl backdrop-blur-sm sm:p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/cvisionary-logo.svg" alt="CVisionary" className="h-10 w-10 rounded-2xl object-cover shadow-sm" />
            <h1 className="text-3xl font-semibold text-slate-900">Recover Password</h1>
          </div>
          <Link to="/login?mode=signin" className="text-sm font-medium text-sky-700 underline underline-offset-2">
            Back to Sign In
          </Link>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          {step === 1 && "Enter your registered email to receive OTP."}
          {step === 2 && `Enter the OTP sent to ${email}.`}
          {step === 3 && "Set a new password for your account."}
        </p>

        {step === 1 && (
          <form className="mt-8 space-y-4" onSubmit={handleSendOtp}>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-500">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gmail.com"
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400"
              />
            </label>
            {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-sm font-semibold text-white shadow-md shadow-cyan-200 disabled:opacity-70"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-4" onSubmit={handleVerifyOtp}>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-500">Enter OTP</span>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="_ _ _ _ _ _"
                className="h-14 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-center text-2xl font-bold tracking-[0.5em] text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400"
              />
            </label>
            {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-sm font-semibold text-white shadow-md shadow-cyan-200 disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
                setSuccess("");
              }}
              className="w-full text-center text-sm text-slate-500 underline"
            >
              Change email
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="mt-8 space-y-4" onSubmit={handleResetPassword}>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-500">New Password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-500">Confirm New Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400"
              />
            </label>
            {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}
            <button
              type="submit"
              disabled={loading || !resetToken}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-sm font-semibold text-white shadow-md shadow-cyan-200 disabled:opacity-70"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </motion.section>
    </main>
  );
}

export default ForgotPassword;
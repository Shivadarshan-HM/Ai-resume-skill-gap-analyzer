import { useState } from "react";
import { motion } from "framer-motion";
import { analyzeResumeUpload } from "../services/api";

function ResumeAnalyzer({ roles, onAnalysisComplete, onLoadingChange }) {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!file) {
      onAnalysisComplete?.(null);
      setError("Please upload a resume file before analyzing.");
      return;
    }

    if (!role) {
      onAnalysisComplete?.(null);
      setError("Please select a target role.");
      return;
    }

    setLoading(true);
    onLoadingChange?.(true);

    try {
      const data = await analyzeResumeUpload({ file, prompt, role });
      onAnalysisComplete?.(data);
    } catch (apiError) {
      onAnalysisComplete?.(null);
      setError(apiError.message || "Unable to analyze the uploaded resume.");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }

  return (
    <motion.section
      className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-sm lg:p-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
    >
      <h3 className="text-lg font-semibold text-slate-900">Resume Upload + AI Analysis</h3>
      <p className="mt-1 text-sm text-slate-500">
        Upload your resume and ask AI for focused career feedback.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Resume File</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-700 shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Target Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-700 outline-none transition duration-300 focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Choose a role</option>
            {roles.map((roleName) => (
              <option key={roleName} value={roleName}>
                {roleName}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Prompt</span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask AI about your resume..."
            rows={4}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-700 outline-none transition duration-300 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400"
          />
        </label>

        <motion.button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md transition duration-300 disabled:cursor-not-allowed disabled:opacity-70"
          whileHover={{ scale: 1.03, boxShadow: "0 14px 28px rgba(37, 99, 235, 0.32)" }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? "Analyzing..." : "Analyze Uploaded Resume"}
        </motion.button>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}
      </form>

      {loading ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          Generating AI analysis...
        </div>
      ) : null}
    </motion.section>
  );
}

export default ResumeAnalyzer;

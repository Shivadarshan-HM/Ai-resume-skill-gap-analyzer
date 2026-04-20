import { useState } from "react";
import { motion } from "framer-motion";
import { analyzeResumeUpload } from "../services/api";

function toSuggestionText(item) {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "";

  const skill = item.skill ? `${item.skill}: ` : "";
  const how = item.how_to_learn || item.tip || "Improve this area with focused practice.";
  const priority = item.priority ? ` (Priority: ${item.priority})` : "";
  return `${skill}${how}${priority}`.trim();
}

function ResumeAnalyzer({ roles, onAnalysisComplete, onLoadingChange }) {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [prompt, setPrompt] = useState("");
  const [analysisOutput, setAnalysisOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!file) {
      onAnalysisComplete?.(null);
      setAnalysisOutput(null);
      setError("Please upload a resume file before analyzing.");
      return;
    }

    if (!role) {
      onAnalysisComplete?.(null);
      setAnalysisOutput(null);
      setError("Please select a target role.");
      return;
    }

    setLoading(true);
    onLoadingChange?.(true);

    try {
      const data = await analyzeResumeUpload({ file, prompt, role });
      setAnalysisOutput(data);
      // ✅ FIX: attach target_role so Resources & JobMatch auto-select it
      onAnalysisComplete?.({ ...data, target_role: role });
    } catch (apiError) {
      onAnalysisComplete?.(null);
      setAnalysisOutput(null);
      setError(apiError.message || "Unable to analyze the uploaded resume.");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }

  return (
    <motion.section
      className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur-sm lg:p-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Core Tool</p>
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
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-700 shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-sky-700"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Target Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-700 outline-none transition duration-300 focus:ring-2 focus:ring-sky-400"
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
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-700 outline-none transition duration-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-400"
          />
        </label>

        <motion.button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-sm font-semibold text-white shadow-md shadow-cyan-200 transition duration-300 disabled:cursor-not-allowed disabled:opacity-70"
          whileHover={{ scale: 1.02, boxShadow: "0 14px 28px rgba(14, 116, 144, 0.26)" }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? "Analyzing..." : "Analyze Uploaded Resume"}
        </motion.button>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
      </form>

      {loading ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          Generating AI analysis...
        </div>
      ) : null}

      {analysisOutput ? (
        <motion.div
          className="mt-6 rounded-3xl border-2 border-sky-200 bg-white p-5 shadow-md lg:p-7"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Main Feature Output</p>
          <h4 className="mt-2 text-2xl font-bold text-slate-900 lg:text-3xl">Detailed Resume Analysis Result</h4>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-sky-700">Match Score</p>
              <p className="mt-1 text-3xl font-bold text-sky-800">{analysisOutput.match_score ?? 0}%</p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-indigo-700">Required Skills</p>
              <p className="mt-1 text-3xl font-bold text-indigo-800">{analysisOutput.required_skills?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Skills Found</p>
              <p className="mt-1 text-3xl font-bold text-emerald-800">{analysisOutput.found_skills?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-rose-700">Need to Enhance</p>
              <p className="mt-1 text-3xl font-bold text-rose-800">{analysisOutput.missing_skills?.length ?? 0}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Analysis Summary</p>
            <p className="mt-2 whitespace-pre-line text-base leading-7 text-slate-700">
              {analysisOutput.summary || analysisOutput.analysis}
            </p>
          </div>

          {analysisOutput.required_skills?.length ? (
            <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.1em] text-indigo-700">Required Skills for Role</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {analysisOutput.required_skills.map((skill) => (
                  <span
                    key={`required-${skill}`}
                    className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.1em] text-emerald-700">Skills Found in Resume</p>
              {!analysisOutput.found_skills?.length ? (
                <p className="mt-3 text-sm text-slate-600">No required skills detected yet.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {analysisOutput.found_skills.map((skill, index) => (
                    <li key={`found-${skill}`} className="rounded-lg border border-emerald-200 bg-white px-3 py-2">
                      <span className="font-semibold text-emerald-700">{index + 1}.</span> {skill}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.1em] text-rose-700">Skills to Enhance</p>
              {!analysisOutput.missing_skills?.length ? (
                <p className="mt-3 text-sm text-slate-600">Excellent. No critical skill gaps for this role.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {analysisOutput.missing_skills.map((skill, index) => (
                    <li key={`missing-${skill}`} className="rounded-lg border border-rose-200 bg-white px-3 py-2">
                      <span className="font-semibold text-rose-700">{index + 1}.</span> {skill}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {(analysisOutput.suggestions?.length || analysisOutput.highlighted_skills?.length) ? (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.1em] text-blue-700">Point-Wise Enhancement Plan</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {(analysisOutput.suggestions || []).map((item, index) => {
                  const suggestionText = toSuggestionText(item);
                  if (!suggestionText) return null;

                  return (
                    <li key={`suggestion-${index}`} className="rounded-lg border border-blue-200 bg-white px-3 py-2">
                      <span className="font-semibold text-blue-700">{index + 1}.</span> {suggestionText}
                    </li>
                  );
                })}
                {(analysisOutput.highlighted_skills || []).map((skill, index) => (
                  <li key={`highlight-${skill}`} className="rounded-lg border border-blue-200 bg-white px-3 py-2">
                    <span className="font-semibold text-blue-700">{(analysisOutput.suggestions?.length || 0) + index + 1}.</span> Add one measurable project or achievement bullet for <span className="font-semibold">{skill}</span>.
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </motion.section>
  );
}

export default ResumeAnalyzer;

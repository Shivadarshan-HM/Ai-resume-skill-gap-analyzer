import { useEffect, useMemo, useState } from "react";
import { logActivity } from "./Dashboard";
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

function ResumeAnalyzer({ roles, onAnalysisComplete, onLoadingChange, analysisData }) {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState(analysisData?.role || "");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyTick, setHistoryTick] = useState(0);
  useEffect(() => {
    const handler = () => setHistoryTick(t => t + 1);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Use persisted analysisData as output if available
  const analysisOutput = analysisData;

  const summaryStats = useMemo(() => {
    if (!analysisOutput) {
      return {
        score: 0,
        required: 0,
        found: 0,
        missing: 0,
        suggestions: 0,
      };
    }

    return {
      score: analysisOutput.match_score ?? 0,
      required: analysisOutput.required_skills?.length ?? 0,
      found: analysisOutput.found_skills?.length ?? 0,
      missing: analysisOutput.missing_skills?.length ?? 0,
      suggestions: analysisOutput.suggestions?.length ?? 0,
    };
  }, [analysisOutput]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Please upload a resume file before analyzing.");
      return;
    }

    if (!role) {
      setError("Please select a target role.");
      return;
    }

    setLoading(true);
    onLoadingChange?.(true);

    try {
      const data = await analyzeResumeUpload({ file, prompt, role });
      onAnalysisComplete?.({ ...data, role });
      // Save score history
      try {
        const history = JSON.parse(localStorage.getItem("cv_score_history") || "[]");
        history.unshift({ score: data.match_score ?? 0, role, file: file?.name || "Resume", time: new Date().toISOString() });
        localStorage.setItem("cv_score_history", JSON.stringify(history.slice(0, 10)));
        logActivity(`Resume analyzed — "${file?.name || 'Resume'}" for ${role} — Match: ${data.match_score ?? 0}%`);
      } catch {}
    } catch (apiError) {
      setError(apiError.message || "Unable to analyze the uploaded resume.");
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }

  return (
    <motion.section
      className="cv-panel space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Core Tool</p>
      <h3 className="text-lg font-semibold text-slate-900">Resume Upload + AI Analysis</h3>
      <p className="mt-1 text-sm text-slate-500">Upload your resume and ask AI for focused career feedback.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Resume File</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="cv-input shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-sky-700"
            aria-describedby="resume-file-help"
          />
          <p id="resume-file-help" className="mt-2 text-xs text-slate-500">Supported formats: PDF, DOC, DOCX, TXT.</p>
          {analysisOutput?.role && !file && (
            <p className="mt-1 text-xs text-slate-400">Last analyzed: <span className="text-sky-600 font-medium">{analysisOutput.role}</span></p>
          )}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Target Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="cv-input"
          >
            <option value="">Choose a role</option>
            {roles.map((roleName) => (
              <option key={roleName} value={roleName}>{roleName}</option>
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
            className="cv-input min-h-28"
          />
        </label>

        <motion.button
          type="submit"
          disabled={loading}
          className="cv-btn-primary h-11 w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? "Analyzing..." : "Analyze Uploaded Resume"}
        </motion.button>

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert" aria-live="assertive">{error}</p>
        )}
      </form>

      {loading && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700" role="status" aria-live="polite">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          Generating AI analysis...
        </div>
      )}

      {analysisOutput && (
        <motion.div
          className="mt-6 overflow-hidden rounded-3xl border-2 border-sky-200 bg-white p-4 shadow-md sm:p-5 lg:p-7"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Main Feature Output</p>
          <h4 className="mt-2 text-2xl font-bold text-slate-900 lg:text-3xl">Detailed Resume Analysis Result</h4>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-sky-700">Match Score</p>
              <p className="mt-1 text-3xl font-bold text-sky-800">{summaryStats.score}%</p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-indigo-700">Required Skills</p>
              <p className="mt-1 text-3xl font-bold text-indigo-800">{summaryStats.required}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">Skills Found</p>
              <p className="mt-1 text-3xl font-bold text-emerald-800">{summaryStats.found}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-rose-700">Need to Enhance</p>
              <p className="mt-1 text-3xl font-bold text-rose-800">{summaryStats.missing}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] xl:items-start">
            <div className="min-w-0 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Analysis Summary</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700 sm:text-base">
                  {analysisOutput.summary || analysisOutput.analysis}
                </p>
              </div>

              {analysisOutput.required_skills?.length ? (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
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

              <div className="grid gap-4 lg:grid-cols-2">
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
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.1em] text-blue-700">Point-Wise Enhancement Plan</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    {(analysisOutput.suggestions || []).map((item, index) => {
                      const suggestionText = toSuggestionText(item);
                      if (!suggestionText) return null;

                      return (
                        <li key={`suggestion-${index}`} className="rounded-lg border border-blue-200 bg-white px-3 py-2 break-words">
                          <span className="font-semibold text-blue-700">{index + 1}.</span> {suggestionText}
                        </li>
                      );
                    })}
                    {(analysisOutput.highlighted_skills || []).map((skill, index) => (
                      <li key={`highlight-${skill}`} className="rounded-lg border border-blue-200 bg-white px-3 py-2 break-words">
                        <span className="font-semibold text-blue-700">{(analysisOutput.suggestions?.length || 0) + index + 1}.</span> Add one measurable project or achievement bullet for <span className="font-semibold">{skill}</span>.
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <aside className="block" aria-label="Sticky analysis summary">
              <div className="cv-card xl:sticky xl:top-24">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Quick Summary</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span>Match Score</span><strong>{summaryStats.score}%</strong></li>
                  <li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span>Required Skills</span><strong>{summaryStats.required}</strong></li>
                  <li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span>Skills Found</span><strong>{summaryStats.found}</strong></li>
                  <li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span>Need to Enhance</span><strong>{summaryStats.missing}</strong></li>
                  <li className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span>Suggestions</span><strong>{summaryStats.suggestions}</strong></li>
                </ul>
                <p className="mt-3 text-xs leading-5 text-slate-500">Use this summary to track progress after each resume edit and rerun analysis.</p>
              </div>
              {/* Score History */}
              <div className="cv-card mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Score History</p>
                {/* historyTick: {historyTick} */}{(() => {
                  try {
                    const history = JSON.parse(localStorage.getItem("cv_score_history") || "[]");
                    if (history.length === 0) return <p className="mt-2 text-xs text-slate-400">No history yet — analyze your resume to start tracking!</p>;
                    const deleteOne = (idx) => {
                      const h = JSON.parse(localStorage.getItem("cv_score_history") || "[]");
                      h.splice(idx, 1);
                      localStorage.setItem("cv_score_history", JSON.stringify(h));
                      window.dispatchEvent(new Event("storage"));
                    };
                    const clearAll = () => {
                      localStorage.removeItem("cv_score_history");
                      window.dispatchEvent(new Event("storage"));
                    };
                    return (
                      <>
                        <ul className="mt-3 space-y-2">
                          {history.slice(0,5).map((h, i) => (
                            <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 group">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-700">{h.role}</p>
                                <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{h.file || "Resume"}</p>
                                <p className="text-[10px] text-slate-400">{new Date(h.time).toLocaleDateString("en-IN", {day:"numeric", month:"short", hour:"2-digit", minute:"2-digit"})}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${h.score >= 70 ? "text-emerald-600" : h.score >= 40 ? "text-amber-500" : "text-rose-500"}`}>{h.score}%</span>
                                <button onClick={() => deleteOne(i)} className="text-rose-400 hover:text-rose-600 transition text-xs font-bold">✕</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <button onClick={clearAll} className="mt-3 w-full rounded-lg border border-rose-100 bg-rose-50 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-100 transition">Clear All History</button>
                      </>
                    );
                  } catch { return null; }
                })()}
              </div>
            </aside>
          </div>

          <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-800" role="status" aria-live="polite">
            Tip: Re-analyze after updating project bullets to see how score and missing skills change.
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}

export default ResumeAnalyzer;

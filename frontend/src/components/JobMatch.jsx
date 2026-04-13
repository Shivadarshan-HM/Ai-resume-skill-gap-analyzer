import { useMemo, useState } from "react";
import { motion } from "framer-motion";

function JobMatch({ analysisData }) {
  const [jobDescription, setJobDescription] = useState("");
  const [comparison, setComparison] = useState(null);

  const detectedSkills = useMemo(() => analysisData?.found_skills ?? [], [analysisData]);

  function handleCompare(event) {
    event.preventDefault();

    const text = jobDescription.toLowerCase();
    if (!text.trim()) {
      setComparison({
        match: 0,
        missingSkills: [],
        suggestions: ["Paste a job description to compare against your resume."]
      });
      return;
    }

    const jdSkills = [
      "react",
      "javascript",
      "typescript",
      "python",
      "flask",
      "sql",
      "docker",
      "aws",
      "machine learning",
      "communication",
      "git"
    ].filter((skill) => text.includes(skill));

    const normalizedDetected = detectedSkills.map((skill) => skill.toLowerCase());
    const matchedCount = jdSkills.filter((skill) => normalizedDetected.includes(skill)).length;
    const match = jdSkills.length ? Math.round((matchedCount / jdSkills.length) * 100) : 0;

    const missingSkills = jdSkills.filter((skill) => !normalizedDetected.includes(skill));

    const suggestions = missingSkills.length
      ? [
          `Add resume evidence for: ${missingSkills.slice(0, 4).join(", ")}.`,
          "Mirror the job description wording in project bullets.",
          "Prioritize achievements with measurable impact."
        ]
      : ["Strong alignment found. Add quantifiable outcomes to stand out further."];

    setComparison({
      match,
      missingSkills,
      suggestions
    });
  }

  return (
    <motion.section
      className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur-sm lg:p-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25 }}
      whileHover={{ y: -5 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Comparison</p>
      <h3 className="text-lg font-semibold text-slate-900">Job Description Match</h3>
      <p className="mt-1 text-sm text-slate-500">Paste a job description and compare it with your current resume profile.</p>

      <form onSubmit={handleCompare} className="mt-4 space-y-3">
        <textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste job description here..."
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-700 outline-none transition duration-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-400"
        />

        <motion.button
          type="submit"
          className="h-11 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Compare
        </motion.button>
      </form>

      {comparison ? (
        <motion.div
          className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm font-semibold text-slate-800">Match Percentage: {comparison.match}%</p>

          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-rose-700">Missing Skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {comparison.missingSkills.length ? (
                comparison.missingSkills.map((skill) => (
                  <span key={skill} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No critical missing skill detected.</span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-blue-700">Suggestions</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {comparison.suggestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      ) : null}
    </motion.section>
  );
}

export default JobMatch;

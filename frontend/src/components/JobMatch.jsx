import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const JOB_SITES = [
  {
    name: "LinkedIn",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6 fill-blue-600"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    color: "bg-blue-50 border-blue-200 text-blue-700",
    getUrl: (role) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}`,
  },
  {
    name: "Indeed",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6 fill-sky-600"><path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm-.47 4.388c1.715 0 2.743 1.029 2.743 2.45 0 1.42-1.028 2.45-2.743 2.45-1.714 0-2.743-1.03-2.743-2.45 0-1.421 1.029-2.45 2.743-2.45zm3.551 14.807h-2.058v-1.056c-.588.773-1.45 1.25-2.45 1.25-2.156 0-3.772-1.74-3.772-4.28 0-2.537 1.616-4.277 3.772-4.277.999 0 1.862.478 2.45 1.25V11.11h2.058v8.085z"/></svg>,
    color: "bg-sky-50 border-sky-200 text-sky-700",
    getUrl: (role) => `https://www.indeed.com/jobs?q=${encodeURIComponent(role)}`,
  },
  {
    name: "Naukri",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6 fill-orange-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9V8h2v9zm4 0h-2V8h2v9z"/></svg>,
    color: "bg-orange-50 border-orange-200 text-orange-700",
    getUrl: (role) => `https://www.naukri.com/${encodeURIComponent(role.toLowerCase().replace(/ /g, "-"))}-jobs`,
  },
  {
    name: "Glassdoor",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6 fill-green-600"><path d="M12 .5C5.649.5.5 5.649.5 12S5.649 23.5 12 23.5 23.5 18.351 23.5 12 18.351.5 12 .5zm0 4.5a7 7 0 1 1 0 14A7 7 0 0 1 12 5zm0 2a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>,
    color: "bg-green-50 border-green-200 text-green-700",
    getUrl: (role) => `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(role)}`,
  },
  {
    name: "Internshala",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6 fill-purple-600"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
    color: "bg-purple-50 border-purple-200 text-purple-700",
    getUrl: (role) => `https://internshala.com/jobs/keywords-${encodeURIComponent(role.toLowerCase().replace(/ /g, "-"))}`,
  },
  {
    name: "Wellfound",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6 fill-rose-500"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    color: "bg-rose-50 border-rose-200 text-rose-700",
    getUrl: (role) => `https://wellfound.com/jobs?q=${encodeURIComponent(role)}`,
  },
];

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Data Analyst",
  "DevOps Engineer",
  "ML Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Cloud Engineer",
];

// Detect role from job description text
function detectRoleFromText(text) {
  const t = text.toLowerCase();
  if (t.includes("frontend") || t.includes("front-end") || t.includes("react") || t.includes("html") || t.includes("css")) return "Frontend Developer";
  if (t.includes("backend") || t.includes("back-end") || t.includes("flask") || t.includes("django") || t.includes("node")) return "Backend Developer";
  if (t.includes("data scientist") || t.includes("machine learning") || t.includes("pandas") || t.includes("numpy") || t.includes("ml")) return "Data Scientist";
  if (t.includes("full stack") || t.includes("fullstack") || t.includes("full-stack")) return "Full Stack Developer";
  return null;
}

function JobMatch({ analysisData }) {
  const [jobDescription, setJobDescription] = useState("");
  const [comparison, setComparison] = useState(null);

  // Auto-select target role from analysisData
  const targetRole = analysisData?.target_role || null;
  const defaultRole = targetRole && ROLE_OPTIONS.includes(targetRole) ? targetRole : ROLE_OPTIONS[0];
  const [selectedRole, setSelectedRole] = useState(defaultRole);

  // Detect role from job description as user types
  function handleJDChange(e) {
    const text = e.target.value;
    setJobDescription(text);
    const detected = detectRoleFromText(text);
    if (detected) setSelectedRole(detected);
  }

  const detectedSkills = useMemo(() => analysisData?.found_skills ?? [], [analysisData]);

  function handleCompare(event) {
    event.preventDefault();

    const text = jobDescription.toLowerCase();
    if (!text.trim()) {
      setComparison({
        match: 0,
        missingSkills: [],
        suggestions: ["Paste a job description to compare against your resume."],
      });
      return;
    }

    const jdSkills = [
      "react", "javascript", "typescript", "python", "flask",
      "sql", "docker", "aws", "machine learning", "communication", "git",
    ].filter((skill) => text.includes(skill));

    const normalizedDetected = detectedSkills.map((s) => s.toLowerCase());
    const matchedCount = jdSkills.filter((s) => normalizedDetected.includes(s)).length;
    const match = jdSkills.length ? Math.round((matchedCount / jdSkills.length) * 100) : 0;
    const missingSkills = jdSkills.filter((s) => !normalizedDetected.includes(s));

    const suggestions = missingSkills.length
      ? [
          `Add resume evidence for: ${missingSkills.slice(0, 4).join(", ")}.`,
          "Mirror the job description wording in project bullets.",
          "Prioritize achievements with measurable impact.",
        ]
      : ["Strong alignment found. Add quantifiable outcomes to stand out further."];

    setComparison({ match, missingSkills, suggestions });
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
      <p className="mt-1 text-sm text-slate-500">
        Paste a job description and compare it with your current resume profile.
      </p>

      <form onSubmit={handleCompare} className="mt-4 space-y-3">
        <textarea
          value={jobDescription}
          onChange={handleJDChange}
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

      {comparison && (
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
      )}

      {/* ── Job Sites Section ── */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Find Jobs</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">Job Openings by Role</h3>
        <p className="mt-1 text-sm text-slate-500">
          Select your target role and explore live job listings on top platforms.
        </p>

        {/* Target role badge */}
        {targetRole && ROLE_OPTIONS.includes(targetRole) && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            🎯 Target Role: {targetRole}
          </div>
        )}

        {/* Role selector */}
        <div className="mt-3 flex flex-wrap gap-2">
          {/* Primary: target role first */}
          {targetRole && ROLE_OPTIONS.includes(targetRole) && (
            <button
              type="button"
              onClick={() => setSelectedRole(targetRole)}
              className={
                selectedRole === targetRole
                  ? "rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white ring-2 ring-blue-400 ring-offset-1"
                  : "rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
              }
            >
              ⭐ {targetRole}
            </button>
          )}

          {/* Secondary: rest of roles */}
          {ROLE_OPTIONS.filter((r) => r !== targetRole).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={
                selectedRole === role
                  ? "rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                  : "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              }
            >
              {role}
            </button>
          ))}
        </div>

        {/* Job site cards */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {JOB_SITES.map((site, index) => (
            <motion.a
              key={site.name}
              href={site.getUrl(selectedRole)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${site.color}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="text-2xl">{site.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{site.name}</p>
                <p className="text-xs opacity-75">{selectedRole} jobs →</p>
              </div>
              <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default JobMatch;

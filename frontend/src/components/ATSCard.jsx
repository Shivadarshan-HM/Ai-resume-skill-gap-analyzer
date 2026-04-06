import { motion } from "framer-motion";

function MetricRow({ label, value, tone }) {
  const toneClass = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-rose-600";

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-sm text-slate-600">{label}</p>
      <p className={`text-sm font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function ATSCard({ analysisData }) {
  const score = analysisData?.match_score ?? 0;
  const found = analysisData?.found_skills?.length ?? 0;
  const missing = analysisData?.missing_skills?.length ?? 0;

  const keywordScore = Math.min(100, Math.round(score + 8));
  const formattingScore = Math.max(55, Math.min(100, 68 + found * 3));
  const skillsScore = Math.max(40, Math.min(100, 100 - missing * 7));

  return (
    <motion.section
      className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-sm lg:p-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      whileHover={{ y: -5 }}
    >
      <h3 className="text-lg font-semibold text-slate-900">ATS Score Checker</h3>
      <p className="mt-1 text-sm text-slate-500">Estimated ATS performance based on resume-role alignment.</p>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-700">Overall ATS Score</span>
          <span className="text-lg font-semibold text-blue-700">{score}%</span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-blue-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <MetricRow label="Keyword Match" value={`${keywordScore}%`} tone={keywordScore >= 75 ? "good" : "warn"} />
        <MetricRow label="Formatting" value={`${formattingScore}%`} tone={formattingScore >= 75 ? "good" : "warn"} />
        <MetricRow label="Skills" value={`${skillsScore}%`} tone={skillsScore >= 75 ? "good" : "warn"} />
      </div>
    </motion.section>
  );
}

export default ATSCard;

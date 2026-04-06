import { motion } from "framer-motion";

function ProgressBar({ score }) {
  const clampedScore = Math.min(Math.max(score || 0, 0), 100);

  return (
    <div className="space-y-2" aria-label="Skill Match Score">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Match Score</span>
        <strong className="text-sm font-semibold text-blue-600">{clampedScore}%</strong>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-blue-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${clampedScore}%` }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;

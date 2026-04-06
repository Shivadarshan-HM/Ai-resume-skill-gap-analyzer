function ProgressBar({ score }) {
  const clampedScore = Math.min(Math.max(score || 0, 0), 100);

  return (
    <div className="space-y-2" aria-label="Skill Match Score">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-slate-300">Match Score</span>
        <strong className="text-sm font-semibold text-cyan-200">{clampedScore}%</strong>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 transition-all duration-1000 ease-out"
          style={{ width: `${clampedScore}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;

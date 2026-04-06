function ProgressBar({ score }) {
  return (
    <div className="progress-wrapper" aria-label="Skill Match Score">
      <div className="progress-meta">
        <span>Match Score</span>
        <strong>{score}%</strong>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;

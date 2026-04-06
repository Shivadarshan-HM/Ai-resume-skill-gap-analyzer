import ProgressBar from "./ProgressBar";

function SkillList({ title, skills, emptyText, tone }) {
  const toneClasses =
    tone === "good"
      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
      : "border-rose-300/30 bg-rose-400/10 text-rose-100";

  return (
    <div className="rounded-2xl border border-white/15 bg-slate-900/40 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">{title}</h3>
      {skills.length === 0 ? (
        <p className="text-sm text-slate-400">{emptyText}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li
              key={skill}
              className={`rounded-full border px-3 py-1 text-xs font-medium tracking-wide ${toneClasses}`}
            >
              {skill}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ResultCard({ result, loading }) {
  if (loading) {
    return (
      <section className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-panel animate-fadeIn">
        <div className="flex items-center gap-3 text-slate-300">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-200/40 border-t-cyan-200" />
          <p className="text-sm">Crunching resume signals and role-fit metrics...</p>
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-panel">
        <p className="text-sm text-slate-300">
          Your analysis results will appear here after running the resume scan.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl shadow-panel animate-fadeIn lg:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Result Overview</p>
          <h2 className="mt-2 text-2xl font-bold text-white lg:text-3xl">{result.match_score}%</h2>
        </div>
      </div>

      <ProgressBar score={result.match_score} />

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <SkillList
          title="Found Skills"
          skills={result.found_skills}
          emptyText="No required skills were detected in the resume yet."
          tone="good"
        />
        <SkillList
          title="Missing Skills"
          skills={result.missing_skills}
          emptyText="Great! No missing skills for this role."
          tone="warn"
        />
      </div>
    </section>
  );
}

export default ResultCard;

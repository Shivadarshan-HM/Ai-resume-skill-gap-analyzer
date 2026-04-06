import { motion } from "framer-motion";
import ProgressBar from "./ProgressBar";

function SkillList({ title, skills, emptyText, tone }) {
  const toneClasses =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</h3>
      {skills.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
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
      <motion.section
        className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 text-slate-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500" />
          <p className="text-sm">Crunching resume signals and role-fit metrics...</p>
        </div>
      </motion.section>
    );
  }

  if (!result) {
    return (
      <motion.section
        className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-slate-500">
          Your analysis results will appear here after running the resume scan.
        </p>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-sm lg:p-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      whileHover={{ y: -5 }}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Result Overview</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 lg:text-3xl">{result.match_score}%</h2>
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
    </motion.section>
  );
}

export default ResultCard;

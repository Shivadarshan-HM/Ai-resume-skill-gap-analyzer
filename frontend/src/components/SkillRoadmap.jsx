import { motion } from "framer-motion";

function SkillRoadmap({ analysisData }) {
  const missingSkills = analysisData?.missing_skills ?? [];
  const roadmapSkills = missingSkills.length
    ? missingSkills.slice(0, 5)
    : ["Advanced Communication", "System Design", "Cloud Deployment", "Testing Strategy"];

  return (
    <motion.section
      className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-sm lg:p-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <h3 className="text-lg font-semibold text-slate-900">Skill Roadmap Generator</h3>
      <p className="mt-1 text-sm text-slate-500">Step-by-step learning path based on your resume gap.</p>

      <div className="mt-5 space-y-3">
        {roadmapSkills.map((skill, index) => (
          <motion.div
            key={skill}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-blue-600">Step {index + 1}</p>
            <p className="mt-1 text-sm font-medium text-slate-800">Learn and apply {skill}</p>
            <p className="mt-1 text-sm text-slate-500">
              Build one portfolio project that demonstrates this skill with measurable impact.
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default SkillRoadmap;

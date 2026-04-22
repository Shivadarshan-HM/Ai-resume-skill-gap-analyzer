import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import resourcesData from "../data/resources.json";

const TYPE_COLORS = {
  Roadmap: "bg-purple-50 text-purple-700 border-purple-200",
  Docs: "bg-blue-50 text-blue-700 border-blue-200",
  Course: "bg-green-50 text-green-700 border-green-200",
  Tutorial: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Blog: "bg-orange-50 text-orange-700 border-orange-200",
  Video: "bg-red-50 text-red-700 border-red-200",
  Guide: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

function Resources({ analysisData }) {
  const roles = Object.keys(resourcesData);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    if (analysisData?.target_role) {
      const matched = roles.find(
        (r) => r.toLowerCase() === analysisData.target_role.toLowerCase()
      );
      if (matched) {
        setSelectedRole(matched);
        setSelectedSkills([]);
      }
    }
  }, [analysisData]);

  const resources = resourcesData[selectedRole] || [];
  const missingSkills = analysisData?.missing_skills || [];
  const skillSet = [...new Set(resources.map((r) => r.skill))];

  const sorted = [...resources].sort((a, b) => {
    const aM = missingSkills.some((s) => s.toLowerCase() === a.skill.toLowerCase());
    const bM = missingSkills.some((s) => s.toLowerCase() === b.skill.toLowerCase());
    return bM - aM;
  });

  const filtered = selectedSkills.length === 0
    ? sorted
    : sorted.filter((r) => selectedSkills.includes(r.skill));

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Learning</p>
        <h2 className="text-xl font-semibold text-slate-900">Resources</h2>
        <p className="mt-1 text-sm text-slate-500">Curated links by role. Select multiple filters to narrow down.</p>

        {/* Role Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => { setSelectedRole(role); setSelectedSkills([]); }}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                selectedRole === role
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Skill Filter Pills */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {skillSet.map((skill) => {
            const active = selectedSkills.includes(skill);
            const isMissing = missingSkills.some((s) => s.toLowerCase() === skill.toLowerCase());
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "border-cyan-500 bg-cyan-500 text-white"
                    : isMissing
                    ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : "border-gray-200 bg-gray-50 text-slate-500 hover:border-cyan-300 hover:text-cyan-600"
                }`}
              >
                {skill}{isMissing ? " !" : ""}
              </button>
            );
          })}
          {selectedSkills.length > 0 && (
            <button
              onClick={() => setSelectedSkills([])}
              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 transition"
            >
              Clear ({selectedSkills.length})
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((resource, index) => {
          const colorClass = TYPE_COLORS[resource.type] || "bg-gray-50 text-gray-700 border-gray-200";
          return (
            <motion.a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-sky-200 transition block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <p className="font-semibold text-slate-800 text-sm leading-snug">{resource.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${colorClass}`}>{resource.type}</span>
                <span className="text-xs text-slate-400">{resource.skill}</span>
              </div>
              <p className="mt-2 text-xs text-sky-600 truncate">Open &rarr; {resource.url}</p>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}

export default Resources;

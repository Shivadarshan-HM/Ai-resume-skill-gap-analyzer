import { useState } from "react";
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

function Resources() {
  const roles = Object.keys(resourcesData);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [selectedSkill, setSelectedSkill] = useState("All");

  const resources = resourcesData[selectedRole] || [];
  const skills = ["All", ...new Set(resources.map((r) => r.skill))];
  const filtered = selectedSkill === "All"
    ? resources
    : resources.filter((r) => r.skill === selectedSkill);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-sm lg:p-7">
        <h3 className="text-lg font-semibold text-slate-900">📚 Learning Resources</h3>
        <p className="mt-1 text-sm text-slate-500">
          Curated links to the best free websites, docs, and courses — by role.
        </p>

        {/* Role Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => { setSelectedRole(role); setSelectedSkill("All"); }}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition duration-200 ${
                selectedRole === role
                  ? "border-blue-600 bg-blue-600 text-white shadow-md"
                  : "border-gray-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Skill Filter */}
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition duration-200 ${
                selectedSkill === skill
                  ? "border-cyan-500 bg-cyan-500 text-white"
                  : "border-gray-200 bg-gray-50 text-slate-500 hover:border-cyan-300 hover:text-cyan-600"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((resource, index) => (
          <motion.a
            key={resource.url}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-between rounded-2xl border border-white/70 bg-white/80 p-5 shadow-md backdrop-blur-sm transition duration-200 hover:shadow-lg hover:-translate-y-0.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-snug text-slate-800">
                  {resource.title}
                </p>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                    TYPE_COLORS[resource.type] || "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {resource.type}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">{resource.skill}</p>
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600">
              <span>Open →</span>
              <span className="truncate text-slate-400">{resource.url.replace("https://", "")}</span>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}

export default Resources;

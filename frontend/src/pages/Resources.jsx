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
  const skills = ["All", ...new Set(resources.map((resource) => resource.skill))];
  const filtered =
    selectedSkill === "All"
      ? resources
      : resources.filter((resource) => resource.skill === selectedSkill);

  return (
    <div className="space-y-6">
      <motion.section
        className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-semibold text-slate-900">📚 Learning Resources</h2>
        <p className="mt-2 text-sm text-slate-500">
          Curated links to the best free websites, docs, and courses — by role.
        </p>
      </motion.section>

      <div className="flex flex-wrap gap-2">
        {roles.map((role) => {
          const active = role === selectedRole;
          return (
            <button
              key={role}
              type="button"
              onClick={() => {
                setSelectedRole(role);
                setSelectedSkill("All");
              }}
              className={
                active
                  ? "rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                  : "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              }
            >
              {role}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => {
          const active = skill === selectedSkill;
          return (
            <button
              key={skill}
              type="button"
              onClick={() => setSelectedSkill(skill)}
              className={
                active
                  ? "rounded-full bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white"
                  : "rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
              }
            >
              {skill}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((resource, index) => {
          const badgeClass = TYPE_COLORS[resource.type] || "bg-slate-100 text-slate-700 border-slate-200";
          return (
            <motion.a
              key={`${resource.title}-${resource.url}`}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900">{resource.title}</h3>
                <span className={`shrink-0 rounded-full border px-2 py-1 text-xs font-medium ${badgeClass}`}>
                  {resource.type}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{resource.skill}</p>
              <p className="mt-3 truncate text-sm font-medium text-sky-700">
                Open → {resource.url}
              </p>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}

export default Resources;

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import ResumeAnalyzer from "./ResumeAnalyzer";
import ResultCard from "./ResultCard";
import Sidebar from "./Sidebar";
import StatsCard from "./StatsCard";

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Full Stack Developer"
];

function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const foundSkillsCount = result?.found_skills?.length || 0;
  const missingSkillsCount = result?.missing_skills?.length || 0;
  const matchScore = result?.match_score || 0;
  const suggestions =
    result?.missing_skills?.length > 0
      ? result.missing_skills
      : ["System Design", "Communication", "Cloud Fundamentals"];

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f7fbff_0%,#eef3f8_40%,#e8f3ff_100%)]">
      <Sidebar
        activeItem={activeMenu}
        onItemSelect={setActiveMenu}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <div className="grid gap-4 sm:grid-cols-3">
            <StatsCard label="Match Score" value={`${matchScore}%`} hint="Current role fit" tone="blue" delay={0.05} />
            <StatsCard label="Skills Found" value={foundSkillsCount} hint="Detected in resume" tone="green" delay={0.1} />
            <StatsCard label="Skills Missing" value={missingSkillsCount} hint="Need improvement" tone="red" delay={0.15} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            <div className="space-y-6">
              <ResumeAnalyzer
                roles={ROLE_OPTIONS}
                onAnalysisComplete={setResult}
                onLoadingChange={setLoading}
              />

              <ResultCard result={result} loading={loading} />
            </div>

            <motion.aside
              className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-lg font-semibold text-slate-900">Suggested Skills</h3>
              <p className="mt-1 text-sm text-slate-500">Recommended next skills to boost your profile.</p>

              <ul className="mt-5 space-y-3">
                {suggestions.map((skill) => (
                  <li
                    key={skill}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
                  >
                    <span>{skill}</span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                      Learn
                    </span>
                  </li>
                ))}
              </ul>
            </motion.aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

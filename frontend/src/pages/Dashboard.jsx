import { motion } from "framer-motion";
import SkillRoadmap from "../components/SkillRoadmap";
import StatsCard from "../components/StatsCard";

function DashboardPage({ analysisData }) {
  const foundSkillsCount = analysisData?.found_skills?.length || 0;
  const missingSkillsCount = analysisData?.missing_skills?.length || 0;
  const matchScore = analysisData?.match_score || 0;

  return (
    <div className="space-y-6">
      <motion.section
        className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm text-slate-600">
          Welcome to your AI resume workspace. Use the sidebar to run deep analysis, compare jobs,
          and improve your ATS readiness.
        </p>
      </motion.section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Match Score" value={`${matchScore}%`} hint="Current role fit" tone="blue" delay={0.05} />
        <StatsCard label="Skills Found" value={foundSkillsCount} hint="Detected in resume" tone="green" delay={0.1} />
        <StatsCard label="Skills Missing" value={missingSkillsCount} hint="Need improvement" tone="red" delay={0.15} />
      </div>

      <SkillRoadmap analysisData={analysisData} />
    </div>
  );
}

export default DashboardPage;

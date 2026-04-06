import { useState } from "react";
import { motion } from "framer-motion";
import ATSCard from "./ATSCard";
import ChatAssistant from "./ChatAssistant";
import Header from "./Header";
import JobMatch from "./JobMatch";
import ResumeAnalyzer from "./ResumeAnalyzer";
import Sidebar from "./Sidebar";
import SkillRoadmap from "./SkillRoadmap";

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Full Stack Developer"
];

function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

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

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
          >
            <ResumeAnalyzer
              roles={ROLE_OPTIONS}
              onAnalysisComplete={setAnalysisData}
              onLoadingChange={setAnalysisLoading}
            />

            <ChatAssistant analysisData={analysisData} />

            <ATSCard analysisData={analysisData} loading={analysisLoading} />

            <JobMatch analysisData={analysisData} />

            <SkillRoadmap analysisData={analysisData} />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

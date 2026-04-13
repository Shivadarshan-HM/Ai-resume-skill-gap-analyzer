import { useState } from "react";
import { motion } from "framer-motion";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ATSCard from "./ATSCard";
import ChatAssistant from "./ChatAssistant";
import JobMatch from "./JobMatch";
import ResumeAnalyzer from "./ResumeAnalyzer";
import Sidebar from "./Sidebar";
import SkillRoadmap from "./SkillRoadmap";
import StatsCard from "./StatsCard";

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Full Stack Developer"
];

function DashboardHome({ analysisData, analysisLoading, setAnalysisData, setAnalysisLoading }) {
  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
      <motion.section
        className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-slate-600">
          Welcome to your AI resume workspace. Use the sidebar to run deep analysis, compare jobs, and improve your ATS readiness.
        </p>
      </motion.section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Match Score" value={`${analysisData?.match_score || 0}%`} hint="Current role fit" tone="blue" delay={0.05} />
        <StatsCard label="Skills Found" value={analysisData?.found_skills?.length || 0} hint="Detected in resume" tone="green" delay={0.1} />
        <StatsCard label="Skills Missing" value={analysisData?.missing_skills?.length || 0} hint="Need improvement" tone="red" delay={0.15} />
      </div>

      <SkillRoadmap analysisData={analysisData} />
    </motion.div>
  );
}

function Dashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const location = useLocation();

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const renderContent = () => {
    const path = location.pathname;

    if (path === "/dashboard" || path === "/dashboard/") {
      return <DashboardHome analysisData={analysisData} analysisLoading={analysisLoading} setAnalysisData={setAnalysisData} setAnalysisLoading={setAnalysisLoading} />;
    }
    if (path === "/analyze") {
      return (
        <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
          <ResumeAnalyzer roles={ROLE_OPTIONS} onAnalysisComplete={setAnalysisData} onLoadingChange={setAnalysisLoading} />
        </motion.div>
      );
    }
    if (path === "/chat") {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
          <ChatAssistant analysisData={analysisData} />
        </motion.div>
      );
    }
    if (path === "/job-match") {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
          <JobMatch analysisData={analysisData} />
        </motion.div>
      );
    }
    if (path === "/ats") {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
          <ATSCard analysisData={analysisData} loading={analysisLoading} />
        </motion.div>
      );
    }
    return <Navigate to="/dashboard" replace />;
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f7fbff_0%,#eef3f8_40%,#e8f3ff_100%)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-72">
        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <motion.header
            className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-lg backdrop-blur-sm sm:p-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-600 transition hover:bg-gray-50 lg:hidden"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Welcome, {user?.full_name?.split(" ")[0] || "User"} 👋
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">Analyze your resume and improve your skills</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-semibold text-white">
                    {initials}
                  </span>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-slate-800">{user?.full_name || "User"}</p>
                    <p className="text-xs text-slate-500">{user?.email || ""}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.header>

          {renderContent()}

        </main>
      </div>
    </div>
  );
}

export default Dashboard;

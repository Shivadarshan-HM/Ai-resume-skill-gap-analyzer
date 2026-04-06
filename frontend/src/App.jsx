

import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Page load pe check karo — token hai toh seedha Dashboard
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setChecking(false);
  }, []);

  function handleLoginSuccess(userData) {
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  if (checking) return null;

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;


import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ATSPage from "./pages/ATS";
import ChatAssistantPage from "./pages/ChatAssistant";
import DashboardPage from "./pages/Dashboard";
import JobMatchPage from "./pages/JobMatch";
import ResumeAnalyzerPage from "./pages/ResumeAnalyzer";

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function RoutedApp() {
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const location = useLocation();

  return (
    <AppLayout pathname={location.pathname}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <DashboardPage analysisData={analysisData} />
              </PageTransition>
            }
          />
          <Route
            path="/analyze"
            element={
              <PageTransition>
                <ResumeAnalyzerPage
                  onAnalysisComplete={setAnalysisData}
                  onLoadingChange={setAnalysisLoading}
                />
              </PageTransition>
            }
          />
          <Route
            path="/chat"
            element={
              <PageTransition>
                <ChatAssistantPage analysisData={analysisData} />
              </PageTransition>
            }
          />
          <Route
            path="/job-match"
            element={
              <PageTransition>
                <JobMatchPage analysisData={analysisData} />
              </PageTransition>
            }
          />
          <Route
            path="/ats"
            element={
              <PageTransition>
                <ATSPage analysisData={analysisData} loading={analysisLoading} />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </AppLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  );



import Dashboard from "./components/Dashboard";

function App() {
  return <Dashboard />;

}

export default App;

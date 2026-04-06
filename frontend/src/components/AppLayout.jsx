import { useMemo, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const ROUTE_META = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Analyze your resume and improve your skills"
  },
  "/analyze": {
    title: "Analyze Resume",
    subtitle: "Upload your resume and get AI-powered analysis"
  },
  "/chat": {
    title: "AI Chat Assistant",
    subtitle: "Ask follow-up questions about your resume"
  },
  "/job-match": {
    title: "Job Match",
    subtitle: "Compare your resume with any job description"
  },
  "/ats": {
    title: "ATS Score Checker",
    subtitle: "Track ATS readiness and improve score quality"
  }
};

function AppLayout({ pathname, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const meta = useMemo(() => {
    return ROUTE_META[pathname] || ROUTE_META["/dashboard"];
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f7fbff_0%,#eef3f8_40%,#e8f3ff_100%)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-72">
        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          <Header title={meta.title} subtitle={meta.subtitle} onMenuClick={() => setSidebarOpen(true)} />
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;

import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import ATSCard from "./ATSCard";
import ChatAssistant from "./ChatAssistant";
import JobMatch from "./JobMatch";
import ResumeAnalyzer from "./ResumeAnalyzer";
import Resources from "../pages/Resources";
import Sidebar from "./Sidebar";
import SkillRoadmap from "./SkillRoadmap";
import StatsCard from "./StatsCard";

const ROLE_OPTIONS = ["Frontend Developer", "Backend Developer", "Data Scientist", "Full Stack Developer"];

const ROUTE_LABELS = {
  "/dashboard": "Overview",
  "/dashboard/analyze": "Analyze Resume",
  "/dashboard/chat": "AI Chat",
  "/dashboard/ats": "ATS Score",
  "/dashboard/job-match": "Job Match",
  "/dashboard/roadmap": "Roadmap",
  "/dashboard/resources": "Resources",
  "/dashboard/activity": "Activity",
  "/dashboard/settings": "Settings"
};

const LEARNING_RESOURCES = [
  {
    title: "Frontend Developer Roadmap",
    detail: "Step-by-step guide for frontend skills, tools, and project progression.",
    tag: "Frontend",
    topics: ["frontend", "html", "css", "javascript", "react"],
    url: "https://roadmap.sh/frontend"
  },
  {
    title: "React Official Learn",
    detail: "Hands-on official React learning path with modern patterns.",
    tag: "React",
    topics: ["react", "hooks", "jsx", "frontend"],
    url: "https://react.dev/learn"
  },
  {
    title: "MDN JavaScript Guide",
    detail: "Comprehensive JavaScript reference and practical tutorials.",
    tag: "JavaScript",
    topics: ["javascript", "web", "frontend", "programming"],
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"
  },
  {
    title: "Python Official Tutorial",
    detail: "Beginner-to-intermediate Python fundamentals from official docs.",
    tag: "Python",
    topics: ["python", "backend", "basics", "programming"],
    url: "https://docs.python.org/3/tutorial/"
  },
  {
    title: "Flask Mega-Tutorial",
    detail: "Practical Flask web app development from basics to advanced.",
    tag: "Backend",
    topics: ["flask", "backend", "api", "python"],
    url: "https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world"
  },
  {
    title: "System Design Primer",
    detail: "High-level system design concepts and interview preparation notes.",
    tag: "System Design",
    topics: ["system design", "architecture", "interview", "scalability"],
    url: "https://github.com/donnemartin/system-design-primer"
  },
  {
    title: "NeetCode Roadmap",
    detail: "Curated DSA problem list with structured interview preparation order.",
    tag: "DSA",
    topics: ["dsa", "algorithms", "data structures", "coding interview"],
    url: "https://neetcode.io/roadmap"
  },
  {
    title: "AWS Training and Certification",
    detail: "Cloud learning paths for AWS basics, architecture, and services.",
    tag: "Cloud",
    topics: ["aws", "cloud", "devops", "architecture"],
    url: "https://www.aws.training/"
  }
];

function Dashboard({ user, onLogout, analysisData, setAnalysisData, analysisLoading, setAnalysisLoading }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resourceQuery, setResourceQuery] = useState("");
  const location = useLocation();

  const initials = user?.full_name ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";
  const score = analysisData?.match_score ?? 0;
  const foundCount = analysisData?.found_skills?.length ?? 0;
  const missingCount = analysisData?.missing_skills?.length ?? 0;
  const suggestionsCount = analysisData?.suggestions?.length ?? 0;
  const quickPrompts = ["Give me 5 ATS keywords for my role", "Which projects should I add first?", "How can I improve match score by 15%?"];

  const activePath = location.pathname === "/dashboard/" ? "/dashboard" : location.pathname;
  const activeSection = ROUTE_LABELS[activePath] || "Overview";

  function renderHome() {
    return (
      <div className="space-y-6">
        <motion.section
          className="overflow-hidden rounded-3xl border border-sky-100 bg-[linear-gradient(120deg,#0f172a_0%,#0b3f63_55%,#0ea5b7_100%)] p-6 text-white shadow-xl sm:p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Career Command Center</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Design a resume that recruiters shortlist faster</h2>
              <p className="mt-3 text-sm text-cyan-50/95 sm:text-base">Analyze resume alignment, prioritize missing skills, and turn your resume into an ATS-friendly document.</p>
            </div>
            <div className="grid w-full max-w-xs grid-cols-2 gap-3 text-slate-900">
              <div className="rounded-2xl bg-white/95 p-3 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Match</p>
                <p className="mt-1 text-2xl font-semibold">{score}%</p>
              </div>
              <div className="rounded-2xl bg-white/95 p-3 shadow-sm">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Missing</p>
                <p className="mt-1 text-2xl font-semibold">{missingCount}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard label="Skill Match" value={`${score}%`} hint="Role-fit score" tone="blue" delay={0.05} />
          <StatsCard label="Skills Found" value={foundCount} hint="Detected in resume" tone="green" delay={0.1} />
          <StatsCard label="Skills Missing" value={missingCount} hint="Need focused work" tone="red" delay={0.15} />
          <StatsCard label="Suggestions" value={suggestionsCount} hint="Action points available" tone="blue" delay={0.2} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <ResumeAnalyzer roles={ROLE_OPTIONS} onAnalysisComplete={setAnalysisData} onLoadingChange={setAnalysisLoading} />
            <JobMatch analysisData={analysisData} />
          </div>

          <div className="space-y-6">
            <ATSCard analysisData={analysisData} loading={analysisLoading} />
            <SkillRoadmap analysisData={analysisData} />
          </div>
        </div>
      </div>
    );
  }

  function renderResources() {
    const query = resourceQuery.trim().toLowerCase();
    const filteredResources = LEARNING_RESOURCES.filter((item) => {
      if (!query) return true;
      return item.title.toLowerCase().includes(query) || item.tag.toLowerCase().includes(query) || item.detail.toLowerCase().includes(query) || item.topics.some((topic) => topic.includes(query));
    });

    return (
      <motion.section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3 className="text-xl font-semibold text-slate-900">Learning Resources</h3>
        <p className="mt-1 text-sm text-slate-500">Type a skill or topic (for example: react, python, aws, system design) and open useful external learning blogs or websites.</p>
        <label htmlFor="resource-search" className="mt-4 block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Search by skill or topic</label>
        <input
          id="resource-search"
          type="text"
          value={resourceQuery}
          onChange={(e) => setResourceQuery(e.target.value)}
          placeholder="Type skill or topic..."
          className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400"
        />

        <p className="mt-3 text-xs text-slate-500">{filteredResources.length} resource{filteredResources.length === 1 ? "" : "s"} found</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {filteredResources.map((item) => (
            <a
              key={item.title}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-sky-700">{item.tag}</p>
              <h4 className="mt-1 text-base font-semibold text-slate-900">{item.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
              <p className="mt-3 text-sm font-medium text-sky-700 group-hover:text-sky-800">Open resource</p>
            </a>
          ))}
          {filteredResources.length === 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 sm:col-span-2">
              No resources found for this topic yet. Try another keyword like react, flask, dsa, or aws.
            </div>
          )}
        </div>
      </motion.section>
    );
  }

  function renderActivity() {
    const timeline = ["Uploaded resume and selected target role", "Generated ATS score and improvement suggestions", "Compared resume with job description keywords", "Created roadmap for next 4 learning priorities"];

    return (
      <motion.section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3 className="text-xl font-semibold text-slate-900">Recent Activity</h3>
        <p className="mt-1 text-sm text-slate-500">Track progress and keep your resume updates consistent.</p>
        <div className="mt-5 space-y-3">
          {timeline.map((item, index) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">{index + 1}</span>
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </motion.section>
    );
  }

  function renderSettings() {
    return (
      <motion.section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3 className="text-xl font-semibold text-slate-900">Preferences</h3>
        <p className="mt-1 text-sm text-slate-500">Tune your dashboard workflow and analysis focus.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-medium text-slate-900">Preferred Role</p>
            <p className="mt-1 text-sm text-slate-600">Set your default role for faster analysis starts.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-medium text-slate-900">Weekly Goal</p>
            <p className="mt-1 text-sm text-slate-600">Choose number of skills to improve per week.</p>
          </div>
        </div>
      </motion.section>
    );
  }

  function renderContent() {
    if (activePath === "/dashboard/analyze") {
      return <ResumeAnalyzer roles={ROLE_OPTIONS} onAnalysisComplete={setAnalysisData} onLoadingChange={setAnalysisLoading} />;
    }

    if (activePath === "/dashboard/chat") {
      return <ChatAssistant quickPrompts={quickPrompts} />;
    }

    if (activePath === "/dashboard/ats") {
      return <ATSCard analysisData={analysisData} loading={analysisLoading} />;
    }

    if (activePath === "/dashboard/job-match") {
      return <JobMatch analysisData={analysisData} />;
    }

    if (activePath === "/dashboard/roadmap") {
      return <SkillRoadmap analysisData={analysisData} />;
    }

    if (activePath === "/dashboard/resources") {
      return <Resources />;
    }

    if (activePath === "/dashboard/activity") {
      return renderActivity();
    }

    if (activePath === "/dashboard/settings") {
      return renderSettings();
    }

    return renderHome();
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_10%_10%,#d8f4ff_0%,transparent_33%),radial-gradient(circle_at_85%_25%,#d9ecff_0%,transparent_35%),linear-gradient(140deg,#f8fcff_0%,#eef5fb_45%,#edf7ff_100%)]">
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-slate-200/60">
        <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-[width] duration-300" style={{ width: `${Math.min(100, Math.max(6, score))}%` }} />
      </div>
      <div className="pointer-events-none absolute -top-24 right-8 h-64 w-64 rounded-full bg-cyan-200/45 blur-3xl" />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-80">
        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          <motion.header
            className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-sm sm:p-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="space-y-4">
              {activePath === "/dashboard" && (
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(true)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-600 transition hover:bg-gray-50 lg:hidden"
                      aria-label="Open sidebar"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-semibold text-white">{initials}</span>
                      <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Welcome, {user?.full_name?.split(" ")[0] || "User"} 👋</h1>
                        <p className="mt-1 text-sm text-slate-500">Build a stronger resume with focused AI guidance and ATS friendly formatting</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onLogout}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-sky-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Active Section: {activeSection}</span>
                <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Missing Skills: {missingCount}</span>
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

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import ATSCard from "./ATSCard";
import ChatAssistant from "./ChatAssistant";
import JobMatch from "./JobMatch";
import ResumeAnalyzer from "./ResumeAnalyzer";
import Resources from "../pages/Resources";
import Sidebar from "./Sidebar";
import SkillRoadmap from "./SkillRoadmap";
import StatsCard from "./StatsCard";

const ROLE_OPTIONS = ["Frontend Developer", "Backend Developer", "Data Scientist", "Full Stack Developer"];
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

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

// ─── Activity helpers ───────────────────────────────────────────
const getActivityKey = () => { try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return `cv_activity_log_${u.id || "guest"}`; } catch { return "cv_activity_log_guest"; } };

function loadActivity() {
  try {
    return JSON.parse(localStorage.getItem(getActivityKey()) || "[]");
  } catch {
    return [];
  }
}

function saveActivity(log) {
  localStorage.setItem(getActivityKey(), JSON.stringify(log.slice(0, 20))); // keep last 20
}

export function logActivity(message) {
  const log = loadActivity();
  log.unshift({ message, time: new Date().toISOString() });
  saveActivity(log);
}

// ────────────────────────────────────────────────────────────────

function Dashboard({ user, onUserUpdate, onLogout, analysisData, setAnalysisData, analysisLoading, setAnalysisLoading }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    bio: "",
    phone: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [savedProfile, setSavedProfile] = useState(null); // ✅ FIX 3: show saved data after save
  const profilePct = Math.round(["full_name","phone","location","linkedin_url","github_url","portfolio_url","bio"].filter(k => savedProfile?.[k]).length / 7 * 100);
  const location = useLocation();
  const navigate = useNavigate();

  const initials = user?.full_name ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";
  const score = analysisData?.match_score ?? 0;
  const foundCount = analysisData?.found_skills?.length ?? 0;
  const missingCount = analysisData?.missing_skills?.length ?? 0;
  const suggestionsCount = analysisData?.suggestions?.length ?? 0;
  const quickPrompts = ["Give me 5 ATS keywords for my role", "Which projects should I add first?", "How can I improve match score by 15%?"];

  const activePath = location.pathname === "/dashboard/" ? "/dashboard" : location.pathname;
  const activeSection = ROUTE_LABELS[activePath] || "Overview";

  // ✅ FIX 2: Load activity when Activity tab opens
  // close profile dropdown on outside click
  useEffect(() => {
    if (!showProfile) return;
    const handler = () => setShowProfile(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showProfile]);

  useEffect(() => {
    if (activePath === "/dashboard/activity") {
      setActivityLog(loadActivity());
    }
  }, [activePath]);

  // ✅ FIX 2: Log when resume is analyzed


  useEffect(() => {
    setProfileForm({
      full_name: user?.full_name || "",
      bio: user?.bio || "",
      phone: user?.phone || "",
      location: user?.location || "",
      linkedin_url: user?.linkedin_url || "",
      github_url: user?.github_url || "",
      portfolio_url: user?.portfolio_url || "",
    });
    // ✅ FIX 3: Initialize savedProfile from user data
    if (user) {
      setSavedProfile({
        full_name: user.full_name || "",
        bio: user.bio || "",
        phone: user.phone || "",
        location: user.location || "",
        linkedin_url: user.linkedin_url || "",
        github_url: user.github_url || "",
        portfolio_url: user.portfolio_url || "",
      });
    }
  }, [user]);

  function handleProfileFieldChange(event) {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setProfileError("Session expired. Please login again.");
      return;
    }

    setProfileSaving(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Failed to update profile.");
        return;
      }

      if (data.user && onUserUpdate) {
        onUserUpdate(data.user);
      }
      // ✅ FIX 3: Update savedProfile so UI shows updated data
      setSavedProfile({ ...profileForm });
      setProfileSuccess("Profile saved successfully! ✅");
      setEditMode(false);
      logActivity("Profile bio data updated");
    } catch {
      setProfileError("Unable to connect to server.");
    } finally {
      setProfileSaving(false);
    }
  }

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
          <StatsCard label="Skill Match" value={`${score}%`} hint="Current role-fit status" tone="blue" delay={0.05} />
          <StatsCard label="Skills Found" value={foundCount} hint="Detected from latest analysis" tone="green" delay={0.1} />
          <StatsCard label="Skills Missing" value={missingCount} hint="Top priorities to improve" tone="red" delay={0.15} />
          <StatsCard label="Suggestions" value={suggestionsCount} hint="Action tips available" tone="blue" delay={0.2} />
        </div>

        <motion.section
          className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Website Information</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">How this platform helps your career growth</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            CVisionary helps you improve resume quality and role-fit with a structured workflow.
            Use the sidebar sections to analyze your resume, check ATS readiness, compare job match, and follow
            a domain roadmap based on your target role.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <h4 className="text-sm font-semibold text-slate-900">Analyze Resume</h4>
              <p className="mt-1 text-sm text-slate-600">Upload your resume and select a role to get skill-match score, found skills, and missing skills.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <h4 className="text-sm font-semibold text-slate-900">AI Chat & Suggestions</h4>
              <p className="mt-1 text-sm text-slate-600">Ask follow-up questions and receive practical recommendations to strengthen resume impact.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <h4 className="text-sm font-semibold text-slate-900">ATS & Job Match</h4>
              <p className="mt-1 text-sm text-slate-600">Check ATS performance and compare with job requirements for targeted improvements.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <h4 className="text-sm font-semibold text-slate-900">Role Roadmap</h4>
              <p className="mt-1 text-sm text-slate-600">Follow a role-specific roadmap to close skill gaps and improve interview readiness.</p>
            </article>
          </div>
        </motion.section>
      </div>
    );
  }

  // ✅ FIX 2: Real activity from localStorage
  function renderActivity() {
    const log = activityLog;

    return (
      <motion.section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Recent Activity</h3>
            <p className="mt-1 text-sm text-slate-500">Everything you've done on CVisionary — auto tracked.</p>
          </div>
          {log.length > 0 && (
            <button
              onClick={() => {
                localStorage.removeItem(getActivityKey());
                setActivityLog([]);
              }}
              className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="mt-5 space-y-3">
          {log.length === 0 ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center text-sm text-amber-700">
              No activity yet — analyze your resume, check ATS, or update your profile to see activity here!
            </div>
          ) : (
            log.map((item, index) => (
              <div key={index} onClick={() => setSelectedActivity(selectedActivity === index ? null : index)} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{item.message}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{new Date(item.time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                  {selectedActivity === index && (
                    <div className="mt-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 space-y-1">
                      <p className="text-xs font-semibold text-sky-700">Activity Detail</p>
                      <p className="text-xs text-slate-500">Action: <span className="font-medium text-slate-700">{item.message.split("—")[0]?.trim()}</span></p>
                      {item.message.includes("—") && <p className="text-xs text-slate-500">Info: <span className="font-medium text-slate-700">{item.message.split("—").slice(1).join("—").trim()}</span></p>}
                      <p className="text-xs text-slate-400">Full date: {new Date(item.time).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "medium" })}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.section>
    );
  }

  // ✅ FIX 3: Settings — saved card + Edit Profile toggle
  function renderSettings() {
    const hasProfile = savedProfile && (savedProfile.full_name || savedProfile.phone || savedProfile.bio);
    return (

      <motion.section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Settings - Bio Data</h3>
            <p className="mt-1 text-sm text-slate-500">Add your personal information so your profile is complete and easier to manage.</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Logout
          </button>
        </div>


        {/* Saved Profile Card — visible when profile exists and not editing */}
        {hasProfile && !editMode && (
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">Your Saved Profile</p>
              <button onClick={() => setEditMode(true)} className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition">Edit Profile</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {savedProfile.full_name && <div className="rounded-xl border border-slate-100 bg-white p-3"><p className="text-xs text-slate-400">Full Name</p><p className="mt-0.5 text-sm font-medium text-slate-800">{savedProfile.full_name}</p></div>}
              {savedProfile.phone && <div className="rounded-xl border border-slate-100 bg-white p-3"><p className="text-xs text-slate-400">Phone</p><p className="mt-0.5 text-sm font-medium text-slate-800">{savedProfile.phone}</p></div>}
              {savedProfile.location && <div className="rounded-xl border border-slate-100 bg-white p-3"><p className="text-xs text-slate-400">Location</p><p className="mt-0.5 text-sm font-medium text-slate-800">{savedProfile.location}</p></div>}
              {savedProfile.linkedin_url && <div className="rounded-xl border border-slate-100 bg-white p-3"><p className="text-xs text-slate-400">LinkedIn</p><a href={savedProfile.linkedin_url} target="_blank" rel="noreferrer" className="mt-0.5 block truncate text-sm font-medium text-sky-600 hover:underline">{savedProfile.linkedin_url}</a></div>}
              {savedProfile.github_url && <div className="rounded-xl border border-slate-100 bg-white p-3"><p className="text-xs text-slate-400">GitHub</p><a href={savedProfile.github_url} target="_blank" rel="noreferrer" className="mt-0.5 block truncate text-sm font-medium text-sky-600 hover:underline">{savedProfile.github_url}</a></div>}
              {savedProfile.portfolio_url && <div className="rounded-xl border border-slate-100 bg-white p-3"><p className="text-xs text-slate-400">Portfolio</p><a href={savedProfile.portfolio_url} target="_blank" rel="noreferrer" className="mt-0.5 block truncate text-sm font-medium text-sky-600 hover:underline">{savedProfile.portfolio_url}</a></div>}
              {savedProfile.bio && <div className="rounded-xl border border-slate-100 bg-white p-3 sm:col-span-2"><p className="text-xs text-slate-400">Bio / Summary</p><p className="mt-0.5 text-sm text-slate-700 leading-relaxed">{savedProfile.bio}</p></div>}
            </div>
          </div>
        )}

        {/* Edit Form — show if no profile yet OR editMode true */}
        {(!hasProfile || editMode) && (
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Settings — Edit Profile</h3>
                <p className="mt-1 text-sm text-slate-500">Update your personal information and save.</p>
              </div>
              {editMode && <button onClick={() => setEditMode(false)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition">✕ Cancel</button>}
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleProfileSave}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Full Name</span><input type="text" name="full_name" value={profileForm.full_name} onChange={handleProfileFieldChange} placeholder="Your full name" className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Phone</span><input type="text" name="phone" value={profileForm.phone} onChange={handleProfileFieldChange} placeholder="+91 98765 43210" className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Location</span><input type="text" name="location" value={profileForm.location} onChange={handleProfileFieldChange} placeholder="City, Country" className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">LinkedIn URL</span><input type="url" name="linkedin_url" value={profileForm.linkedin_url} onChange={handleProfileFieldChange} placeholder="https://linkedin.com/in/username" className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">GitHub URL</span><input type="url" name="github_url" value={profileForm.github_url} onChange={handleProfileFieldChange} placeholder="https://github.com/username" className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
                <label className="block"><span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Portfolio URL</span><input type="url" name="portfolio_url" value={profileForm.portfolio_url} onChange={handleProfileFieldChange} placeholder="https://your-portfolio.com" className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
              </div>
              <label className="block"><span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Bio / Summary</span><textarea name="bio" value={profileForm.bio} onChange={handleProfileFieldChange} rows={4} placeholder="Write a short professional summary..." className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-sky-400" /></label>
              {profileError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{profileError}</p>}
              {profileSuccess && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{profileSuccess}</p>}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                <p className="text-xs text-slate-600">Email: <span className="font-medium text-slate-800">{user?.email || "-"}</span></p>
                <button type="submit" disabled={profileSaving} className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-200 disabled:opacity-70">{profileSaving ? "Saving..." : "Save Profile"}</button>
              </div>
            </form>
          </div>
        )}
      </motion.section>
    );
  }
  function renderContent() {
    if (activePath === "/dashboard/analyze") {
      return <ResumeAnalyzer roles={ROLE_OPTIONS} onAnalysisComplete={(data) => setAnalysisData({ ...data, target_role: data.role })} onLoadingChange={setAnalysisLoading} analysisData={analysisData} />;
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
      // ✅ FIX 1: analysisData pass hota hai — Resources auto-select karega target role as Primary
      return <Resources analysisData={analysisData} />;
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
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} analysisData={analysisData} />

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
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white shadow">{initials}</div>
                      <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Welcome, {user?.full_name?.split(" ")[0] || "User"}</h1>
                        <p className="mt-1 text-sm text-slate-500">Build a stronger resume with focused AI guidance and ATS friendly formatting</p>
                      </div>
                    </div>
                  </div>

                  {/* Right side professional elements */}
                  <div className="hidden sm:flex items-center gap-3 ml-auto">
                    <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm text-xs text-slate-500 font-medium">
                      <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                    </div>
                    <div className="relative">
                      <button onClick={() => setShowNotif(v => !v)} className="relative rounded-xl border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50 transition">
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        {loadActivity().length > 0 && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500"></span>}
                      </button>
                      {showNotif && (
                        <div className="absolute right-0 top-10 z-50 w-72 rounded-2xl border border-gray-200 bg-white shadow-xl">
                          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                            <span className="text-sm font-semibold text-slate-800">Notifications</span>
                            <button onClick={() => setShowNotif(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {loadActivity().length === 0 ? (
                              <p className="px-4 py-6 text-center text-xs text-slate-400">No notifications yet</p>
                            ) : loadActivity().slice(0,8).map((a, i) => (
                              <div key={i} className="border-b border-gray-50 px-4 py-3 last:border-0">
                                <p className="text-xs text-slate-700">{a.message}</p>
                                <p className="mt-0.5 text-[10px] text-slate-400">{new Date(a.time).toLocaleString("en-IN", {day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div onClick={(e) => { e.stopPropagation(); setShowProfile(v => !v); }} className="relative flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm cursor-pointer hover:border-sky-300 transition">
                      <div className="relative h-7 w-7">
                        <svg className="h-7 w-7 -rotate-90" viewBox="0 0 28 28">
                          <circle cx="14" cy="14" r="11" fill="none" stroke="#e2e8f0" strokeWidth="3"/>
                          <circle cx="14" cy="14" r="11" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={`${(profilePct * 0.69).toFixed(1)} 69`}/>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-blue-600">{profilePct}%</span>
                      </div>
                      <span className="text-xs font-medium text-slate-600">Profile</span>
                    </div>
                    {showProfile && (
                      <div className="absolute right-0 top-14 z-[999] w-64 rounded-2xl border border-slate-200 bg-white shadow-2xl p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Profile</p>
                        <p className="text-sm font-semibold text-slate-800">{user?.full_name || "User"}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user?.email || ""}</p>
                        <hr className="my-3 border-slate-100" />
                        <button onClick={(e) => { e.stopPropagation(); setShowProfile(false); navigate("/dashboard/settings"); }} className="w-full text-left text-xs text-sky-600 hover:text-sky-800 font-medium">Edit Profile in Settings</button>
                      </div>
                    )}
                  </div>

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

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";

const MENU_ITEMS = [
  {
    to: "/dashboard",
    end: true,
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h4v7H4v-7Zm6 0h10v7H10v-7Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    to: "/dashboard/analyze",
    label: "Analyze Resume",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-9-1h6m-6 4h6m-9 4h6" stroke="currentColor" strokeWidth="1.5" />
        <path d="m14 4 6 6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    to: "/dashboard/chat",
    label: "AI Chat",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M7 8h10M7 12h7m6 8-3.8-1.9a2 2 0 0 0-.9-.2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    to: "/dashboard/job-match",
    label: "Job Match",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="m10 13 2 2 4-4m5 1a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    to: "/dashboard/ats",
    label: "ATS Score",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M4 18h16M7 14l3-3 2 2 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    to: "/dashboard/roadmap",
    label: "Roadmap",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M4 7h6v4H4V7Zm10 0h6v4h-6V7ZM9 13h6v4H9v-4Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    to: "/dashboard/resources",
    label: "Resources",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M6 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 4h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    to: "/dashboard/activity",
    label: "Activity",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M4 12h4l2-4 4 8 2-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    to: "/dashboard/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 1-.1 1.2l2 1.5-2 3.4-2.4-1a8.5 8.5 0 0 1-2 1.2L13 21h-2l-.5-2.7a8.5 8.5 0 0 1-2-1.2l-2.4 1-2-3.4 2-1.5A8 8 0 0 1 4 12c0-.4 0-.8.1-1.2l-2-1.5 2-3.4 2.4 1a8.5 8.5 0 0 1 2-1.2L11 3h2l.5 2.7a8.5 8.5 0 0 1 2 1.2l2.4-1 2 3.4-2 1.5c.1.4.1.8.1 1.2Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
];

const getGoalsKey = () => { try { const u = JSON.parse(localStorage.getItem("user") || "{}"); return `cv_weekly_goals_${u.id || "guest"}`; } catch { return "cv_weekly_goals_guest"; } };

function loadGoals() {
  try { return JSON.parse(localStorage.getItem(getGoalsKey()) || "[]"); }
  catch { return []; }
}
function saveGoals(goals) {
  localStorage.setItem(getGoalsKey(), JSON.stringify(goals));
}

function Sidebar({ isOpen, onClose, analysisData }) {
  const [goals, setGoals] = useState(loadGoals);
  const [inputVal, setInputVal] = useState("");
  const [showInput, setShowInput] = useState(false);

  // Auto-add missing skills as goals when analysis happens
  useEffect(() => {
    if (!analysisData?.missing_skills?.length) return;

    const existing = loadGoals();
    const existingLabels = existing.map(g => g.label.toLowerCase());

    const newGoals = analysisData.missing_skills.slice(0, 4).map(skill => ({
      id: `skill-${skill}`,
      label: `Learn: ${skill}`,
      done: false,
      auto: true,
    })).filter(g => !existingLabels.includes(g.label.toLowerCase()));

    if (newGoals.length > 0) {
      const merged = [...newGoals, ...existing].slice(0, 10);
      setGoals(merged);
      saveGoals(merged);
    }
  }, [analysisData]);

  function toggleGoal(id) {
    const updated = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
    setGoals(updated);
    saveGoals(updated);
  }

  function addGoal() {
    const label = inputVal.trim();
    if (!label) return;
    const newGoal = { id: `custom-${Date.now()}`, label, done: false, auto: false };
    const updated = [newGoal, ...goals].slice(0, 10);
    setGoals(updated);
    saveGoals(updated);
    setInputVal("");
    setShowInput(false);
  }

  function deleteGoal(id) {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    saveGoals(updated);
  }

  const doneCount = goals.filter(g => g.done).length;
  const total = goals.length;
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/25 backdrop-blur-[1px] transition lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-80 flex-col border-r border-slate-200/70 bg-[linear-gradient(170deg,#fcfeff_0%,#f2f8fd_100%)] p-6 shadow-xl backdrop-blur-sm transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <NavLink to="/dashboard" onClick={onClose}><img src="/cvisionary-logo.svg" alt="CVisionary" className="h-11 w-11 rounded-2xl object-cover shadow-md hover:opacity-80 transition" /></NavLink>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI Career Studio</p>
            <h2 className="text-lg font-semibold text-slate-900">CVisionary</h2>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1 overflow-y-auto">
          {MENU_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose}>
              {({ isActive }) => (
                <motion.div
                  className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition duration-300 ${
                    isActive
                      ? "border-cyan-200 bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-700 shadow-sm"
                      : "border-transparent text-slate-600 hover:border-cyan-100 hover:bg-cyan-50/70 hover:text-sky-700"
                  }`}
                  whileHover={{ x: 2 }}
                >
                  <span className={`${isActive ? "text-sky-600" : "text-slate-500"}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Weekly Target Card */}
        <div className="mt-6 rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-600">Weekly Target</p>
            <button
              onClick={() => setShowInput(v => !v)}
              className="grid h-6 w-6 place-items-center rounded-lg bg-sky-100 text-sky-600 hover:bg-sky-200 transition text-sm font-bold"
              title="Add goal"
            >
              {showInput ? "−" : "+"}
            </button>
          </div>

          {/* Add input */}
          <AnimatePresence>
            {showInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addGoal()}
                    placeholder="Add a goal..."
                    className="h-8 flex-1 rounded-lg border border-cyan-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-sky-400"
                    autoFocus
                  />
                  <button
                    onClick={addGoal}
                    className="h-8 rounded-lg bg-sky-500 px-2.5 text-xs font-semibold text-white hover:bg-sky-600 transition"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Goals list */}
          {total === 0 ? (
            <p className="mt-2 text-xs text-slate-500">Analyze your resume to get auto goals, or add one with +</p>
          ) : (
            <ul className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {goals.map(goal => (
                <li key={goal.id} className="group flex items-start gap-2">
                  <button
                    onClick={() => toggleGoal(goal.id)}
                    className={`mt-0.5 h-4 w-4 shrink-0 rounded border transition ${
                      goal.done
                        ? "border-emerald-400 bg-emerald-400 text-white"
                        : "border-slate-300 bg-white hover:border-sky-400"
                    }`}
                  >
                    {goal.done && (
                      <svg viewBox="0 0 12 12" className="h-full w-full" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-xs leading-5 ${goal.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                    {goal.auto && <span className="mr-1 rounded-full bg-sky-100 px-1 py-0.5 text-[10px] text-sky-600">AI</span>}
                    {goal.label}
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="hidden text-slate-300 hover:text-rose-400 group-hover:block text-xs leading-none"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Progress bar */}
          {total > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>{doneCount}/{total} done</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-cyan-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

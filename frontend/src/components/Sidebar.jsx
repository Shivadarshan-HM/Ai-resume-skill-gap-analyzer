import { motion } from "framer-motion";
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

function Sidebar({ isOpen, onClose }) {
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
        className={`fixed inset-y-0 left-0 z-40 w-80 border-r border-slate-200/70 bg-[linear-gradient(170deg,#fcfeff_0%,#f2f8fd_100%)] p-6 shadow-xl backdrop-blur-sm transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="mb-8 flex items-center gap-3">
        <img src="/cvisionary-logo.svg" alt="CVisionary" className="h-11 w-11 rounded-2xl object-cover shadow-md" />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI Career Studio</p>
          <h2 className="text-lg font-semibold text-slate-900">CVisionary</h2>
        </div>
      </div>

      <nav className="space-y-2">
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

      <div className="mt-8 rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.12em] text-sky-600">Weekly Target</p>
        <p className="mt-2 text-sm text-slate-700">Add two measurable achievement bullets and one role-specific project this week.</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-cyan-100">
          <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500" />
        </div>
      </div>
      </aside>
    </>
  );
}

export default Sidebar;

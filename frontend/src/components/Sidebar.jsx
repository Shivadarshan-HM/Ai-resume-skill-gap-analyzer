import { motion } from "framer-motion";

const MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h4v7H4v-7Zm6 0h10v7H10v-7Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    id: "analyze",
    label: "Analyze Resume",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-9-1h6m-6 4h6m-9 4h6" stroke="currentColor" strokeWidth="1.5" />
        <path d="m14 4 6 6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    id: "chat",
    label: "AI Chat",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M7 8h10M7 12h7m6 8-3.8-1.9a2 2 0 0 0-.9-.2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    id: "job-match",
    label: "Job Match",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="m10 13 2 2 4-4m5 1a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Zm7.4-3.5a7.8 7.8 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1l-.3-2.6h-4l-.3 2.6a8 8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.8 7.8 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1l.3 2.6h4l.3-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
];

function Sidebar({ activeItem, onItemSelect, isOpen, onClose }) {
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
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-sm transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            <path d="M4 12h16M8 8l-4 4 4 4m8-8 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI Analyzer</p>
          <h2 className="text-lg font-semibold text-slate-900">Control Panel</h2>
        </div>
      </div>

      <nav className="space-y-2">
        {MENU_ITEMS.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => {
              onItemSelect(item.id);
              onClose();
            }}
            className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition duration-300 ${
              activeItem === item.id
                ? "border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 shadow-sm"
                : "border-transparent text-slate-600 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700"
            }`}
            whileHover={{ x: 2 }}
          >
            <span className={`${activeItem === item.id ? "text-blue-600" : "text-slate-500"}`}>{item.icon}</span>
            <span>{item.label}</span>
          </motion.button>
        ))}
      </nav>

      <div className="mt-8 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <p className="text-xs uppercase tracking-[0.12em] text-blue-600">Tip</p>
        <p className="mt-2 text-sm text-slate-600">Use role-specific keywords in your resume to improve match quality.</p>
      </div>
      </aside>
    </>
  );
}

export default Sidebar;

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
    id: "results",
    label: "Results",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M5 19V9m7 10V5m7 14v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
];

function Sidebar() {
  return (
    <aside className="w-full rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl shadow-panel lg:w-72 lg:p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-300 shadow-glow">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            <path d="M4 12h16M8 8l-4 4 4 4m8-8 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">AI Analyzer</p>
          <h2 className="font-display text-lg font-semibold text-white">Control Panel</h2>
        </div>
      </div>

      <nav className="space-y-2">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition duration-300 hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-cyan-200 hover:shadow-glow"
          >
            <span className="text-cyan-300/90 transition group-hover:text-cyan-200">{item.icon}</span>
            <span className="font-medium tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;

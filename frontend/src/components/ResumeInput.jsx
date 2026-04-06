function ResumeInput({
  resume,
  role,
  roles,
  loading,
  error,
  onResumeChange,
  onRoleChange,
  onSubmit
}) {
  return (
    <section className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl shadow-panel lg:p-7">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label htmlFor="resumeInput" className="text-sm font-medium text-slate-200">
            Resume Content
          </label>
          <textarea
            id="resumeInput"
            value={resume}
            onChange={(event) => onResumeChange(event.target.value)}
            placeholder="Paste your resume summary, projects, and key skills here..."
            rows={8}
            className="w-full resize-y rounded-2xl border border-white/20 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition duration-300 placeholder:text-slate-400 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-2">
            <label htmlFor="roleSelect" className="text-sm font-medium text-slate-200">
              Target Role
            </label>
            <select
              id="roleSelect"
              value={role}
              onChange={(event) => onRoleChange(event.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 outline-none transition duration-300 focus:border-fuchsia-300/70 focus:ring-2 focus:ring-fuchsia-300/30"
            >
              <option value="">Choose a role</option>
              {roles.map((roleName) => (
                <option key={roleName} value={roleName}>
                  {roleName}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-2xl border border-cyan-300/50 bg-cyan-300/20 px-8 text-sm font-semibold tracking-wide text-cyan-100 transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-300/30 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-300/35 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}

export default ResumeInput;

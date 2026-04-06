import { motion } from "framer-motion";

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
    <motion.section
      className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-sm lg:p-7"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label htmlFor="resumeInput" className="text-sm font-medium text-slate-700">
            Resume Content
          </label>
          <textarea
            id="resumeInput"
            value={resume}
            onChange={(event) => onResumeChange(event.target.value)}
            placeholder="Paste your resume summary, projects, and key skills here..."
            rows={8}
            className="w-full resize-y rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-700 outline-none transition duration-300 placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/70"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-2">
            <label htmlFor="roleSelect" className="text-sm font-medium text-slate-700">
              Target Role
            </label>
            <select
              id="roleSelect"
              value={role}
              onChange={(event) => onRoleChange(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-slate-700 outline-none transition duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/70"
            >
              <option value="">Choose a role</option>
              {roles.map((roleName) => (
                <option key={roleName} value={roleName}>
                  {roleName}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 text-sm font-semibold tracking-wide text-white shadow-md transition duration-300 disabled:cursor-not-allowed disabled:opacity-70"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </motion.button>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
      </form>
    </motion.section>
  );
}

export default ResumeInput;

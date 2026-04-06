import { motion } from "framer-motion";

function StatsCard({ label, value, hint, tone = "blue", delay = 0 }) {
  const toneMap = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-emerald-500 to-teal-500",
    red: "from-rose-500 to-orange-400"
  };

  return (
    <motion.article
      className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-sm"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -5, boxShadow: "0 20px 35px rgba(148, 163, 184, 0.35)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${toneMap[tone] || toneMap.blue}`} />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </motion.article>
  );
}

export default StatsCard;

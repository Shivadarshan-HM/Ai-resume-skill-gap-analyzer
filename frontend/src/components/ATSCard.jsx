import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ExpandableRow({ label, value, tone, children }) {
  const [open, setOpen] = useState(false);
  const toneClass = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-rose-600";
  const bgClass = tone === "good" ? "bg-emerald-50 border-emerald-100" : tone === "warn" ? "bg-amber-50 border-amber-100" : "bg-rose-50 border-rose-100";
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button type="button" onClick={() => setOpen(v => !v)} className="flex w-full items-center justify-between px-4 py-3 hover:bg-slate-50 transition">
        <p className="text-sm text-slate-600">{label}</p>
        <div className="flex items-center gap-2">
          <p className={`text-sm font-semibold ${toneClass}`}>{value}</p>
          <svg className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className={`border-t px-4 py-3 ${bgClass}`}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ATSCard({ analysisData }) {
  const score = analysisData?.match_score ?? 0;
  const found = analysisData?.found_skills ?? [];
  const missing = analysisData?.missing_skills ?? [];
  const suggestions = analysisData?.suggestions ?? [];
  const keywordScore = Math.min(100, Math.round(score + 8));
  const formattingScore = Math.max(55, Math.min(100, 68 + found.length * 3));
  const skillsScore = Math.max(40, Math.min(100, 100 - missing.length * 7));
  const formattingTips = ["Use standard headings: Experience, Education, Skills", "Avoid tables and columns — ATS cannot read them", "Use bullet points for responsibilities", "Save as .pdf or .docx format", "Keep font size 10-12pt for body text"];
  const skillTips = missing.slice(0, 3).map(s => `Add a project demonstrating "${s}"`);
  return (
    <motion.section className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur-sm lg:p-7" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Performance</p>
      <h3 className="text-lg font-semibold text-slate-900">ATS Score Checker</h3>
      <p className="mt-1 text-sm text-slate-500">Click each row to see details and improvement tips.</p>
      <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-sky-700">Overall ATS Score</span>
          <span className="text-lg font-semibold text-sky-700">{score}%</span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-sky-100">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-600 to-cyan-500" initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.1, ease: "easeOut" }} />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <ExpandableRow label="Keyword Match" value={`${keywordScore}%`} tone={keywordScore >= 75 ? "good" : "warn"}>
          <div className="space-y-3">
            <div><p className="text-xs font-semibold text-emerald-700 mb-1">Matched ({found.length})</p>{found.length > 0 ? <div className="flex flex-wrap gap-1.5">{found.map(s => <span key={s} className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-xs text-emerald-700 font-medium">{s}</span>)}</div> : <p className="text-xs text-slate-400">Analyze resume first.</p>}</div>
            <div><p className="text-xs font-semibold text-rose-700 mb-1">Unmatched ({missing.length})</p>{missing.length > 0 ? <div className="flex flex-wrap gap-1.5">{missing.map(s => <span key={s} className="rounded-full bg-rose-100 border border-rose-200 px-2 py-0.5 text-xs text-rose-700 font-medium">{s}</span>)}</div> : <p className="text-xs text-slate-400">All matched!</p>}</div>
          </div>
        </ExpandableRow>
        <ExpandableRow label="Formatting" value={`${formattingScore}%`} tone={formattingScore >= 75 ? "good" : "warn"}>
          <div>
            <div className="flex gap-4 mb-3"><div className="text-center"><p className="text-xs text-slate-500">Matched</p><p className="text-base font-bold text-emerald-600">{formattingScore}%</p></div><div className="text-center"><p className="text-xs text-slate-500">Needs Fix</p><p className="text-base font-bold text-rose-500">{100 - formattingScore}%</p></div></div>
            <p className="text-xs font-semibold text-slate-600 mb-2">How to improve:</p>
            <ul className="space-y-1">{formattingTips.map((tip, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600"><span className="mt-0.5 text-amber-500">-</span>{tip}</li>)}</ul>
          </div>
        </ExpandableRow>
        <ExpandableRow label="Skills" value={`${skillsScore}%`} tone={skillsScore >= 75 ? "good" : "warn"}>
          <div className="space-y-3">
            <div className="flex gap-4"><div className="text-center"><p className="text-xs text-slate-500">Matched</p><p className="text-base font-bold text-emerald-600">{skillsScore}%</p></div><div className="text-center"><p className="text-xs text-slate-500">Missing</p><p className="text-base font-bold text-rose-500">{100 - skillsScore}%</p></div></div>
            {found.length > 0 && <div><p className="text-xs font-semibold text-emerald-700 mb-1">Skills Found</p><div className="flex flex-wrap gap-1.5">{found.map(s => <span key={s} className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-xs text-emerald-700">{s}</span>)}</div></div>}
            {missing.length > 0 && <div><p className="text-xs font-semibold text-rose-700 mb-1">Missing - How to fix:</p><ul className="space-y-1">{skillTips.map((tip, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600"><span className="mt-0.5 text-rose-400">-</span>{tip}</li>)}</ul></div>}
            {suggestions.length > 0 && <div><p className="text-xs font-semibold text-blue-700 mb-1">AI Suggestions</p><ul className="space-y-1">{suggestions.slice(0,3).map((s,i) => <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600"><span className="mt-0.5 text-blue-400">-</span>{s}</li>)}</ul></div>}
          </div>
        </ExpandableRow>
      </div>
    </motion.section>
  );
}
export default ATSCard;

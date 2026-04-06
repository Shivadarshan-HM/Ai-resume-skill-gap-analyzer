import { useState } from "react";
import { analyzeResume } from "../services/api";
import ResultCard from "./ResultCard";
import ResumeInput from "./ResumeInput";
import Sidebar from "./Sidebar";

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Full Stack Developer"
];

function Dashboard() {
  const [resume, setResume] = useState("");
  const [role, setRole] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze(event) {
    event.preventDefault();
    setError("");

    if (!resume.trim() || !role) {
      setResult(null);
      setError("Please add resume text and select a target role.");
      return;
    }

    setLoading(true);

    try {
      const data = await analyzeResume({ resume, role });
      setResult(data);
    } catch (apiError) {
      setResult(null);
      setError(apiError.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(89,103,255,0.28),transparent_38%),radial-gradient(circle_at_100%_20%,rgba(0,224,255,0.23),transparent_36%),linear-gradient(140deg,#050507_0%,#0b1230_48%,#291046_100%)] px-4 py-6 font-display text-slate-100 lg:px-8 lg:py-10">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[18rem_1fr]">
        <Sidebar />

        <main className="space-y-6">
          <header className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-panel">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white lg:text-3xl">
              Resume Analyzer Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300 lg:text-base">
              Upload resume content, target your desired role, and get instant skill-gap insights
              with a premium analytics view.
            </p>
          </header>

          <ResumeInput
            resume={resume}
            role={role}
            roles={ROLE_OPTIONS}
            loading={loading}
            error={error}
            onResumeChange={setResume}
            onRoleChange={setRole}
            onSubmit={handleAnalyze}
          />

          <ResultCard result={result} loading={loading} />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

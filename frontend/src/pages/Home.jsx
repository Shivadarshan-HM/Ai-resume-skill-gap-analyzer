import { useState } from "react";
import Loader from "../components/Loader";
import ResultCard from "../components/ResultCard";
import ResumeInput from "../components/ResumeInput";
import RoleSelector from "../components/RoleSelector";
import { analyzeResume } from "../services/api";

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Full Stack Developer"
];

function Home() {
  const [resume, setResume] = useState("");
  const [role, setRole] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!resume.trim() || !role) {
      setError("Please provide resume text and select a role.");
      return;
    }

    setLoading(true);

    try {
      const data = await analyzeResume({ resume, role });
      setResult(data);
    } catch (apiError) {
      setResult(null);
      setError(apiError.message || "Unexpected error while analyzing resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="tag">Hackathon-Ready Project</p>
        <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm">
          <img src="/cvisionary-logo.svg" alt="CVisionary logo" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-sm font-semibold tracking-[0.16em] text-slate-700">CVisionary</span>
        </div>
        <h1>CVisionary</h1>
        <p>
          Compare resume content against role-based skill requirements and instantly
          discover your strongest matches and improvement areas.
        </p>
      </section>

      <section className="panel">
        <form onSubmit={handleSubmit} className="analyzer-form">
          <ResumeInput value={resume} onChange={setResume} />
          <RoleSelector value={role} onChange={setRole} roles={ROLE_OPTIONS} />

          <button type="submit" disabled={loading} className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>
        {loading && <Loader />}
        {result && !loading && <ResultCard result={result} loading={loading} />}
      </section>
    </main>
  );
}

export default Home;
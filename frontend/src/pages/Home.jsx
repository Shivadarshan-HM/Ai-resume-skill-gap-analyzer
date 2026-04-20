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
        <h1>AI Resume Skill Gap Analyzer</h1>
        <p>
          Compare resume content against role-based skill requirements and instantly
          discover your strongest matches and improvement areas.
        </p>
      </section>

      <section className="panel">
        <form onSubmit={handleSubmit} className="analyzer-form">
          <ResumeInput value={resume} onChange={setResume} />
          <RoleSelector value={role} onChange={setRole} roles={ROLE_OPTIONS} />

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Skill Gap"}
          </button>
        </form>

        {error ? <p className="error-banner">{error}</p> : null}
        {loading ? <Loader /> : <ResultCard result={result} />}
      </section>

      <footer className="mt-8 rounded-2xl border border-slate-200 bg-white/85 px-5 py-4 text-sm text-slate-600 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-slate-800">CVisionary</p>
          <a href="mailto:cvisionary@gmail.com" className="font-medium text-sky-700 underline underline-offset-2">
            cvisionary@gmail.com
          </a>
        </div>
        <p className="mt-2 leading-6">
          For any issues, feedback, or support requests, contact the CVisionary team through the email above.
        </p>
      </footer>
    </main>
  );
}

export default Home;

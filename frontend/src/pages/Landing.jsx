import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Role-Based Resume Analysis",
    description: "Analyze your resume against specific roles like Frontend, Backend, Data Science, and Full Stack.",
  },
  {
    title: "Skill Gap Detection",
    description: "See which skills are missing and what to improve to boost your shortlisting chances.",
  },
  {
    title: "ATS Optimization",
    description: "Get ATS-oriented suggestions to improve keyword coverage and formatting quality.",
  },
  {
    title: "Job Description Matching",
    description: "Compare your resume with real job descriptions and receive targeted action points.",
  },
];

const STEPS = [
  {
    title: "Upload Resume",
    description: "Upload PDF, DOCX, or TXT and let the AI parse key experience and skills.",
  },
  {
    title: "Choose Target Role",
    description: "Select the role you want and align your profile to role-specific expectations.",
  },
  {
    title: "Get Action Plan",
    description: "Receive ATS score, missing skills, and a clear roadmap to improve quickly.",
  },
];

const METRICS = [
  { value: "4+", label: "Role Tracks" },
  { value: "6-digit", label: "OTP Verification" },
  { value: "3-Step", label: "Analysis Flow" },
  { value: "24/7", label: "Anytime Access" },
];

const TESTIMONIALS = [
  {
    quote: "I used the missing skills list as my weekly plan and improved my resume confidence within days.",
    name: "Priya S.",
    role: "Final Year CS Student",
  },
  {
    quote: "The ATS score and keyword suggestions helped me rewrite my project section in a much better way.",
    name: "Rohit K.",
    role: "Frontend Developer",
  },
  {
    quote: "The job-match view made interview prep simple because I knew exactly what gaps to close first.",
    name: "Nisha M.",
    role: "Aspiring Data Analyst",
  },
];

const FAQS = [
  {
    question: "Who can use this platform?",
    answer: "Students, fresh graduates, and professionals who want better role-fit and ATS readiness.",
  },
  {
    question: "Do I need technical knowledge to use it?",
    answer: "No. The workflow is simple: upload resume, select role, and follow recommendations.",
  },
  {
    question: "What do I get after analysis?",
    answer: "You receive match score, missing skills, keyword guidance, and practical improvement suggestions.",
  },
];

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Process", href: "#process" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

const TRUSTED_BY = ["Student Clubs", "Hackathon Teams", "Bootcamp Learners", "Career Mentors", "Campus Communities"];

const HIGHLIGHTS = [
  "Instant resume-role gap mapping",
  "Actionable ATS keyword recommendations",
  "Clear weekly roadmap for improvement",
];

function Landing() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress((window.scrollY / total) * 100);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_8%,#cbeeff_0%,transparent_30%),radial-gradient(circle_at_82%_12%,#daf2ff_0%,transparent_34%),linear-gradient(145deg,#f9fcff_0%,#edf6fc_42%,#e9f6ff_100%)] px-4 py-6 sm:px-8 sm:py-10">
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-slate-200/60">
        <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-[width] duration-150" style={{ width: `${Math.min(100, Math.max(0, scrollProgress))}%` }} />
      </div>

      <motion.div className="pointer-events-none absolute -left-16 top-12 h-60 w-60 rounded-full bg-cyan-200/45 blur-3xl" animate={{ y: [0, -16, 0] }} transition={{ duration: 12, repeat: Infinity }} />
      <motion.div className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" animate={{ y: [0, 12, 0] }} transition={{ duration: 14, repeat: Infinity }} />

      <section className="mx-auto max-w-7xl rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-xl backdrop-blur-sm sm:p-8 lg:p-10">
        <header className="sticky top-4 z-20 rounded-2xl border border-white/80 bg-white/85 p-3 shadow-lg backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-500 text-sm font-semibold text-white shadow-md">AI</span>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">AI Career Studio</p>
              <h1 className="text-lg font-semibold text-slate-900">Resume Skill Gap Analyzer</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-700">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Toggle menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
            <Link
              to="/login?mode=signin"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-200 hover:text-sky-700"
            >
              Sign In
            </Link>
            <Link
              to="/login?mode=signup"
              className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            >
              Create Account
            </Link>
          </div>
          </div>

          {menuOpen ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2 lg:hidden">
              <div className="grid gap-1">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </header>

        <motion.div
          className="mt-6 overflow-hidden rounded-2xl border border-sky-100 bg-[linear-gradient(110deg,#ffffff_0%,#f3fbff_55%,#ecf8ff_100%)] px-4 py-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="flex w-max items-center gap-8 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700"
            animate={{ x: [0, -260, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          >
            {TRUSTED_BY.map((item) => (
              <span key={item}>{item}</span>
            ))}
            {TRUSTED_BY.map((item) => (
              <span key={`${item}-repeat`}>{item}</span>
            ))}
          </motion.div>
        </motion.div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr]" id="top">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p className="text-xs uppercase tracking-[0.18em] text-sky-700">Website Details</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Turn your resume into a role-ready profile with focused AI support
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              This website is built for students and professionals who want faster job outcomes.
              Instead of generic advice, you get role-specific skill gap analysis, ATS-focused feedback,
              and practical recommendations you can apply to your resume immediately.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/login?mode=signup" className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md">
                Start Free with Sign Up
              </Link>
              <Link to="/login?mode=signin" className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
                I Have an Account
              </Link>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              No credit card required to get started
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {HIGHLIGHTS.map((item, index) => (
                <motion.span
                  key={item}
                  className="rounded-full border border-sky-100 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.08 * index }}
                >
                  {item}
                </motion.span>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {METRICS.map((metric) => (
                <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{metric.label}</p>
                </article>
              ))}
            </div>
          </motion.div>

          <motion.aside
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[linear-gradient(160deg,#0b1220_0%,#0a3f63_58%,#0891b2_100%)] p-6 text-white shadow-xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl" />
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">What You Get</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">A complete resume growth workspace</h3>
            <ul className="mt-4 space-y-2 text-sm text-cyan-50/95">
              <li>Role-based analysis and skill detection</li>
              <li>ATS score and keyword recommendations</li>
              <li>Job description match percentage</li>
              <li>Skill roadmap and actionable next steps</li>
            </ul>

            <div className="mt-6 rounded-2xl border border-cyan-100/35 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-cyan-100">Quick Start</p>
              <p className="mt-2 text-sm text-cyan-50">Create an account, verify OTP, upload resume, choose role, and get instant insights.</p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-cyan-100">
                <span>Sample Match</span>
                <span>82%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" />
              </div>
              <p className="mt-2 text-xs text-cyan-50">Add 2 project bullets + 3 keywords to move toward 90%.</p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-xs text-cyan-50">Resume quality checks in under 60 seconds</div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-xs text-cyan-50">Role-specific suggestions, not generic templates</div>
            </div>
          </motion.aside>
        </div>

        <section className="mt-12" id="features">
          <div className="mb-5 flex items-end justify-between gap-3">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Features Included in This Website</h3>
            <p className="text-sm text-slate-500">Designed for practical outcomes</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {FEATURES.map((feature, index) => (
              <motion.article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.35, delay: 0.05 * index }}
                whileHover={{ y: -5, boxShadow: "0 20px 35px rgba(14, 116, 144, 0.14)" }}
              >
                <h4 className="text-base font-semibold text-slate-900">{feature.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm" id="process">
            <p className="text-xs uppercase tracking-[0.16em] text-sky-700">How It Works</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Simple process, clear output</h3>
            <div className="mt-5 space-y-3">
              {STEPS.map((step, index) => (
                <motion.div key={step.title} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4" whileHover={{ x: 3 }}>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">{index + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm" id="testimonials">
            <p className="text-xs uppercase tracking-[0.16em] text-sky-700">Why Users Like It</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Built for career momentum</h3>
            <div className="mt-5 space-y-3">
              {TESTIMONIALS.map((item) => (
                <blockquote key={item.name} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-700">"{item.quote}"</p>
                  <footer className="mt-2 text-xs text-slate-500">{item.name} • {item.role}</footer>
                </blockquote>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm" id="faq">
          <p className="text-xs uppercase tracking-[0.16em] text-sky-700">FAQ</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Common questions</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {FAQS.map((item) => (
              <article key={item.question} className="rounded-2xl border border-slate-200 bg-white p-4">
                <h4 className="text-sm font-semibold text-slate-900">{item.question}</h4>
                <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-cyan-100 bg-[linear-gradient(130deg,#e7f9ff_0%,#f1f9ff_48%,#f5fdff_100%)] p-6 text-center shadow-sm sm:p-8">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Ready to improve your resume with AI?</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Join now, verify your account, and start receiving role-focused recommendations that help you stand out.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login?mode=signup" className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md">
              Sign Up Now
            </Link>
            <Link to="/login?mode=signin" className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
              Sign In
            </Link>
          </div>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/75 px-4 py-3 text-xs text-slate-500">
          <p>AI Resume Skill Gap Analyzer • Built for practical career growth</p>
          <a href="#top" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700">
            Back to top
          </a>
        </footer>
      </section>
    </main>
  );
}

export default Landing;

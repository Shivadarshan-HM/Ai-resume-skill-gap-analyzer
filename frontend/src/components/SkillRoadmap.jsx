import { motion } from "framer-motion";

const ROLE_ROADMAPS = {
  "Frontend Developer": {
    title: "Frontend Developer Roadmap",
    intro: "A practical path to become job-ready for frontend roles.",
    stages: [
      {
        title: "Core Foundations",
        items: ["HTML semantics and page structure", "CSS layout, responsive design, and accessibility", "JavaScript fundamentals, DOM, and async basics"]
      },
      {
        title: "Framework Skills",
        items: ["React components, props, state, and hooks", "Routing, forms, and API integration", "Performance basics and reusable UI patterns"]
      },
      {
        title: "Portfolio Projects",
        items: ["Build a responsive dashboard or landing page", "Create a CRUD app with API calls", "Deploy a polished portfolio with 2-3 case studies"]
      },
      {
        title: "Interview Prep",
        items: ["Practice JavaScript and React interview questions", "Revise component design and debugging", "Prepare resume bullets with measurable impact"]
      }
    ]
  },
  "Backend Developer": {
    title: "Backend Developer Roadmap",
    intro: "A backend path focused on APIs, data, and reliable systems.",
    stages: [
      {
        title: "Core Foundations",
        items: ["Python or Node.js fundamentals", "HTTP, REST, and status codes", "Git, Linux basics, and environment setup"]
      },
      {
        title: "Server Skills",
        items: ["Build REST APIs with Flask or Express", "Authentication, validation, and error handling", "Database modeling with SQL and ORM tools"]
      },
      {
        title: "Real Projects",
        items: ["Create an authenticated API service", "Add database CRUD with pagination and filters", "Deploy the app with logging and basic monitoring"]
      },
      {
        title: "Interview Prep",
        items: ["Practice backend system design basics", "Revise SQL, APIs, and concurrency concepts", "Prepare impact-driven project explanations"]
      }
    ]
  },
  "Data Scientist": {
    title: "Data Scientist Roadmap",
    intro: "A data path for analysis, modeling, and business insight.",
    stages: [
      {
        title: "Core Foundations",
        items: ["Python, pandas, and NumPy basics", "Statistics, probability, and data cleaning", "SQL queries and data extraction"]
      },
      {
        title: "Analysis Skills",
        items: ["Exploratory data analysis and visualization", "Feature engineering and model selection", "Experiment design and metric interpretation"]
      },
      {
        title: "Portfolio Projects",
        items: ["Build an end-to-end analysis notebook", "Create one predictive modeling project", "Publish a dashboard or report with insights"]
      },
      {
        title: "Interview Prep",
        items: ["Revise stats, ML basics, and SQL", "Practice business-case storytelling", "Prepare concise explanations of model choices"]
      }
    ]
  },
  "Full Stack Developer": {
    title: "Full Stack Developer Roadmap",
    intro: "A balanced path across frontend, backend, and deployment.",
    stages: [
      {
        title: "Core Foundations",
        items: ["HTML, CSS, JavaScript, and Git", "API concepts and client-server flow", "Responsive UI and data handling basics"]
      },
      {
        title: "Build Both Sides",
        items: ["React or another frontend framework", "Backend APIs with auth and validation", "Database design and full request lifecycle"]
      },
      {
        title: "Capstone Projects",
        items: ["Build a complete product with login and CRUD", "Add dashboards, filters, and polished UI", "Deploy frontend and backend together"]
      },
      {
        title: "Interview Prep",
        items: ["Practice system design and project architecture", "Revise debugging across client and server", "Show breadth with strong portfolio stories"]
      }
    ]
  }
};

function SkillRoadmap({ analysisData }) {
  const role = analysisData?.role || analysisData?.target_role || "";
  const missingSkills = analysisData?.missing_skills ?? [];
  const roleRoadmap = ROLE_ROADMAPS[role];
  const roadmapSkills = missingSkills.length ? missingSkills.slice(0, 5) : [];

  return (
    <motion.section
      className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur-sm lg:p-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Growth Plan</p>
      <h3 className="text-lg font-semibold text-slate-900">{roleRoadmap?.title || "Skill Roadmap Generator"}</h3>
      <p className="mt-1 text-sm text-slate-500">{roleRoadmap?.intro || "Step-by-step learning path based on your resume gap and target role."}</p>

      {role ? (
        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Target Role</p>
          <p className="mt-1 text-sm font-medium text-slate-800">Roadmap to become a {role}</p>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          Select a target role in resume analysis to see a personalized roadmap.
        </div>
      )}

      {missingSkills.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Priority Gaps</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {roadmapSkills.map((skill) => (
              <span key={skill} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {(roleRoadmap?.stages || roadmapSkills.map((skill) => ({ title: `Learn ${skill}`, items: [`Understand the basics of ${skill}`, `Build one small project using ${skill}`, `Add ${skill} to your resume with evidence`] }))).map((step, index) => (
          <motion.div
            key={step.title}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-blue-600">Step {index + 1}</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{step.title}</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-500">
              {step.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default SkillRoadmap;

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

function ChatAssistant({ analysisData }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hi! Ask anything about your resume and I will guide you with practical suggestions."
    }
  ]);

  const contextSummary = useMemo(() => {
    const score = analysisData?.match_score ?? 0;
    const found = analysisData?.found_skills ?? [];
    const missing = analysisData?.missing_skills ?? [];

    return {
      score,
      found,
      missing
    };
  }, [analysisData]);

  function buildAssistantReply(question) {
    const normalized = question.toLowerCase();

    if (normalized.includes("score") || normalized.includes("ats")) {
      return `Your current match score is ${contextSummary.score}%. Improve it by adding measurable achievements and including missing role keywords.`;
    }

    if (normalized.includes("missing") || normalized.includes("improve")) {
      if (!contextSummary.missing.length) {
        return "Great progress. I do not see missing core skills for the selected role right now.";
      }
      return `Top skills to improve next: ${contextSummary.missing.slice(0, 5).join(", ")}. Add one project bullet for each skill.`;
    }

    if (normalized.includes("found") || normalized.includes("strength")) {
      if (!contextSummary.found.length) {
        return "I could not detect strong matched skills yet. Try adding your key tools and achievements clearly in the resume.";
      }
      return `Your strongest detected skills are ${contextSummary.found.slice(0, 5).join(", ")}. Emphasize outcomes tied to these.`;
    }

    return "Focus on impact-driven bullet points, role-specific keywords, and clean formatting. If you want, ask me about ATS score, missing skills, or interview readiness.";
  }

  function handleSend(event) {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed
    };

    const assistantMessage = {
      id: Date.now() + 1,
      role: "assistant",
      content: buildAssistantReply(trimmed)
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput("");
  }

  return (
    <motion.section
      className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg backdrop-blur-sm lg:p-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      whileHover={{ y: -5 }}
    >
      <h3 className="text-lg font-semibold text-slate-900">AI Resume Chat Assistant</h3>
      <p className="mt-1 text-sm text-slate-500">Ask follow-up questions and get quick, resume-focused guidance.</p>

      <div className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
              message.role === "user"
                ? "ml-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
            initial={{ opacity: 0, x: message.role === "user" ? 22 : -22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            {message.content}
          </motion.div>
        ))}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything about your resume..."
          className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition duration-300 focus:ring-2 focus:ring-blue-400"
        />
        <motion.button
          type="submit"
          className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-md"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Send
        </motion.button>
      </form>
    </motion.section>
  );
}

export default ChatAssistant;

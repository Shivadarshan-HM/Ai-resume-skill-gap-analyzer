import { useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const BASE_URL = "http://127.0.0.1:5000";

function getToken() {
  return localStorage.getItem("token");
}

function ChatAssistant({ analysisData }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hi! Ask anything about your resume and I will guide you with practical suggestions."
    }
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const contextSummary = useMemo(() => ({
    match_score: analysisData?.match_score ?? 0,
    found_skills: analysisData?.found_skills ?? [],
    missing_skills: analysisData?.missing_skills ?? [],
    role: analysisData?.role ?? ""
  }), [analysisData]);

  async function handleSend(event) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { id: Date.now(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          message: trimmed,
          analysis_data: contextSummary
        })
      });

      const data = await res.json();
      const reply =
        data.reply ||
        data.error ||
        data.msg ||
        (res.status === 401 ? "Please login again to use chat." : "Sorry, I could not process that.");

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: reply }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: "Connection error. Make sure backend is running." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.section
      className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur-sm lg:p-7"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Assistant</p>
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

        {loading && (
          <div className="flex max-w-[85%] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            <span className="h-3 w-3 animate-bounce rounded-full bg-sky-400" style={{ animationDelay: "0ms" }} />
            <span className="h-3 w-3 animate-bounce rounded-full bg-sky-400" style={{ animationDelay: "150ms" }} />
            <span className="h-3 w-3 animate-bounce rounded-full bg-sky-400" style={{ animationDelay: "300ms" }} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything about your resume..."
          disabled={loading}
          className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition duration-300 focus:ring-2 focus:ring-sky-400 disabled:opacity-60"
        />
        <motion.button
          type="submit"
          disabled={loading}
          className="h-11 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-200 disabled:opacity-60"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Send
        </motion.button>
      </form>
    </motion.section>
  );
}

export default ChatAssistant;

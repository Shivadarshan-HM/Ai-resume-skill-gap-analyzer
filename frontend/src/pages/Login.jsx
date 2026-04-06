import { useState } from "react";
import { motion } from "framer-motion";

function Login() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7fbff_0%,#eef3f8_40%,#e6f2ff_100%)] px-4 py-6 sm:px-8 sm:py-10">
      <motion.div
        className="pointer-events-none fixed -left-14 top-24 h-44 w-44 rounded-full bg-blue-200/45 blur-3xl"
        animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none fixed right-8 top-1/3 h-52 w-52 rounded-full bg-cyan-200/35 blur-3xl"
        animate={{ y: [0, 12, 0], x: [0, -10, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      <motion.section
        className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-xl backdrop-blur-sm transition duration-300 hover:shadow-2xl lg:grid-cols-2"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{ opacity: { duration: 0.6 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
      >
        <div className="relative flex flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-7 sm:p-10 lg:p-12">
          <button
            type="button"
            className="w-fit rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-gray-50"
          >
            AI Analyzer
          </button>

          <div className="mx-auto mt-10 w-full max-w-[380px] lg:mt-16">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Create an account</h1>
            <p className="mt-2 text-sm text-slate-500">Sign up and get started</p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-500">Full Name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Amelie Laurent"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition duration-300 placeholder:opacity-80 focus:ring-2 focus:ring-blue-400 focus:placeholder:opacity-55"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-500">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="amelielaurent7622@gmail.com"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition duration-300 placeholder:opacity-80 focus:ring-2 focus:ring-blue-400 focus:placeholder:opacity-55"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-500">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="**************"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-slate-700 outline-none transition duration-300 placeholder:opacity-80 focus:ring-2 focus:ring-blue-400 focus:placeholder:opacity-55"
                />
              </label>

              <motion.button
                type="submit"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md transition duration-300 hover:scale-105 hover:shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 16px 30px rgba(37, 99, 235, 0.35)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                Create account
              </motion.button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-gray-50"
                >
                  <span className="text-base"></span>
                  Apple
                </button>
                <button
                  type="button"
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-gray-50"
                >
                  <span className="font-semibold text-[#4285F4]">G</span>
                  Google
                </button>
              </div>
            </form>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 lg:mt-auto">
            <p>
              Already have an account?{" "}
              <a href="#" className="font-semibold text-slate-700 underline underline-offset-2">
                Sign in
              </a>
            </p>
            <a href="#" className="font-medium underline underline-offset-2">
              Terms & Conditions
            </a>
          </div>
        </div>

        <motion.div
          className="relative hidden p-4 lg:block"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
        >
          <motion.div
            className="relative h-full overflow-hidden rounded-3xl"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/15 via-transparent to-slate-900/25" />

            <div className="absolute left-6 top-6 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-slate-800 shadow-xl backdrop-blur-md">
              <p className="text-sm font-semibold">Resume Screening Sprint</p>
              <p className="mt-1 text-xs text-slate-600">09:30 AM - 10:00 AM</p>
            </div>

            <div className="absolute right-7 top-1/3 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-xl backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">Top Matches</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">89%</p>
            </div>

            <div className="absolute bottom-8 left-8 rounded-2xl border border-white/40 bg-white/75 px-5 py-4 text-slate-800 shadow-xl backdrop-blur-md">
              <p className="text-sm font-semibold">AI Resume Insights</p>
              <p className="mt-1 text-xs text-slate-600">Skill coverage and role-fit summary</p>
              <div className="mt-3 flex -space-x-2">
                <span className="h-7 w-7 rounded-full border-2 border-white bg-slate-300" />
                <span className="h-7 w-7 rounded-full border-2 border-white bg-slate-400" />
                <span className="h-7 w-7 rounded-full border-2 border-white bg-slate-500" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
    </main>
  );
}

export default Login;

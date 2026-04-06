function Button({ children, type = "button", onClick, className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full rounded-lg bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.35)] transition duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.45)] ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;

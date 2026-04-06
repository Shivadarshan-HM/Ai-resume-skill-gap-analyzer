function InputField({
  id,
  type,
  placeholder,
  value,
  onChange,
  icon,
  rightElement,
  autoComplete,
  containerClassName = "",
  iconClassName = "",
  inputClassName = ""
}) {
  return (
    <label htmlFor={id} className="block">
      <div
        className={`group flex items-center gap-3 rounded-lg border border-white/15 bg-black/30 px-4 py-3 transition duration-300 focus-within:border-cyan-300/60 focus-within:ring-2 focus-within:ring-cyan-300/25 ${containerClassName}`}
      >
        <span
          className={`text-slate-400 transition duration-300 group-focus-within:text-cyan-200 ${iconClassName}`}
        >
          {icon}
        </span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400 ${inputClassName}`}
        />
        {rightElement ? <span className="shrink-0">{rightElement}</span> : null}
      </div>
    </label>
  );
}

export default InputField;

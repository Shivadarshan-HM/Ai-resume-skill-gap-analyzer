function ResumeInput({ value, onChange }) {
  return (
    <div className="field-group">
      <label htmlFor="resumeInput" className="field-label">Resume Text</label>
      <textarea
        id="resumeInput"
        className="text-area"
        placeholder="Paste your resume summary, skills, and experience here..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={10}
      />
    </div>
  );
}

export default ResumeInput;

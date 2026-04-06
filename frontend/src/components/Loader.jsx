function Loader() {
  return (
    <div className="loader-row" role="status" aria-live="polite">
      <span className="loader" />
      <p>Analyzing your resume...</p>
    </div>
  );
}

export default Loader;

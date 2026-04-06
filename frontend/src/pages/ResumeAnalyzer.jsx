import ResumeAnalyzer from "../components/ResumeAnalyzer";

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Full Stack Developer"
];

function ResumeAnalyzerPage({ onAnalysisComplete, onLoadingChange }) {
  return (
    <div className="space-y-6">
      <ResumeAnalyzer
        roles={ROLE_OPTIONS}
        onAnalysisComplete={onAnalysisComplete}
        onLoadingChange={onLoadingChange}
      />
    </div>
  );
}

export default ResumeAnalyzerPage;

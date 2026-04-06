import JobMatch from "../components/JobMatch";

function JobMatchPage({ analysisData }) {
  return (
    <div className="space-y-6">
      <JobMatch analysisData={analysisData} />
    </div>
  );
}

export default JobMatchPage;

import ATSCard from "../components/ATSCard";

function ATSPage({ analysisData, loading }) {
  return (
    <div className="space-y-6">
      <ATSCard analysisData={analysisData} loading={loading} />
    </div>
  );
}

export default ATSPage;

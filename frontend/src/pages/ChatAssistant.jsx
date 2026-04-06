import ChatAssistant from "../components/ChatAssistant";

function ChatAssistantPage({ analysisData }) {
  return (
    <div className="space-y-6">
      <ChatAssistant analysisData={analysisData} />
    </div>
  );
}

export default ChatAssistantPage;

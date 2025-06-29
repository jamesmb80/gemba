import React from 'react';
import { ArrowLeftIcon, PrinterIcon, ShareIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ChatSession, ChatMessage } from '../types/session';
import { supabase } from '../lib/supabaseClient';

interface SessionDetailProps {
  session: ChatSession;
  onBack: () => void;
}

export const SessionDetail: React.FC<SessionDetailProps> = ({ session, onBack }) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!session) return;
    setIsLoading(true);
    setError(null);
    (async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('timestamp', { ascending: true });
      if (error) setError('Failed to load conversation.');
      else setMessages((data as ChatMessage[]) || []);
      setIsLoading(false);
    })();
  }, [session]);

  // Render confidence indicator
  const renderConfidenceIndicator = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <span title="High Confidence" className="text-green-500">🟢</span>;
      case 'medium':
        return <span title="Medium Confidence" className="text-yellow-500">🟡</span>;
      case 'low':
        return <span title="Low Confidence" className="text-red-500">🔴</span>;
      default:
        return null;
    }
  };

  // Add export functions
  const exportCSV = () => {
    const csv = messages.map(m => `${m.timestamp},${m.sender},${JSON.stringify(m.text)}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${session.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ session, messages }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${session.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  // For PDF export, you may use a library like jsPDF or html2pdf.js (add a placeholder for now)
  const exportPDF = () => {
    alert('PDF export coming soon!');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-2" aria-label="Go back">
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-xl font-bold">Session Detail</h1>
        <div className="ml-auto flex space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Export CSV" onClick={exportCSV}>
            <span>CSV</span>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Export JSON" onClick={exportJSON}>
            <span>JSON</span>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Export PDF" onClick={exportPDF}>
            <span>PDF</span>
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md mb-4">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold">Session {session.id.slice(0, 8)}...</h2>
              <p className="text-sm text-gray-500 mt-1">Session ID: {session.id}</p>
              <p className="text-sm text-gray-500">Started: {new Date(session.created_at).toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-2">Summary: {session.summary || 'No summary yet.'}</p>
            </div>
            <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 flex items-center">
              Active
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium mb-3">Conversation Transcript</h3>
          {error && <div className="text-red-600 font-semibold mb-3">{error}</div>}
          {isLoading ? (
            <div className="flex items-center justify-center py-8"><LoadingSpinner /></div>
          ) : messages.length === 0 ? (
            <div className="text-gray-500 py-8">No messages in this session yet.</div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex">
                  <div className="w-24 text-xs text-gray-500 pt-1">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className={`flex-1 ${message.sender === 'user' ? 'pl-4 border-l-4 border-blue-500' : 'pl-4 border-l-4 border-green-500'}`}>
                    <div className="flex items-center mb-1">
                      <span className="font-medium">
                        {message.sender === 'user' ? 'Engineer' : 'AI Assistant'}
                      </span>
                      {message.confidence && (
                        <span className="ml-2">{renderConfidenceIndicator(message.confidence)}</span>
                      )}
                    </div>
                    <div className="text-gray-800 whitespace-pre-line">{message.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

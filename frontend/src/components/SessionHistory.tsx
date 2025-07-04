import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { getChatSessions, ChatSession, Machine } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { ChatSession as SupabaseChatSession } from '../types/session';

interface SessionHistoryProps {
  machine: Machine;
  onSelectSession: (session: ChatSession) => void;
  onBack: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  machine,
  onSelectSession,
  onBack,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!machine) return;
    setLoading(true);
    const fetchSessions = async () => {
      let query = supabase
        .from('chat_sessions')
        .select('*')
        .eq('machine_id', machine.id)
        .order('created_at', { ascending: false });
      if (searchTerm) {
        query = query.textSearch('search_vector', searchTerm, { type: 'plain' });
      }
      const { data, error } = await query;
      if (!error) setSessions(data || []);
      setLoading(false);
    };
    fetchSessions();
    // Real-time subscription
    const subscription = supabase
      .channel('public:chat_sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_sessions' },
        fetchSessions,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [machine, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (!machine) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 mr-2"
          aria-label="Go back"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-xl font-bold">Session History</h1>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <form onSubmit={handleSearch} className="relative mb-4">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <SearchIcon className="absolute left-3 top-3 text-gray-400" size={20} />
          {loading && <LoadingSpinner className="absolute right-3 top-3" />}
        </form>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">{machine.name} - Past Sessions</h2>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No sessions found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session)}
                className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Session {session.id.slice(0, 8)}...</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {session.summary || 'No summary yet.'}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    Active
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

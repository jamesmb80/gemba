import React, { useEffect, useState, useRef } from 'react';
import { MicIcon, SendIcon, ArrowLeftIcon, VolumeIcon, Volume2Icon } from 'lucide-react';
import { LoadingSpinner } from './ui/LoadingSpinner';
import {
  getChatSessions,
  createChatSession,
  getChatMessages,
  addChatMessage,
  sendMessageToAI,
  Machine,
  ChatSession,
  ChatMessage,
} from '../lib/api';

interface ChatInterfaceProps {
  machine: Machine;
  onBack: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ machine, onBack }) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load or create chat session and fetch messages
  useEffect(() => {
    if (!machine) return;
    let isMounted = true;
    (async () => {
      setError(null);
      try {
        // Try to find existing session for this machine (latest)
        const sessions = await getChatSessions(machine.id || '');
        let chatSession = sessions[0];
        if (!chatSession) {
          chatSession = await createChatSession(machine.id || '');
        }
        if (!isMounted) return;
        setSession(chatSession);
        // Fetch messages
        const msgs = await getChatMessages(chatSession.id);
        if (!isMounted) return;
        setMessages(msgs);
      } catch (err) {
        setError('Failed to load chat session.');
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [machine]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !session) return;
    setIsProcessing(true);
    setError(null);
    try {
      // Add user message
      const userMsg: Omit<ChatMessage, 'id' | 'timestamp'> = {
        session_id: session.id,
        sender: 'user',
        text: inputValue,
      };
      const savedUserMsg = await addChatMessage(userMsg);
      setMessages((prev) => [...prev, savedUserMsg]);
      setInputValue('');
      // Call AI API
      const aiResponse = await sendMessageToAI({
        userMessage: savedUserMsg.text,
        machine,
        conversation: [...messages, savedUserMsg].map((m) => ({ sender: m.sender, text: m.text })),
      });
      // Add AI message
      const aiMsg: Omit<ChatMessage, 'id' | 'timestamp'> = {
        session_id: session.id,
        sender: 'ai',
        text: aiResponse.text,
        confidence: aiResponse.confidence,
      };
      const savedAiMsg = await addChatMessage(aiMsg);
      setMessages((prev) => [...prev, savedAiMsg]);
      // Text-to-speech if enabled
      if (audioEnabled) {
        const utterance = new window.SpeechSynthesisUtterance(aiResponse.text);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecord = () => {
    setIsRecording(true);
    // Simulate voice recording for 3 seconds (placeholder, can be replaced with real voice input)
    setTimeout(() => {
      setIsRecording(false);
      setInputValue(
        'The machine is making a loud grinding noise when starting up and displaying error code E-394.',
      );
    }, 3000);
  };

  // Render confidence indicator
  const renderConfidenceIndicator = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return (
          <span title="High Confidence" className="text-green-500">
            🟢
          </span>
        );
      case 'medium':
        return (
          <span title="Medium Confidence" className="text-yellow-500">
            🟡
          </span>
        );
      case 'low':
        return (
          <span title="Low Confidence" className="text-red-500">
            🔴
          </span>
        );
      default:
        return null;
    }
  };

  if (!machine) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Machine context header */}
      <div className="bg-white p-3 rounded-t-lg shadow-md border-b border-gray-200 flex justify-between items-center">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <div className="text-center">
          <h2 className="font-semibold">{machine.name}</h2>
          <p className="text-xs text-gray-500">Troubleshooting Session</p>
        </div>
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label={audioEnabled ? 'Disable audio' : 'Enable audio'}
        >
          {audioEnabled ? <Volume2Icon size={20} /> : <VolumeIcon size={20} />}
        </button>
      </div>
      {/* Chat messages */}
      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
        {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
        {messages.length === 0 && !isProcessing ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500">No messages yet. Start the conversation!</span>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user' ? 'bg-blue-600 text-white' : message.sender === 'ai' ? 'bg-white text-gray-800 border border-gray-200 shadow-sm' : 'bg-gray-200 text-gray-800'}`}
              >
                <div className="flex items-start">
                  {message.sender === 'ai' && renderConfidenceIndicator(message.confidence || '')}
                  <p className={message.sender === 'ai' ? 'ml-2' : ''}>{message.text}</p>
                </div>
                <div
                  className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        {isProcessing && (
          <div className="flex justify-start mb-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm flex items-center">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600">Processing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input area */}
      <div className="bg-white p-3 border-t border-gray-200 rounded-b-lg shadow-md">
        <form onSubmit={handleSend} className="flex items-center">
          <button
            type="button"
            onClick={handleRecord}
            className={`p-3 rounded-full mr-2 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            aria-label="Voice input"
          >
            <MicIcon size={20} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isRecording ? 'Listening...' : 'Type your message...'}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isRecording}
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 text-white rounded-full ml-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputValue.trim() || isProcessing}
            aria-label="Send message"
          >
            <SendIcon size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

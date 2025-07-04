import axios from 'axios';
import { API_BASE_URL } from './utils';
import { supabase } from './supabaseClient';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// Define a Machine type for CRUD functions
export interface Machine {
  id?: string;
  name: string;
  type?: string;
  image?: string;
  serial_number?: string;
  install_date?: string;
  last_maintenance?: string;
  department?: string;
  last_activity?: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
  notes?: string;
}

export async function getMachines(): Promise<Machine[]> {
  // Check if user is authenticated first
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('Session error:', sessionError);
    throw new Error('Authentication required');
  }
  if (!session) {
    throw new Error('Authentication required');
  }
  
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase error in getMachines:', error);
    throw error;
  }
  return data as Machine[];
}

export async function addMachine(machine: Machine): Promise<Machine> {
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');
  
  const { data, error } = await supabase.from('machines').insert([machine]).select().single();
  if (error) throw error;
  return data as Machine;
}

export async function updateMachine(id: string, updates: Partial<Machine>): Promise<Machine> {
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');
  
  const { data, error } = await supabase
    .from('machines')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Machine;
}

export async function deleteMachine(id: string): Promise<boolean> {
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');
  
  const { error } = await supabase.from('machines').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// Chat session and message types
export interface ChatSession {
  id: string;
  machine_id: string;
  user_id?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'ai';
  text: string;
  confidence?: 'high' | 'medium' | 'low';
  timestamp: string;
}

// Create a new chat session
export async function createChatSession(
  machine_id: string,
  user_id?: string,
): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{ machine_id, user_id }])
    .select()
    .single();
  if (error) throw error;
  return data as ChatSession;
}

// Get chat sessions for a machine (optionally filtered by user)
export async function getChatSessions(
  machine_id: string,
  user_id?: string,
): Promise<ChatSession[]> {
  let query = supabase
    .from('chat_sessions')
    .select('*')
    .eq('machine_id', machine_id)
    .order('created_at', { ascending: false });
  if (user_id) query = query.eq('user_id', user_id);
  const { data, error } = await query;
  if (error) throw error;
  return data as ChatSession[];
}

// Get messages for a session
export async function getChatMessages(session_id: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', session_id)
    .order('timestamp', { ascending: true });
  if (error) throw error;
  return data as ChatMessage[];
}

// Add a message to a session
export async function addChatMessage(
  message: Omit<ChatMessage, 'id' | 'timestamp'>,
): Promise<ChatMessage> {
  const { data, error } = await supabase.from('chat_messages').insert([message]).select().single();
  if (error) throw error;
  return data as ChatMessage;
}

// Send a message to the AI API (Anthropic Claude)
export async function sendMessageToAI({
  userMessage,
  machine,
  conversation,
}: {
  userMessage: string;
  machine: Machine;
  conversation: Array<{ sender: string; text: string }>;
}): Promise<{ text: string; confidence: 'high' | 'medium' | 'low' }> {
  // Compose system prompt with machine context
  const systemPrompt = `You are an expert troubleshooting assistant for the following machine: ${machine.name}. Use the context below to help the user. Be concise, clear, and helpful.`;

  // Compose messages for Anthropic API
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversation.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch('/api/anthropic-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.content[0].text,
      confidence: 'medium' as const,
    };
  } catch (error) {
    console.error('Anthropic API error:', error);
    return {
      text: "I apologize, but I'm having trouble connecting to my AI service right now. Please try again later or check the machine manual for assistance.",
      confidence: 'low' as const,
    };
  }
}

/**
 * Calls the Supabase Edge Function to process a PDF document.
 * @param documentId The UUID of the document record in the database
 * @param storagePath The storage path of the PDF in Supabase Storage
 */
export async function processPDFDocument(documentId: string, storagePath: string): Promise<void> {
  const edgeUrl = 'https://nqqtucoxjgosciunjnfx.supabase.co/functions/v1/process-pdf';
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const body = JSON.stringify({
    storage_path: storagePath,
    document_id: documentId,
  });
  const response = await fetch(edgeUrl, {
    method: 'POST',
    headers,
    body,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || 'Failed to process PDF');
  }
}

export interface ChatSession {
  id: string;
  machine_id: string;
  user_id: string;
  created_at: string;
  summary?: string;
  search_vector?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: string;
  text: string;
  confidence?: string;
  timestamp: string;
} 
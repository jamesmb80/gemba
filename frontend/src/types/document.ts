export interface Document {
  id: string;
  machine_id: string;
  uploader_id: string;
  filename: string;
  storage_path: string;
  uploaded_at: string;
  extracted_text?: string;
  metadata?: Record<string, any>;
  processing_status?: string;
  page_count?: number;
  file_size?: number;
  processed_at?: string;
  error_message?: string;
} 
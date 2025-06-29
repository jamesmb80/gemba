// types.ts
export interface ProcessPDFRequest {
  storage_path: string;
  document_id: string;
}

export interface ProcessPDFResponse {
  extractedText: string;
  pageCount: number;
  fileSize: number;
  processedAt: string;
  error?: string;
} 
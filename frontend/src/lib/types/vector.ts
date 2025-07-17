/**
 * Vector database types for document embeddings and chunks
 */

export interface Embedding {
  id: string;
  tenant_id: string;
  document_id: string;
  chunk_id: string;
  chunk_text: string;
  chunk_metadata: Record<string, any>;
  embedding: number[]; // Vector array
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  tenant_id: string;
  document_id: string;
  chunk_index: number;
  parent_chunk_id?: string | null;
  previous_chunk_id?: string | null;
  next_chunk_id?: string | null;
  chunk_type: ChunkType;
  page_number?: number | null;
  section_header?: string | null;
  created_at: string;
  updated_at: string;
}

export type ChunkType = 'text' | 'table' | 'diagram' | 'list';

export interface VectorSearchParams {
  query_embedding: number[];
  limit?: number;
  threshold?: number;
  tenant_id: string;
  document_ids?: string[];
}

export interface VectorSearchResult {
  chunk_id: string;
  chunk_text: string;
  chunk_metadata: Record<string, any>;
  document_id: string;
  similarity_score: number;
  page_number?: number;
  section_header?: string;
}

export interface EmbeddingGenerationRequest {
  text: string;
  model?: 'text-embedding-ada-002' | string;
}

export interface EmbeddingGenerationResponse {
  embedding: number[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

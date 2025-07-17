-- Migration: Enable pgvector extension and create vector database infrastructure
-- Date: 2025-01-16
-- Purpose: Set up pgvector for storing and querying document embeddings

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table for storing document vectors
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    document_id UUID NOT NULL,
    chunk_id UUID NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_metadata JSONB DEFAULT '{}',
    embedding vector(1536), -- OpenAI ada-002 embeddings are 1536 dimensions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create document_chunks table for storing chunk relationships
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    document_id UUID NOT NULL,
    chunk_index INTEGER NOT NULL,
    parent_chunk_id UUID,
    previous_chunk_id UUID,
    next_chunk_id UUID,
    chunk_type VARCHAR(50) NOT NULL, -- 'text', 'table', 'diagram', 'list'
    page_number INTEGER,
    section_header TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_id, chunk_index)
);

-- Create indexes for vector similarity search using ivfflat
-- Note: For production with >1M vectors, consider using HNSW index
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS embeddings_tenant_id_idx ON embeddings(tenant_id);
CREATE INDEX IF NOT EXISTS embeddings_document_id_idx ON embeddings(document_id);
CREATE INDEX IF NOT EXISTS embeddings_chunk_id_idx ON embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS document_chunks_tenant_id_idx ON document_chunks(tenant_id);
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON document_chunks(document_id);

-- Add foreign key constraint between embeddings and document_chunks
ALTER TABLE embeddings 
ADD CONSTRAINT embeddings_chunk_id_fkey 
FOREIGN KEY (chunk_id) 
REFERENCES document_chunks(id) 
ON DELETE CASCADE;

-- Enable Row Level Security (RLS)
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation on embeddings table
CREATE POLICY "Tenant isolation for embeddings select" ON embeddings
    FOR SELECT
    USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Tenant isolation for embeddings insert" ON embeddings
    FOR INSERT
    WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Tenant isolation for embeddings update" ON embeddings
    FOR UPDATE
    USING (tenant_id = auth.jwt() ->> 'tenant_id'::text)
    WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Tenant isolation for embeddings delete" ON embeddings
    FOR DELETE
    USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- Create RLS policies for tenant isolation on document_chunks table
CREATE POLICY "Tenant isolation for document_chunks select" ON document_chunks
    FOR SELECT
    USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Tenant isolation for document_chunks insert" ON document_chunks
    FOR INSERT
    WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Tenant isolation for document_chunks update" ON document_chunks
    FOR UPDATE
    USING (tenant_id = auth.jwt() ->> 'tenant_id'::text)
    WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Tenant isolation for document_chunks delete" ON document_chunks
    FOR DELETE
    USING (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_embeddings_updated_at BEFORE UPDATE ON embeddings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_chunks_updated_at BEFORE UPDATE ON document_chunks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE embeddings IS 'Stores vector embeddings for document chunks with multi-tenant isolation';
COMMENT ON TABLE document_chunks IS 'Stores document chunk metadata and relationships';
COMMENT ON COLUMN embeddings.embedding IS 'Vector embedding of chunk text (1536 dimensions for OpenAI ada-002)';
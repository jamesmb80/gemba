-- Rollback script for pgvector installation
-- Run this script to completely remove vector database infrastructure

-- Step 1: Disable feature flag (application level)
-- This should be done via environment variable: VECTOR_SEARCH_ENABLED=false

-- Step 2: Drop tables (cascading will remove dependent objects)
DROP TABLE IF EXISTS embeddings CASCADE;
DROP TABLE IF EXISTS document_chunks CASCADE;

-- Step 3: Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 4: Drop the pgvector extension
DROP EXTENSION IF EXISTS vector CASCADE;

-- Step 5: Verify cleanup
DO $$
DECLARE
    vector_exists BOOLEAN;
    tables_exist BOOLEAN;
BEGIN
    -- Check if vector extension still exists
    SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
    ) INTO vector_exists;
    
    -- Check if tables still exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('embeddings', 'document_chunks')
    ) INTO tables_exist;
    
    IF vector_exists THEN
        RAISE WARNING 'Vector extension still exists after rollback attempt';
    END IF;
    
    IF tables_exist THEN
        RAISE WARNING 'Vector tables still exist after rollback attempt';
    END IF;
    
    IF NOT vector_exists AND NOT tables_exist THEN
        RAISE NOTICE 'Rollback completed successfully';
    END IF;
END $$;
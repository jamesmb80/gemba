-- Test script to verify pgvector installation and functionality
-- This should be run manually after applying the migration

-- Test 1: Verify pgvector extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Test 2: Verify vector operations are available
SELECT '[1,2,3]'::vector;

-- Test 3: Test vector similarity operations
SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector AS cosine_distance;

-- Test 4: Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('embeddings', 'document_chunks');

-- Test 5: Verify indexes were created
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('embeddings', 'document_chunks');

-- Test 6: Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('embeddings', 'document_chunks');

-- Test 7: Test inserting a sample vector (will fail due to RLS without proper auth)
-- This is expected behavior and validates RLS is working
-- INSERT INTO embeddings (tenant_id, document_id, chunk_id, chunk_text, embedding)
-- VALUES (
--     gen_random_uuid(),
--     gen_random_uuid(), 
--     gen_random_uuid(),
--     'Test chunk',
--     '[0.1, 0.2, 0.3]'::vector
-- );
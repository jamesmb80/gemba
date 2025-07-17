-- Verify pgvector functions and operators are available

-- Vector distance functions
SELECT 
    'cosine_distance' as function_name,
    '[1,2,3]'::vector <-> '[4,5,6]'::vector as result
UNION ALL
SELECT 
    'euclidean_distance' as function_name,
    '[1,2,3]'::vector <#> '[4,5,6]'::vector as result
UNION ALL
SELECT 
    'inner_product' as function_name,
    '[1,2,3]'::vector <@> '[4,5,6]'::vector as result;

-- Vector dimension functions
SELECT 
    'vector_dims' as function_name,
    vector_dims('[1,2,3,4,5]'::vector)::text as result;

-- Vector norm function
SELECT 
    'vector_norm' as function_name,
    vector_norm('[3,4]'::vector)::text as result;

-- List available vector operators
SELECT 
    oprname as operator_name,
    oprleft::regtype as left_type,
    oprright::regtype as right_type,
    oprresult::regtype as result_type
FROM pg_operator
WHERE oprname IN ('<->', '<#>', '<@>')
AND oprleft = 'vector'::regtype;
/**
 * Vector database operations with feature flag protection
 */

import { isFeatureEnabled } from '../featureFlags';
import { vectorDb } from './vector';
import type { VectorSearchParams, VectorSearchResult } from '../types/vector';

/**
 * Feature-flagged vector search
 */
export async function searchWithVectors(
  params: VectorSearchParams,
): Promise<VectorSearchResult[] | null> {
  if (!isFeatureEnabled('VECTOR_SEARCH_ENABLED')) {
    console.log('Vector search is disabled via feature flag');
    return null;
  }

  try {
    return await vectorDb.searchSimilar(params);
  } catch (error) {
    console.error('Vector search failed:', error);
    // Graceful degradation - return null instead of throwing
    return null;
  }
}

/**
 * Example usage in a React component
 */
export function ExampleVectorSearchUsage() {
  const handleSearch = async (query: string) => {
    // Check feature flag before attempting vector operations
    if (!isFeatureEnabled('VECTOR_SEARCH_ENABLED')) {
      console.log('Using fallback search method');
      // Use traditional search method
      return;
    }

    // Proceed with vector search
    const results = await searchWithVectors({
      query_embedding: [], // Would be generated from query
      tenant_id: 'current-tenant',
      limit: 10,
    });

    if (results) {
      // Handle vector search results
      console.log('Vector search results:', results);
    } else {
      // Handle fallback case
      console.log('Vector search unavailable, using fallback');
    }
  };

  return { handleSearch };
}

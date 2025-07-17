/**
 * Chunk relationship management and hierarchy utilities
 */

import { DocumentChunk, ChunkRelationships, ChunkMetadata } from '../types/chunking';

export interface ChunkGraph {
  nodes: Map<string, DocumentChunk>;
  edges: Map<string, Set<string>>;
  roots: Set<string>;
  leaves: Set<string>;
}

export interface ChunkHierarchy {
  levels: Map<number, DocumentChunk[]>;
  parents: Map<string, string>;
  children: Map<string, string[]>;
  siblings: Map<string, string[]>;
}

export interface ChunkSequence {
  previous: Map<string, string>;
  next: Map<string, string>;
  sequences: ChunkSequence[];
}

/**
 * Builds a graph representation of chunk relationships
 */
export function buildChunkGraph(chunks: DocumentChunk[]): ChunkGraph {
  const nodes = new Map<string, DocumentChunk>();
  const edges = new Map<string, Set<string>>();
  const roots = new Set<string>();
  const leaves = new Set<string>();

  // Build nodes
  for (const chunk of chunks) {
    nodes.set(chunk.id, chunk);
    edges.set(chunk.id, new Set());
  }

  // Build edges and identify roots/leaves
  for (const chunk of chunks) {
    const relationships = chunk.relationships;

    // Previous/next relationships
    if (relationships.previousChunkId) {
      edges.get(relationships.previousChunkId)?.add(chunk.id);
    } else {
      roots.add(chunk.id);
    }

    if (relationships.nextChunkId) {
      edges.get(chunk.id)?.add(relationships.nextChunkId);
    } else {
      leaves.add(chunk.id);
    }

    // Parent/child relationships
    if (relationships.parentChunkId) {
      edges.get(relationships.parentChunkId)?.add(chunk.id);
    } else if (!relationships.previousChunkId) {
      roots.add(chunk.id);
    }

    for (const childId of relationships.childChunkIds) {
      edges.get(chunk.id)?.add(childId);
    }
  }

  return {
    nodes,
    edges,
    roots,
    leaves,
  };
}

/**
 * Builds hierarchical representation of chunks
 */
export function buildChunkHierarchy(chunks: DocumentChunk[]): ChunkHierarchy {
  const levels = new Map<number, DocumentChunk[]>();
  const parents = new Map<string, string>();
  const children = new Map<string, string[]>();
  const siblings = new Map<string, string[]>();

  // Group by hierarchy level
  for (const chunk of chunks) {
    const level = chunk.relationships.hierarchyLevel;
    if (!levels.has(level)) {
      levels.set(level, []);
    }
    levels.get(level)!.push(chunk);
  }

  // Build parent-child relationships
  for (const chunk of chunks) {
    const relationships = chunk.relationships;

    if (relationships.parentChunkId) {
      parents.set(chunk.id, relationships.parentChunkId);
    }

    if (relationships.childChunkIds.length > 0) {
      children.set(chunk.id, [...relationships.childChunkIds]);
    }
  }

  // Also build children map from parent relationships
  for (const chunk of chunks) {
    const relationships = chunk.relationships;

    if (relationships.parentChunkId) {
      const parentId = relationships.parentChunkId;
      if (!children.has(parentId)) {
        children.set(parentId, []);
      }
      if (!children.get(parentId)!.includes(chunk.id)) {
        children.get(parentId)!.push(chunk.id);
      }
    }
  }

  // Build sibling relationships
  for (const chunk of chunks) {
    const parentId = parents.get(chunk.id);
    if (parentId) {
      const siblingsIds = children.get(parentId) || [];
      siblings.set(
        chunk.id,
        siblingsIds.filter((id) => id !== chunk.id),
      );
    }
  }

  return {
    levels,
    parents,
    children,
    siblings,
  };
}

/**
 * Validates chunk relationships for consistency
 */
export function validateChunkRelationships(chunks: DocumentChunk[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const chunkIds = new Set(chunks.map((c) => c.id));

  for (const chunk of chunks) {
    const relationships = chunk.relationships;

    // Validate previous/next chain
    if (relationships.previousChunkId && !chunkIds.has(relationships.previousChunkId)) {
      errors.push(
        `Chunk ${chunk.id} references non-existent previous chunk ${relationships.previousChunkId}`,
      );
    }

    if (relationships.nextChunkId && !chunkIds.has(relationships.nextChunkId)) {
      errors.push(
        `Chunk ${chunk.id} references non-existent next chunk ${relationships.nextChunkId}`,
      );
    }

    // Validate parent/child relationships
    if (relationships.parentChunkId && !chunkIds.has(relationships.parentChunkId)) {
      errors.push(
        `Chunk ${chunk.id} references non-existent parent chunk ${relationships.parentChunkId}`,
      );
    }

    for (const childId of relationships.childChunkIds) {
      if (!chunkIds.has(childId)) {
        errors.push(`Chunk ${chunk.id} references non-existent child chunk ${childId}`);
      }
    }

    // Validate hierarchy levels
    if (relationships.hierarchyLevel < 0) {
      errors.push(`Chunk ${chunk.id} has invalid hierarchy level ${relationships.hierarchyLevel}`);
    }

    // Validate bidirectional relationships
    if (relationships.previousChunkId) {
      const prevChunk = chunks.find((c) => c.id === relationships.previousChunkId);
      if (prevChunk && prevChunk.relationships.nextChunkId !== chunk.id) {
        errors.push(
          `Chunk ${chunk.id} and ${relationships.previousChunkId} have inconsistent prev/next relationship`,
        );
      }
    }

    if (relationships.nextChunkId) {
      const nextChunk = chunks.find((c) => c.id === relationships.nextChunkId);
      if (nextChunk && nextChunk.relationships.previousChunkId !== chunk.id) {
        errors.push(
          `Chunk ${chunk.id} and ${relationships.nextChunkId} have inconsistent prev/next relationship`,
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Finds all chunks in a sequence starting from a given chunk
 */
export function getChunkSequence(chunks: DocumentChunk[], startChunkId: string): DocumentChunk[] {
  const sequence: DocumentChunk[] = [];
  const chunkMap = new Map(chunks.map((c) => [c.id, c]));

  let currentChunk = chunkMap.get(startChunkId);

  // Go to the beginning of the sequence
  while (currentChunk?.relationships.previousChunkId) {
    currentChunk = chunkMap.get(currentChunk.relationships.previousChunkId);
  }

  // Collect the sequence
  while (currentChunk) {
    sequence.push(currentChunk);
    const nextId = currentChunk.relationships.nextChunkId;
    currentChunk = nextId ? chunkMap.get(nextId) : undefined;
  }

  return sequence;
}

/**
 * Finds all children of a chunk (recursive)
 */
export function getChunkDescendants(chunks: DocumentChunk[], chunkId: string): DocumentChunk[] {
  const descendants: DocumentChunk[] = [];
  const chunkMap = new Map(chunks.map((c) => [c.id, c]));
  const visited = new Set<string>();

  function collectDescendants(id: string) {
    if (visited.has(id)) return;
    visited.add(id);

    const chunk = chunkMap.get(id);
    if (!chunk) return;

    for (const childId of chunk.relationships.childChunkIds) {
      const child = chunkMap.get(childId);
      if (child && !visited.has(childId)) {
        descendants.push(child);
        collectDescendants(childId);
      }
    }
  }

  collectDescendants(chunkId);
  return descendants;
}

/**
 * Finds all ancestors of a chunk
 */
export function getChunkAncestors(chunks: DocumentChunk[], chunkId: string): DocumentChunk[] {
  const ancestors: DocumentChunk[] = [];
  const chunkMap = new Map(chunks.map((c) => [c.id, c]));

  let current = chunkMap.get(chunkId);

  while (current?.relationships.parentChunkId) {
    const parent = chunkMap.get(current.relationships.parentChunkId);
    if (parent) {
      ancestors.unshift(parent); // Add to beginning to maintain order
      current = parent;
    } else {
      break;
    }
  }

  return ancestors;
}

/**
 * Finds chunks at a specific hierarchy level
 */
export function getChunksAtLevel(chunks: DocumentChunk[], level: number): DocumentChunk[] {
  return chunks.filter((chunk) => chunk.relationships.hierarchyLevel === level);
}

/**
 * Finds sibling chunks (same parent)
 */
export function getSiblingChunks(chunks: DocumentChunk[], chunkId: string): DocumentChunk[] {
  const chunk = chunks.find((c) => c.id === chunkId);
  if (!chunk?.relationships.parentChunkId) {
    return [];
  }

  const parentId = chunk.relationships.parentChunkId;
  return chunks.filter((c) => c.relationships.parentChunkId === parentId && c.id !== chunkId);
}

/**
 * Repairs broken chunk relationships
 */
export function repairChunkRelationships(chunks: DocumentChunk[]): {
  repairedChunks: DocumentChunk[];
  repairLog: string[];
} {
  const repairedChunks = chunks.map((c) => ({ ...c })); // Deep copy
  const repairLog: string[] = [];
  const chunkMap = new Map(repairedChunks.map((c) => [c.id, c]));

  // Repair previous/next chain
  for (const chunk of repairedChunks) {
    const relationships = chunk.relationships;

    // Check if next chunk exists and has correct back reference
    if (relationships.nextChunkId) {
      const nextChunk = chunkMap.get(relationships.nextChunkId);
      if (nextChunk && nextChunk.relationships.previousChunkId !== chunk.id) {
        nextChunk.relationships.previousChunkId = chunk.id;
        repairLog.push(`Fixed back reference from ${nextChunk.id} to ${chunk.id}`);
      }
    }

    // Check if previous chunk exists and has correct forward reference
    if (relationships.previousChunkId) {
      const prevChunk = chunkMap.get(relationships.previousChunkId);
      if (prevChunk && prevChunk.relationships.nextChunkId !== chunk.id) {
        prevChunk.relationships.nextChunkId = chunk.id;
        repairLog.push(`Fixed forward reference from ${prevChunk.id} to ${chunk.id}`);
      }
    }
  }

  // Repair parent/child relationships
  for (const chunk of repairedChunks) {
    const relationships = chunk.relationships;

    // Ensure parent has this chunk as child
    if (relationships.parentChunkId) {
      const parent = chunkMap.get(relationships.parentChunkId);
      if (parent && !parent.relationships.childChunkIds.includes(chunk.id)) {
        parent.relationships.childChunkIds.push(chunk.id);
        repairLog.push(`Added ${chunk.id} as child of ${parent.id}`);
      }
    }

    // Ensure children have this chunk as parent
    for (const childId of relationships.childChunkIds) {
      const child = chunkMap.get(childId);
      if (child && child.relationships.parentChunkId !== chunk.id) {
        child.relationships.parentChunkId = chunk.id;
        repairLog.push(`Set ${chunk.id} as parent of ${child.id}`);
      }
    }
  }

  return {
    repairedChunks,
    repairLog,
  };
}

/**
 * Optimizes chunk relationships by removing redundant connections
 */
export function optimizeChunkRelationships(chunks: DocumentChunk[]): {
  optimizedChunks: DocumentChunk[];
  optimizationLog: string[];
} {
  const optimizedChunks = chunks.map((c) => ({
    ...c,
    metadata: { ...c.metadata },
    relationships: { ...c.relationships, childChunkIds: [...c.relationships.childChunkIds] },
  })); // Deep copy
  const optimizationLog: string[] = [];

  // Remove duplicate child references
  for (const chunk of optimizedChunks) {
    const relationships = chunk.relationships;
    const originalChildCount = relationships.childChunkIds.length;

    relationships.childChunkIds = [...new Set(relationships.childChunkIds)];

    if (relationships.childChunkIds.length < originalChildCount) {
      optimizationLog.push(`Removed duplicate child references from ${chunk.id}`);
    }
  }

  // Sort child chunks by hierarchy level and position
  for (const chunk of optimizedChunks) {
    const relationships = chunk.relationships;
    const chunkMap = new Map(optimizedChunks.map((c) => [c.id, c]));

    relationships.childChunkIds.sort((a, b) => {
      const childA = chunkMap.get(a);
      const childB = chunkMap.get(b);

      if (!childA || !childB) return 0;

      // First sort by hierarchy level
      const levelDiff = childA.relationships.hierarchyLevel - childB.relationships.hierarchyLevel;
      if (levelDiff !== 0) return levelDiff;

      // Then by chunk index
      return childA.metadata.chunkIndex - childB.metadata.chunkIndex;
    });
  }

  return {
    optimizedChunks,
    optimizationLog,
  };
}

/**
 * Generates relationship statistics
 */
export function getRelationshipStatistics(chunks: DocumentChunk[]): {
  totalChunks: number;
  hierarchyLevels: number;
  maxDepth: number;
  avgChildrenPerChunk: number;
  rootChunks: number;
  leafChunks: number;
  orphanedChunks: number;
} {
  const graph = buildChunkGraph(chunks);
  const hierarchy = buildChunkHierarchy(chunks);

  const totalChunks = chunks.length;
  const hierarchyLevels = hierarchy.levels.size;
  const levels = Array.from(hierarchy.levels.keys());
  const maxDepth = levels.length > 0 ? Math.max(...levels) : 0;

  const totalChildren = chunks.reduce(
    (sum, chunk) => sum + chunk.relationships.childChunkIds.length,
    0,
  );
  const avgChildrenPerChunk = totalChunks > 0 ? totalChildren / totalChunks : 0;

  const rootChunks = graph.roots.size;
  const leafChunks = graph.leaves.size;

  // Find orphaned chunks (no parent, no children, no next/previous)
  const orphanedChunks = chunks.filter((chunk) => {
    const rel = chunk.relationships;
    return (
      !rel.parentChunkId &&
      !rel.previousChunkId &&
      !rel.nextChunkId &&
      rel.childChunkIds.length === 0
    );
  }).length;

  return {
    totalChunks,
    hierarchyLevels,
    maxDepth,
    avgChildrenPerChunk,
    rootChunks,
    leafChunks,
    orphanedChunks,
  };
}

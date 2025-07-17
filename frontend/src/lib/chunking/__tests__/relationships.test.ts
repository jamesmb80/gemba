/**
 * Tests for chunk relationship management utilities
 */

import {
  buildChunkGraph,
  buildChunkHierarchy,
  validateChunkRelationships,
  getChunkSequence,
  getChunkDescendants,
  getChunkAncestors,
  getChunksAtLevel,
  getSiblingChunks,
  repairChunkRelationships,
  optimizeChunkRelationships,
  getRelationshipStatistics,
} from '../relationships';
import { DocumentChunk } from '../../types/chunking';

describe('Chunk Relationship Management', () => {
  // Helper function to create test chunks
  const createTestChunk = (
    id: string,
    content: string,
    relationships: Partial<DocumentChunk['relationships']> = {},
  ): DocumentChunk => ({
    id,
    content,
    documentId: 'test-doc',
    tenantId: 'test-tenant',
    metadata: {
      id: id,
      documentId: 'test-doc',
      chunkIndex:
        parseInt(id.split('_')[1]) ||
        (id === 'parent' ? 0 : id === 'child1' ? 1 : id === 'child2' ? 2 : 0),
      totalChunks: 5,
      tokenCount: { count: 100, breakdown: { text: 90, punctuation: 5, numbers: 5 } },
      startPage: 1,
      endPage: 1,
      documentTitle: 'Test Document',
      documentAuthor: 'Test Author',
      contentType: {
        hasTable: false,
        hasList: false,
        hasCode: false,
        hasImage: false,
        hasDiagram: false,
      },
      createdAt: new Date(),
    },
    relationships: {
      previousChunkId: relationships.previousChunkId,
      nextChunkId: relationships.nextChunkId,
      parentChunkId: relationships.parentChunkId,
      childChunkIds: relationships.childChunkIds || [],
      hierarchyLevel: relationships.hierarchyLevel || 0,
    },
  });

  describe('buildChunkGraph', () => {
    it('should build a graph from chunks with next/previous relationships', () => {
      const chunks = [
        createTestChunk('chunk_0', 'First chunk', { nextChunkId: 'chunk_1' }),
        createTestChunk('chunk_1', 'Second chunk', {
          previousChunkId: 'chunk_0',
          nextChunkId: 'chunk_2',
        }),
        createTestChunk('chunk_2', 'Third chunk', { previousChunkId: 'chunk_1' }),
      ];

      const graph = buildChunkGraph(chunks);

      expect(graph.nodes.size).toBe(3);
      expect(graph.roots.size).toBe(1);
      expect(graph.leaves.size).toBe(1);
      expect(graph.roots.has('chunk_0')).toBe(true);
      expect(graph.leaves.has('chunk_2')).toBe(true);
    });

    it('should handle parent-child relationships', () => {
      const chunks = [
        createTestChunk('parent', 'Parent chunk', { childChunkIds: ['child_1', 'child_2'] }),
        createTestChunk('child_1', 'Child 1', { parentChunkId: 'parent' }),
        createTestChunk('child_2', 'Child 2', { parentChunkId: 'parent' }),
      ];

      const graph = buildChunkGraph(chunks);

      expect(graph.nodes.size).toBe(3);
      expect(graph.edges.get('parent')?.size).toBe(2);
      expect(graph.edges.get('parent')?.has('child_1')).toBe(true);
      expect(graph.edges.get('parent')?.has('child_2')).toBe(true);
    });

    it('should handle empty chunks array', () => {
      const graph = buildChunkGraph([]);

      expect(graph.nodes.size).toBe(0);
      expect(graph.edges.size).toBe(0);
      expect(graph.roots.size).toBe(0);
      expect(graph.leaves.size).toBe(0);
    });
  });

  describe('buildChunkHierarchy', () => {
    it('should build hierarchy from chunks', () => {
      const chunks = [
        createTestChunk('level0_1', 'Level 0 chunk', { hierarchyLevel: 0 }),
        createTestChunk('level1_1', 'Level 1 chunk 1', {
          hierarchyLevel: 1,
          parentChunkId: 'level0_1',
        }),
        createTestChunk('level1_2', 'Level 1 chunk 2', {
          hierarchyLevel: 1,
          parentChunkId: 'level0_1',
        }),
      ];

      const hierarchy = buildChunkHierarchy(chunks);

      expect(hierarchy.levels.size).toBe(2);
      expect(hierarchy.levels.get(0)?.length).toBe(1);
      expect(hierarchy.levels.get(1)?.length).toBe(2);
      expect(hierarchy.parents.get('level1_1')).toBe('level0_1');
      expect(hierarchy.children.get('level0_1')).toEqual(['level1_1', 'level1_2']);
    });

    it('should build sibling relationships', () => {
      const chunks = [
        createTestChunk('parent', 'Parent', {
          hierarchyLevel: 0,
          childChunkIds: ['child1', 'child2'],
        }),
        createTestChunk('child1', 'Child 1', {
          hierarchyLevel: 1,
          parentChunkId: 'parent',
        }),
        createTestChunk('child2', 'Child 2', {
          hierarchyLevel: 1,
          parentChunkId: 'parent',
        }),
      ];

      const hierarchy = buildChunkHierarchy(chunks);

      expect(hierarchy.siblings.get('child1')).toEqual(['child2']);
      expect(hierarchy.siblings.get('child2')).toEqual(['child1']);
    });
  });

  describe('validateChunkRelationships', () => {
    it('should validate correct relationships', () => {
      const chunks = [
        createTestChunk('chunk1', 'Chunk 1', { nextChunkId: 'chunk2' }),
        createTestChunk('chunk2', 'Chunk 2', { previousChunkId: 'chunk1' }),
      ];

      const validation = validateChunkRelationships(chunks);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect missing chunk references', () => {
      const chunks = [createTestChunk('chunk1', 'Chunk 1', { nextChunkId: 'missing_chunk' })];

      const validation = validateChunkRelationships(chunks);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Chunk chunk1 references non-existent next chunk missing_chunk',
      );
    });

    it('should detect bidirectional relationship inconsistencies', () => {
      const chunks = [
        createTestChunk('chunk1', 'Chunk 1', { nextChunkId: 'chunk2' }),
        createTestChunk('chunk2', 'Chunk 2', { previousChunkId: 'chunk3' }), // Wrong reference
      ];

      const validation = validateChunkRelationships(chunks);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Chunk chunk1 and chunk2 have inconsistent prev/next relationship',
      );
    });

    it('should detect invalid hierarchy levels', () => {
      const chunks = [createTestChunk('chunk1', 'Chunk 1', { hierarchyLevel: -1 })];

      const validation = validateChunkRelationships(chunks);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Chunk chunk1 has invalid hierarchy level -1');
    });
  });

  describe('getChunkSequence', () => {
    it('should return complete sequence starting from any chunk', () => {
      const chunks = [
        createTestChunk('chunk1', 'First', { nextChunkId: 'chunk2' }),
        createTestChunk('chunk2', 'Second', {
          previousChunkId: 'chunk1',
          nextChunkId: 'chunk3',
        }),
        createTestChunk('chunk3', 'Third', { previousChunkId: 'chunk2' }),
      ];

      const sequence = getChunkSequence(chunks, 'chunk2');

      expect(sequence.length).toBe(3);
      expect(sequence[0].id).toBe('chunk1');
      expect(sequence[1].id).toBe('chunk2');
      expect(sequence[2].id).toBe('chunk3');
    });

    it('should handle single chunk', () => {
      const chunks = [createTestChunk('chunk1', 'Only chunk')];

      const sequence = getChunkSequence(chunks, 'chunk1');

      expect(sequence.length).toBe(1);
      expect(sequence[0].id).toBe('chunk1');
    });

    it('should handle non-existent chunk', () => {
      const chunks = [createTestChunk('chunk1', 'Only chunk')];

      const sequence = getChunkSequence(chunks, 'missing');

      expect(sequence.length).toBe(0);
    });
  });

  describe('getChunkDescendants', () => {
    it('should return all descendants recursively', () => {
      const chunks = [
        createTestChunk('parent', 'Parent', { childChunkIds: ['child1', 'child2'] }),
        createTestChunk('child1', 'Child 1', {
          parentChunkId: 'parent',
          childChunkIds: ['grandchild1'],
        }),
        createTestChunk('child2', 'Child 2', { parentChunkId: 'parent' }),
        createTestChunk('grandchild1', 'Grandchild 1', { parentChunkId: 'child1' }),
      ];

      const descendants = getChunkDescendants(chunks, 'parent');

      expect(descendants.length).toBe(3);
      expect(descendants.map((c) => c.id)).toContain('child1');
      expect(descendants.map((c) => c.id)).toContain('child2');
      expect(descendants.map((c) => c.id)).toContain('grandchild1');
    });

    it('should handle chunks with no descendants', () => {
      const chunks = [createTestChunk('leaf', 'Leaf chunk')];

      const descendants = getChunkDescendants(chunks, 'leaf');

      expect(descendants.length).toBe(0);
    });

    it('should handle circular references gracefully', () => {
      const chunks = [
        createTestChunk('chunk1', 'Chunk 1', { childChunkIds: ['chunk2'] }),
        createTestChunk('chunk2', 'Chunk 2', { childChunkIds: ['chunk1'] }), // Circular
      ];

      const descendants = getChunkDescendants(chunks, 'chunk1');

      expect(descendants.length).toBe(1);
      expect(descendants[0].id).toBe('chunk2');
    });
  });

  describe('getChunkAncestors', () => {
    it('should return all ancestors in order', () => {
      const chunks = [
        createTestChunk('grandparent', 'Grandparent', { childChunkIds: ['parent'] }),
        createTestChunk('parent', 'Parent', {
          parentChunkId: 'grandparent',
          childChunkIds: ['child'],
        }),
        createTestChunk('child', 'Child', { parentChunkId: 'parent' }),
      ];

      const ancestors = getChunkAncestors(chunks, 'child');

      expect(ancestors.length).toBe(2);
      expect(ancestors[0].id).toBe('grandparent');
      expect(ancestors[1].id).toBe('parent');
    });

    it('should handle root chunks', () => {
      const chunks = [createTestChunk('root', 'Root chunk')];

      const ancestors = getChunkAncestors(chunks, 'root');

      expect(ancestors.length).toBe(0);
    });
  });

  describe('getChunksAtLevel', () => {
    it('should return chunks at specified hierarchy level', () => {
      const chunks = [
        createTestChunk('level0', 'Level 0', { hierarchyLevel: 0 }),
        createTestChunk('level1_1', 'Level 1a', { hierarchyLevel: 1 }),
        createTestChunk('level1_2', 'Level 1b', { hierarchyLevel: 1 }),
        createTestChunk('level2', 'Level 2', { hierarchyLevel: 2 }),
      ];

      const level1Chunks = getChunksAtLevel(chunks, 1);

      expect(level1Chunks.length).toBe(2);
      expect(level1Chunks.map((c) => c.id)).toContain('level1_1');
      expect(level1Chunks.map((c) => c.id)).toContain('level1_2');
    });

    it('should return empty array for non-existent level', () => {
      const chunks = [createTestChunk('level0', 'Level 0', { hierarchyLevel: 0 })];

      const level5Chunks = getChunksAtLevel(chunks, 5);

      expect(level5Chunks.length).toBe(0);
    });
  });

  describe('getSiblingChunks', () => {
    it('should return sibling chunks', () => {
      const chunks = [
        createTestChunk('parent', 'Parent', { childChunkIds: ['child1', 'child2', 'child3'] }),
        createTestChunk('child1', 'Child 1', { parentChunkId: 'parent' }),
        createTestChunk('child2', 'Child 2', { parentChunkId: 'parent' }),
        createTestChunk('child3', 'Child 3', { parentChunkId: 'parent' }),
      ];

      const siblings = getSiblingChunks(chunks, 'child2');

      expect(siblings.length).toBe(2);
      expect(siblings.map((c) => c.id)).toContain('child1');
      expect(siblings.map((c) => c.id)).toContain('child3');
      expect(siblings.map((c) => c.id)).not.toContain('child2');
    });

    it('should return empty array for orphaned chunks', () => {
      const chunks = [createTestChunk('orphan', 'Orphan chunk')];

      const siblings = getSiblingChunks(chunks, 'orphan');

      expect(siblings.length).toBe(0);
    });

    it('should return empty array for only child', () => {
      const chunks = [
        createTestChunk('parent', 'Parent', { childChunkIds: ['onlychild'] }),
        createTestChunk('onlychild', 'Only child', { parentChunkId: 'parent' }),
      ];

      const siblings = getSiblingChunks(chunks, 'onlychild');

      expect(siblings.length).toBe(0);
    });
  });

  describe('repairChunkRelationships', () => {
    it('should repair broken bidirectional relationships', () => {
      const chunks = [
        createTestChunk('chunk1', 'Chunk 1', { nextChunkId: 'chunk2' }),
        createTestChunk('chunk2', 'Chunk 2', { previousChunkId: 'wrong_id' }),
      ];

      const result = repairChunkRelationships(chunks);

      expect(result.repairedChunks.length).toBe(2);
      expect(result.repairedChunks[1].relationships.previousChunkId).toBe('chunk1');
      expect(result.repairLog.length).toBeGreaterThan(0);
    });

    it('should repair parent-child relationships', () => {
      const chunks = [
        createTestChunk('parent', 'Parent', { childChunkIds: ['child1'] }),
        createTestChunk('child1', 'Child 1', { parentChunkId: 'wrong_parent' }),
      ];

      const result = repairChunkRelationships(chunks);

      expect(result.repairedChunks[1].relationships.parentChunkId).toBe('parent');
      expect(result.repairLog).toContain('Set parent as parent of child1');
    });

    it('should add missing child references', () => {
      const chunks = [
        createTestChunk('parent', 'Parent', { childChunkIds: [] }),
        createTestChunk('child1', 'Child 1', { parentChunkId: 'parent' }),
      ];

      const result = repairChunkRelationships(chunks);

      expect(result.repairedChunks[0].relationships.childChunkIds).toContain('child1');
      expect(result.repairLog).toContain('Added child1 as child of parent');
    });
  });

  describe('optimizeChunkRelationships', () => {
    it('should remove duplicate child references', () => {
      const chunks = [
        createTestChunk('parent', 'Parent', {
          childChunkIds: ['child1', 'child1', 'child2'],
        }),
        createTestChunk('child1', 'Child 1', { parentChunkId: 'parent' }),
        createTestChunk('child2', 'Child 2', { parentChunkId: 'parent' }),
      ];

      const result = optimizeChunkRelationships(chunks);

      expect(result.optimizedChunks[0].relationships.childChunkIds).toEqual(['child1', 'child2']);
      expect(result.optimizationLog).toContain('Removed duplicate child references from parent');
    });

    it('should sort child chunks by hierarchy and index', () => {
      const chunks = [
        createTestChunk('parent', 'Parent', { childChunkIds: ['child2', 'child1'] }),
        createTestChunk('child1', 'Child 1', {
          parentChunkId: 'parent',
          hierarchyLevel: 1,
        }),
        createTestChunk('child2', 'Child 2', {
          parentChunkId: 'parent',
          hierarchyLevel: 1,
        }),
      ];

      // Set metadata to ensure proper sorting
      chunks[1].metadata.chunkIndex = 1;
      chunks[2].metadata.chunkIndex = 2;

      const result = optimizeChunkRelationships(chunks);

      expect(result.optimizedChunks[0].relationships.childChunkIds).toEqual(['child1', 'child2']);
    });
  });

  describe('getRelationshipStatistics', () => {
    it('should calculate comprehensive statistics', () => {
      const chunks = [
        createTestChunk('root', 'Root', {
          hierarchyLevel: 0,
          childChunkIds: ['child1', 'child2'],
          nextChunkId: 'orphan',
        }),
        createTestChunk('child1', 'Child 1', {
          hierarchyLevel: 1,
          parentChunkId: 'root',
          previousChunkId: 'root',
        }),
        createTestChunk('child2', 'Child 2', {
          hierarchyLevel: 1,
          parentChunkId: 'root',
        }),
        createTestChunk('orphan', 'Orphan', {
          hierarchyLevel: 0,
          previousChunkId: 'root',
        }),
      ];

      const stats = getRelationshipStatistics(chunks);

      expect(stats.totalChunks).toBe(4);
      expect(stats.hierarchyLevels).toBe(2);
      expect(stats.maxDepth).toBe(1);
      expect(stats.rootChunks).toBe(1);
      expect(stats.leafChunks).toBe(1);
      expect(stats.avgChildrenPerChunk).toBe(0.5); // 2 children / 4 chunks
      expect(stats.orphanedChunks).toBe(0); // No truly orphaned chunks
    });

    it('should handle empty chunks array', () => {
      const stats = getRelationshipStatistics([]);

      expect(stats.totalChunks).toBe(0);
      expect(stats.hierarchyLevels).toBe(0);
      expect(stats.maxDepth).toBe(0);
      expect(stats.rootChunks).toBe(0);
      expect(stats.leafChunks).toBe(0);
      expect(stats.avgChildrenPerChunk).toBe(0);
      expect(stats.orphanedChunks).toBe(0);
    });

    it('should identify orphaned chunks', () => {
      const chunks = [
        createTestChunk('connected', 'Connected', { nextChunkId: 'other' }),
        createTestChunk('other', 'Other', { previousChunkId: 'connected' }),
        createTestChunk('orphan', 'Orphan', { hierarchyLevel: 0 }),
      ];

      const stats = getRelationshipStatistics(chunks);

      expect(stats.orphanedChunks).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty relationships', () => {
      const chunks = [createTestChunk('empty', 'Empty relationships')];

      const graph = buildChunkGraph(chunks);
      const hierarchy = buildChunkHierarchy(chunks);
      const validation = validateChunkRelationships(chunks);

      expect(graph.nodes.size).toBe(1);
      expect(hierarchy.levels.get(0)?.length).toBe(1);
      expect(validation.isValid).toBe(true);
    });

    it('should handle complex hierarchies', () => {
      const chunks = [
        createTestChunk('l0', 'Level 0', {
          hierarchyLevel: 0,
          childChunkIds: ['l1_1', 'l1_2'],
        }),
        createTestChunk('l1_1', 'Level 1.1', {
          hierarchyLevel: 1,
          parentChunkId: 'l0',
          childChunkIds: ['l2_1'],
        }),
        createTestChunk('l1_2', 'Level 1.2', {
          hierarchyLevel: 1,
          parentChunkId: 'l0',
        }),
        createTestChunk('l2_1', 'Level 2.1', {
          hierarchyLevel: 2,
          parentChunkId: 'l1_1',
        }),
      ];

      const hierarchy = buildChunkHierarchy(chunks);
      const stats = getRelationshipStatistics(chunks);

      expect(hierarchy.levels.size).toBe(3);
      expect(stats.maxDepth).toBe(2);
      expect(stats.hierarchyLevels).toBe(3);
    });
  });
});

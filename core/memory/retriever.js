/**
 * Vox Umbra Framework — Memory Retriever
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 * 
 * Generic memory retriever that uses personality schema for search filters.
 * Returns memories relevant to current context.
 */

const { loadMemories } = require('./store');

/**
 * Search memories with optional filters
 */
function searchMemories(personality, options = {}) {
  const { 
    query = null, 
    type = null, 
    tags = [], 
    significance = null,
    limit = 20,
    timeRange = null // { start, end } in ISO format
  } = options;
  
  // Load all memories for personality
  let memories = loadMemories(personality, { limit: 1000 });
  
  // Apply filters
  if (query) {
    const queryLower = query.toLowerCase();
    memories = memories.filter(m => {
      const content = (m.content || '').toLowerCase();
      const tags = (m.tags || []).join(' ').toLowerCase();
      return content.includes(queryLower) || tags.includes(queryLower);
    });
  }
  
  if (type) {
    memories = memories.filter(m => m.type === type);
  }
  
  if (tags.length > 0) {
    memories = memories.filter(m => 
      tags.every(tag => (m.tags || []).includes(tag))
    );
  }
  
  if (significance) {
    memories = memories.filter(m => m.significance === significance);
  }
  
  if (timeRange) {
    const startTime = new Date(timeRange.start).getTime();
    const endTime = new Date(timeRange.end).getTime();
    memories = memories.filter(m => {
      const timestamp = typeof m.timestamp === 'string' 
        ? new Date(m.timestamp).getTime() 
        : m.timestamp;
      return timestamp >= startTime && timestamp <= endTime;
    });
  }
  
  // Return top results
  return memories.slice(0, limit);
}

/**
 * Get recent memories
 */
function getRecentMemories(personality, options = {}) {
  const { limit = 10, type = null } = options;
  
  return loadMemories(personality, {
    limit,
    type
  });
}

/**
 * Get memories by type
 */
function getMemoriesByType(personality, type, options = {}) {
  return searchMemories(personality, { 
    type, 
    limit: options.limit || 100 
  });
}

/**
 * Get memories by tags
 */
function getMemoriesByTags(personality, tags, options = {}) {
  return searchMemories(personality, { 
    tags: Array.isArray(tags) ? tags : [tags],
    limit: options.limit || 100
  });
}

/**
 * Get most significant memories
 */
function getHighSignificanceMemories(personality, options = {}) {
  return searchMemories(personality, { 
    significance: 'high',
    limit: options.limit || 20
  });
}

/**
 * Get memory statistics for context awareness
 */
function getContextStats(personality, options = {}) {
  const { type = null } = options;
  
  const memories = type 
    ? getMemoriesByType(personality, type)
    : loadMemories(personality);
  
  return {
    total: memories.length,
    bySignificance: memories.reduce((acc, m) => {
      acc[m.significance] = (acc[m.significance] || 0) + 1;
      return acc;
    }, {}),
    byType: memories.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {}),
    timeCoverage: memories.length > 0
      ? {
          oldest: new Date(memories[memories.length - 1].timestamp).toISOString(),
          newest: new Date(memories[0].timestamp).toISOString()
        }
      : null
  };
}

/**
 * Export public API
 */
module.exports = {
  searchMemories,
  getRecentMemories,
  getMemoriesByType,
  getMemoriesByTags,
  getHighSignificanceMemories,
  getContextStats
};

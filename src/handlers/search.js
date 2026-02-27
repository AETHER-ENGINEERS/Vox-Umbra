/**
 * Vox Umbra — Multimodal Discord Bot
 * Context-Aware Channel Summarizer (Search-Based)
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 * 
 * DESIGN PHILOSOPHY:
 * - Summarization is silent and automatic
 * - Uses Discord's search API for targeted context retrieval
 * - Only searches when needed (on bot mention)
 * - Thread-aware: can search specific channels or threads
 */

const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Directory for storing search results (gitignored)
const SEARCH_DIR = path.join(__dirname, '..', '..', 'data', 'searches');
if (!fs.existsSync(SEARCH_DIR)) {
  fs.mkdirSync(SEARCH_DIR, { recursive: true });
}

/**
 * Build search query from context
 */
function buildSearchQuery(options) {
  const { 
    channelId, 
    threadId = null, 
    query = '', 
    fromUser = null, 
    before = null, 
    after = null,
    limit = 50 
  } = options;

  let searchParts = [];

  // Channel scope
  const channelRef = threadId ? `thread:${threadId}` : `in:#${channelId}`;
  searchParts.push(channelRef);

  // User filter
  if (fromUser) {
    searchParts.push(`from:${fromUser}`);
  }

  // Time filter
  if (after) {
    searchParts.push(`after:${after}`);
  }
  if (before) {
    searchParts.push(`before:${before}`);
  }

  // Search text
  if (query) {
    searchParts.push(`"${query}"`);
  }

  return {
    query: searchParts.join(' '),
    limit
  };
}

/**
 * Perform actual Discord search using API
 * Returns search results with message data
 */
async function performSearch(client, searchOptions) {
  const { channelId, threadId = null, query, limit } = buildSearchQuery(searchOptions);

  console.log(`🔍 Searching Discord with: ${query} (limit: ${limit})`);

  try {
    // Determine which channel to search
    const targetChannelId = threadId || channelId;
    
    // Get the channel from cache or fetch it
    let channel = client.channels.cache.get(targetChannelId);
    if (!channel) {
      channel = await client.channels.fetch(targetChannelId).catch(() => null);
    }
    
    if (!channel) {
      console.error(`❌ Channel not found: ${targetChannelId}`);
      return {
        query,
        results: [],
        totalResults: 0,
        searchTimestamp: Date.now(),
        error: 'channel_not_found'
      };
    }

    // Perform the search
    const searchResults = await channel.search({
      query: query.split('in:#')[1] || query.split('thread:')[1] || query,
      limit: Math.min(limit, 50) // Discord API max is 50
    });

    // Transform results to our format
    const results = searchResults.messages.map(msg => ({
      id: msg.id,
      channelId: msg.channelId,
      author: {
        id: msg.author.id,
        username: msg.author.username,
        discriminator: msg.author.discriminator,
        avatar: msg.author.avatar
      },
      content: msg.content,
      timestamp: msg.createdTimestamp,
      createdTimestamp: msg.createdTimestamp,
      attachments: msg.attachments.map(a => ({
        id: a.id,
        filename: a.filename,
        url: a.url,
        contentType: a.contentType
      })),
      reactions: msg.reactions.cache.map(r => ({
        emoji: r.emoji.name || r.emoji.id,
        count: r.count
      }))
    }));

    return {
      query,
      results,
      totalResults: results.length,
      searchTimestamp: Date.now(),
      raw: searchResults // Keep raw for debugging
    };

  } catch (error) {
    console.error(`❌ Discord search error:`, error.message);
    return {
      query,
      results: [],
      totalResults: 0,
      searchTimestamp: Date.now(),
      error: error.message
    };
  }
}

/**
 * Build a compact, context-aware summary from search results
 */
function buildSearchSummary(results, contextId) {
  if (!results || results.length === 0) return null;

  const summaries = results.map((msg, idx) => ({
    rank: idx + 1,
    user: msg.author?.username || 'unknown',
    userId: msg.author?.id || 'unknown',
    text: msg.content?.slice(0, 200) || '',
    hasImages: msg.attachments?.some(a => a.contentType?.startsWith('image/')) || false,
    timestamp: msg.timestamp || Date.now(),
    messageLink: `https://discord.com/channels/359380840213512192/${msg.channelId || 'unknown'}/${msg.id || 'unknown'}`
  }));

  // Generate summary hash
  const summaryHash = crypto.createHash('md5').update(JSON.stringify(summaries)).digest('hex').slice(0, 8);

  // Create compact summary
  const summaryText = [
    `SEARCH CONTEXT SUMMARY (${summaries.length} messages):`,
    `Query: ${contextId}`,
    summaries.map(s => `[${s.rank}] ${s.user}: ${s.text} ${s.hasImages ? '[+image]' : ''} ${s.messageLink}`).join('\n')
  ].join('\n');

  return {
    summaryText,
    summaryHash,
    messageCount: summaries.length,
    uniqueUsers: [...new Set(summaries.map(s => s.user))].length,
    hasImages: summaries.some(s => s.hasImages),
    contextId,
    timestamp: Date.now()
  };
}

/**
 * Save search results to file system (for debugging/audit)
 */
function saveSearchResults(results, searchId) {
  const filePath = path.join(SEARCH_DIR, `${searchId}-${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  return filePath;
}

/**
 * Extract search intent from mention message
 */
function extractSearchIntent(messageContent) {
  const content = messageContent.toLowerCase();

  // Time-based queries
  if (content.includes('last 24 hours') || content.includes('past day')) {
    return { type: 'time', timeframe: '24h' };
  }
  if (content.includes('last hour') || content.includes('past hour')) {
    return { type: 'time', timeframe: '1h' };
  }
  if (content.includes('last week')) {
    return { type: 'time', timeframe: '7d' };
  }

  // User-based queries
  if (content.includes('from @') || content.includes('from user')) {
    const userMatch = content.match(/from (@?[\w#]+)/);
    return { type: 'user', user: userMatch ? userMatch[1] : null };
  }

  // Topic-based queries (default)
  return { type: 'topic', keywords: content };
}

/**
 * Prepare context for model using search-based retrieval
 * This is the CORE FUNCTION — called when bot is pinged
 */
async function prepareContextForModel(client, channelId, threadId, messageContent) {
  const contextId = threadId ? `${channelId}-${threadId}` : channelId;
  const intent = extractSearchIntent(messageContent);

  // Build search options based on intent
  let searchOptions = {
    channelId,
    threadId: threadId || null,
    query: messageContent, // Use messageContent as search query
    limit: 30 // Default to 30 most relevant
  };

  // Add intent-specific filters
  if (intent.type === 'time') {
    // Time-based: search within timeframe
    const now = Date.now();
    if (intent.timeframe === '24h') {
      searchOptions.after = new Date(now - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (intent.timeframe === '1h') {
      searchOptions.after = new Date(now - 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (intent.timeframe === '7d') {
      searchOptions.after = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
  } else if (intent.type === 'user') {
    searchOptions.fromUser = intent.user;
  }

  // Perform search (in production, this calls Discord API)
  const searchResults = await performSearch(client, searchOptions);

  // Build summary from search results
  const summary = buildSearchSummary(searchResults.results || [], contextId);

  // Save search results for audit
  if (summary) {
    const searchId = `${contextId}-${searchResults.searchTimestamp}`;
    saveSearchResults(searchResults, searchId);
  }

  return {
    contextId,
    searchQuery: searchResults.query || messageContent,
    summary,
    searchResults,
    intent
  };
}

/**
 * Export public API
 */
module.exports = {
  performSearch,
  buildSearchSummary,
  extractSearchIntent,
  prepareContextForModel
};

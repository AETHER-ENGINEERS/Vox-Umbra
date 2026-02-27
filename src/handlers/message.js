/**
 * Vox Umbra — Multimodal Discord Bot
 * Message Handler (with search-based context)
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 */

const { prepareContextForModel } = require('./search');

/**
 * Process incoming message
 */
function handleMessageWrapper(message, client) {
  // NOTE: We DO NOT skip bot messages - bots engage with bots!
  // Humans help break any accidental loops by responding in the thread

  const channelId = message.channel.id;
  const threadId = message.channel.parentId || message.channel.threadId || null;
  const contextId = threadId ? `${channelId}-${threadId}` : channelId;
  const guildId = message.guild?.id || 'DM';

  // Log message for debugging
  console.log(`💬 [${guildId}/${channelId}${threadId ? `/${threadId}` : ''}] ${message.author.username}: ${message.content?.slice(0, 80) || '(no text)'}`);

  // Check for bot mention (use bot's own ID) — this is when we need to prepare context for Kimi K2
  if (message.mentions.has(client.user.id)) {
    console.log(`🔔 Bot mentioned in ${contextId} — preparing search-based context for Kimi K2`);

    // Prepare context using search-based retrieval (real client)
    const prepared = prepareContextForModel(client, channelId, threadId, message.content);

    console.log(`📊 Search-based context prepared for Kimi K2:`);
    console.log(`   - Search query: ${prepared?.searchQuery || 'N/A'}`);
    console.log(`   - Intent: ${prepared?.intent?.type || 'N/A'}`);
    console.log(`   - Results: ${prepared?.summary?.messageCount || 0} messages`);
    console.log(`   - Users: ${prepared?.summary?.uniqueUsers || 0}`);

    // Handle case where search failed or intent is undefined
    if (!prepared || !prepared.intent || !prepared.intent.type) {
      console.log(`⚠️ Search/Intent failed, using fallback context`);
      return {
        contextId,
        searchQuery: message.content,
        intent: { type: 'fallback', message: 'Search failed - using message content' },
        summary: { messageCount: 0, uniqueUsers: 0 },
        searchResults: { results: [], totalResults: 0 }
      };
    }

    // Return prepared context for Kimi K2 integration
    return prepared;
  }

  return null;
}

/**
 * Export API
 */
module.exports = {
  handleMessage: handleMessageWrapper
};

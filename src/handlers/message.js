/**
 * Vox Umbra — Multimodal Discord Bot
 * Message Handler (with context-aware summarization)
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 */

const { handleMessage, prepareMentionContext, channelContexts, getContextId } = require('./context');

/**
 * Process incoming message
 */
function handleMessageWrapper(message) {
  // Skip bot messages to avoid loops
  if (message.author.bot) return;

  // Use the context-aware handler
  handleMessage(message);

  const channelId = message.channel.id;
  const threadId = message.channel.parentId || message.channel.threadId || null;
  const contextId = getContextId(channelId, threadId);
  const guildId = message.guild?.id || 'DM';

  // Check for bot mention — this is when we need to prepare context for Kimi K2
  if (message.mentions.has(process.env.CLIENT_ID)) {
    console.log(`🔔 Bot mentioned in ${contextId} — preparing context for Kimi K2`);

    const contextData = channelContexts.get(contextId);
    const messages = contextData ? contextData.messages : [];
    
    // Prepare context with auto-summarization
    const prepared = prepareMentionContext(message, {
      text: message.content,
      images: message.attachments.filter(a => a.contentType?.startsWith('image/')),
      reactions: message.reactions.cache.size,
      userId: message.author.id,
      timestamp: message.createdTimestamp,
      userName: message.author.username,
      discriminator: message.author.discriminator
    });

    console.log(`📊 Context prepared for Kimi K2:`);
    console.log(`   - Total messages: ${prepared.totalMessages}`);
    console.log(`   - Summarized: ${prepared.summaryCount} messages`);
    console.log(`   - Recent: ${prepared.recentCount} messages`);
    console.log(`   - Context length: ${prepared.context.length} items`);

    // Debug: Log context structure
    if (prepared.context.length > 0) {
      console.log(`   - First context item: ${prepared.context[0].role}: ${prepared.context[0].content.slice(0, 60)}...`);
    }

    // Return prepared context for Kimi K2 integration (will be used when bot responds)
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

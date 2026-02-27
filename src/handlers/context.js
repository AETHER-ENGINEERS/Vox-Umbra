/**
 * Vox Umbra — Multimodal Discord Bot
 * Context-Aware Channel Summarizer (Invisible Infrastructure)
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 * 
 * DESIGN PHILOSOPHY:
 * - Summarization is silent and automatic
 * - Only the last 10 messages are kept in full; older context is summarized
 * - No user-facing commands needed — this is infrastructure for Kimi K2
 * - Thread awareness: separate summaries per channel/thread
 */

const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Directory for storing summaries (gitignored)
const SUMMARY_DIR = path.join(__dirname, '..', '..', 'data', 'summaries');
if (!fs.existsSync(SUMMARY_DIR)) {
  fs.mkdirSync(SUMMARY_DIR, { recursive: true });
}

// Track message history per channel/thread
const channelContexts = new Collection();

/**
 * Get unique identifier for channel/thread context
 */
function getContextId(channelId, threadId = null) {
  return threadId ? `${channelId}-${threadId}` : `${channelId}`;
}

/**
 * Build a compact, context-aware summary from old messages
 * Returns structured summary ready for Kimi K2 context
 */
function buildContextSummary(messages, contextId) {
  if (messages.length === 0) return null;

  const summaries = messages.map(msg => ({
    user: msg.author.username,
    userId: msg.author.id,
    text: msg.content,
    hasImages: msg.attachments.some(a => a.contentType?.startsWith('image/')),
    timestamp: msg.createdTimestamp,
    reactions: msg.reactions.cache.size
  }));

  // Identify key participants
  const userActivity = {};
  summaries.forEach(s => {
    if (!userActivity[s.user]) userActivity[s.user] = { count: 0, textLength: 0 };
    userActivity[s.user].count++;
    userActivity[s.user].textLength += s.text.length;
  });

  const topUsers = Object.entries(userActivity)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([user, stats]) => `${user} (${stats.count} msgs)`);

  // Generate summary hash
  const summaryHash = crypto.createHash('md5').update(JSON.stringify(summaries)).digest('hex').slice(0, 8);

  // Create compact summary (this goes to Kimi K2 as "context:")
  const summaryText = [
    `SUMMARY (${summaries.length} messages):`,
    `Time span: ${new Date(summaries[0].timestamp).toLocaleString()} - ${new Date(summaries[summaries.length - 1].timestamp).toLocaleString()}`,
    `Participants: ${topUsers.join(', ')}`,
    summaries.slice(-5).map(s => `[${s.user}]: ${s.text.slice(0, 100)}${s.text.length > 100 ? '...' : ''}`).join('\n')
  ].join('\n');

  return {
    summaryText,
    summaryHash,
    messageCount: summaries.length,
    uniqueUsers: Object.keys(userActivity).length,
    topUsers: topUsers.slice(0, 3),
    hasImages: summaries.some(s => s.hasImages),
    contextId,
    timestamp: Date.now()
  };
}

/**
 * Save summary to file system (for debugging/audit)
 */
function saveSummary(summary) {
  const filePath = path.join(SUMMARY_DIR, `${summary.contextId}-${summary.summaryHash}.json`);
  fs.writeFileSync(filePath, JSON.stringify(summary, null, 2));
  return filePath;
}

/**
 * Get summary from file system
 */
function loadSummary(contextId) {
  const files = fs.readdirSync(SUMMARY_DIR).filter(f => f.startsWith(contextId));
  if (files.length === 0) return null;
  
  // Return most recent
  const filePath = path.join(SUMMARY_DIR, files.sort().pop());
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Process context for model consumption
 * This is the CORE FUNCTION — called when bot is pinged
 */
function prepareContextForModel(messages, channelId, threadId = null) {
  const contextId = getContextId(channelId, threadId);
  
  // Keep last 10 messages in full (most recent = current conversation)
  const recentMessages = messages.slice(-10);
  const oldMessages = messages.slice(0, -10);

  // Build context array for Kimi K2
  const context = [];

  // If old messages exist, summarize them (this is the "memory")
  if (oldMessages.length > 0) {
    const summary = buildContextSummary(oldMessages, contextId);
    if (summary) {
      context.push({
        role: 'system',
        content: `PREVIOUS CONTEXT SUMMARY (${summary.messageCount} messages):\n${summary.summaryText}`
      });
      saveSummary(summary); // For debugging/audit
    }
  }

  // Add recent messages (current conversation)
  recentMessages.forEach(msg => {
    const contentParts = [];
    
    // Text
    if (msg.content) {
      contentParts.push(msg.content);
    }

    // Images (for multimodal support)
    if (msg.attachments && msg.attachments.length > 0) {
      const imageMsgs = msg.attachments
        .filter(a => a.contentType?.startsWith('image/'))
        .map(a => `[Image: ${a.filename}]`);
      if (imageMsgs.length > 0) {
        contentParts.push(imageMsgs.join('\n'));
      }
    }

    context.push({
      role: msg.author.bot ? 'assistant' : 'user',
      content: contentParts.join('\n') || '(no content)'
    });
  });

  return {
    contextId,
    totalMessages: messages.length,
    summaryCount: oldMessages.length,
    recentCount: recentMessages.length,
    context
  };
}

/**
 * Process incoming message for tracking
 */
function handleMessage(message) {
  // Skip bot messages to avoid loops
  if (message.author.bot) return;

  const channelId = message.channel.id;
  const threadId = message.channel.parentId || message.channel.threadId || null;
  const contextId = getContextId(channelId, threadId);
  const guildId = message.guild?.id || 'DM';

  // Initialize context if not exists
  if (!channelContexts.has(contextId)) {
    channelContexts.set(contextId, {
      messages: [],
      lastActivity: Date.now()
    });
  }

  const context = channelContexts.get(contextId);

  // Build content object
  const content = {
    text: message.content,
    images: message.attachments.filter(a => a.contentType?.startsWith('image/')),
    reactions: message.reactions.cache.size,
    userId: message.author.id,
    timestamp: message.createdTimestamp,
    userName: message.author.username,
    discriminator: message.author.discriminator
  };

  // Store in context
  context.messages.push(content);
  context.lastActivity = Date.now();

  // Trim old messages (keep max 200 to prevent memory bloat)
  if (context.messages.length > 200) {
    context.messages = context.messages.slice(-200);
  }

  console.log(`💬 [${guildId}/${channelId}${threadId ? `/${threadId}` : ''}] ${content.userName}: ${content.text?.slice(0, 80) || '(no text)'} ${content.images.size > 0 ? `[+${content.images.size} images]` : ''}`);

  // Multimodal response logic (to be implemented with Kimi K2)
  if (message.mentions.has(process.env.CLIENT_ID)) {
    handleMention(message, content);
  }
}

/**
 * Handle mentions specifically — prepare context for Kimi K2
 */
function prepareMentionContext(message, content) {
  const channelId = message.channel.id;
  const threadId = message.channel.parentId || message.channel.threadId || null;
  const contextId = getContextId(channelId, threadId);

  // Get context from stored history
  const contextData = channelContexts.get(contextId);
  const messages = contextData ? contextData.messages : [];

  // Prepare context with auto-summarization
  const prepared = prepareContextForModel(messages, channelId, threadId);

  // Clear recent context (we don't want to grow unbounded)
  // Keep only the current mention message for next time
  contextData.messages = [content];

  return {
    ...prepared,
    mentionMessage: content.text,
    mentionTimestamp: content.timestamp
  };
}

/**
 * Export public API
 */
module.exports = {
  handleMessage,
  prepareMentionContext,
  prepareContextForModel,
  channelContexts,
  getContextId
};

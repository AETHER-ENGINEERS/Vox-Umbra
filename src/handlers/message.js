/**
 * Vox Umbra — Multimodal Discord Bot
 * Context-Aware Channel Summarizer
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 */

const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Directory for storing summaries
const SUMMARY_DIR = path.join(__dirname, '..', '..', 'data', 'summaries');
if (!fs.existsSync(SUMMARY_DIR)) {
  fs.mkdirSync(SUMMARY_DIR, { recursive: true });
}

// Track message history + context for summarization
const channelContexts = new Collection();

/**
 * Get unique identifier for channel/thread context
 */
function getContextId(channelId, threadId = null) {
  return threadId ? `${channelId}-${threadId}` : `${channelId}`;
}

/**
 * Build context-aware summary from recent messages
 */
function buildSummary(messages, channelId, threadId = null) {
  if (messages.length === 0) return null;

  const contextId = getContextId(channelId, threadId);
  
  // Extract key elements
  const summaries = messages.map(msg => ({
    user: msg.author.username,
    userId: msg.author.id,
    text: msg.content,
    images: msg.attachments.filter(a => a.contentType?.startsWith('image/')).map(a => a.url).slice(0, 3),
    timestamp: msg.createdTimestamp,
    reactions: msg.reactions.cache.size
  }));

  // Generate a simple summary (in future, use Kimi K2 for NL generation)
  const uniqueUsers = [...new Set(summaries.map(s => s.user))];
  const timeRange = {
    start: new Date(summaries[0].timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    end: new Date(summaries[summaries.length - 1].timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };

  // Create summary hash for deduplication
  const summaryHash = crypto.createHash('md5').update(JSON.stringify(summaries)).digest('hex').slice(0, 8);

  return {
    contextId,
    channelId,
    threadId,
    messageCount: summaries.length,
    uniqueUsers: uniqueUsers.length,
    timeRange: `${timeRange.start} - ${timeRange.end}`,
    topUsers: uniqueUsers.slice(0, 3), // Top 3 active participants
    summaryHash,
    preview: summaries.slice(-3).map(s => `[${s.user}]: ${s.text.slice(0, 60)}${s.text.length > 60 ? '...' : ''}`).join('\n'),
    hasImages: summaries.some(s => s.images.length > 0),
    timestamp: Date.now()
  };
}

/**
 * Save summary to file system
 */
function saveSummary(summary) {
  const filePath = path.join(SUMMARY_DIR, `${summary.contextId}-${summary.summaryHash}.json`);
  fs.writeFileSync(filePath, JSON.stringify(summary, null, 2));
  return filePath;
}

/**
 * Get recent summaries for a channel (last 24h)
 */
function getRecentSummaries(channelId, hours = 24) {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000);
  const summaries = [];

  if (!fs.existsSync(SUMMARY_DIR)) return summaries;

  const files = fs.readdirSync(SUMMARY_DIR);
  for (const file of files) {
    if (file.endsWith('.json') && file.includes(channelId)) {
      try {
        const summary = JSON.parse(fs.readFileSync(path.join(SUMMARY_DIR, file), 'utf8'));
        if (summary.timestamp > cutoff) {
          summaries.push(summary);
        }
      } catch (e) {
        // Skip corrupted files
      }
    }
  }

  return summaries.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Process text + image messages with context tracking
 * Supports: plain text, image uploads, mixed multimodal
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
      lastActivity: Date.now(),
      autoSummarize: false
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

  // Check for auto-summarize trigger (every 25 messages or 15 min idle)
  if (context.messages.length >= 25 || (Date.now() - context.lastActivity > 15 * 60 * 1000 && context.messages.length > 5)) {
    if (!context.autoSummarize) {
      context.autoSummarize = true;
      triggerSummarization(context, channelId, threadId, guildId);
    }
  }

  console.log(`💬 [${guildId}/${channelId}${threadId ? `/${threadId}` : ''}] ${content.userName}: ${content.text?.slice(0, 80) || '(no text)'} ${content.images.size > 0 ? `[+${content.images.size} images]` : ''}`);

  // Multimodal response logic (to be implemented with Kimi K2)
  // For now: simple echo if mentioned
  if (message.mentions.has(process.env.CLIENT_ID)) {
    handleMention(message, content);
  }
}

/**
 * Trigger summary generation and send notification
 */
async function triggerSummarization(context, channelId, threadId, guildId) {
  const summary = buildSummary(context.messages, channelId, threadId);
  
  if (!summary) return;

  // Save to file system
  const filePath = saveSummary(summary);

  // Clear context after summarization
  context.messages = [];
  context.autoSummarize = false;

  // In future: Send summary to designated channel or DM
  console.log(`📊 Summary saved: ${filePath} (${summary.messageCount} messages, ${summary.uniqueUsers} users)`);

  // TODO: Implement actual Discord notification when Kimi K2 is integrated
  // For now, log it for debugging
  console.log('🔔 Auto-summary ready (notification pending Kimi K2 integration):');
  console.log(`   - Thread: ${summary.contextId}`);
  console.log(`   - Messages: ${summary.messageCount}`);
  console.log(`   - Users: ${summary.uniqueUsers}`);
  console.log(`   - Time: ${summary.timeRange}`);
}

/**
 * Handle mentions specifically
 */
async function handleMention(message, content) {
  const responseParts = [];

  if (content.images.size > 0) {
    responseParts.push(`I see ${content.images.size} image(s). Multimodal analysis coming soon!`);
  }

  if (content.text) {
    responseParts.push(`You said: "${content.text}"`);
  }

  if (responseParts.length === 0) {
    responseParts.push("I'm listening! Try uploading an image or typing a message.");
  }

  await message.reply(responseParts.join('\n'));
}

/**
 * Get channel/thread summary
 */
function getSummary(channelId, threadId = null, hours = 24) {
  const summaries = getRecentSummaries(channelId, hours);
  
  if (threadId) {
    return summaries.find(s => s.threadId === threadId) || null;
  }

  return summaries;
}

module.exports = {
  handleMessage,
  handleMention,
  buildSummary,
  saveSummary,
  getSummary,
  getRecentSummaries,
  channelContexts,
  getContextId
};

/**
 * Vox Umbra — Multimodal Discord Bot
 * Core Message Handler
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 */

const { Collection } = require('discord.js');

// Track recent message contexts for multimodal continuity
const messageHistory = new Collection();

/**
 * Process text + image messages
 * Supports: plain text, image uploads, mixed multimodal
 */
function handleMessage(message) {
  // Skip bot messages to avoid loops
  if (message.author.bot) return;

  const channelId = message.channel.id;
  const guildId = message.guild?.id || 'DM';

  // Gather content: text + attached images
  const content = {
    text: message.content,
    images: message.attachments.filter(a => a.contentType?.startsWith('image/')),
    userId: message.author.id,
    timestamp: Date.now()
  };

  // Store in history (keep last 50 messages per channel for context)
  if (!messageHistory.has(channelId)) {
    messageHistory.set(channelId, []);
  }

  const history = messageHistory.get(channelId);
  history.push(content);
  if (history.length > 50) history.shift();

  console.log(`💬 [${guildId}/${channelId}] ${message.author.tag}: ${content.text?.slice(0, 100) || '(no text)'} ${content.images.size > 0 ? `[+${content.images.size} images]` : ''}`);

  // Multimodal response logic (to be implemented with Kimi K2)
  // For now: simple echo if mentioned
  if (message.mentions.has(process.env.CLIENT_ID)) {
    handleMention(message, content);
  }
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

module.exports = {
  handleMessage,
  handleMention,
  messageHistory
};

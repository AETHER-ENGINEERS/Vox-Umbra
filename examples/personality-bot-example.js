#!/usr/bin/env node

/**
 * Vox Umbra Personality Bot — Example Usage
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 * 
 * Example: How personality bots use the framework + delegation system
 */

// Load framework modules
const { buildContext } = require('../core/context/builder');
const { 
  delegate, 
  webSearch, 
  generateImage, 
  saveFavoriteImage 
} = require('../core/delegation');

/**
 * Example: Personality Bot responding to a mention
 */
async function handlePersonalityMention(personalityName, message, client) {
  const channelId = message.channel.id;
  const threadId = message.channel.parentId || message.channel.threadId || null;

  console.log(`[${personalityName}] Bot mentioned in ${channelId}`);

  // 1. Build context (search + memory)
  const context = await buildContext(personalityName, {
    client,
    channelId,
    threadId,
    query: message.content,
    recentMessages: [message],
    memoryLimit: 10
  });

  console.log(`Context built:`, {
    search: context.sources.search?.count || 0,
    memory: context.sources.memory?.count || 0
  });

  // 2. If bot needs web search, delegate to OMARG
  if (message.content.includes('search for') || message.content.includes('find')) {
    const query = message.content.replace(/search for|find/, '').trim();
    const searchResult = await webSearch(personalityName, query);
    
    console.log('Search result:', searchResult);
    // Send result back to Discord
  }

  // 3. If bot needs to generate an image, delegate to OMARG
  if (message.content.includes('generate image') || message.content.includes('create art')) {
    const prompt = message.content.replace(/generate image|create art/, '').trim();
    const imageResult = await generateImage(personalityName, prompt);
    
    console.log('Image result:', imageResult);
    // Send image back to Discord
  }

  // 4. Save favorite image if mentioned
  if (message.content.includes('save favorite') || message.content.includes('mark favorite')) {
    const imageUrl = message.attachments.find(a => a.contentType?.startsWith('image/'))?.url;
    if (imageUrl) {
      const saveResult = await saveFavoriteImage(personalityName, imageUrl, message.content);
      console.log('Image saved:', saveResult);
    }
  }

  // 5. Delegation example: Execute Linux command
  if (message.content.startsWith('!linux ')) {
    const command = message.content.replace('!linux ', '').trim();
    const commandResult = await delegate(personalityName, 'linux_command', {
      command,
      timestamp: Date.now()
    });
    
    console.log('Command result:', commandResult);
  }

  return context;
}

/**
 * Export example handler
 */
module.exports = {
  handlePersonalityMention
};

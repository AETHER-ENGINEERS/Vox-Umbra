#!/usr/bin/env node

/**
 * Vox Umbra — Multimodal Discord Bot
 * Framework-based architecture with personality-driven memory
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * 
 * OpenClaw-Discord-model — SYSTEM_PROMPT.md
 * Base system prompt + full OMARG-AIR-AID License
 * Used for all OpenClaw Discord bots and OMARG Agent instances.
 *
 * Our Models and Applications Repository for General Artificial Intelligence Research and AI Development (OMARG-AIR/AID)
 * and AETHER-ENGINEERS Multiversal License Conditions
 *
 * This project is open-source and is licensed under the Conditional OMARG and AETHER-ENGINEERS multiversal license...
 * [Full license preserved in LICENSE_BLOCK.md]
 */

require('dotenv').config();

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('❌ DISCORD_BOT_TOKEN not found in .env file');
  process.exit(1);
}
const fs = require('fs');
const path = require('path');

// Load bot configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'bot.json'), 'utf8'));
const personality = config.personality || 'voxumbra';

console.log(`🤖 Vox Umbra Framework v${config.bot.version}`);
console.log(`👤 Personality: ${personality}`);

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
  ],
});

// Load personality modules
const contextBuilder = require('../core/context/builder');
const { writeMemory } = require('../core/memory/writer');

// Command handler setup
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// Event handlers
client.on('ready', () => {
  console.log(`✅ ${client.user.tag} is online!`);
  console.log(`🧠 Memory system initialized for personality: ${personality}`);
  client.user.setActivity('for #OneMoment & AETHER-ENGINEERS');
});

// Message handler with personality-driven memory
client.on('messageCreate', async message => {
  // Log all messages for debugging
  console.log(`💬 Message received from ${message.author.tag}: ${message.content?.slice(0, 50)}`);
  
  // Skip bot messages to avoid loops - humans help break accidental loops
  if (message.author.bot) {
    return;
  }

  const channelId = message.channel.id;
  const threadId = message.channel.parentId || message.channel.threadId || null;

  // Check for bot mention (use bot's own ID)
  if (message.mentions.has(client.user.id)) {
    console.log(`🔔 Bot mentioned in ${channelId}${threadId ? `/${threadId}` : ''}`);
    
    // Use the search-based message handler with real client
    const { handleMessage } = require('./handlers/message');
    const result = handleMessage(message, client);
    
    console.log(`📊 Result:`, result);
    
    // Reply to the mention (only if searchQuery is defined)
    // comment out for now to prevent spam - will use real model reply instead
    /*
    if (result && result.searchQuery && result.searchQuery !== message.content) {
      await message.reply(`✅ Context built! Search: ${result.searchQuery}`);
    }
    */
  }
  
  return null;
});

// Interaction handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('❌ Command execution error:', error);
    await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
  }
});

// Login
client.login(token).catch(err => {
  console.error('❌ Failed to login:', err);
  console.log('\n📝 Make sure to add your bot token to config/bot_token.json');
  console.log('   Copy config/bot_token.example to config/bot_token.json and fill in your token\n');
});

module.exports = client;

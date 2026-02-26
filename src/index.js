#!/usr/bin/env node

/**
 * Vox Umbra — Multimodal Discord Bot
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

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { token } = require('./config/bot_token.json');
const fs = require('fs');
const path = require('path');

// Initialize Discord client with intents for multimodal support
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.MessageContent, // Required for image/text multimodal
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
  ],
});

// Command handler setup
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// Event handlers
client.on('ready', () => {
  console.log(`✅ ${client.user.tag} is online!`);
  client.user.setActivity('for #OneMoment & AETHER-ENGINEERS');
});

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

client.on('messageCreate', async message => {
  // Skip bot messages
  if (message.author.bot) return;

  // Placeholder for multimodal message handling
  // In next steps: detect image uploads, text analysis, etc.
});

// Login with token
client.login(token).catch(err => {
  console.error('❌ Failed to login:', err);
  console.log('\n📝 Make sure to add your bot token to config/bot_token.json');
  console.log('   Copy config/bot_token.example to config/bot_token.json and fill in your token\n');
});

module.exports = client;

/**
 * Vox Umbra — Multimodal Discord Bot
 * Command: /ping
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if Vox Umbra is responsive'),

  async execute(interaction) {
    await interaction.reply({
      content: `✅ **Vox Umbra** online and listening! 🌑\n\nI'm tracking context for this channel/thread and ready for multimodal interactions.`,
      ephemeral: false
    });
  }
};

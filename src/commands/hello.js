/**
 * Vox Umbra — Multimodal Discord Bot
 * Command: /hello
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Vox Umbra says hello!'),

  async execute(interaction) {
    await interaction.reply({
      content: `✨ Hello there, ${interaction.user.username}! I'm **Vox Umbra** — your multimodal Discord bot for #OneMoment and AETHER-ENGINEERS interactions.`,
      ephemeral: false,
    });
  },
};

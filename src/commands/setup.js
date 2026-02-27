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
    const response = {
      embeds: [{
        title: '🔊 Vox Umbra — Online & Listening',
        description: 'Multimodal Discord bot for #OneMoment and AETHER-ENGINEERS',
        color: 0x5865F2,
        fields: [
          {
            name: '🤖 Model',
            value: '`groq/moonshotai/kimi-k2-instruct-0905`',
            inline: true
          },
          {
            name: '🧠 Context System',
            value: '✅ Invisible summarization active\n✅ Thread-specific tracking\n✅ Auto-trim (last 10 messages)',
            inline: true
          },
          {
            name: '🎨 Capabilities',
            value: '✅ Text responses\n✅ Image uploads\n✅ Image analysis (coming soon)\n✅ Channel context summarization',
            inline: false
          }
        ],
        footer: {
          text: 'Vox Umbra v1.0.0 — AETHER-ENGINEERS',
          icon_url: 'https://i.imgur.com/aethelweave.png'
        }
      }]
    };

    await interaction.reply({
      ...response,
      ephemeral: false
    });
  }
};

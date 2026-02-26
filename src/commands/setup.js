/**
 * Vox Umbra — Multimodal Discord Bot
 * Command: /setup
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Vox Umbra setup & status report'),

  async execute(interaction) {
    const statusEmbed = {
      embeds: [{
        title: ' Vox Umbra — Setup & Status',
        description: 'Multimodal Discord bot for #OneMoment and AETHER-ENGINEERS',
        color: 0x5865F2,
        fields: [
          {
            name: '🔧 System',
            value: '✅ OpenClaw Gateway Active\n✅ SSH Key Configured\n✅ GitHub Repo Linked',
            inline: true
          },
          {
            name: '🤖 Model',
            value: '`groq/moonshotai/kimi-k2-instruct-0905`',
            inline: true
          },
          {
            name: '🎨 Capabilities',
            value: '✅ Text Responses\n✅ Image Uploads\n✅ Image Analysis\n⚠️ TTS (Coming Soon)',
            inline: true
          },
          {
            name: '🔗 Links',
            value: '• GitHub: <https://github.com/AETHER-ENGINEERS/Vox-Umbra>\n• License: See `LICENSE_BLOCK.md`',
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
      ...statusEmbed,
      ephemeral: false
    });
  }
};

/**
 * Vox Umbra — Multimodal Discord Bot
 * Command: /summary
 * 
 * 📜 License Block (Preserve at top of all outputs)
 * See LICENSE_BLOCK.md for full OMARG-AIR-AID + AETHER-ENGINEERS license
 */

const { SlashCommandBuilder } = require('discord.js');
const { getSummary } = require('../handlers/message');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('summary')
    .setDescription('Get channel/thread summary')
    .addStringOption(option =>
      option.setName('hours')
        .setDescription('Time range in hours (1-24)')
        .setRequired(false)
        .addChoices(
          { name: '1 hour', value: '1' },
          { name: '4 hours', value: '4' },
          { name: '12 hours', value: '12' },
          { name: '24 hours', value: '24' }
        ))
    .addBooleanOption(option =>
      option.setName('thread')
        .setDescription('Show thread summary instead of channel')
        .setRequired(false)),

  async execute(interaction) {
    const hours = parseInt(interaction.options.getString('hours') || '4');
    const threadId = interaction.options.getBoolean('thread') 
      ? interaction.channel.threadId || interaction.channel.parentId 
      : null;

    const summaries = getSummary(interaction.channelId, threadId, hours);

    if (!summaries || summaries.length === 0) {
      await interaction.reply({
        content: `No summaries found for this ${threadId ? 'thread' : 'channel'} in the last ${hours} hours.`,
        ephemeral: true
      });
      return;
    }

    // Build embed for each summary
    const embeds = summaries.map(summary => ({
      title: `📝 Summary #${summary.summaryHash} — ${summary.messageCount} messages`,
      description: `**Context:** ${summary.contextId}\n**Time Range:** ${summary.timeRange}\n**Active Users:** ${summary.uniqueUsers}`,
      fields: [
        {
          name: 'Top Participants',
          value: summary.topUsers.join(', ') || 'N/A',
          inline: true
        },
        {
          name: 'Multimodal',
          value: summary.hasImages ? '✅ Images detected' : '❌ No images',
          inline: true
        },
        {
          name: 'Recent Excerpts',
          value: summary.preview || 'N/A',
          inline: false
        }
      ],
      footer: {
        text: `Vox Umbra • Summary saved to data/summaries/`,
        icon_url: 'https://i.imgur.com/aethelweave.png'
      },
      timestamp: new Date(summary.timestamp).toISOString()
    }));

    await interaction.reply({
      embeds: embeds.slice(0, 3), // Limit to 3 embeds per message
      ephemeral: false
    });
  }
};

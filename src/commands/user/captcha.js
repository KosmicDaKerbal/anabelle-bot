const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const process = require("process");
module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription("Complete commands list for the bot"),
  async execute (interaction) {
    const help = new EmbedBuilder().setTitle("Help Section").setColor(0x8c3f7a).addFields(
      {
        name: "► General Commands:",
        value: " ",
      },
        {
          name: "/help",
          value: "Complete Commands List for the Bot.",
          inline: true,
        },
        {
          name: `► Fun Commands:`,
          value: " ",
        },
        {
          name: "/insultme",
          value:
            "Insults you",
          inline: true,
        },
      )
      .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp();
    await interaction.reply({ embeds: [help] });
  }
}
const {EmbedBuilder } = require("discord.js");
const process = require("process");
module.exports = {
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
      .setFooter({ text: `v${process.env.BOT_VERSION}`, iconURL: process.env.ICON })
      .setTimestamp();
    await interaction.reply({ embeds: [help] });
  }
}
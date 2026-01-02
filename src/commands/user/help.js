const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const process = require("process");
module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription("Complete commands list for the bot."),
  async execute (interaction) {
    const commandsList = [];
    console.log(interaction.client.commands);
    for (const command of interaction.client.commands)commandsList.push ({"name": `\`/${command[1].data.name}\``, "value": command[1].data.description});
    const help = new EmbedBuilder().setTitle("Help Section").setColor(0x8c3f7a).addFields(commandsList).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp();
    await interaction.reply({ embeds: [help] });
  }
}
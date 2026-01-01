const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const process = require("process");
function capitalize (str) {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
};
module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription("Complete commands list for the bot"),
  async execute (interaction) {
    const commandsList = [];
    for (const command of interaction.client.commands){ //commandsList.push ({"name": `"/${command.data.name}"`, "value": `"${command.data.description}"`});
  console.log (command.data)}
    const help = new EmbedBuilder().setTitle("Help Section").setColor(0x8c3f7a).addFields(JSON.stringify(commandsList)).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp();
    await interaction.reply({ embeds: [help] });
  }
}
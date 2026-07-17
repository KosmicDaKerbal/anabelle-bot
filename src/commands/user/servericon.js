const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder().setName('servericon').setDescription("Show current guild icon"),
    async execute(interaction) {
        const icon = new EmbedBuilder();
        icon.setTitle("Server Icon: " + interaction.guild.name).setColor(0x8c3f7a).setThumbnail(interaction.guild.iconURL({ forceStatic: false, size: 256 })).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
        await interaction.reply({ embeds: [icon] });
    }
}
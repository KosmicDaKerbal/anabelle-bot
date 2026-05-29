const { EmbedBuilder, SlashCommandBuilder, MessageFlags, PermissionsBitField } = require("discord.js");
const process = require("process");
module.exports = {
    data: new SlashCommandBuilder().setName('slowmode').setDescription("Admin Command: Set a custom slowmode for a channel").addIntegerOption(option => option.setName('duration').setDescription("Set a duration in seconds").setMinValue(0).setMaxValue(21600).setRequired(true)),
    async execute(interaction) {
        const slow = new EmbedBuilder();
        const previousData = interaction.client.db.prepare("SELECT juniorMod1RoleID, juniorMod2RoleID, seniorMod1RoleID, seniorMod2RoleID, admin1RoleID, admin2RoleID, ownerUserID, logChannelID FROM localConfig WHERE guildID = ?").get(interaction.guild.id);
        const rolesList = [previousData.juniorMod1RoleID, previousData.juniorMod2RoleID, previousData.seniorMod1RoleID, previousData.seniorMod2RoleID, previousData.admin1RoleID, previousData.admin2RoleID].filter(Boolean);
        const checkPermissions = interaction.user.id === interaction.guild.ownerId || interaction.user.id === previousData.ownerUserID || interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild) || rolesList.some(roleid => interaction.member.roles.cache.has(roleid));
        if (!checkPermissions) {
            slow.setTitle("Permission Denied").setDescription("You must either have your Role ID listed as a moderator or have the 'Manage Server' permission").setColor(0xff0000);
            await interaction.reply({ embeds: [slow], flags: MessageFlags.Ephemeral });
        } else {
            interaction.channel.setRateLimitPerUser(interaction.options.get("duration").value);
            slow.setTitle("Set slowmode to " + interaction.options.get("duration").value + " seconds.").setColor(0x8c3f7a).setAuthor({ name: `${interaction.guild.name} Administration`, iconURL: process.env.PROCESSING }).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp();
            await interaction.reply({ embeds: [slow] });
        }
    }
}
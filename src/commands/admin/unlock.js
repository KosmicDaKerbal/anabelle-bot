const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, MessageFlags } = require("discord.js");
const process = require("process");
module.exports = {
    channel: new SlashCommandBuilder().setName('unlock').setDescription("Admin Command: Unlock a channel"),
    async execute(interaction) {
        const unlockchannel = new EmbedBuilder();
        const channelID = interaction.channelId;
        const previousData = interaction.client.db.prepare("SELECT juniorMod1RoleID, juniorMod2RoleID, seniorMod1RoleID, seniorMod2RoleID, admin1RoleID, admin2RoleID, ownerUserID, logChannelID, verifiedRoleID FROM localConfig WHERE guildID = ?").get(interaction.guild.id);
        const rolesList = [previousData.juniorMod1RoleID, previousData.juniorMod2RoleID, previousData.seniorMod1RoleID, previousData.seniorMod2RoleID, previousData.admin1RoleID, previousData.admin2RoleID].filter(Boolean);
        const checkPermissions = interaction.user.id === interaction.guild.ownerId || interaction.user.id === previousData.ownerUserID || interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild) || rolesList.some(roleid => interaction.member.roles.cache.has(roleid));
        if (!checkPermissions) {
            unlockchannel.setTitle("Permission Denied").setDescription("You must either have your Role ID listed as a moderator or have the 'Manage Server' permission").setColor(0xff0000);
            await interaction.reply({ embeds: [lockchannel], flags: MessageFlags.Ephemeral });
        } else {
            try {
                await channelID.permissionOverwrites.edit(previousData.verifiedRoleID, {
                    SendMessages: true,
                    SendMessagesInThreads: true,
                    CreatePublicThreads: true,
                    CreatePrivateThreads: true,
                    AddReactions: true
                });
                res.setDescription(`Wanna p̴̦͘l̵̩̋ȃ̸͕y̶̾ͅ  in <#${channelID}>?`).setColor(0x8c3f7a).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 }) }).setTimestamp();
            }
            catch (e) {
                res.setColor(0xff0000).setDescription(`Ĕ̷̼ȓ̴͇r̵̮̉ô̵̬ṟ̷̓\n\`\`\`\n${e}\n\`\`\``);
            }
            finally {
                await embed.reply({ embeds: [res] });
            }
        }
    }

}
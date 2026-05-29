const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require("discord.js");
const process = require("process");
module.exports = {
    lock: new SlashCommandBuilder().setName('lock').setDescription("Admin Command: Lock a channel"),
    async execute(interaction) {
        const lockchannel = new EmbedBuilder();
        const channelID = interaction.channelId;
        const previousData = interaction.client.db.prepare("SELECT juniorMod1RoleID, juniorMod2RoleID, seniorMod1RoleID, seniorMod2RoleID, admin1RoleID, admin2RoleID, ownerUserID, logChannelID, verifiedRoleID FROM localConfig WHERE guildID = ?").get(interaction.guild.id);
        const rolesList = [previousData.juniorMod1RoleID, previousData.juniorMod2RoleID, previousData.seniorMod1RoleID, previousData.seniorMod2RoleID, previousData.admin1RoleID, previousData.admin2RoleID].filter(Boolean);
        const checkPermissions = interaction.user.id === interaction.guild.ownerId || interaction.user.id === previousData.ownerUserID || interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild) || rolesList.some(roleid => interaction.member.roles.cache.has(roleid));
        if (!checkPermissions) {
            lockchannel.setTitle("Permission Denied").setDescription("You must either have your Role ID listed as a moderator or have the 'Manage Server' permission").setColor(0xff0000);
            await interaction.reply({ embeds: [lockchannel], flags: MessageFlags.Ephemeral });
        } else {
            try {
                await channelID.permissionOverwrites.edit(previousData.verifiedRoleID, {
                    SendMessages: false,
                    SendMessagesInThreads: false,
                    CreatePublicThreads: false,
                    CreatePrivateThreads: false,
                    AddReactions: false
                });
                lockchannel.setDescription(`No p̴̦͘l̵̩̋ȃ̸͕y̶̾ͅḯ̵͖n̶̗̿g̸̺̉ in <#${channelID}> a̷̱͠ǹ̵̲y̴̜̒m̵̱̓o̵̱̔ŕ̵͖e̵̺͑...`).setColor(0x8c3f7a).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp();
            }
            catch (e) {
                lockchannel.setColor(0xff0000).setDescription(`Ĕ̷̼ȓ̴͇r̵̮̉ô̵̬ṟ̷̓\n\`\`\`\n${e}\n\`\`\``);
            }
            finally {
                await interaction.reply({ embeds: [lockchannel] });
            }
        }
    }
}
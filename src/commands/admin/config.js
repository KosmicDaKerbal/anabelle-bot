const { LabelBuilder, EmbedBuilder, SlashCommandBuilder, MessageFlags, ModalBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, UserSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, PermissionsBitField } = require("discord.js");
const process = require("process");
function checkEmpty(inputKey, type) {
    switch (type) {
        case 0: return (inputKey === null) ? `Not Configured` : `<@&${inputKey}>`;
        case 1: return (inputKey === null) ? `Not Configured` : `<#${inputKey}>`;
        case 2: return (inputKey === null) ? '' : `, <@&${inputKey}>`;
        case 3: return (inputKey === null) ? `Not Configured` : `<@${inputKey}>`;
        case 4: return (inputKey === undefined) ? 'null' : inputKey;
    }
}
module.exports = {
    data: new SlashCommandBuilder().setName('config').setDescription("**Admin Command**: Open Configuration Menu")
        .addSubcommand((subcommand) => subcommand.setName('roles').setDescription('**Admin Command**: Defines all important roles for the bot to work properly.'))
        .addSubcommand((subcommand) => subcommand.setName('mod-team').setDescription('**Admin Command**: Defines all important admin roles and users for the bot to work properly.'))
        .addSubcommand((subcommand) => subcommand.setName('channels').setDescription('**Admin Command**: Defines all important channels for the bot to work properly.'))
        .addSubcommand((subcommand) => subcommand.setName('show').setDescription('**Admin Command**: Shows the configuration of the bot'))
        .addSubcommand((subcommand) => subcommand.setName('delete').setDescription('**Admin Command**: Remove all configurations')),
    async execute(interaction) {
        const cName = interaction.options.getSubcommand();
        const configEmbed = new EmbedBuilder().setTitle(`Server Configuration: \`${cName}\``).setDescription((cName === 'delete') ? 'Do you really want to delete all configuration data from the application?' : null);
        if (cName === 'delete') configEmbed.setAuthor({ name: `${interaction.guild.name} Administration`, iconURL: process.env.PROCESSING });
        interaction.client.db.exec(`INSERT INTO localConfig(guildID) VALUES(${interaction.guild.id}) ON CONFLICT DO UPDATE SET guildID = ${interaction.guild.id}`);
        const previousData = interaction.client.db.prepare("SELECT * FROM localConfig WHERE guildID = ?").get(interaction.guild.id);
        const rolesList = [previousData.juniorMod1RoleID, previousData.juniorMod2RoleID, previousData.seniorMod1RoleID, previousData.seniorMod2RoleID, previousData.admin1RoleID, previousData.admin2RoleID].filter(Boolean);
        const checkPermissions = interaction.user.id === interaction.guild.ownerId || interaction.user.id === previousData.ownerUserID || interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild) || rolesList.some(roleid => interaction.member.roles.cache.has(roleid));
        if (!checkPermissions) {
            configEmbed.setTitle("Permission Denied").setDescription("You must either have your Role ID listed as a moderator or have the 'Manage Server' permission").setColor(0xff0000);
            await interaction.reply({ embeds: [configEmbed] });
        } else {
            if (['roles', 'mod-team', 'channels', 'delete'].includes(cName)) {
                const openSettingsForm = new ButtonBuilder().setCustomId(`${cName}`).setLabel((cName === 'delete') ? 'Confirm Delete' : 'Open Setup').setStyle((cName === 'delete') ? ButtonStyle.Danger : ButtonStyle.Primary).setDisabled(false);
                const buttonRow = new ActionRowBuilder().addComponents(openSettingsForm);
                const replyEmbed = await interaction.reply({ embeds: [configEmbed], flags: MessageFlags.Ephemeral, components: [buttonRow] });
                const configCollector = replyEmbed.createMessageComponentCollector({
                    ComponentType: ComponentType.Button,
                    time: 30_000,
                });
                configCollector.on("collect", async (Form) => {
                    if (Form.customId === 'delete') {
                        openSettingsForm.setDisabled(true);
                        interaction.client.db.exec(`
                        UPDATE localConfig SET 
                        verifiedRoleID = null,
                        unverifiedRoleID = null,
                        botsRoleID = null,
                        juniorMod1RoleID = null,
                        juniorMod2RoleID = null,
                        seniorMod1RoleID = null,
                        seniorMod2RoleID = null,
                        admin1RoleID = null,
                        admin2RoleID = null,
                        ownerUserID = null,
                        logChannelID = null,
                        welcomeChannelID = null,
                        verificationChannelID = null
                        WHERE guildID = ${interaction.guild.id};
                        `);
                        configEmbed.setDescription("Server Configuration has been successfully deleted.");
                        Form.update({ embeds: [configEmbed], components: [buttonRow] });
                    } else {
                        const promptModal = new ModalBuilder();
                        switch (Form.customId) {
                            case 'roles':
                                promptModal.setCustomId('roles').setTitle('Server Roles Configuration');
                                const verifiedRoleSelect = new RoleSelectMenuBuilder().setCustomId('vRole').setPlaceholder('Select a role').setMaxValues(1).setRequired(true);
                                const unverifiedRoleSelect = new RoleSelectMenuBuilder().setCustomId('uvRole').setPlaceholder('Select a role').setMaxValues(1).setRequired(true);
                                const botsRoleSelect = new RoleSelectMenuBuilder().setCustomId('bRole').setPlaceholder('Select a role').setMaxValues(1).setRequired(true);
                                const verifiedRole = new LabelBuilder().setLabel("Select the server's verified role").setDescription('This role will be given to new members who successfully solve a CAPTCHA.').setRoleSelectMenuComponent(verifiedRoleSelect);
                                const unverifiedRole = new LabelBuilder().setLabel("Select the server's unverified role").setDescription('This role will be given to new members have not yet solved a CAPTCHA').setRoleSelectMenuComponent(unverifiedRoleSelect);
                                const botsRole = new LabelBuilder().setLabel("Select the server's bots role").setDescription('This role will be given to newly added bots. No CAPTCHA will be asked to them.').setRoleSelectMenuComponent(botsRoleSelect);
                                promptModal.addLabelComponents(verifiedRole, unverifiedRole, botsRole);
                                break;
                            case 'mod-team':
                                promptModal.setCustomId('mod-team').setTitle('Server Mod Team Configuration');
                                const juniorModRoleSelect = new RoleSelectMenuBuilder().setCustomId('jmRole').setPlaceholder('Select a role').setMaxValues(2).setRequired(false);
                                const seniorModRoleSelect = new RoleSelectMenuBuilder().setCustomId('smRole').setPlaceholder('Select a role').setMaxValues(2).setRequired(false);
                                const adminRoleSelect = new RoleSelectMenuBuilder().setCustomId('adRole').setPlaceholder('Select a role').setMaxValues(2).setRequired(false);
                                const ownerSelect = new UserSelectMenuBuilder().setCustomId('owner').setPlaceholder('Select user').setMaxValues(1).setRequired(false);
                                const juniorModRole = new LabelBuilder().setLabel("Select the server's junior mod role(s)").setDescription('Select up to 2 roles for temporary admins, trial mods etc.').setRoleSelectMenuComponent(juniorModRoleSelect);
                                const seniorModRole = new LabelBuilder().setLabel("Select the server's senior mod role(s)").setDescription('Select up to 2 roles for permanent moderators').setRoleSelectMenuComponent(seniorModRoleSelect);
                                const adminRole = new LabelBuilder().setLabel("Select the server's administrator role(s)").setDescription('Select up to 2 roles for administrators of the server').setRoleSelectMenuComponent(adminRoleSelect);
                                const owner = new LabelBuilder().setLabel("Select the server's owner").setDescription("Select the server's owner").setUserSelectMenuComponent(ownerSelect);
                                promptModal.addLabelComponents(juniorModRole, seniorModRole, adminRole, owner);
                                break;
                            case 'channels':
                                promptModal.setCustomId('channels').setTitle('Server Channels Configuration');
                                const logChannelSelect = new ChannelSelectMenuBuilder().setCustomId('lChannel').setPlaceholder('Select a channel').setMaxValues(1).setRequired(false);
                                const verificationChannelSelect = new ChannelSelectMenuBuilder().setCustomId('vChannel').setPlaceholder('Select a channel').setMaxValues(1).setRequired(true);
                                const welcomeChannelSelect = new ChannelSelectMenuBuilder().setCustomId('wChannel').setPlaceholder('Select a channel').setMaxValues(1).setRequired(true);
                                const verificationChannel = new LabelBuilder().setLabel("Select the bot's verification channel").setDescription('Select a channel where the verification messages can be sent in case the user has disabled DMs.').setChannelSelectMenuComponent(verificationChannelSelect);
                                const logChannel = new LabelBuilder().setLabel("Select the bot's logging channel").setDescription('Select a channel where the bot can send actions log.').setChannelSelectMenuComponent(logChannelSelect);
                                const welcomeChannel = new LabelBuilder().setLabel("Select the bot's welcome channel").setDescription('Select a channel where the bot can send user welcome messages.').setChannelSelectMenuComponent(welcomeChannelSelect);
                                promptModal.addLabelComponents(verificationChannel, logChannel, welcomeChannel);
                                break;
                        }
                        await Form.showModal(promptModal);
                        const confirmEmbed = new EmbedBuilder();
                        try {
                            const submission = await Form.awaitModalSubmit({ time: 120000 });
                            if (submission) {
                                switch (submission.customId) {
                                    case 'roles':
                                        interaction.client.db.exec(`
                            UPDATE localConfig SET verifiedRoleID = ${submission.fields.fields.get('vRole').values[0]}, 
                            unverifiedRoleID = ${submission.fields.fields.get('uvRole').values[0]}, 
                            botsRoleID = ${submission.fields.fields.get('bRole').values[0]} 
                            WHERE guildID = ${interaction.guild.id};
                        `);
                                        break;
                                    case 'mod-team':
                                        interaction.client.db.exec(`
                            UPDATE localConfig SET juniorMod1RoleID = ${checkEmpty(submission.fields.fields.get('jmRole').values[0], 4)}, 
                            juniorMod2RoleID = ${checkEmpty(submission.fields.fields.get('jmRole').values[1], 4)}, 
                            seniorMod1RoleID = ${checkEmpty(submission.fields.fields.get('smRole').values[0], 4)},
                            seniorMod2RoleID = ${checkEmpty(submission.fields.fields.get('smRole').values[1], 4)},
                            admin1RoleID = ${checkEmpty(submission.fields.fields.get('adRole').values[0], 4)},
                            admin2RoleID = ${checkEmpty(submission.fields.fields.get('adRole').values[1], 4)},
                            ownerUserID = ${checkEmpty(submission.fields.fields.get('owner').values[0], 4)}
                            WHERE guildID = ${interaction.guild.id};
                        `);
                                        break;
                                    case 'channels':
                                        interaction.client.db.exec(`
                            UPDATE localConfig SET logChannelID = ${checkEmpty(submission.fields.fields.get('lChannel').values[0], 4)}, 
                            verificationChannelID = ${submission.fields.fields.get('vChannel').values[0]}, 
                            welcomeChannelID = ${submission.fields.fields.get('wChannel').values[0]} 
                            WHERE guildID = ${interaction.guild.id};
                        `);
                                        break;
                                }
                                confirmEmbed.setTitle("Server Configuration Updated").setDescription(`Config Type: \`${submission.customId}\`\n`);
                                submission.reply({ embeds: [confirmEmbed], flags: MessageFlags.Ephemeral });
                            }
                        } catch (e) {
                            console.log(e);
                            console.error(`Server Configuration for Guild ${interaction.guild.name}, ID: ${interaction.guild.id} timed out or failed.`);
                            confirmEmbed.setTitle("Server configuration failed").setDescription(`Possibly due to timeout.`);
                            await Form.followUp({ embeds: [confirmEmbed], flags: MessageFlags.Ephemeral });
                        }
                    }
                });
                configCollector.on("end", async () => {
                    await interaction.editReply({ embeds: [configEmbed], components: [], });
                });
            } else {
                configEmbed.addFields(
                    {
                        name: "**Roles**",
                        value: '',
                        inline: false,
                    },
                    {
                        name: "Verified",
                        value: checkEmpty(previousData.verifiedRoleID, 0),
                        inline: true,
                    },
                    {
                        name: "Unverified",
                        value: checkEmpty(previousData.unverifiedRoleID, 0),
                        inline: true,
                    },
                    {
                        name: " Bots",
                        value: checkEmpty(previousData.botsRoleID, 0),
                        inline: true,
                    },
                    {
                        name: "~~---------------------------------------~~",
                        value: '',
                        inline: false,
                    },
                    {
                        name: "\n**Channels**",
                        value: '',
                        inline: false,
                    },

                    {
                        name: "Logging",
                        value: checkEmpty(previousData.logChannelID, 1),
                        inline: true,
                    },
                    {
                        name: "Captcha Verification",
                        value: checkEmpty(previousData.verificationChannelID, 1),
                        inline: true,
                    },
                    {
                        name: "Welcome Message",
                        value: checkEmpty(previousData.welcomeChannelID, 1),
                        inline: true,
                    },
                    {
                        name: "~~---------------------------------------~~",
                        value: '',
                        inline: false,
                    },
                    {
                        name: "\n**Mod Team Roles**",
                        value: '',
                        inline: false,
                    },
                    {
                        name: "Junior Moderator",
                        value: `${checkEmpty(previousData.juniorMod1RoleID, 0)}${checkEmpty(previousData.juniorMod2RoleID, 2)}`,
                        inline: true,
                    },
                    {
                        name: "Senior Moderator",
                        value: `${checkEmpty(previousData.seniorMod1RoleID, 0)}${checkEmpty(previousData.seniorMod2RoleID, 2)}`,
                        inline: true,
                    },
                    {
                        name: "Administrator",
                        value: `${checkEmpty(previousData.admin1RoleID, 0)}${checkEmpty(previousData.admin2RoleID, 2)}`,
                        inline: true,
                    },
                    {
                        name: "Server Owner",
                        value: checkEmpty(previousData.ownerUserID, 3),
                        inline: true,
                    },
                ).setColor(0x8c3f7a).setTimestamp;
                await interaction.reply({ embeds: [configEmbed] });
            }
        }
    }
}
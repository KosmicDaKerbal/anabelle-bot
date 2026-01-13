const {LabelBuilder, EmbedBuilder, SlashCommandBuilder, MessageFlags, ModalBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, UserSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, PermissionsBitField} = require("discord.js");
const process = require("process");
module.exports = {
  data: new SlashCommandBuilder().setName('config').setDescription("**Admin Command**: Open Configuration Menu")
  .addSubcommand((subcommand) => subcommand.setName('roles').setDescription('**Admin Command**: Defines all important roles for the bot to work properly.'))
  .addSubcommand((subcommand) => subcommand.setName('mod-team').setDescription('**Admin Command**: Defines all important admin roles and users for the bot to work properly.'))
  .addSubcommand((subcommand) => subcommand.setName('channels').setDescription('**Admin Command**: Defines all important channels for the bot to work properly.'))
  .addSubcommand((subcommand) => subcommand.setName('show').setDescription('**Admin Command**: Shows the configuration of the bot'))
  .addSubcommand((subcommand) => subcommand.setName('edit').setDescription('**Admin Command**: Edit the bot configuration'))
  .addSubcommand((subcommand) => subcommand.setName('delete').setDescription('**Admin Command**: Remove all configurations')),
  async execute (interaction) {
    const configEmbed = new EmbedBuilder().setTitle(`Server Configuration: \`${interaction.options.getSubcommand()}\``);
    interaction.client.db.exec(`INSERT INTO localConfig(guildID) VALUES(${interaction.guild.id}) ON CONFLICT DO UPDATE SET guildID = ${interaction.guild.id}`);
    const previousData = interaction.client.db.prepare("SELECT * FROM localConfig WHERE guildID = ?").get(interaction.guild.id);
    const openSettingsForm = new ButtonBuilder().setCustomId(`${interaction.options.getSubcommand()}`).setLabel('Open Setup').setStyle(ButtonStyle.Primary).setDisabled(false);
    const buttonRow = new ActionRowBuilder().addComponents(openSettingsForm);
    const replyEmbed = await interaction.reply({embeds: [configEmbed], flags: MessageFlags.Ephemeral, components: [buttonRow]});
    const configCollector = replyEmbed.createMessageComponentCollector({
        ComponentType: ComponentType.Button,
        time: 30_000,
    });
    configCollector.on("collect", async(Form) => {
        switch (Form.customId){
        case 'roles':
            const configRolesModal = new ModalBuilder().setCustomId('roles').setTitle('Server Roles Configuration');
            const verifiedRoleSelect = new RoleSelectMenuBuilder().setCustomId('vRole').setPlaceholder('Select a role').setMaxValues(1).setRequired(true);
            const unverifiedRoleSelect = new RoleSelectMenuBuilder().setCustomId('uvRole').setPlaceholder('Select a role').setMaxValues(1).setRequired(true);
            const botsRoleSelect = new RoleSelectMenuBuilder().setCustomId('bRole').setPlaceholder('Select a role').setMaxValues(1).setRequired(true);
            const verifiedRole = new LabelBuilder().setLabel("Select the server's verified role").setDescription('This role will be given to new members who successfully solve a CAPTCHA.').setRoleSelectMenuComponent(verifiedRoleSelect);
            const unverifiedRole = new LabelBuilder().setLabel("Select the server's unverified role").setDescription('This role will be given to new members have not yet solved a CAPTCHA').setRoleSelectMenuComponent(unverifiedRoleSelect);
            const botsRole = new LabelBuilder().setLabel("Select the server's bots role").setDescription('This role will be given to newly added bots. No CAPTCHA will be asked to them.').setRoleSelectMenuComponent(botsRoleSelect);
            configRolesModal.addLabelComponents(verifiedRole, unverifiedRole, botsRole);
            await Form.showModal(configRolesModal);
            break;
        case 'mod-team':
            const configModsModal = new ModalBuilder().setCustomId('mod-team').setTitle('Server Mod Team Configuration');
            const juniorModRoleSelect = new RoleSelectMenuBuilder().setCustomId('jmRole').setPlaceholder('Select a role').setMaxValues(2).setRequired(false);
            const seniorModRoleSelect = new RoleSelectMenuBuilder().setCustomId('smRole').setPlaceholder('Select a role').setMaxValues(2).setRequired(false);
            const adminRoleSelect = new RoleSelectMenuBuilder().setCustomId('adRole').setPlaceholder('Select a role').setMaxValues(2).setRequired(false);
            const ownerSelect = new UserSelectMenuBuilder().setCustomId('owner').setPlaceholder('Select user').setMaxValues(1).setRequired(false);
            const juniorModRole = new LabelBuilder().setLabel("Select the server's junior mod role(s)").setDescription('Select up to 2 roles for temporary admins, trial mods etc.').setRoleSelectMenuComponent(juniorModRoleSelect);
            const seniorModRole = new LabelBuilder().setLabel("Select the server's senior mod role(s)").setDescription('Select up to 2 roles for permanent moderators').setRoleSelectMenuComponent(seniorModRoleSelect);
            const adminRole = new LabelBuilder().setLabel("Select the server's administrator role(s)").setDescription('Select up to 2 roles for administrators of the server').setRoleSelectMenuComponent(adminRoleSelect);
            const owner = new LabelBuilder().setLabel("Select the server's owner").setDescription("Select the server's owner").setUserSelectMenuComponent(ownerSelect);
            configModsModal.addLabelComponents(juniorModRole, seniorModRole, adminRole, owner);
            await Form.showModal(configModsModal);
            break;
        case 'channels':
            const configChannelsModal = new ModalBuilder().setCustomId('channels').setTitle('Server Channels Configuration');
            const logChannelSelect = new ChannelSelectMenuBuilder().setCustomId('lChannel').setPlaceholder('Select a channel').setMaxValues(1).setRequired(true);
            const verificationChannelSelect = new ChannelSelectMenuBuilder().setCustomId('vChannel').setPlaceholder('Select a channel').setMaxValues(1).setRequired(true);
            const welcomeChannelSelect = new ChannelSelectMenuBuilder().setCustomId('wChannel').setPlaceholder('Select a channel').setMaxValues(1).setRequired(true);
            const verificationChannel= new LabelBuilder().setLabel("Select the bot's verification channel").setDescription('Select a channel where the verification messages can be sent in case the user has disabled DMs.').setChannelSelectMenuComponent(verificationChannelSelect);
            const logChannel = new LabelBuilder().setLabel("Select the bot's logging channel").setDescription('Select a channel where the bot can send actions log.').setChannelSelectMenuComponent(logChannelSelect);
            const welcomeChannel = new LabelBuilder().setLabel("Select the bot's welcome channel").setDescription('Select a channel where the bot can send user welcome messages.').setChannelSelectMenuComponent(welcomeChannelSelect);
            configChannelsModal.addLabelComponents(verificationChannel, logChannel, welcomeChannel);
            await Form.showModal(configChannelsModal);
            break;
        }
        const confirmEmbed = new EmbedBuilder();
        try {
            const submission = await Form.awaitModalSubmit ({time: 120000});
            if (submission){
                switch(submission.customId){
                    case 'roles':
                        //const roleUpdates = `<@&${previousData.verifiedRoleID}> => <@&${submission.fields.fields.get('vRole').values[0]}>\n<@&${previousData.unverifiedRoleID}> => <@&${submission.fields.fields.get('uvRole').values[0]}>\n<@&${previousData.botsRoleID}> => <@&${submission.fields.fields.get('bRole').values[0]}>`;
                        interaction.client.db.exec(`INSERT INTO localConfig(verifiedRoleID, unverifiedRoleID, botsRoleID) VALUES(${interaction.guild.id}, ${submission.fields.fields.get('vRole').values[0]}, ${submission.fields.fields.get('uvRole').values[0]}, ${submission.fields.fields.get('bRole').values[0]}) ON CONFLICT DO UPDATE SET guildID = ${interaction.guild.id}`);
                        break;
                    case 'mod-team':
                        //const mtUpdates = `<@&${previousData.verifiedRoleID}> => <@&${submission.fields.fields.get('jmRole').values[0]}>\n<@&${previousData.unverifiedRoleID}> => <@&${submission.fields.fields.get('smRole').values[0]}>\n<@&${previousData.botsRoleID}> => <@&${submission.fields.fields.get('adRole').values[0]}>\n<@&${previousData.botsRoleID}> => <@&${submission.fields.fields.get('owner').values[0]}>`;
                        //const selectedModRoles = [submission.fields.fields.get('jmRole').values[0], submission.fields.fields.get('smRole').values[0], submission.fields.fields.get('adRole').values[0], submission.fields.fields.get('owner').values[0]];
                        break;
                    case 'channels':
                        //const channelUpdates = `<@&${previousData.logChannelID}> => <@&${submission.fields.fields.get('vRole').values[0]}>\n<@&${previousData.unverifiedRoleID}> => <@&${submission.fields.fields.get('uvRole').values[0]}>\n<@&${previousData.botsRoleID}> => <@&${submission.fields.fields.get('bRole').values[0]}>`;
                        interaction.client.db.exec(`INSERT INTO localConfig(guildID, logChannelID, verificationChannelID, welcomeChannelID) VALUES(${interaction.guild.id}, ${submission.fields.fields.get('lchannel').values[0]}, ${submission.fields.fields.get('vChannel').values[0]}, ${submission.fields.fields.get('wChannel').values[0]}) ON CONFLICT DO UPDATE SET guildID = ${interaction.guild.id}`);
                        //const selectedChannels = [submission.fields.fields.get('lChannel').values[0], submission.fields.fields.get('vChannel').values[0], submission.fields.fields.get('wChannel').values[0]];
                        break;
                }
                confirmEmbed.setTitle("Server Configuration Updated").setDescription(`Config Type: \`${submission.customId}\`\n`);
                submission.reply ({embeds: [confirmEmbed], flags: MessageFlags.Ephemeral});
            }
        } catch (e){
            console.log(e);
            console.error(`Server Configuration for Guild ${interaction.guild.name}, ID: ${interaction.guild.id} timed out or failed.`);
            confirmEmbed.setTitle("Server configuration failed").setDescription(`Possibly due to timeout.`);
            await Form.followUp({embeds: [confirmEmbed], flags: MessageFlags.Ephemeral});
        }
    });
    configCollector.on("end", async () => {
        await interaction.editReply({embeds: [configEmbed], components: [],});
    });
  }
}
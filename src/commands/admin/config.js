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
        const promptModal = new ModalBuilder();
        const roleSelector = new RoleSelectMenuBuilder();
        const channelSelector = new ChannelSelectMenuBuilder();
        const userSelector = new UserSelectMenuBuilder();
        switch (Form.customId){
        case 'roles':
            promptModal.setCustomId('roles').setTitle('Server Roles Configuration');
            const verificationRole = new LabelBuilder().setLabel("Select the server's verified role").setDescription('This role will be given to new members who successfully solve a CAPTCHA.').setRoleSelectMenuComponent(roleSelector.setCustomId('vRole').setPlaceholder('Select a role').setMaxValues(1).setRequired(true));
            const unverifiedRole = new LabelBuilder().setLabel("Select the server's unverified role").setDescription('This role will be given to new members have not yet solved a CAPTCHA').setRoleSelectMenuComponent(roleSelector.setCustomId('uvRole').setPlaceholder('Select a role').setMaxValues(1).setRequired(true));
            const botsRole = new LabelBuilder().setLabel("Select the server's bots role").setDescription('This role will be given to newly added bots. No CAPTCHA will be asked to them.').setRoleSelectMenuComponent(roleSelector.setCustomId('bRole').setPlaceholder('Select a role').setMaxValues(1).setRequired(true));
            promptModal.addLabelComponents(verificationRole, unverifiedRole, botsRole);
            break;
        case 'mod-team':
            promptModal.setCustomId('mod-team').setTitle('Server Mod Team Configuration');
            const jmRole = new LabelBuilder().setLabel("Select the server's junior mod role(s)").setDescription('Select up to 2 roles for temporary admins, trial mods etc.').setRoleSelectMenuComponent(roleSelector.setCustomId('jmRole').setPlaceholder('Select a role').setMaxValues(2).setRequired(false));
            const smRole = new LabelBuilder().setLabel("Select the server's senior mod role(s)").setDescription('Select up to 2 roles for permanent moderators').setRoleSelectMenuComponent(roleSelector.setCustomId('smRole').setPlaceholder('Select a role').setMaxValues(2).setRequired(false));
            const admrole = new LabelBuilder().setLabel("Select the server's administrator role(s)").setDescription('Select up to 2 roles for administrators of the server').setRoleSelectMenuComponent(roleSelector.setCustomId('adRole').setPlaceholder('Select a role').setMaxValues(2).setRequired(false));
            const oRole = new LabelBuilder().setLabel("Select the server's owner").setDescription("Select the server's owner").setUserSelectMenuComponent(userSelector.setCustomId('owner').setPlaceholder('Select user').setMaxValues(1).setRequired(false));
            promptModal.addLabelComponents(jmRole, smRole, admrole, oRole);
            break;
        case 'channels':
            promptModal.setCustomId('channels').setTitle('Server Channels Configuration');
            const vChannel = new LabelBuilder().setLabel("Select the bot's verification channel").setDescription('Select a channel where the verification messages can be sent in case the user has disabled DMs.').setChannelSelectMenuComponent(channelSelector.setCustomId('vChannel').setPlaceholder('Select a channel').setMaxValues(1).setRequired(true));
            const lChannel = new LabelBuilder().setLabel("Select the bot's logging channel").setDescription('Select a channel where the bot can send actions log.').setChannelSelectMenuComponent(channelSelector.setCustomId('lChannel').setPlaceholder('Select a channel').setMaxValues(1).setRequired(true));
            const wChannel = new LabelBuilder().setLabel("Select the bot's welcome channel").setDescription('Select a channel where the bot can send user welcome messages.').setChannelSelectMenuComponent(channelSelector.setCustomId('wChannel').setPlaceholder('Select a channel').setMaxValues(1).setRequired(true));
            promptModal.addLabelComponents(vChannel, lChannel, wChannel);
            break;
        }
        await Form.showModal(promptModal);
        const confirmEmbed = new EmbedBuilder();
        try {
            const submission = await Form.awaitModalSubmit ({time: 120000});
            if (submission){
                switch(submission.customId){
                    case 'roles':
                        interaction.client.db.exec(`UPDATE localConfig SET verifiedRoleID = ${submission.fields.fields.get('vRole').values[0]}, unverifiedRoleID = ${submission.fields.fields.get('uvRole').values[0]}, botsRoleID = ${submission.fields.fields.get('bRole').values[0]} WHERE guildID = ${interaction.guild.id};`);
                        break;
                    case 'mod-team':
                        break;
                    case 'channels':
                        interaction.client.db.exec(`UPDATE localConfig SET logChannelID = ${submission.fields.fields.get('lChannel').values[0]}, verificationChannelID = ${submission.fields.fields.get('vChannel').values[0]}, welcomeChannelID = ${submission.fields.fields.get('wChannel').values[0]} WHERE guildID = ${interaction.guild.id};`);
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
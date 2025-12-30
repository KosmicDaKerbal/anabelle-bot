const process = require("process");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require("discord.js");
module.exports = {
        async execute (interaction) {
        const restart = new EmbedBuilder().setTitle("Confirm Bot Restart").setColor(0x8c3f7a).setAuthor({ name: `${interaction.guild.name} Administration`, iconURL: process.env.PROCESSING }).setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp();
        const restartConfirm = new ButtonBuilder().setCustomId("restart").setLabel("Restart").setStyle(ButtonStyle.Danger).setDisabled(false);
        const component = new ActionRowBuilder().addComponents(restartConfirm);
        const rstreply = await interaction.reply({ embeds: [restart], components: [component] });
        const collect = rstreply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15_000,
          });
        collect.on("collect", async (rstInteraction) => {
            if (rstInteraction.user.id != interaction.user.id) return rstInteraction.reply({embeds: [new EmbedBuilder().setTitle("This command is not for you!")], flags: MessageFlags.Ephemeral});
            if (rstInteraction.customId == 'restart'){
                restartConfirm.setDisabled(true).setStyle(ButtonStyle.Success);
                await interaction.editReply({ embeds: [restart], components: [component], });
            restart.setAuthor({ name: `${interaction.guild.name} Administration`, iconURL: process.env.SUCCESS }).setColor(0x00ff00).setTitle("Restarting...").setDescription(`Bot restarts <t:${Math.floor(Date.now() / 1000) + 15}:R> from now.`).setTimestamp();
            await rstInteraction.update({ embeds: [restart] });
            }
            setTimeout(() => {
            interaction.client.user.setPresence({status: 'invisible'});
            console.log('[INFO] Bot stopping on command.');
            process.exit();
        }, 15000);
        });
        collect.on("end", async () => {
            restartConfirm.setDisabled(true).setStyle(ButtonStyle.Secondary);
            restart.setAuthor({ name: `${interaction.guild.name} Administration`, iconURL: process.env.FAIL }).setColor(0xff0000).setTitle("Restart Abort").setDescription(`Bot restart cancelled.`).setTimestamp();
            await interaction.editReply({components: [component],});
        });
    }
}
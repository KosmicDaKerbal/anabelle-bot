const {EmbedBuilder, MessageFlags, SlashCommandBuilder} = require("discord.js");
const { Captcha } = require("libanabelle-captcha");
module.exports = {
  data: new SlashCommandBuilder().setName('captcha').setDescription("Generates a new captcha for human verification."),
  async execute (interaction, objectTypeCode) {
    const captchaEmbed = new EmbedBuilder().setTitle("Captcha verification process started. Check your DM's.").setDescription(`If your DM's are closed, check the verification channel. If that doesn't work, please open your DM's temporarily.`).setColor(0xffff00);
    const captchaCommand = new Captcha(interaction.client, {
    roleID: (interaction.guild.roles.cache.find(role => role.name === 'Verified')).id,
    channelID: (interaction.guild.channels.cache.find(channel => channel.name === 'verification')).id,
    sendToTextChannel: false,
    addRoleOnSuccess: true,
    kickOnFailure: false,
    caseSensitive: true,
    attempts: 3,
    timeout: 600000,
    showAttemptCount: true,
    customPromptEmbed: new EmbedBuilder().setTitle("w̶̼̃ḣ̷̬a̶̞̽t̸͉̓ ̷͈͌i̴̘͝s̵̪̈ ̷̡̿ẗ̴̺ẖ̵̇î̷̞s̷̼̑?̷̼͛").setDescription(`Captcha for <@${(!objectTypeCode) ? interaction.user.id : interaction.id}>`).setColor(0x8c3f7a),
    customSuccessEmbed: new EmbedBuilder().setTitle("I̶̡͠ ̶͓͝l̷̬̒i̷̳͘ķ̴̃e̶͍͝ ̶̦͐ỷ̶̦o̴̰͝ú̸̝.̵͇͘").setImage(process.env.CAPTCHA_SUCCESS).setFooter({ text: 'Captcha verification complete', iconURL: (!objectTypeCode) ? interaction.member.guild.iconURL({ dynamic: true, size: 32 }) : interaction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp().setColor(0x00ff00),
    customFailureEmbed: new EmbedBuilder().setTitle("Ī̵̮ ̴̥̒c̵̝͋a̶̺͘n̴̤͑'̶͚̋t̶̳̿ ̶̥͌p̵̦̒l̴͈̓a̵̹͝ȳ̷̭ ̶͓̈́ẃ̷̘ĭ̶͎t̸̹͐h̶̆͜ ̵͈̎ỳ̶̯o̸̹͗u̶̙͆").setImage(process.env.CAPTCHA_FAIL).setFooter({ text: 'Captcha verification failed', iconURL: (!objectTypeCode) ? interaction.member.guild.iconURL({ dynamic: true, size: 32 }) : interaction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp().setColor(0xff0000),
    });
    if (!objectTypeCode && interaction.member.roles.cache.some(role => role.name === 'Verified')) captchaEmbed.setTitle("User already verified").setDescription("You have texting permissions on the server.").setColor(0x00ff00);
    else {
      try {
      captchaCommand.present((!objectTypeCode) ? interaction.member : interaction);
      console.log(`[INFO] CAPTCHA process initiated for user ${interaction.user.name}, ID: ${interaction.user.id} in guild ${(!objectTypeCode) ? interaction.member.guild.name : interaction.guild.name}, ID: ${(!objectTypeCode) ? interaction.member.guild.id : interaction.guild.id}`)
    }
    catch (e) {
      console.error ("[ERROR] While running Captcha\n", e);
    }}
    if (!objectTypeCode) await interaction.reply({ embeds: [captchaEmbed], flags: MessageFlags.Ephemeral });
    const guild = await interaction.client.guilds.fetch(process.env.GUILD_ID);
    captchaCommand.on("success", async data => {
      const vchannel = await interaction.client.channels.fetch(process.env.GCHAT_ID);
      console.log(`[INFO] ${data.member.user.username} has solved a CAPTCHA, ID: ${data.member.user.id}`);
      captchaEmbed.setTitle(`ẁ̸̡̛̱e̸̬̙̚l̴̏̇ͅĉ̴͎͘ọ̷̄̒m̵̻̬̅͝ȅ̶̹͝`).setDescription(`<@${data.member.user.id}> i̶͝ͅs̴̹̚ ̸̘́h̶͚͗e̵̛̼r̸͈͛ë̷̫́ ̴͎̿t̷̙̓o̸̜̐ ̷̺̀p̵̜͗l̴̮̓a̸̬͗y̸̬̆`).setColor(0x8c3f7a);
      await vchannel.send({ embeds: [captchaEmbed]});
      data.member.roles.remove(process.env.UNVERIFIED_ROLE_ID);
    });
    captchaCommand.on("failure", async data => {
        console.log(`[INFO] CAPTCHA for ${data.member.user.username} answered incorrectly, ID: ${data.member.user.id}`);
            await guild.members.fetch(data.member.user.id).then((member) => {
              if (!member){
                console.log(`[INFO] ${data.member.user.username} has left the server, ID: ${data.member.user.id}`);
                } else {
                console.log(`[INFO] CAPTCHA fail message for ${data.member.user.username} sent, ID: ${data.member.user.id}`);
                captchaEmbed.setTitle("Captcha Fail").setDescription(`To retry, Type /captcha in the <#${process.env.CAPTCHA_CHANNEL_ID}> channel.`).setFooter({ text: data.member.guild.name, iconURL: data.member.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp().setColor(0xff0000);
                interaction.client.users.send(data.member.user.id, { embeds: [captchaEmbed] }).catch((e)=>{
                console.log(`[INFO] ${data.member.user.username} does not allow DM's from bots, ID: ${data.member.user.id}`);
                });
              }
            }).catch ((e) => {
              console.warn(`[WARNING] Could not send CAPTCHA fail instruction message to ${data.member.user.username}, ID: ${data.member.user.id}`);
            });
    });
    captchaCommand.on("timeout", async data => {
        console.log(`[INFO] CAPTCHA for ${data.member.user.username} timed out, ID: ${data.member.user.id}`);
            await guild.members.fetch(data.member.user.id).then((member) => {
              if (!member){
                console.log(`[INFO] ${data.member.user.username} has left the server, ID: ${data.member.user.id}`);
                } else {
                console.log(`[INFO] CAPTCHA timeout message for ${data.member.user.username} sent, ID: ${data.member.user.id}`);
                captchaEmbed.setTitle("Captcha Timeout").setDescription(`To retry, Type /captcha in the <#${process.env.CAPTCHA_CHANNEL_ID}> channel.`).setFooter({ text: data.member.guild.name, iconURL: data.member.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp().setColor(0xff0000);
                interaction.client.users.send(data.member.user.id, { embeds: [captchaEmbed] }).catch((e)=>{
                console.log(`[INFO] ${data.member.user.username} does not allow DM's from bots, ID: ${data.member.user.id}`);
                });
              }
            }).catch ((e) => {
              console.warn(`[WARNING] Could not send CAPTCHA timeout instruction message to ${data.member.user.username}, ID: ${data.member.user.id}`);
            });
    });
  }
}
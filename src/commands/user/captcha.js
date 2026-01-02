const {EmbedBuilder, MessageFlags, SlashCommandBuilder} = require("discord.js");
const { Captcha } = require("discord.js-captcha");
module.exports = {
  data: new SlashCommandBuilder().setName('captcha').setDescription("Generates a new captcha for human verification."),
  async execute (interaction, objectTypeCode) {
    const captchaEmbed = new EmbedBuilder().setTitle("Captcha verification process started. Check your DM's.").setDescription(`If your DM's are closed, check the verification channel. If that doesn't work, please open your DM's temporarily.`);
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
    customPromptEmbed: new EmbedBuilder().setTitle("w̶̼̃ḣ̷̬a̶̞̽t̸͉̓ ̷͈͌i̴̘͝s̵̪̈ ̷̡̿ẗ̴̺ẖ̵̇î̷̞s̷̼̑?̷̼͛").setDescription(`Captcha for <@${(!objectTypeCode) ? interaction.user.id : interaction.id}>`)
    });
    if (!objectTypeCode && interaction.member.roles.cache.some(role => role.name === 'Verified')) captchaEmbed.setTitle("User already verified").setDescription("You have texting permissions on the server.").setColor(0x00ff00);
    else {
      try {
      captchaCommand.present((!objectTypeCode) ? interaction.member : interaction);
    }
    catch (e) {
      console.error ("[ERROR] While running Captcha\n", e);
    }}
    if (!objectTypeCode) await interaction.reply({ embeds: [captchaEmbed], flags: MessageFlags.Ephemeral });
    const guild = await interaction.client.guilds.fetch(process.env.GUILD_ID);
    captchaCommand.on("success", async data => {
      try {
            await guild.members.cache.get(data.member.user.id)
            .then((member) => {
              if (!member){
                console.log(`${data.member.user.username} has left the server.`);
                } else {
                console.log(`CAPTCHA success message for ${data.member.user.username} sent`);
                captchaEmbed.setTitle("I̶̡͠ ̶͓͝l̷̬̒i̷̳͘ķ̴̃e̶͍͝ ̶̦͐ỷ̶̦o̴̰͝ú̸̝.̵͇͘").setImage(process.env.CAPTCHA_SUCCESS).setFooter({ text: 'Captcha verification complete'}).setTimestamp();
                interaction.client.users.send(data.member.user.id, { embeds: [captchaEmbed] }).catch((e1)=>{
                console.log(`${data.member.user.username} does not allow DM's from bots.`);
                });
              }
            }).catch ((e1) => {
              console.log(`${data.member.user.username} has left the server.`);
            });
        } catch (e2){
          console.log(`${data.member.user.username} has left the server.`);
          }
      const vchannel = await interaction.client.channels.fetch(process.env.GCHAT_ID);
      console.log(`${data.member.user.username} has solved a CAPTCHA.`);
      captchaEmbed.setTitle(`${data.member.user.username} i̶͝ͅs̴̹̚ ̸̘́h̶͚͗e̵̛̼r̸͈͛ë̷̫́ ̴͎̿t̷̙̓o̸̜̐ ̷̺̀p̵̜͗l̴̮̓a̸̬͗y̸̬̆`).setDescription(null);
      await vchannel.send({ embeds: [captchaEmbed]});
      data.member.roles.remove(process.env.UNVERIFIED_ROLE_ID);
    });
    captchaCommand.on("failure", async data => {
        console.log(`CAPTCHA for ${data.member.user.username} answered incorrectly`);
        try {
            await guild.members.cache.get(data.member.user.id)
            .then((member) => {
              if (!member){
                console.log(`${data.member.user.username} has left the server.`);
                } else {
                console.log(`CAPTCHA fail message for ${data.member.user.username} sent`);
                captchaEmbed.setTitle("Ī̵̮ ̴̥̒c̵̝͋a̶̺͘n̴̤͑'̶͚̋t̶̳̿ ̶̥͌p̵̦̒l̴͈̓a̵̹͝ȳ̷̭ ̶͓̈́ẃ̷̘ĭ̶͎t̸̹͐h̶̆͜ ̵͈̎ỳ̶̯o̸̹͗u̶̙͆").setImage(process.env.CAPTCHA_FAIL).setDescription(`To retry, Type /captcha in the <#${process.env.CAPTCHA_CHANNEL_ID}> channel.`).setFooter({ text: 'Captcha verification failed'}).setTimestamp();
                interaction.client.users.send(data.member.user.id, { embeds: [captchaEmbed] }).catch((e1)=>{
                console.log(`${data.member.user.username} does not allow DM's from bots.`);
                });
              }
            }).catch ((e1) => {
              console.log(`${data.member.user.username} has left the server.`);
            });
        } catch (e2){
          console.log(`${data.member.user.username} has left the server.`);
          }
    });
    captchaCommand.on("timeout", async data => {
        console.log(`CAPTCHA for ${data.member.user.username} timed out`);
        try {
            await guild.members.cache.get(data.member.user.id)
            .then((member) => {
              if (!member){
                console.log(`${data.member.user.username} has left the server.`);
                } else {
                console.log(`CAPTCHA timeout message for ${data.member.user.username} sent`);
                captchaEmbed.setTitle("Ī̵̮ ̴̥̒c̵̝͋a̶̺͘n̴̤͑'̶͚̋t̶̳̿ ̶̥͌p̵̦̒l̴͈̓a̵̹͝ȳ̷̭ ̶͓̈́ẃ̷̘ĭ̶͎t̸̹͐h̶̆͜ ̵͈̎ỳ̶̯o̸̹͗u̶̙͆").setImage(process.env.CAPTCHA_FAIL).setDescription(`To retry, Type /captcha in the <#${process.env.CAPTCHA_CHANNEL_ID}> channel.`).setFooter({ text: 'Captcha verification timed out'}).setTimestamp();
                interaction.client.users.send(data.member.user.id, { embeds: [captchaEmbed] }).catch((e1)=>{
                console.log(`${data.member.user.username} does not allow DM's from bots.`);
                });
              }
            }).catch ((e1) => {
              console.log(`${data.member.user.username} has left the server.`);
            });
        } catch (e2){
          console.log(`${data.member.user.username} has left the server.`);
          }
    });
  }
}
const {EmbedBuilder, MessageFlags, SlashCommandBuilder} = require("discord.js");
const { Captcha } = require("discord.js-captcha");
module.exports = {
  data: new SlashCommandBuilder().setName('captcha').setDescription("Generates a new Captcha for Human verification."),
  async execute (interaction, objectTypeCode) {
    const captchaEmbed = new EmbedBuilder().setTitle("Captcha verification process started. Check your DM's.").setDescription(`If your DM's are closed, check the verification channel. If that doesn't work, please open your DM's temporarily.`);
    console.log((interaction.member.roles.cache.some(role => role.name === 'Verified')).id);
    const captchaCommand = new Captcha(interaction.client, {
    roleID: (!objectTypeCode) ? (interaction.member.roles.cache.some(role => role.name === 'Verified')).id : (interaction.roles.cache.some(role => role.name === 'Verified')).id,
    channelID: (interaction.guild.channels.cache.some(channel => channel.name === 'Verification')).id,
    sendToTextChannel: false,
    addRoleOnSuccess: true,
    kickOnFailure: false,
    caseSensitive: true,
    attempts: 3,
    timeout: 600000,
    showAttemptCount: true,
    customPromptEmbed: new EmbedBuilder().setTitle("w̶̼̃ḣ̷̬a̶̞̽t̸͉̓ ̷͈͌i̴̘͝s̵̪̈ ̷̡̿ẗ̴̺ẖ̵̇î̷̞s̷̼̑?̷̼͛").setDescription(`Captcha for <@${interaction.user.id}>`)
    ,
    customSuccessEmbed: new EmbedBuilder().setTitle("I̶̡͠ ̶͓͝l̷̬̒i̷̳͘ķ̴̃e̶͍͝ ̶̦͐ỷ̶̦o̴̰͝ú̸̝.̵͇͘").setImage(process.env.CAPTCHA_SUCCESS).setFooter({ text: 'Captcha verification complete'}).setTimestamp(),
    customFailureEmbed: new EmbedBuilder().setTitle("Ī̵̮ ̴̥̒c̵̝͋a̶̺͘n̴̤͑'̶͚̋t̶̳̿ ̶̥͌p̵̦̒l̴͈̓a̵̹͝ȳ̷̭ ̶͓̈́ẃ̷̘ĭ̶͎t̸̹͐h̶̆͜ ̵͈̎ỳ̶̯o̸̹͗u̶̙͆").setImage(process.env.CAPTCHA_FAIL).setFooter({ text: 'Captcha verification failed'}).setTimestamp(),
    });
    if (interaction.member.roles.cache.some(role => role.name === 'Verified')) captchaEmbed.setTitle("User already verified").setDescription("You have texting permissions on the server.").setColor(0x00ff00);
    else {
      try {
      captchaCommand.present((!objectTypeCode) ? interaction.member : interaction);
    }
    catch (e) {
      console.error ("[ERROR] While running Captcha\n", e);
    }}
    if (!objectTypeCode) await interaction.reply({ embeds: [captchaEmbed], flags: MessageFlags.Ephemeral });
    captchaCommand.on("success", async data => {
      const vchannel = await data.client.channels.fetch(process.env.GCHAT_ID);
      console.log(`${data.member.user.username} has solved a CAPTCHA.`);
      captchaEmbed.setTitle(`${data.member.user.username} i̶͝ͅs̴̹̚ ̸̘́h̶͚͗e̵̛̼r̸͈͛ë̷̫́ ̴͎̿t̷̙̓o̸̜̐ ̷̺̀p̵̜͗l̴̮̓a̸̬͗y̸̬̆`).setDescription(null);
      await vchannel.send({ embeds: [captchaEmbed]});
      data.member.roles.remove(process.env.UNVERIFIED_ROLE_ID);
    });
    captchaCommand.on("failure", async data => {
        const guild = await data.client.guilds.fetch(process.env.GUILD_ID);
        console.log(`CAPTCHA for ${data.member.user.username} answered incorrectly`);
        try {
            await guild.members.fetch(data.member.user.id)
            .then((member) => {
              if (!member){
                console.log(`${data.member.user.username} has left the server.`);
                } else {
                console.log(`CAPTCHA fail message for ${data.member.user.username} sent`);
                captchaEmbed.setTitle(`Captcha Fail`).setDescription(`To retry, Type /captcha in the <#${process.env.CAPTCHA_CHANNEL_ID}> channel.`);
                client.users.send(data.member.user.id, { embeds: [captchaEmbed] }).catch((err)=>{
                console.log(`${data.member.user.username} does not allow DM's from bots.`);
                });
              }
            }).catch ((err) => {
              console.log(`${data.member.user.username} has left the server.`);
            });
        } catch (e){
          console.log(`${data.member.user.username} has left the server.`);
          }
    });
    captchaCommand.on("timeout", async data => {
        const guild = await data.client.guilds.fetch(process.env.GUILD_ID);
        console.log(`CAPTCHA for ${data.member.user.username} timed out`);
        try {
            await guild.members.fetch(data.member.user.id)
            .then((member) => {
              if (!member){
                console.log(`${data.member.user.username} has left the server.`);
                } else {
                console.log(`CAPTCHA timeout message for ${data.member.user.username} sent`);
                captchaEmbed.setTitle(`Captcha timed out`).setDescription(`To retry, Type /captcha in the <#${process.env.CAPTCHA_CHANNEL_ID}> channel.`);
                client.users.send(data.member.user.id, { embeds: [captchaEmbed] }).catch((err)=>{
                console.log(`${data.member.user.username} does not allow DM's from bots.`);
                });
              }
            }).catch ((err) => {
              console.log(`${data.member.user.username} has left the server.`);
            });
        } catch (e){
          console.log(`${data.member.user.username} has left the server.`);
          }
    });
  }
}
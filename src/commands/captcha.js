const { EmbedBuilder } = require("discord.js");
module.exports = {
    start: async function (embed, captchaObject, client){
          const index = new EmbedBuilder().setTitle("Captcha Verification Process Started. Check your DM's.");
          await embed.reply({ embeds: [index], ephemeral: true });
          captchaObject.present(embed.member);
          captchaObject.on("success", data => {
          console.log(`${data.member.user.username} has solved a CAPTCHA.`);
          const channel = client.channels.cache.get('1360596156656390262');
          index.setTitle(`${data.member.user.username} i̶͝ͅs̴̹̚ ̸̘́h̶͚͗e̵̛̼r̸͈͛ë̷̫́ ̴͎̿t̷̙̓o̸̜̐ ̷̺̀p̵̜͗l̴̮̓a̸̬͗y̸̬̆`);
          channel.send({ embeds: [index]});
          try {
            data.member.roles.remove("1368095911305281536");
          } catch (e){
            console.log(e);
          }
          });
    }
}
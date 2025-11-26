const { EmbedBuilder } = require("discord.js");
const process = require("process");
module.exports = {
    start: async function (embed, captchaObject, channel){
          const index = new EmbedBuilder().setTitle("Captcha Verification Process Started. Check your DM's.");
          await embed.reply({ embeds: [index], ephemeral: true });
          captchaObject.present(embed.member);
          captchaObject.on("success", async data => {
          console.log(`${data.member.user.username} has solved a CAPTCHA.`);
          //const channel = client.channels.cache.get(process.env.GHCHAT_ID);
          index.setTitle(`${data.member.user.username} i̶͝ͅs̴̹̚ ̸̘́h̶͚͗e̵̛̼r̸͈͛ë̷̫́ ̴͎̿t̷̙̓o̸̜̐ ̷̺̀p̵̜͗l̴̮̓a̸̬͗y̸̬̆`);
          await channel.send({ embeds: [index]});
          try {
            data.member.roles.remove(process.env.UNVERIFIED_ROLE_ID);
          } catch (e){
            console.log(e);
          }
          });
    }
}

const { EmbedBuilder } = require("discord.js");
module.exports = {
    start: async function (embed, captchaObject){
          const index = new EmbedBuilder().setTitle("Captcha Verification Process Started. Check your DM's.");
          await embed.reply({ embeds: [index], ephemeral: true });
          captchaObject.present(embed.member);
          captchaObject.on("success", data => {
          console.log(`${data.member.user.username} has solved a CAPTCHA.`);
          try {
            data.member.roles.remove("1368095911305281536");
          } catch (e){
            console.log(e);
          }
          });
    }
}
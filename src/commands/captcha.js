const { EmbedBuilder } = require("discord.js");
const { Captcha } = require("discord.js-captcha");
module.exports = {
    start: async function (embed, client){
        const captcha = new Captcha(client, {
            roleID: "1368095832313692170",
            channelID: "1389110949436330014",
            sendToTextChannel: false,
            addRoleOnSuccess: true,
            kickOnFailure: true,
            caseSensitive: true,
            attempts: 3,
            timeout: 180000,
            showAttemptCount: true,
            customPromptEmbed: new EmbedBuilder().setTitle("w̶̼̃ḣ̷̬a̶̞̽t̸͉̓ ̷͈͌i̴̘͝s̵̪̈ ̷̡̿ẗ̴̺ẖ̵̇î̷̞s̷̼̑?̷̼͛"),
            customSuccessEmbed: new EmbedBuilder().setTitle("I̶̡͠ ̶͓͝l̷̬̒i̷̳͘ķ̴̃e̶͍͝ ̶̦͐ỷ̶̦o̴̰͝ú̸̝.̵͇͘").setImage("https://i.postimg.cc/MHCZZcS4/Annabelle-Creation-Trailer2.jpg").setFooter({ text: `Teens of Maharashtra v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }),
            customFailureEmbed: new EmbedBuilder().setTitle("Ī̵̮ ̴̥̒c̵̝͋a̶̺͘n̴̤͑'̶͚̋t̶̳̿ ̶̥͌p̵̦̒l̴͈̓a̵̹͝ȳ̷̭ ̶͓̈́ẃ̷̘ĭ̶͎t̸̹͐h̶̆͜ ̵͈̎ỳ̶̯o̸̹͗u̶̙͆").setImage("https://i.postimg.cc/1X57gM9V/thumb-1920-686638.jpg").setFooter({ text: `Teens of Maharashtra v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }),
            });
        const index = new EmbedBuilder().setTitle("Captcha Verification Process Started. Check your DM's.");
        await embed.reply({ embeds: [index], ephemeral: true });
        captcha.present(embed);
        captcha.on("success", data => {
        console.log(`${data.member.user.username} has solved a CAPTCHA.`);
        try {
          data.member.roles.remove("1368095911305281536");
        } catch (e){
          console.log(e);
        }
        });
    }
}
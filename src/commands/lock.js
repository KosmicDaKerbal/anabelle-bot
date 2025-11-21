const {EmbedBuilder, PermissionsBitField, PermissionFlagsBits} = require("discord.js");
const process = require("process");
function timeFormat (time){
  time = Math.round(time);
  if (time >= 60 && time < 3600) return `${Math.floor(time/60)} minutes and ${time % 60} seconds`;
  else if (time >= 3600) return `${Math.floor(time/3600)} hours, ${Math.floor((time % 3600)/60)} minutes and ${(time % 3600) % 60} seconds`;
  return `${time} seconds`;
  }
module.exports = {
  channel: async function (embed, lockchannel, vrf , channelId) {
    const res = new EmbedBuilder().setTitle("Channel Locked").setColor(0x8c3f7a).setTimestamp();
//    const duration = embed.options.get("duration").value;
    try {
        await lockchannel.permissionOverwrites.edit(vrf, {
        SendMessages: false,
        SendMessagesInThreads: false,
        CreatePublicThreads: false,
        CreatePrivateThreads: false,
        AddReactions: false
    });
        res.setDescription(`No p̴̦͘l̵̩̋ȃ̸͕y̶̾ͅḯ̵͖n̶̗̿g̸̺̉ in <#${channelId}> a̷̱͠ǹ̵̲y̴̜̒m̵̱̓o̵̱̔ŕ̵͖e̵̺͑...`);
    }
    catch (e){
        res.setColor(0xff0000).setDescription(`Ĕ̷̼ȓ̴͇r̵̮̉ô̵̬ṟ̷̓\n\`\`\`\n${e}\n\`\`\``);
    }
    finally{
        await embed.reply({ embeds: [res] });
    }
    //if (!duration) 
    //else res.setDescription(`No playing in <#${channelId}> for ${timeFormat(duration)} anymore...`); 
  }
}
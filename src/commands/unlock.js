const {EmbedBuilder, PermissionsBitField} = require("discord.js");
const process = require("process");
function timeFormat (time){
  time = Math.round(time);
  if (time >= 60 && time < 3600) return `${Math.floor(time/60)} minutes and ${time % 60} seconds`;
  else if (time >= 3600) return `${Math.floor(time/3600)} hours, ${Math.floor((time % 3600)/60)} minutes and ${(time % 3600) % 60} seconds`;
  return `${time} seconds`;
  }
module.exports = {
  channel: async function (embed, unlockchannel, channelId) {
    const res = new EmbedBuilder().setTitle("Channel Unlocked").setColor(0x8c3f7a).setTimestamp();
//    const duration = embed.options.get("duration").value;
    try {
        await unlockchannel.permissionOverwrites.edit(process.env.VERIFIED_ROLE, {
            [PermissionsBitField.Flags.SendMessages]: true,
            [PermissionsBitField.Flags.SendMessagesInThreads]: true,
            [PermissionsBitField.Flags.CreatePublicThreads]: true,
            [PermissionsBitField.Flags.CreatePrivateThreads]: true,
            [PermissionsBitField.Flags.AddReactions]: true
        });
    }
    catch (e){
        res.setColor(0xff0000).setDescription(`Ĕ̷̼ȓ̴͇r̵̮̉ô̵̬ṟ̷̓`);
    }
    //if (!duration) 
    res.setDescription(`Wanna p̶̺̊l̸͈͑a̵͙̒y̷̤͠  in <#${channelId}>?`);
    //else res.setDescription(`No playing in <#${channelId}> for ${timeFormat(duration)} anymore...`);
    await embed.reply({ embeds: [res] });
  }
}
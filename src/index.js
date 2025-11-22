require('dotenv').config();
const { Client, IntentsBitField, EmbedBuilder, ActivityType } = require("discord.js");
const { Captcha } = require("discord.js-captcha");
const help = require('./commands/help');
const insult = require('./commands/insultme');
const restart = require('./commands/restart');
const slowmode = require("./commands/slowmode");
const verify = require("./commands/captcha");
const lock = require("./commands/lock");
const unlock = require("./commands/unlock");
const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.DirectMessages,
    ],
  });
  const index = new EmbedBuilder();
  var rbt;
  const captcha = new Captcha(client, {
    roleID: process.env.VERIFIED_ROLE_ID,
    channelID: process.env.CAPTCHA_CHANNEL_ID,
    sendToTextChannel: false,
    addRoleOnSuccess: true,
    kickOnFailure: true,
    caseSensitive: true,
    attempts: 3,
    timeout: 180000,
    showAttemptCount: true,
    customPromptEmbed: new EmbedBuilder().setTitle("w̶̼̃ḣ̷̬a̶̞̽t̸͉̓ ̷͈͌i̴̘͝s̵̪̈ ̷̡̿ẗ̴̺ẖ̵̇î̷̞s̷̼̑?̷̼͛"),
    customSuccessEmbed: new EmbedBuilder().setTitle("I̶̡͠ ̶͓͝l̷̬̒i̷̳͘ķ̴̃e̶͍͝ ̶̦͐ỷ̶̦o̴̰͝ú̸̝.̵͇͘").setImage("https://i.postimg.cc/MHCZZcS4/Annabelle-Creation-Trailer2.jpg").setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }),
    customFailureEmbed: new EmbedBuilder().setTitle("Ī̵̮ ̴̥̒c̵̝͋a̶̺͘n̴̤͑'̶͚̋t̶̳̿ ̶̥͌p̵̦̒l̴͈̓a̵̹͝ȳ̷̭ ̶͓̈́ẃ̷̘ĭ̶͎t̸̹͐h̶̆͜ ̵͈̎ỳ̶̯o̸̹͗u̶̙͆").setImage("https://i.postimg.cc/1X57gM9V/thumb-1920-686638.jpg").setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }),
});
client.on("guildMemberAdd", async member => {
    if(member.user.bot) {
        member.roles.add(member.guild.roles.cache.find(role => role.id === process.env.BOT_ROLE_ID));
        return;
    };
    var role= member.guild.roles.cache.find(role => role.id === process.env.UNVERIFIED_ROLE_ID);
    member.roles.add(role);
    captcha.present(member);
    captcha.on("success", data => {
    console.log(`${data.member.user.username} has solved a CAPTCHA.`);
    data.member.roles.remove(process.env.UNVERIFIED_ROLE_ID);
});
});
  client.on("interactionCreate", async (mainInteraction) => {
    if (!mainInteraction.isChatInputCommand()) return;
    client.user.setPresence({ status: 'online' });
    if (mainInteraction.guild === null){
      if (mainInteraction.commandName == "captcha"){
          index.setTitle("Wrong Channel").setColor(0xff0000).setDescription(`Send this command in the <#${process.env.CAPTCHA_CHANNEL_ID}> channel.`).setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON });
        } else {
          index.setTitle("Invalid Interaction").setColor(0xff0000).setDescription(`Ew why are you sliding into my DM's\nThese commands are only usable in the ${process.env.BOT_NAME} Server`).setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON });
        }
    await mainInteraction.reply({ embeds: [index] });
    } else {
      if (mainInteraction.member.roles.cache.some(role => role.name === process.env.VERIFIED_ROLE)) {
        switch (mainInteraction.commandName) {
          case "captcha":
          index.setTitle("User is already verified.").setColor(0x00ff00);
          await mainInteraction.reply({ embeds: [index], ephemeral: true });
          break;
          case "help":
            help.send(mainInteraction);
            break;
          case "insultme":
            insult.me(mainInteraction);
            break;
          default:
            if (mainInteraction.member.roles.cache.some(role => role.name === process.env.SERVER_OWNER) || mainInteraction.member.roles.cache.some(role => role.name === process.env.MODERATOR)) {
              switch (mainInteraction.commandName) {
                case "lock":
                  const lockchannel = await client.channels.fetch(mainInteraction.options.get("lock-channel-name").value);
                  lock.channel(mainInteraction, lockchannel, mainInteraction.options.get("lock-channel-name").value);  
                  break;
                case "unlock":
                  const unlockchannel = await client.channels.fetch(mainInteraction.options.get("unlock-channel-name").value);
                  unlock.channel(mainInteraction, unlockchannel, mainInteraction.options.get("unlock-channel-name").value);
                  break;
                case 'slowmode':
                  slowmode.set(mainInteraction);
                  break;
                case 'restart':
                  const reboot = await restart.execute(mainInteraction);
                  if (reboot){
                    rbt = reboot;
                    client.user.setStatus('invisible');
                    setTimeout(async () => { await client.destroy(); process.exit(22) }, 15000);
                  }
                  break;
                }
              } else {
                index.setTitle("Nice try, pleb").setColor(0xff0000).setDescription("You cannot use admin commands when you're not one, duh.").setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
                await mainInteraction.reply({ embeds: [index], ephemeral: true });
              }
              break;
        }
    } else {
       switch (mainInteraction.commandName) {
        case "captcha":
          verify.start(mainInteraction, captcha, client);
          break;
          default:
            index.setTitle("User not verified").setColor(0xff0000).setDescription(`Whoa there, we don't know whether you're a human or not.\nVerify yourself in the <#${process.env.VERIFICATION_CHANNEL}> channel`).setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
            await mainInteraction.reply({ embeds: [index], ephemeral: true });
       }
    }
    }
    if (!rbt){
        setTimeout(() => { client.user.setPresence({ status: 'idle' }); }, 10000);
      }
  });
  console.log("Connecting...");
  client.on("ready", async (c) => {
    console.log("Anabelle is runnning");
    client.user.setPresence({
      activities: [
      {
        type: ActivityType.Custom,
        name: "custom",
        state: "u/mi_tatyavinchoo's secret admirer"
      }
    ],
      status: 'idle'
    });
  });
  client.login(process.env.TOKEN);

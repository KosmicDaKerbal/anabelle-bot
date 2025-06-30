require('dotenv').config();
const { Client, IntentsBitField, EmbedBuilder, ActivityType } = require("discord.js");
const { Captcha } = require("discord.js-captcha");
const help = require('./commands/help');
const insult = require('./commands/insultme');
const restart = require('./commands/restart');
const slowmode = require("./commands/slowmode");
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
    roleID: "1368095832313692170", //optional
    channelID: "1389110949436330014", //optional
    sendToTextChannel: false, //optional, defaults to false
    addRoleOnSuccess: true, //optional, defaults to true. whether you want the bot to add the role to the user if the captcha is solved
    kickOnFailure: false, //optional, defaults to true. whether you want the bot to kick the user if the captcha is failed
    caseSensitive: true, //optional, defaults to true. whether you want the captcha responses to be case-sensitive
    attempts: 3, //optional, defaults to 1. number of attempts before captcha is considered to be failed
    timeout: 30000, //optional, defaults to 60000. time the user has to solve the captcha on each attempt in milliseconds
    showAttemptCount: true, //optional, defaults to true. whether to show the number of attempts left in embed footer
    customPromptEmbed: new EmbedBuilder(), //customise the embed that will be sent to the user when the captcha is requested
    customSuccessEmbed: new EmbedBuilder(), //customise the embed that will be sent to the user when the captcha is solved
    customFailureEmbed: new EmbedBuilder(), //customise the embed that will be sent to the user when they fail to solve the captcha
});
client.on("guildMemberAdd", async member => {
    var role= member.guild.roles.cache.find(role => role.id === "1368095911305281536");
    member.roles.add(role);
    captcha.present(member);
    captcha.on("success", data => {
    console.log(`A Member has Solved a CAPTCHA!`);
    console.log(data);
});
});
  client.on("interactionCreate", async (mainInteraction) => {
    if (!mainInteraction.isChatInputCommand()) return;
    client.user.setPresence({ status: 'online' });
    if (mainInteraction.guild === null){
      index.setTitle("Invalid Interaction").setColor(0xff0000).setDescription(`Ew why are you sliding into my DM's\nThese commands are only usable in the ${process.env.BOT_NAME} Server`).setFooter(`Anabelle v${process.env.BOT_VERSION}`).setTimestamp();
      await mainInteraction.reply({ embeds: [index] });
    } else {
      if (mainInteraction.member.roles.cache.some(role => role.name === process.env.VERIFIED_ROLE)) {
        switch (mainInteraction.commandName) {
          case "help":
            help.send(mainInteraction);
            break;
          case "insultme":
            insult.me(mainInteraction);
            break;
          default:
            if (mainInteraction.member.roles.cache.some(role => role.name === process.env.SERVER_OWNER) || mainInteraction.member.roles.cache.some(role => role.name === process.env.MODERATOR)) {
              switch (mainInteraction.commandName) {
                case 'slowmode':
                  slowmode.set(mainInteraction);
                  break;
                case 'purge':
                  purge.execute(mainInteraction);
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
      index.setTitle("User not verified").setColor(0xff0000).setDescription(`Whoa there, we don't know whether you're a human or not.\nVerify yourself in the <#${process.env.VERIFICATION_CHANNEL}> channel`).setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
       await mainInteraction.reply({ embeds: [index], ephemeral: true });
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
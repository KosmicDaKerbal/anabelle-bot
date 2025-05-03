require('dotenv').config({ path: require('find-config')('.env') });
const { Client, IntentsBitField, EmbedBuilder, ActivityType } = require("discord.js");
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
    ],
  });
  const index = new EmbedBuilder();
  var rbt;
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
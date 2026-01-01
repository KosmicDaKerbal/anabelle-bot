require('dotenv').config();
const { Client, Collection, GatewayIntentBits, IntentsBitField, EmbedBuilder, ActivityType, Events, MessageFlags } = require("discord.js");
const { Captcha } = require("discord.js-captcha");
const fs = require("fs");
const path = require ("path");
const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.DirectMessages,
      GatewayIntentBits.Guilds,
    ],
  });
client.commands = new Collection();
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
	const commandsPath = path.join(path.join(__dirname, 'commands'), folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  if (folder.length != 0) {
	for (const file of commandFiles) {
		const command = require(path.join(commandsPath, file));
		if ('data' in command && 'execute' in command) client.commands.set(path.basename(file, path.extname(file)), command);
    else console.warn(`[WARNING] The command at ${filePath} is missing a required "execute" or "data" property.`);
	}
 } else console.log(`[INFO] The command directory ${folder} is empty, skipping.`);
}
client.on(Events.GuildMemberAdd, async member => {
  if(member.user.bot) {
        member.roles.add(await member.guild.roles.fetch(process.env.BOT_ROLE_ID));
        return;
    };
    if(!member.roles.cache.some(role => role.name === 'UNVERIFIED')) member.roles.add(member.guild.roles.cache.find(role => role.name === 'UNVERIFIED'));
    client.commands.get('captcha').execute(member, 1); // Arg 1 => Member object passed, Arg 0 => Interaction Object Passed
});

client.on(Events.InteractionCreate, async (mainInteraction) => {
  const index = new EmbedBuilder();
	if (!mainInteraction.isChatInputCommand()) return;
	const command = mainInteraction.client.commands.get(mainInteraction.commandName);
	if (!command) {
    index.setTitle("Command in development").setDescription("This command is still work in progress.").setColor(0xff0000).setFooter({ text: mainInteraction.guild.name, iconURL: mainInteraction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp();
    await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
		return;
	}
	try {
    client.user.setPresence({status: 'online'});
		await command.execute(mainInteraction, 0);
    if (mainInteraction.commandName != 'restart') setTimeout(() => client.user.setPresence({status: 'idle'}), 5000);
	} catch (error) {
    index.setTitle("Error executing command").setDescription((process.env.MAINTANENCE_MODE === '0') ? "There was an error executing the command" : `Log: \n\`\`\`${error}\n\`\`\``).setColor(0xff0000).setFooter({ text: mainInteraction.guild.name, iconURL: mainInteraction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp();
		if (mainInteraction.replied || mainInteraction.deferred) await mainInteraction.followUp({ embeds: [index], flags: MessageFlags.Ephemeral });
	  else await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
	}
});

/*
client.on(Events.InteractionCreate , async (mainInteraction) => {
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
        await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
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
              await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
            }
            break;
      }
  } else {
     switch (mainInteraction.commandName) {
      case "captcha":
        index.setTitle("Captcha Verification Process Started. Check your DM's.");
        await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
        captcha.present(mainInteraction.member);
        break;
        default:
          index.setTitle("User not verified").setColor(0xff0000).setDescription(`Whoa there, we don't know whether you're a human or not.\nVerify yourself in the <#${process.env.VERIFICATION_CHANNEL}> channel`).setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }).setTimestamp();
          await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
     }
  }
  }
  if (!rbt){
      setTimeout(() => { client.user.setPresence({ status: 'idle' }); }, 10000);
    }
});
*/
  

  console.log("Connecting...");
  client.once(Events.ClientReady, async (c) => {
    console.log("Anabelle is runnning");
    client.user.setPresence({
      activities: [
      {
        type: ActivityType.Custom,
        name: "custom",
        state: (process.env.MAINTANENCE_MODE === "0") ? "u/mi_tatyavinchoo's secret admirer" : "--MAINTANENCE MODE--"
      }
    ],
      status: 'idle'
    });
  });
  client.login(process.env.TOKEN);

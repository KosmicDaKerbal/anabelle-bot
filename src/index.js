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
  const captcha = new Captcha(client, {
    roleID: process.env.VERIFIED_ROLE_ID,
    channelID: process.env.CAPTCHA_CHANNEL_ID,
    sendToTextChannel: false,
    addRoleOnSuccess: true,
    kickOnFailure: false,
    caseSensitive: true,
    attempts: 3,
    timeout: 600000,
    showAttemptCount: true,
    customPromptEmbed: new EmbedBuilder().setTitle("w̶̼̃ḣ̷̬a̶̞̽t̸͉̓ ̷͈͌i̴̘͝s̵̪̈ ̷̡̿ẗ̴̺ẖ̵̇î̷̞s̷̼̑?̷̼͛"),
    customSuccessEmbed: new EmbedBuilder().setTitle("I̶̡͠ ̶͓͝l̷̬̒i̷̳͘ķ̴̃e̶͍͝ ̶̦͐ỷ̶̦o̴̰͝ú̸̝.̵͇͘").setImage(process.env.CAPTCHA_SUCCESS).setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }),
    customFailureEmbed: new EmbedBuilder().setTitle("Ī̵̮ ̴̥̒c̵̝͋a̶̺͘n̴̤͑'̶͚̋t̶̳̿ ̶̥͌p̵̦̒l̴͈̓a̵̹͝ȳ̷̭ ̶͓̈́ẃ̷̘ĭ̶͎t̸̹͐h̶̆͜ ̵͈̎ỳ̶̯o̸̹͗u̶̙͆").setImage(process.env.CAPTCHA_FAIL).setFooter({ text: `${process.env.BOT_NAME} v${process.env.BOT_VERSION}`, iconURL: process.env.ICON }),
});
/*
const help = require('./commands/help');
const insult = require('./commands/insultme');
const restart = require('./commands/restart');
const slowmode = require("./commands/slowmode");
const lock = require("./commands/lock");
const unlock = require("./commands/unlock");
*/

  const index = new EmbedBuilder();
  var rbt;
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.GuildMemberAdd, async member => {
    if(member.user.bot) {
        member.roles.add(await member.guild.roles.fetch(process.env.BOT_ROLE_ID));
        return;
    };
    member.roles.add(await member.guild.roles.fetch(process.env.UNVERIFIED_ROLE_ID));
    captcha.present(member);
});

client.on(Events.InteractionCreate, async (mainInteraction) => {
	if (!mainInteraction.isChatInputCommand()) return;
	const command = mainInteraction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${mainInteraction.commandName} was found.`);
		return;
	}
	try {
		await command.execute(mainInteraction);
	} catch (error) {
		console.error(error);
		if (mainInteraction.replied || mainInteraction.deferred) {
			await mainInteraction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await mainInteraction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
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
  
const vindex = new EmbedBuilder();
captcha.on("success", async data => {
  const vchannel = await client.channels.fetch(process.env.GCHAT_ID);
  console.log(`${data.member.user.username} has solved a CAPTCHA.`);
  vindex.setTitle(`${data.member.user.username} i̶͝ͅs̴̹̚ ̸̘́h̶͚͗e̵̛̼r̸͈͛ë̷̫́ ̴͎̿t̷̙̓o̸̜̐ ̷̺̀p̵̜͗l̴̮̓a̸̬͗y̸̬̆`).setDescription(null);
  await vchannel.send({ embeds: [vindex]});
  data.member.roles.remove(process.env.UNVERIFIED_ROLE_ID);
});
captcha.on("failure", async data => {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    console.log(`CAPTCHA for ${data.member.user.username} answered incorrectly`);
    try {
        await guild.members.fetch(data.member.user.id)
        .then((member) => {
          if (!member){
            console.log(`${data.member.user.username} has left the server.`);
            } else {
            console.log(`CAPTCHA fail message for ${data.member.user.username} sent`);
            vindex.setTitle(`Captcha Fail`).setDescription(`To retry, Type /captcha in the <#${process.env.CAPTCHA_CHANNEL_ID}> channel.`);
            client.users.send(data.member.user.id, { embeds: [vindex] }).catch((err)=>{
            console.log(`${data.member.user.username} does not allow DM's from bots.`);
            });
          }
        }).catch ((err) => {
          console.log(`${data.member.user.username} has left the server.`);
        });
    } catch (e){
      console.log(`${data.member.user.username} has left the server.`);
      }
});
captcha.on("timeout", async data => {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    console.log(`CAPTCHA for ${data.member.user.username} timed out`);
    try {
        await guild.members.fetch(data.member.user.id)
        .then((member) => {
          if (!member){
            console.log(`${data.member.user.username} has left the server.`);
            } else {
            console.log(`CAPTCHA timeout message for ${data.member.user.username} sent`);
            vindex.setTitle(`Captcha timed out`).setDescription(`To retry, Type /captcha in the <#${process.env.CAPTCHA_CHANNEL_ID}> channel.`);
            client.users.send(data.member.user.id, { embeds: [vindex] }).catch((err)=>{
            console.log(`${data.member.user.username} does not allow DM's from bots.`);
            });
          }
        }).catch ((err) => {
          console.log(`${data.member.user.username} has left the server.`);
        });
    } catch (e){
      console.log(`${data.member.user.username} has left the server.`);
      }
});
  console.log("Connecting...");
  client.once(Events.ClientReady, async (c) => {
    console.log("Anabelle is runnning");
    client.user.setPresence({
      activities: [
      {
        type: ActivityType.Custom,
        name: "custom",
        state: (process.env.MAINTAINENCE_MODE.toLowerCase === "false") ? "u/mi_tatyavinchoo's secret admirer" : "--MAINTANENCE MODE--"
      }
    ],
      status: 'idle'
    });
  });
  client.login(process.env.TOKEN);

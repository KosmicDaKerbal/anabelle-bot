require('dotenv').config();
const { Client, Collection, GatewayIntentBits, IntentsBitField, EmbedBuilder, ActivityType, Events, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require ("path");
const dbOptions = {
  readonly: false,
  fileMustExist: false,
  timeout: 5000,
  verbose: console.log
};
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
client.db = require('better-sqlite3')(`${__dirname}/serverConfig.db`, dbOptions);
client.db.pragma('journal_mode = WAL');
client.db.exec (`
  CREATE TABLE IF NOT EXISTS localConfig (
    guildID BIGINT PRIMARY KEY NOT NULL,
    verifiedRoleID BIGINT DEFAULT NULL,
    unverifiedRoleID BIGINT DEFAULT NULL,
    botsRoleID BIGINT DEFAULT NULL,
    verificationChannelID BIGINT DEFAULT NULL,
    logChannelID BIGINT DEFAULT NULL,
    welcomeChannelID BIGINT DEFAULT NULL,
    juniorMod1RoleID BIGINT DEFAULT NULL,
    juniorMod2RoleID BIGINT DEFAULT NULL,
    seniorMod1RoleID BIGINT DEFAULT NULL,
    seniorMod2RoleID BIGINT DEFAULT NULL,
    admin1RoleID BIGINT DEFAULT NULL,
    admin2RoleID BIGINT DEFAULT NULL,
    ownerUserID BIGINT DEFAULT NULL
  );
`);
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
client.on(Events.GuildCreate, guild => {
  console.log ("Joined Server ", guild.name, ", ID: ", guild.id);
  client.db.exec(`INSERT INTO config(guildID) VALUES(${guild.id}) ON CONFLICT DO UPDATE SET guildID = ${guild.id}`);
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
	  if (process.env.RESTART_FLAG === '0') await command.execute(mainInteraction, 0);
    else {
      index.setTitle("Permission Denied").setDescription("Commands are temporarily disabled.").setColor(0xff0000).setFooter({ text: mainInteraction.guild.name, iconURL: mainInteraction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp();
      await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
    }
    if (mainInteraction.commandName != 'restart') setTimeout(() => client.user.setPresence({status: 'idle'}), 5000);
	} catch (error) {
    console.log(error);
    index.setTitle("Error executing command").setDescription((process.env.MAINTANENCE_MODE === '0') ? "There was an error executing the command" : `Log: \n\`\`\`${error}\n\`\`\``).setColor(0xff0000).setFooter({ text: mainInteraction.guild.name, iconURL: mainInteraction.guild.iconURL({ dynamic: true, size: 32 })}).setTimestamp();
		if (mainInteraction.replied || mainInteraction.deferred) await mainInteraction.followUp({ embeds: [index], flags: MessageFlags.Ephemeral });
	  else await mainInteraction.reply({ embeds: [index], flags: MessageFlags.Ephemeral });
	}
});
  console.log("Connecting...");
  client.once(Events.ClientReady, async (c) => {
    process.env.RESTART_FLAG = '0';
    console.log("Anabelle is runnning");
    client.user.setPresence({
      activities: [
      {
        type: (process.env.MAINTANENCE_MODE === "0") ? ActivityType.Watching : ActivityType.Custom,
        name: "you",
        state: (process.env.MAINTANENCE_MODE === "0") ? "Ị̵̀'̴̩͑ḿ̵̥ ̴͓̍ẘ̷̟à̸̰t̸̬͠ċ̶̫h̶̫̕i̷̛̠n̶̘̏g̶͎̍ ̷̪͋y̶̬̽ơ̵̙ŭ̴̻.̴̣̉" : "--MAINTANENCE MODE--"
      }
    ],
      status: 'idle'
    });
  });
  client.login(process.env.TOKEN);

const {EmbedBuilder, SlashCommandBuilder} = require("discord.js");
const process = require("process");
const dbOptions = {
  readonly: false,
  fileMustExist: false,
  timeout: 5000,
  verbose: console.log
};
const db = require('better-sqlite3')('../../serverConfig.db', dbOptions);
db.pragma('journal_mode = WAL');
module.exports = {
  data: new SlashCommandBuilder().setName('config').setDescription("**Admin Command**: Open Configuration Menu")
  .addSubcommand((subcommand) => subcommand.setName('setup').setDescription('**Admin Command**: Defines all important roles and channels for the bot to work.'))
  .addSubcommand((subcommand) => subcommand.setName('show').setDescription('**Admin Command**: Shows the configuration of the bot'))
  .addSubcommand((subcommand) => subcommand.setName('edit').setDescription('**Admin Command**: Edit the bot configuration'))
  .addSubcommand((subcommand) => subcommand.setName('delete').setDescription('**Admin Command**: Remove all configurations')),
  async execute (interaction) {
    
  }
}
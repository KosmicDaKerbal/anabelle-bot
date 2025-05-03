require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'help',
        description: 'Complete Commands List for the Bot.',
    },
    {
        name: 'slowmode',
        description: "Set a Slowmode: Admin Command",
        options: [
            {
                name: 'duration',
                description: 'Time in Seconds',
                type: ApplicationCommandOptionType.Integer,
                required: true,
                min_value: 1,
                max_value: 360,
            },
        ],
    },
    {
        name: 'purge',
        description: "Purges Past Messages: Admin Command",
        options: [
            {
                name: 'purge-limit',
                description: 'Number of Messages',
                type: ApplicationCommandOptionType.Integer,
                required: true,
                min_value: 1,
                max_value: 100,
            },
        ],
    },
    {
        name: 'restart',
        description: 'Restarts the Bot: Admin Command',
    },
    {
        name: 'insultme',
        description: `You're quite the masochist huh`,
    },
];
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
(async () => {
    try {
        console.log('Registering Slash Commands...');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('Slash Commands Registration Successful.');
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();
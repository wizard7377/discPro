const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');
const commands = [];

//register commands bc youll forget


const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
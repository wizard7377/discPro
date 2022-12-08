const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const commands = [
	(new SlashCommandBuilder()
		.setName('nq')
		.setDescription('create new question')
		.addIntegerOption(option =>
			option.setName('operation')
				.setDescription('the type of operation you want to be tested on')
				.setRequired(true)
				.addChoices(
					{ name: 'random', value: 0},
					{ name: 'add', value: 1},
					{ name: 'sub', value: 2},
				))
	),
	(new SlashCommandBuilder()
		.setName('guess')
		.setDescription('enter your guess')
		.addIntegerOption(option =>
			option.setName('guess')
			.setDescription('your guess')
			.setRequired(true))
	)
];

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

const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const commands = [
	(new SlashCommandBuilder()
		.setName('cset')
		.setDescription('amount of cash you want each user to start with')
		.addIntegerOption(option =>
			option.setName('dcash')
				.setDescription('default user cash')
				.setRequired(true))
		.setDefaultMemberPermissions(0)
	),

	(new SlashCommandBuilder()
		.setName('uset')
		.setDescription('amount of cash you want a user to have')
		.addUserOption(option =>
			option.setName('uname')
				.setDescription('user you wish to give cash')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('acash')
				.setDescription('amount user cash')
				.setRequired(true))
		.setDefaultMemberPermissions(0)
	),
	(new SlashCommandBuilder()
		.setName('viewbalance')
		.setDescription('view the amount of cash you have')
	),
	(new SlashCommandBuilder()
		.setName('playblackjack')
		.setDescription('Play a game of blackjack with your server balence')
		.addIntegerOption(option =>
			option.setName('bet')
				.setDescription('The amount you wish to bet on this deal')
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

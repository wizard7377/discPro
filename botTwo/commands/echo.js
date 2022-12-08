const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('replies with input')
		.addStringOption(option =>
			option.setName('word')
				.setDescription('what is echoed')),
	async execute(interaction) {
		await interaction.reply(interaction.options.getString('word'));
	},
};

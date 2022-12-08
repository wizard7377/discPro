const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Replies with word')
		.addStringOption(option => 
			option.setName('input')
				.setDescription('the input to echo')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.reply(interaction.options.getString('input'));
	},
}


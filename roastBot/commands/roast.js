const { SlashCommandBuilder } = require('discord.js');
const { greets, insult } = require('./words.json');

const fs = require('node:fs');

function getRandom(max) {
	return (Math.floor(Math.random()*max));

}
module.exports = {
	data: new SlashCommandBuilder()
		.setName('roast')
		.setDescription('roasts a given user')
		.addUserOption(option =>
			option.setName('target')
				.setDescription('the user to roast')
				.setRequired(true)),

	async execute(interaction) {
		const user = interaction.options.getUser('target');
		await interaction.reply(greets[getRandom(greets.length)] + ', ' + user.tag);
		await interaction.followUp((insult[getRandom(insult.length)]));
	},
};

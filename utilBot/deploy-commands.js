const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');
const commands = [
	(new SlashCommandBuilder()
		.setName('rand')
		.setDescription('gets a random number between min and max with diffrence of step')
		.addNumberOption(option =>
			option.setName('min')
				.setDescription('the lowest you want the value to be')
				.setRequired(true))
		.addNumberOption(option =>
			option.setName('max')
				.setDescription('the highest you want the value to be')
				.setRequired(true))	  
		.addNumberOption(option =>
			option.setName('step')
				.setDescription('the step value you want for the number')
				.setRequired(true))	  
	),
	(new SlashCommandBuilder()
		.setName('sarcasm')
		.setDescription('formats text with random case')
		.addStringOption(option =>
			option.setName('text')
				.setDescription('the text you want sarcasticly')
				.setRequired(true))
	),
	(new SlashCommandBuilder()
		.setName('rockpaperscissors')
		.setDescription('Play a game of rock, paper, scissors, against the bot')
		.addIntegerOption(option =>
			option.setName('choice')
				.setDescription('Your choice of move')
				.setRequired(true)
				.addChoices(
					{name: 'random',value:0},
					{name: 'rock',value:1},
					{name: 'paper',value:2},
					{name: 'scissors',value:3},
				))
	),
	(new SlashCommandBuilder()
		.setName('playnote')
		.setDescription('write to file note of specefic fequency')
		.addStringOption(option =>
			option.setName('tone')
				.setDescription('note of the scale you wish to play')
				.setRequired(true)
				.addChoices(
					{name: 'B#/C',value:'Cn'},
					{name: 'C#/Db',value:'Cs'},
					{name: 'D/Ebb',value:'Dn'},
					{name: 'D#/Eb',value:'Eb'},
					{name: 'E/Fb',value:'En'},
					{name: 'E#/F',value:'Fn'},
					{name: 'F#/Gb',value:'Fs'},
					{name: 'G/Abb',value:'Gn'},
					{name: 'G#/Ab',value:'Gs'},
					{name: 'A/Bbb',value:'An'},
					{name: 'A#/Bb',value:'Bb'},
					{name: 'B/Cb',value:'Bn'},

				))
		.addIntegerOption(option =>
			option.setName('octave')
				.setDescription('octave to play note at')
				.setRequired(true))

	),
	(new SlashCommandBuilder()
		.setName('loadfen')
		.setDescription('Displays a given (chess) FEN string with unicode charecters')
		.addStringOption(option =>
			option.setName('fenstring')
				.setDescription('the FEN string you wish to display;')
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

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const config = require('./config.json');

let answer = 0;
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	if (interaction.commandName=='nq') {
		let nOne = Math.floor(Math.random()*100000);
		let nTwo = Math.floor(Math.random()*100000);
		let oper = (function(val) {
			if (val==0) {
				val = Math.ceil(Math.random()*2);
			}
			return val;
		})(interaction.options.getInteger('operation'));
		if (oper==1) {
			answer=nOne+nTwo;
			await interaction.reply(nOne+'+'+nTwo);
		} else {
			answer=nOne-nTwo
			await interaction.reply(nOne+'-'+nTwo);
		}
	} else if (interaction.commandName=='guess') {
		let userG = interaction.options.getInteger('guess');
		if (answer==userG) {
			await interaction.reply('good job')
		} else {

			await interaction.reply('bad job, the answer was: ' + answer);
		}
		answer = 0;
	}



  
});

client.login(config.token);

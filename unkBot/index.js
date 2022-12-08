const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const config = require('./config.json')
const prompt = require('prompt-sync')({sigint:true});


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

let msg = '';

while(msg != 'stopper') {
	if (msg != '') {
		const chan = client.channels.cache.get(config.channel);
		chan.send(msg);
	}
	msg = prompt('your msg: ');
}

client.login(config.token);


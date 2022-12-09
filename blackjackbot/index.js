/*
 
NAME: blackJackBot

MAIN DEPS: discord.js,mongodb
 
MAIN JSON/BSON:

{
	gId: String
	dCash: Int
	uInfo: [
		{ uId: String, uCash: Int }
	]
}

TO-DO (only stuff I'll forget):

allow user to block bot
TABLE uPref IS SET UP

 
*/


//YO ASSEMBLY STYLE RN





const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const config = require('./config.json');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = config.MDBURI;
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});





const dClient = new MongoClient(uri);


function loadDoc() {
	try {
		const database = dClient.db("blackone");
		const guildList = database.collection("guilds");
		return guildList;
	} catch (err) {
		throw err;
	} finally {
		console.log("done");
	}
}

const guildData = loadDoc();


//LOOK AT THE WHITEBOARD

async function guildPrep(guildId) {
	try {
		if (await guildData.countDocuments({gId:guildId})==0) {
			await guildData.insertOne({
				gId:guildId,
				dCash:0,
				uInfo:[{uId:'0',uCash:0}]
			})
		}
	} catch (err) {
		console.error(err);
	} finally {
		return;
	}
}





async function gUserPrep(userId,guildId) {
	try {
		let swPath = true;
		await guildPrep(guildId);
		const filter = { gId:guildId };
		const options = {
			projection: {dCash:1,uInfo:1}
		};
		let gUInfo = (await guildData.findOne(filter,options));
		for (let i = 0; i < gUInfo.uInfo.length; i++) {
			if (gUInfo.uInfo[i].uId == userId) {
				swPath = false;
				break;
			}
		}
		if (swPath) {
			await guildData.updateOne(filter,
				{
					$push: {uInfo:{uId:userId,uCash:(gUInfo.dCash)}}
				}
			);
		}
		

	} catch (err) {
		console.error(err);
	} finally {
		return;
	}
}


		

async function getUserCash(userId,guildId) {
	try {
		await gUserPrep(userId,guildId);
		const filter = {gId:guildId};
		const qOps = {projection:{uInfo:1}};
		let qRes = (await guildData.findOne(filter,qOps)).uInfo;
		console.log(qRes);
		for (let i of qRes) {
			if (i.uId == userId) {
				return i.uCash;
			}
		}
		
	} catch (err) {
		console.error(err);
	} finally {
		console.log('Operation done');
	}
}

async function setUserCash(userId,guildId,valCash) {
	try {

		await gUserPrep(userId,guildId);
		const filter = {gId:guildId,"uInfo.uId":userId};
		await guildData.updateOne(filter,
			{ $set: { "uInfo.$.uCash":valCash}}
		);

	} catch (err) {
		console.error(err);
	} finally {
		return;
	}
}





process.on('SIGINT',function() {
	
	process.exit();

});


process.on('exit',function() {

});


const botCommands = new Map();


botCommands.set('cset', (
	async function(interaction) {
		let cVal = interaction.options.getInteger('dcash');
		await interaction.reply("Set default cash to: $" + cVal);
		await cDefCash(interaction.guildId,cVal);

	}
));

botCommands.set('viewbalance', (
	async function(interaction) {
		await interaction.deferReply({ephemeral:true});
		let userCash = await getUserCash(interaction.user.id,interaction.guildId);
	
		await interaction.editReply('Your current cash is: $' + userCash);
	}
));

botCommands.set('uset', (
	
	async function(interaction) {

		let args = [interaction.options.getUser('uname'),interaction.guildId,interaction.options.getInteger('acash')];
		await setUserCash(args[0].id,args[1],args[2]);
		client.users.send(args[0].id,
			'Hello, ' + args[0].username + ', your cash has been set to $' + args[2] + " in guild " + interaction.guild.name);
		await interaction.reply('set cash');




	}
));




client.on('interactionCreate', async interaction => {
	if (!(interaction.isChatInputCommand())) {	
		return;
	}

	if (!(botCommands.has(interaction.commandName))) { return; }

	try {
		(botCommands.get(interaction.commandName))(interaction);
	} catch (err) {
		interaction.reply('An error has occured');
	}

	return;
});

client.login(config.token);

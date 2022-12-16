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





const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const config = require('./config.json');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const uri = config.MDBURI;
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
	  const j = Math.floor(Math.random() * (i + 1));
	  [array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

const cardName = ['A','2','3','4','5','6','7','8','9','T','J','Q','K'];
const suitSym = ['♠️','♣️','♥️','♦️'];
const cardBack = '🃏';
function sumHand(array) {
	let total = [0];
	for (let card of array) {
		if (card.val==1) {
			for (let i of total) {
				i++;
			}
			total.push(total[total.length-1]+10);
		} else if (card.val > 10) {
			for (let i of total) {
				i += 10;
			}
		} else {
			for (let i of total) {
				i += card.val;
			}
		}
	}
	return total;
		
}


function getM(uId) {
	return ('<@'+uId+'>');
}



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

const fullDeck = (function() {
	const retVal = [];
	for (let i = 1; i <= 13; i++) {
		for (let ii = 0; ii < 4; ii++) {
			retVal.push({val:i,suit:ii});
		}
	}
	return retVal;
})();

const botCommands = new Map();
const commandQ = new Map();
const userPlays = new Map();


class userHand {
	constructor(userBet) {
		this.userDeck = shuffle(fullDeck);
		this.dealCards = [this.userDeck[0],this.userDeck[1]];
		this.userHand = [{cards:[this.userDeck[2],this.userDeck[3]],bet:userBet}];
		this.uBet = userBet;
		this.currentIndex = 4;
		this.currentHand = 0;
		this.isFirst = true;
		this.canSplit = false;
	}
	
	getHand(handIndex) {
		if (handIndex == null) { handIndex = this.currentHand ; }
		return (this.userHand[handIndex]);
	}
	checkHand() {
		if (this.currentHand >= this.userHand.length) { return -1 ; }
		if ((sumHand(this.getHand(this.currentHand)))[0] > 21) {
			this.surrenderHand();
		} else if ((sumHand(this.getHand(this.currentHand)))[0] == 21) {
			if (this.isFirst) {
				this.userHand[this.currentHand].bet=Math.ceil(this.userHand[this.currentHand].bet * 1.5);
			}
			this.stayHand()
		} else if (((this.getHand(this.currentHand).cards[0]) == (this.getHand(this.currentHand).cards[1])) && (this.getHand(this.currentHand).cards.length == 2)) { this.canSplit = true };
	}

			


	drawCard() {
		let res = this.userDeck[this.currentIndex];
		this.currentIndex++;
		return res;
	}
	pushHand() {
		this.userHand[currentHand].cards.push(this.userDeck[this.currentIndex]);
		this.currentIndex++;
		if (sumHand(this.getHand(this.currentHand).cards) >= 21) {
			this.currentHand++;
			return 0;
		}
		if (this.currentHand >= this.userHand.length) {
			//work needed
		}

	}

	stayHand() {
		this.currentHand++;
	}

	surrenderHand() {
		this.userHand[this.currentHand].bet = 0;
		this.currentHand++;

	}

	doubleDown() {
		this.userHand[this.currentHand].bet *= 2;
		if (this.pushHand() != 0) { this.stayHand() ; }
	}
	newHand(startCard,userBet) {
		if (startCard == null) {
			startCard = (this.userDeck[this.currentIndex])
			this.currentIndex++;
		}
		if (userBet == null) {
			userBet = this.uBet;
		}
		this.userHand.push({cards: 
			[
				(startCard),
				(this.userDeck[this.currentIndex])
			],
			bet:(userBet)
		});
		this.currentIndex++;
	}
	splitHand() {
		this.newHand(this.userHand[this.currentHand].cards[0],this.uBet);
		this.userHand[this.currentHand].cards[1] = this.drawCard();
	}
		
}

class userEnd {


	async display(interaction) {
		let message = 'Hello, ' + getM(interaction.user.id) + 'this is your current hand: \n';
		let disHand = this.userPlay.getHand();
		for (let i of disHand.cards) {
			message = message + cardName[i.val-1] + suitSym[i.suit];
		}
		await interaction.followUp(message);
	}

	constructor(interaction,userBet) {
		if (userBet == null) {
			interaction.options.getInteger('bet');
		}
		this.userBalence = getUserCash(interaction.user.id,interaction.guildId);
		warnUser(interaction, this.conPartTwo.bind(this),userBet,"deal");

	}
	async conPartTwo(interaction,userBet) {
		this.userPlay = new userHand(userBet);
		await this.display(interaction);
	}









}
//((this.userHand[this.currentHand]).cards[0])
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
			'Hello, ' + getM(args[0].id) + ', your cash has been set to $' + args[2] + " in guild " + interaction.guild.name);
		await interaction.reply('set cash');




	}
));
async function warnUser(interaction, /*async function(interaction)*/ callFunc, userBet, actBio = "action") {
	if (userBet == null) { let userBet = interaction.options.getInteger('bet'); }
	let gUserInfo = [interaction.user.id,interaction.guildId];
	
	let amountOfCash = await getUserCash(gUserInfo[0],gUserInfo[1]);
	if (userBet > amountOfCash) {
		await interaction.reply('I\'m so sorry, ' + getM(gUserInfo[0]) + ', but it appears you only have $' + amountOfCash + ', while you need $' + userBet + 'to perform this ' + actBio);
		return -1;
	} else if (userBet*10>=amountOfCash) {
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('1'+gUserInfo[0]+gUserInfo[1])
					.setLabel('Yes?')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('2'+gUserInfo[0]+gUserInfo[1])
					.setLabel('No!')
					.setStyle(ButtonStyle.Danger),

			);
		commandQ.set(('1'+gUserInfo[0]+gUserInfo[1]), callFunc);
		await interaction.reply({content: 'Hello, ' + getM(gUserInfo[0]) + ', but it appears that you are attempting to wager $' + userBet + ' however, you only have $' + amountOfCash + ', and it is generally a good rule of thumb to not bet more than 10x your savings at once. Are you sure you want to continue with this ' + actBio + '?', components: [row] });
		return 0;
	} else {
		await interaction.deferReply();
		callFunc(interaction);
		return 1;
	}


	

		



}

async function playHand(interaction) {


	//Start here tommorow
	if (interaction.isButton()) {
		await (interaction.message.edit({components:[]}));

	}

}

botCommands.set('playblackjack', (
	async function(interaction) {
		let userBet = interaction.options.getInteger('bet');
		let gUserInfo = [interaction.user.id,interaction.guildId];
		let amountOfCash = await getUserCash(gUserInfo[0],gUserInfo[1]);
		let frontEnd = await new userEnd(interaction,userBet);
		//await warnUser(interaction, playHand, userBet);
	
	}

	));




client.on('interactionCreate', async interaction => {
	if (!(interaction.isButton())) {

		if (!(interaction.isChatInputCommand())) {	
			return;
		} else if (botCommands.has(interaction.commandName)) {
			try {
				(botCommands.get(interaction.commandName))(interaction);
			} catch (err) {
				interaction.reply('An error has occured');
			}

			return;
		} 
	} else if (commandQ.has(interaction.customId)) {
		try {
			await ((commandQ.get(interaction.customId))(interaction));
			(commandQ.delete(interaction.customId));
		} catch (err) {
			console.error(err);
		}
	}
	return;
});

client.login(config.token);

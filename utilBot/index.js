const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const config = require('./config.json');
const tone = require('tonegenerator');
const header = require('waveheader');
const fs = require('fs');

const VOL = 16;
//C4
const noteFeq = new Map([
	['Cn',261.63],['Cs',277.18],['Dn',293.66],['Eb',311.13],['En',329.63],['Fn',349.23],['Fs',369.99],['Gn',392.00],['Gs',415.30],['An',440.00],['Bb',466.16],['Bn',493.88]
]);
//1 is white square, 0 is black square
//king,queen,rook,bishop,knight,pawn then white (high - low order)
const nToNum = new Map([
	['k',2],
	['q',3],
	['r',4],
	['b',5],
	['n',6],
	['p',7],
	['K',8],
	['Q',9],
	['R',10],
	['B',11],
	['N',12],
	['P',13]
]);

const numToChar = ['█ ','░ ','♚','♛','♜','♝','♞','♟︎','♔','♕','♖','♗','♘','♙'];




client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const botCommands = new Map();

const winMap = new Map([
	[4,0],
	[5,-1],
	[6,1],
	[7,1],
	[8,0],
	[9,-1],
	[10,-1],
	[11,1],
	[12,0]
]);


function bRand() {
	if (Math.random() > 0.5) {
		return true;
	} else {
		return false;
	}
}
botCommands.set('rand', (
	async function(interaction) {
		const args = [
			interaction.options.getNumber('min'),
			interaction.options.getNumber('max'),
			interaction.options.getNumber('step')
		];

		const numStep = Math.floor((args[1]-args[0])/args[2]);
		const val = (args[0]+((Math.floor(Math.random()*numStep))*args[2]));
		await interaction.reply('Value is: ' + val);
		return;
	}
));

botCommands.set('sarcasm', (
	async function(interaction) {
		let iString = interaction.options.getString('text');
		let nString = "";
		for (let i of iString) {
			if (bRand()) {
				nString = nString + (i.toUpperCase());
			} else {

				nString = nString + (i.toLowerCase());

			}
		}

		interaction.reply(nString);
		return;
	}
));

botCommands.set('playnote', (
	async function(interaction) {
		const ops = [interaction.options.getString('tone'),interaction.options.getInteger('octave')];
		let nFile = fs.createWriteStream('noteFile.wav');
		let sample = tone({ freq: ((noteFeq.get(ops[0]))*(Math.pow(2,(ops[1]-4)))),lengthInSecs:5,volume:VOL});
		nFile.write(header(sample.length, {
			bitDepth: 8
		}))
		let data = Uint8Array.from(sample, function (val) {
			return val + 128
		})
		if (Buffer.from) { // Node 5+
			buffer = Buffer.from(data);
		} else {
			buffer = new Buffer(data);
		}
		nFile.write(buffer);
		nFile.end();
		const exIm = new EmbedBuilder().setTitle('file');
		const uFile = new AttachmentBuilder('./noteFile.wav');

		interaction.reply({files:[uFile]});

		return;


	}
));

botCommands.set('rockpaperscissors', (
	async function(interaction) {
		let choice = interaction.options.getInteger('choice');
		let bChoice = Math.ceil(Math.random()*3);

		const cNames = ['rock','paper','scissors'];
		const cEmojis = ['🪨','📄','✂️'];

		const start = new String('I chose ' + cEmojis[bChoice-1] + ' and you choose ' + cEmojis[choice-1] + ' which means:' + '\n');
		if (choice == 0) {
			choice = Math.ceil(Math.random()*3);
		}
		const wVal = (choice*3)+bChoice;
		if (winMap.get(wVal)==-1) {
			await interaction.reply(start + 'I win, as ' + cNames[bChoice-1] + ' beats ' + cNames[choice-1]);

		} else if (winMap.get(wVal)==0) {

			await interaction.reply(start + 'We tie, as ' + cNames[bChoice-1] + ' cancels out ' + cNames[choice-1]);
		} else if (winMap.get(wVal)==1) {

			await interaction.reply(start + 'You win, as ' + cNames[choice-1] + ' beats out ' + cNames[bChoice-1]);
		}
	}
));

function getAdv(cIn) {
	if (nToNum.has(cIn)) {
		return 1;
	} else if ((!(isNaN(cIn))) && (cIn<9)) {
		return (cIn*1);
	} else {
		return 0;
	}
}
		

botCommands.set('loadfen', ( 
	async function(interaction) {
		let fString = interaction.options.getString('fenstring');

		let board = [1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1];



		let curIn = 0;
		for (let cChar of fString) {
			if (nToNum.has(cChar)) {
				board[curIn]=nToNum.get(cChar);
			}
			curIn += getAdv(cChar);
			console.log(curIn);
			if (curIn >= 64) { break; }
		}
		console.log(board);

		let curString = "";

		for (let i = 0; i <= 8; i++) {
			for (let ii = 0; ii<8;ii++) {
				curString=curString+numToChar[board[((i*8)+ii)]];
			}
			curString = curString+"\n";
		}

		await interaction.reply(curString);
		return;
	


			


	}
		




));








	

client.on('interactionCreate', async interaction => {
	if (!(interaction.isChatInputCommand())) {	
		return;
	}
	if (!botCommands.has(interaction.commandName)) { return; }

	try {
		(botCommands.get(interaction.commandName))(interaction);
	} catch (err) {
		interaction.reply('An error has occured');
	}

	return;
	
    
});

client.login(config.token);

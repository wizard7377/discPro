const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const config = require('./config.json');

class ticTacToeG {
	constructor() {
		this.gameBoard = [[0,0,0],[0,0,0],[0,0,0]];
		this.redTurn = true;
	}
	userTurn(pos) {
		let x = (pos-1) % 3;
		let y = Math.floor((pos-1)/3);
		if (this.gameBoard[x][y] != 0) { return -1; }
		let cellVal = (function(bVal) {
			if (bVal) {
				return 1;
			} else {
				return 2;
			}
		})(this.redTurn);

		this.gameBoard[x][y] = cellVal;
		let count = 0;
		
		for (let i = 0; i < 3; i++) {
			if (this.gameBoard[x][i] == cellVal) { count++; }
		}
		if (count == 3) { return 2; }
		
		count = 0;
		
		for (let i = 0; i < 3; i++) {
			if (this.gameBoard[i][y] == cellVal) { count++; }
		}
		if (count == 3) { return 2; }

		if (((x+y)%2==0)&&(this.gameBoard[1][1]!=0)) {
			if ((this.gameBoard[0][0]==this.gameBoard[1][1]) && (this.gameBoard[2][2]==this.gameBoard[1][1])) { return 2; }
			if ((this.gameBoard[0][2]==this.gameBoard[1][1]) && (this.gameBoard[2][0]==this.gameBoard[1][1])) { return 2; }
		}
		return 1;
	}
	




}

class openGame {
	constructor(pOne,pTwo) {
		this.players = [pOne,pTwo];
		this.gameLog = new ticTacToeG();
		this.userTurn = (function() { 
			if (Math.random()>0.5) {
				return true;
			} else {
				return false;
			}
		})();
	}
	dExist(user) {
		if (this.players[0]=user) { return true; }
		if (this.players[1]=user) { return true; }
		return false;
	}

	hanMove(user,space) {
		if (userTurn) {
			if (this.players[0]!=user) { return -2; }
		} else {

			if (this.players[1]!=user) { return -2; }
		}
		return (this.gameLog.userTurn(space));
	
	}


}

class gameManager {
	constructor() {
		this.openReq = [[0,0]];
		this.openGames = [];
	}
	onNewReq(uOne,uTwo) {
		for (game in this.openGames) {
			if (game.dExist(uOne)) { return -3; }
			if (game.dExist(uTwo)) { return -3; }
		}
		for (req in this.openReq) {
			if (req[0] == uOne) { return -2; }
			if (req[1] == uOne) { return -2; }
			if (req[0] == uTwo) { return -2; }
			if (req[1] == uTwo) { return -2; }

		}

		this.openReq.push([uOne,uTwo]);
		return 1;

	}

	onNewAccept(user) {
		
		for (req in this.openReq) {
			if ((req[0]==user) || (req[1]==user)) {
				this.openGames.push((new openGame(req[0],req[1])));
				req[0]=0;
				req[1]=0;
			}
		}

	}
}



		
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

  
});

client.login(config.token);

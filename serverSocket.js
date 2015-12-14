var io;
var gameSocket;
var db = require("./public/models/mongoModel.js")
var currentPlayers = 0;
//the players is an oject with the players name as the name and their score as the value
var players = {}
//guesses will be the submitted guesses, and will clear every round
var guesses = {}

var responded = 0;



exports.init = function(sio, socket){

	io = sio;
    gameSocket = socket;

	gameSocket.emit('connected', { message: "You are connected!" });

    gameSocket.on('joined', function(name){
    	if (currentPlayers >= 4){
    		//game already in progress. don't do anything.
    	}
    	else{
	    	players[name] = {"id": currentPlayers, "score": 0};
	    	currentPlayers ++;
	    	//emit to the player that joined
	    	socket.emit('welcome', { message: "Welcome ", name: name});
			socket.emit('players', { number: currentPlayers});

			//emit to everyone else
			socket.broadcast.emit('players', { number: currentPlayers});
			socket.broadcast.emit('joined', {messageEnd: " joined", name:name })
			//this will only start the round when everyone has joined
			StartRound()
		}
    });

	gameSocket.on('guessed', function(guess, playerName){
		//add their guess to the list
		var id = players[playerName]["id"]
		//console.log('ID: ', id)
		guesses[id] = guess

		if (ObjectLength(guesses) == 4){
			//console.log(guesses)
			socket.emit('vote', {guesses: guesses});
			socket.broadcast.emit('vote', {guesses: guesses});
		}
	});

	gameSocket.on('voted', function(voteID){
		//record they have voted:
		responded++;
		//add points to the person they voted for
		UpdateScore(voteID)
		//just emit updated scores back to the player who responded.
		//when everyone has submitted they will all have the new scores
		socket.emit('scores', {players: players})
		//if everyones voted, update scores
		if (responded == 4){
			//now update all the scores
			socket.broadcast.emit('scores', {players: players})
			//set responded to 0 for next round
			responded = 0;
			//check if anyone has won
			CheckScores();
			//move on to the next round!
			StartRound();
		}
	})

	gameSocket.on('getWords', function(){
		db.retrieve('prompts', {}, function(docs){
			socket.broadcast.emit('updateWords', { words: docs});
			socket.emit('updateWords', { words: docs});
		})
	})

	gameSocket.on('newWord', function(word, def){
		//make a doc fo the new word/definition
		var insertDoc = {"prompt": word, "definition" : def}
		//insert the doc into the prompts db
		db.create('prompts',insertDoc, function(){
			//if that works, get the new prompts list
			db.retrieve('prompts', {}, function(docs){
				//emit the updated list to all users.
	   			socket.broadcast.emit('updateWords', { words: docs});
				socket.emit('updateWords', { words: docs});
			})
		})
	});

    gameSocket.on('disconnect', function () {
    		//this is a hack. should check if they have 'joined'
    		if (currentPlayers > 0){
    			--currentPlayers;
    		}
    		//console.log('someone discontected')
			socket.broadcast.emit('players', { number: currentPlayers});
	});

	function UpdateScore(pid){
		//console.log("Voted for:", pid)
		//console.log(players)
		for (var player in players){
			//console.log(players[player]["id"])
			if(players[player]["id"] == pid-1){
				players[player]["score"]++;
				return;
			}
		}
	}

	function StartRound(){
	if (currentPlayers == 4){
		//then we start the game!
		guesses = {}
		var prompt = GetPrompt()
	}

	}

	function ObjectLength( object ) {
    var length = 0;
    for( var key in object ) {
        if( object.hasOwnProperty(key) ) {
            ++length;
        }
    }
    return length;
};

	function GetPrompt(){
		db.retrieve('prompts', {}, function(docs){
        	//get a random prompt in the array
        	var num = docs.length
        	var rand = Math.floor(Math.random() * num)
        	var prompt =  docs[rand]["prompt"];
        	//want to emit to everyone.
			socket.emit('startRound', {prompt: prompt})
			socket.broadcast.emit('startRound', {prompt: prompt})
		});
		//console.log(prompt);
		//return prompt
	}

	function CheckScores(){
		for( var player in players ) {
			if (players[player]["score"] >= 25){
				socket.emit('gameOver', {players: players, winner: player})
				socket.broadcast.emit('gameOver', {players: players, winner: player})
				//reset all variables
				guesses = {};
				players = {};
				responded = 0;
				currentPlayers = 0;
				console.log(players)
				return;
			}
		}
		return;
	}


	
}

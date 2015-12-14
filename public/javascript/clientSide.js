var socket = io();
var thisPlayer = ""

$(function() {   // when document is ready

	//when the player 'joins' the game
	$('#playerForm').submit(function(){
		//send their name to the server
		socket.emit('joined', $('#inputPlayerName').val());
		thisPlayer = $('#inputPlayerName').val();
		$('#inputPlayerName').val('');
		$('#waitingMessage').show()
		$('#roundWaitMessage').hide();
		$('#intro-screen-template').hide();
		$('#waiting-screen-template').show();
		//returns false so doesn't redirect
		return false;
	});

	//when a player makes a guess
	$('#guessForm').submit(function(){
		socket.emit('guessed', $('#inputGuess').val(), thisPlayer)
		$('#round-template').hide();
		$('#waitingMessage').hide()
		$('#roundWaitMessage').show();
		$('#waiting-screen-template').show();
		//returns false so doesn't redirect
		return false;
	});

	//when the player clicks the 'create words' button
	$('#createCards').click(function(){
		socket.emit('getWords')
		$('#intro-screen-template').hide();
		$('#new-word-template').show();
		return false;
	});

	//when a user submits a new word for the list
	$('#wordForm').submit(function(){
		socket.emit('newWord', $('#inputWord').val(), $('#inputDefinition').val())
		$('#inputWord').val('');
		$('#inputDefinition').val('');
		return false;
	})

	//the back button on teh create card form 
	$('#back').click(function(){
		$('#new-word-template').hide();
		$('#intro-screen-template').show();
	});

	//when a player votes for teh definition they like the best
	$('#voteForm').submit(function(){
		$('#inputGuess').val('');
		socket.emit('voted', $('input[name="guess"]:checked').val());
		$('#vote-template').hide();
		//remove the selection
		$('#waitingMessage').hide()
		$('#roundWaitMessage').show();
		$('input[name="guess"]').attr('checked',false);
		$('#waiting-screen-template').show();
		//returns false so doesn't redirect
		return false;
	});

	//the home button at the end of the game
	$('#homeButton').click(function(){
		$('#game-over-template').hide();
		$('#intro-screen-template').show();
		$('#scores-template').hide();
		$('#round-template').hide();
		$('#waiting-screen-template').hide();
	})
})

socket.on('connected', function(msg){
	//console.log(msg.message)
	$('#intro-screen-template').show();

});

socket.on('players', function (data) {
  //console.log(data);
  $("#numPlayers").text(data.number);
	});

 socket.on('welcome', function(data){
 	//console.log('Welcome');
 	$('#welcome').text(data.message + data.name);
 });

  socket.on('joined', function(data){
 	$('#welcome').text(data.name + data.messageEnd);
 });

//when everyone has joined and a round starts
socket.on('startRound', function(data){
	$('#waiting-screen-template').hide();
	$('#round-template').show();
	$('#scores-template').show();
	$('#promptWord').text(data.prompt);
	$('#promptWord2').text(data.prompt);
});

//when everyone has submitted a guess and its time to vote
socket.on('vote', function(data){
	$('#waiting-screen-template').hide();
	$('#vote-template').show();
	var gs = data.guesses
	//stick all the players guesses by the check boxes
	$('#player1Guess').text(gs[0])
	$('#player2Guess').text(gs[1])
	$('#player3Guess').text(gs[2])
	$('#player4Guess').text(gs[3])
	$('#promptWord').text(data.prompt);
});

//when the server sends updated scores to the user
socket.on('scores', function(data){
	$('#scores').text('')
	players = data.players
	//update all the scores
	for( var key in players ) {
		var name = key
		var score = players[key]["score"]
		$('#scores').append(name + " : " + score + "<br>")
	}
});

//when the server sends an updated word list to the user
socket.on('updateWords', function(data){
	$('#wordList').empty('');
	for (var i = 0; i < data.words.length; i++){
		var word = data.words[i]
		$('#wordList').append(word["prompt"] + " - " + word["definition"] + "<br>")
	}

})

//when the server sends the game over (someone won)
socket.on('gameOver', function(data){
	$('#scores').text('');
	$('#waitingMessage').show();
	$('#waiting-screen-template').hide();
	$('#round-template').hide();
	$('#waiting-screen-template').hide();
	$('#game-over-template').show();
	//display the winner
	$('#winnerMessage').text(data.winner + " Won!")
})



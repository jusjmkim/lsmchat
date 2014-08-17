var server = io.connect('window.location.hostname');
server.on('error', function() {
	server.socket.connect();
});

var username;

function generateUser() {
  username = "Guest " + randomNumber();
}

function randomNumber() {
  return Math.random() * (1000 - 1) + 1;
}

function submitListener() {
	var $submit = $(""),
      $message = $("");
	$submit.click(function(e) {
    var message = $message.text();
    $message.text("");
		sendMessage(message);
    displayOwnMessage(message);
		e.preventDefault();
	});
}

function sendMessage(message) {
	server.emit(JSON.stringify(message));
}

function messageListener() {
	server.on('message', function(data) {
		var message = JSON.parse(data);
		displayMessage(message);
	});
}

function displayOwnMessage(message) {
  var fullMessage = {
    user: username,
    text: message
  };
  displayMessage(fullmessage);
}

function displayMessage(message) {
  $chatText = $("");
  $chatText.append()
}

$(function() {
  generateUser();
	submitListener();
	messageListener();
});
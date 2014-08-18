var server = io.connect('http://localhost:8080');

function assignName() {
  server.on('connect', function() {
    var username = generateUser();
    displayOwnName(username);
    server.emit('join', username);
  });
}

function generateUser() {
  return "Guest " + roundedNumber();
}

function randomNumber() {
  return Math.random() * (1000 - 1) + 1;
}

function roundedNumber() {
  return Math.floor(randomNumber());
}

function submitListener() {
	var $message = $("#message");
	$("#submit").click(function(e) {
    e.preventDefault();
    var message = $message.val();
    $message.val("");
		sendMessage(message);
    displayOwnMessage(message);
	});
}

function sendMessage(message) {
	server.emit('message', message);
}

function messageListener() {
	server.on('message', function(message) {
		displayMessage(message);
	});
}

function displayOwnMessage(message) {
  var fullMessage = scrapeUsername() + ": " + message;
  displayMessage(fullMessage);
}

function displayMessage(message) {
  var $chatText = $("#chat-text");
  $chatText.append(ptagify(message));
}

function newMemberListener() {
  server.on('join', function(name) {
    displayMessage(name + " has joined");
  });
}

function memberLeaveListener() {
  server.on('leave', function(name) {
    displayMessage(name + " has left");
  });
}

function displayOwnName(name) {
  $("#chat-text").before(welcomeUser(name));
}

function welcomeUser(name) {
  return "<h2>Welcome <span id='username'>" + name + "!</span></h2>";
}

function scrapeUsername() {
  return $("#username").text();
}

function ptagify(message) {
  return "<p>" + message + "</p>";
}

$(function() {
  assignName();
  generateUser();
  newMemberListener();
  memberLeaveListener();
	submitListener();
	messageListener();
});
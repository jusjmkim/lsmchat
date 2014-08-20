var server = io.connect(window.location.hostname);

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
    if (message.length > 0) { 
      $message.val("");
  		sendMessage(message);
      displayOwnMessage(message);
    }
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
  $chatText.append(ptagifyMessage(message));
  $chatText.scrollTop($chatText[0].scrollHeight);
}

function newMemberListener() {
  server.on('newJoin', function(name) {
    var $member = $("#members h3");
    displayMessage(spanify(name + " has joined"));
    addNewMember($member, name);
  });
}

function memberLeaveListener() {
  server.on('leave', function(name) {
    displayMessage(spanify(name + " has left"));
    removeMember(name);
  });
}

function displayOwnName(name) {
  $("#chat-text").before(welcomeUser(name));
}

function welcomeUser(name) {
  return "<h2>Hey <span id='username'>" + name + "</span>!</h2>";
}

function scrapeUsername() {
  return $("#username").text();
}

function ptagifyMessage(message) {
  return "<p>" + message + "</p>";
}

function ptagifyMember(username) {
  return "<p id='" + normalize(username) + "'>" + username + "</p>";
}

function spanify(message) {
  return "<span class='enter-leave'>" + message + "</span>";
}

function populateMembers() {
  var $member = $("#members h3");
  server.on('join', function(usernames) {
    for (var username in usernames) {
      addNewMember($member, username);
    }
  });
}

function addNewMember($member, username) {
  $member.after(ptagifyMember(username));
}

function removeMember(username) {
  $("#" + normalize(username)).remove();
}

function normalize(name) {
  return name.split(" ").join("-");
}

function populateChat() {
  server.on('chatMessages', function(chatMessages) {
    chatMessages.forEach(function(message) {
      displayMessage(message['chat']);
    });
  });
}

$(function() {
  assignName();
  generateUser();
  newMemberListener();
  memberLeaveListener();
  populateMembers();
  populateChat();
	submitListener();
	messageListener();
});
var socket = require('socket.io')
    , http = require('http')
    , express = require('express')
    , path = require('path')
    , port = process.env.PORT || 8080
    , app = express()
    , mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/lsmchat';

var monk = require('monk')
    , db = monk(mongoUri)
    , chats = db.get('chats');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.use("../stylesheets", express.static(__dirname + "/stylesheets"));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
  res.render('index');
});

var server = http.createServer(app)
    , io = socket.listen(server)
    , usernames = {};

function openClientConnection() {
  io.sockets.on('connection', function(client) {
    console.log('server is connected...')
    var addedUser = false;
    newUser(client);
    messageListener(client);
    disconnectHandler(client);
  });
}

function newUser(client) {
  client.on('join', function(name) {
    assignName(client, name);
    populateMembers(client);
    broadcastJoin(client);
    populateChat(client);
  });
}

function assignName(client, name) {
  console.log(name + " has joined");
  addedUser = true;
  client.username = name;
  usernames[client.username] = name;
}

function populateMembers(client) {
  client.emit('join', usernames);
}

function broadcastJoin(client) {
  client.broadcast.emit('newJoin', client.username);
  persistMessage(spanify(client.username + ' has joined'));
}

function broadcastLeave(client) {
  console.log(client.username + ' has left');
  client.broadcast.emit('leave', client.username);
  persistMessage(spanify(client.username + ' has left'));
}

function messageListener(client) {
  client.on('message', function(message) {
    var fullMessage = usernames[client.username] + ": " + message;
    client.broadcast.emit('message', fullMessage);
    persistMessage(fullMessage);
  });
}

function disconnectHandler(client) {
  client.on('disconnect', function() {
    if(addedUser) {
      delete usernames[client.username];
      broadcastLeave(client);
    }
  });
}

function persistMessage(message) {
  chats.insert({'chat': message});
}

function spanify(message) {
  return "<span class='enter-leave'>" + message + "</span>";
}

function populateChat(client) {
  chats.find().success(function(chat) {
    client.emit('chatMessages', chat);
  });
}

function listenToServer() {
  server.listen(port);
}

(function() {
  console.log('Starting server...');
  openClientConnection();
  listenToServer();
})();
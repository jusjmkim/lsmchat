var socket = require('socket.io')
    , http = require('http')
    , express = require('express')
    , path = require('path')
    , port = process.env.PORT || 8080
    , app = express()
    , mongo = require('mongodb')
    , monk = require('monk')
    , db = monk('localhost:27017/lsmchat');

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.use("../stylesheets", express.static(__dirname + "/stylesheets"));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// app.use(function(req, res, next) {
//   req.db = db;
//   next();
// });

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
  persistMessage(client.username);
}

function broadcastLeave(client) {
  console.log(client.username + ' has left');
  client.broadcast.emit('leave', client.username);
  persistMessage(client.username);
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
  // db.chats.insert({'chat': message});
}

function createDatabase() {
  if (typeof db.chats === "undefined") {
    console.log(db);
    // db.createCollection('chats', {capped: true, max: 1000});
  }
}

function listenToServer() {
  server.listen(port);
}

(function() {
  console.log('Starting server...');
  // createDatabase();
  openClientConnection();
  listenToServer();
})();
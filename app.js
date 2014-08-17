var socket = require('socket.io')
    , http = require('http')
    , express = require('express')
    , port = process.env.PORT || 8080
    , app = express();

var server = http.createServer(app)
    , io = socket.listen(server);

function openClientConnection() {
    io.socket.on('connection', function(client) {
        messageListener(client);
        client.on('join', function() {

        });
    });
}

function messageListener(client) {
    client.on('message', function(data) {
        // var message = JSON.parse(data);
        client.broadcast.emit('message', data);
    });
}

function listenToServer() {
    server.listen(port);
}

(function() {
    openClientConnection();
    listenToServer();
})();
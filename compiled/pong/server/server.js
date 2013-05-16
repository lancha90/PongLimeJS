var express = require('express'),
app     = express(),
server  = require('http').createServer(app),
io      = require('socket.io').listen(server);

var count = 0;

server.listen(3000);

app.get('/', function(req, res){
	res.send('running server');
});

io.sockets.on('connection', function (socket) {

	socket.on('send', function (data) {
		socket.broadcast.emit('send', data);
	});

	socket.on('player', function (data) {
		socket.broadcast.emit('player',data);
	});

});

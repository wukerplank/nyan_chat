var Booter = require('./config/booter.js');
var booter = new Booter();

var app           = booter.app;
var connect       = booter.connect;
var express       = booter.express;
var server        = booter.server;
var io            = booter.io;
var session_store = booter.session_store;
var cookie        = require('cookie');

var default_channel;
var clients  = [];
var channels = [
	{name: 'General',  slug: 'general',  default: true, messages: []},
	{name: 'Cat Chat', slug: 'cat-chat', messages: []},
	{name: 'Dog Chat', slug: 'dog-chat', messages: []}
];
var messages = [];

for(var i=0; i<channels.length; i++) {
	if (channels[i]['default']===true)
		default_channel = channels[i];
}

app.use('/', express.static('./public'));

server.listen(80);

io.sockets.on('connection', function (socket) {
	
	var cookie_string  = socket.handshake.headers.cookie;
	var parsed_cookies = cookie.parse(cookie_string);
	var connect_sid    = parsed_cookies['express.sid'];
	socket.current_client;
	socket.current_channel;
	
	if (connect_sid) {
		var test = session_store.get(connect_sid, function (error, session) {
			
			// See if we find the connecting client in our known clients list
			for (var i=0; i<clients.length; i++) {
				if(clients[i]['sid']==connect_sid) {
					clients[i]['socket_id'] = socket.id;
					clients[i]['online']    = true;
					
					socket.current_client = clients[i];
					break;
				}
			}
			
			// If there is no current client, create one
			if (!socket.current_client) {
				var new_client = {
					name: 'Anonymous',
					socket_id: socket.id, 
					sid: connect_sid, 
					current_channel: default_channel['slug'], 
					online: true, 
					nyan_mode: false
				};
				
				socket.current_client = new_client;
				
				clients.push(new_client);
			}
			
			// select the right channel for the client
			for (var i=0; i<channels.length; i++) {
				if (socket.current_client['current_channel']==channels[i]['slug'])
					socket.current_channel = channels[i];
			}
			
			io.sockets.emit('clients', clients);
			socket.emit('channels',    channels);
			socket.emit('chat',        socket.current_channel['messages']);
		});
	}
	
	socket.on('nyan_mode', function(data){
		socket.current_client['nyan_mode'] = data;
		
		io.sockets.emit('clients', clients);
	});
	
	socket.on('change_name', function(data){
		socket.current_client['name'] = data;
		
		io.sockets.emit('clients', clients);
		io.sockets.emit('chat',    socket.current_channel['messages']);
	});
	
	socket.on('join_channel', function(channel){
		for(var i=0; i<channels.length; i++) {
			if(channels[i]['slug']==channel) {
				socket.current_client['current_channel'] = channels[i]['slug'];
				
				socket.current_channel = channels[i];
				
				socket.join(channel);
				
				io.sockets.emit('chat', socket.current_channel['messages']);
			}
		}
	});
	
	socket.on('chat', function (data) {
		socket.current_channel['messages'].push({
			client: socket.current_client,
			message: data['message'],
			timestamp: new Date()
		});
		io.sockets.emit('chat', socket.current_channel['messages']);
	});
	
	socket.on('disconnect', function() {
		socket.current_client['online'] = false
		
		io.sockets.emit('clients', clients);
	})
});
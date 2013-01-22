var socket = io.connect('http://localhost');
var current_channel;

socket.on('clients', function (data) {
	update_users(data);
});

socket.on('channels', function (data) {
	update_channels(data);
});

socket.on('chat', function (data) {
	update_messages(data);
});

var update_messages = function(messages){
	var message_container = $('#messages');
	
	message_container.html('');
	
	for(var i=0; i<messages.length; i++) {
		var message = messages[i];
		
		var m = $('<div></div>').addClass('message');
		m.append($('<p></p>').html(message['message']));
		m.append($('<p></p>').append(
			$('<small></small>').html(message['timestamp'] + " &mdash; " + message['client']['name'])
		));
		
		message_container.append(m);
	}
}

var update_channels = function(channels){
	var channels_container = $('#channels');
	
	channels_container.html('');
	
	channels_container.append($('<li></li>').addClass('nav-header').html("Channels"));
	
	// Find and set current channel
	if (typeof(current_channel)=='undefined') {
		for(var i=0; i<channels.length; i++) {
			if (channels[i]['default']===true) {
				current_channel = channels[i]['current_channel'];
			}
		}
	}
	
	// update channel list
	for(var i=0; i<channels.length; i++) {
		var channel = channels[i];
		
		var m = $('<li></li>');
			var link = $('<a></a>').attr('href', '#');
			link.attr('data-slug', channel['slug']);
			link.text(channel['name']);
		m.append(link);
		
		// catch the click and switch the channel
		$(link).click(function(ev){
			ev.preventDefault();
			
			socket.emit('join_channel', $(this).attr('data-slug'));
		});
		
		channels_container.append(m);
	}
}

var update_users = function(clients){
	var client_container = $('#clients');
	
	client_container.html('');
	
	client_container.append($('<li></li>').addClass('nav-header').html("Clients"));
	
	for(var i=0; i<clients.length; i++) {
		var client = clients[i];
		
		if (client['online']===false)
			continue;
		
		var name_string = client['name'];
		if (client['nyan_mode']==true) {
			name_string += " [N!]";
		}
		else {
			name_string += " [ ]";
		}
		
		var m = $('<li></li>').html(name_string);
		
		client_container.append(m);
	}
}

var toggle_nyan_mode = function(){
	if($('#nyan_mode').is(':checked')) {
		current_channel = 
		socket.emit('nyan_mode', true);
		$('body').addClass('nyan_mode');
	}
	else {
		socket.emit('nyan_mode', false);
		$('body').removeClass('nyan_mode');
	}
}

$(function(){
	// Handle new message submits
	$('#new_message_form').submit(function(ev){
		ev.preventDefault();
		
		if ($('#new_message_field').val() != '') {
			var data = $('#new_message_field').val();
			socket.emit('chat', {message: data});
			$('#new_message_field').val('');
		}
	});
	
	// Handle name changes
	$('#name_form').submit(function(ev){
		ev.preventDefault();
		
		if ($('#name_field').val() != '') {
			var data = $('#name_field').val();
			socket.emit('change_name', data);
		}
	});
	
	// Handle the Full Nyan Mode
	$('#nyan_mode').click(toggle_nyan_mode);
});

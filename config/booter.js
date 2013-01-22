function Booter() {
	this.express = require('express');
	this.http    = require('http');
	
	this.app     = this.express();
	this.server  = this.http.createServer(this.app);
	this.connect = require('connect');
	this.io      = require('socket.io').listen(this.server);
	
	
	this.app.use(this.express.bodyParser());
	this.app.use(this.express.cookieParser());
	this.app.use(this.express.session({secret: 'secret', key: 'express.sid'}));
	
	var MemoryStore = this.connect.session.MemoryStore;
	this.session_store = new MemoryStore();
	
	this.app.use(this.express.session({ store: this.session_store }));
}

module.exports = Booter;

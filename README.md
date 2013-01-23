NyanChat
========

Installation
------------

This program was developed against Node.js v0.9.4-pre. You might run in to problems if you use an older version.

First of all, checkout the repository or download the [ZIP package](https://github.com/wukerplank/nyan_chat/archive/master.zip).

    git clone https://github.com/wukerplank/nyan_chat.git

Got to the newly created folder and install the required dependencies:

    cd nyan_chat
    npm install

The dependencies are:

- express 3.0.3
- socket.io 0.9.13
- connect 2.7.2
- cookie 0.0.5

Usage
-----

You can start the app by issuing

    node server.js

How It Works
------------

In our workshop with Phil Leggetter we learned how to use Websockets by leveraging die infrastructure of [Pusher](http://pusher.com). Pusher is very convenient to use and you can get immediate results with very little code. Unfortunately it makes your software depending on somebody else's infrastructure. So I ventured to find out more about open source alternatives and to strengthen my understanding of socket communication.

I decided to use [socket.io](http://socket.io), because seems to be widely used, offers great functionality and it is easy to find tutorials and snippets. The official documentation is a bit lacking, but googeling can solve a lot of problems.

Getting started is a breeze:

    var io = require('socket.io').listen(80);

    io.sockets.on('connection', function (socket) {
      socket.emit('news', { hello: 'world' });
      socket.on('my other event', function (data) {
        console.log(data);
      });
    });

`socket.emit()` sends data to the connected clients and `socket.on()` defines a callback that will be executed when the server receives data. You can name the events (in this example `news` and `my other event`) which makes it easier to structure your code.

The newest version of socket.io also offers the concept of channels, which make it easier to group clients. Finding out about this new feature, implementing a chat with multiple channels seemed like an obvious choice to me.

Joining clients into an channel and sending them messages is very easy:

    # add a client to a channel
    socket.join("knitting-101");
    
    # sending all connected clients a message
    io.sockets.in("knitting-101").emit("Welcome!");

This cuts down the code you'd have to write yourself and makes managing your clients a lot easier.

One issue I ran into: When users reload the website, they get disconnected and then connected again. This leads to a new socket ID and the server has no chance of recognizing the client again. I did some research and found a workaround: Have [Express](http://expressjs.com) create a cookie based session and let socket.io parse cookies when a new client connects. If a new timer joins, we save their cookie session ID for later. If a known client returns we reactivate his socket session.

For this project I used socket.io 0.9 and I also had to use the cookie package (`npm install cookie`) to get this to work. The syntax for older socket.io versions may differ.

    # get the raw cookies
    var cookie_string  = socket.handshake.headers.cookie;
    
    # parse the cookies
    var parsed_cookies = cookie.parse(cookie_string);

    # extract the Express session ID
    var connect_sid    = parsed_cookies['express.sid'];

Things I've Learned
-------------------

- Although Pusher is very convenient, socket.io isn't too shabby either.
- API changes all the time: If you find a code snippet for socket.io 0.8 it might not work for 0.9.
- With node.js you have to do *everything* yourself. Finding up-to-date tutorials and documentation can be hard.
- Structuring your code is tough with javascript. Creating sensible modules with the callback-based nature of node.js is even tougher.

Improvements & Future Work
--------------------------

- The project is still a bit rough around the edges. Managing the socket client in the browser was a bit awkward and needs some refactoring.
- The UI provides too little feedback.
- Let users create their own channels.
- Create superuser that can close channels and kick rude users.
- Use persistent storage: Right now everything is managed in memory. If the server crashes, everything is gone.

Copyright
---------

Copyright (C) 2013 Christoph Edthofer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
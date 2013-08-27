//chat
var express = require('express');
var app = express();
var server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

io.set('log level', 1);
io.set('browser client minification', true);  // send minified client
io.set('browser client etag', true);          // apply etag caching logic based on version number


server.listen(process.env.PORT);

app.use(express.favicon('public/images/favicon.ico'));
app.use('/img', express.static(__dirname + '/public/images'));
app.use('/etc', express.static(__dirname + '/public/etc'));

var globalOptions = {
    allowCORS: true,
    queueing: true,
    messagestostore: 10,
    maxRoomNameSize: 12,
};

var roomlist = [
    {name: "Room 1", isDefault: true, first: true},
    {name: "Room 2", isDefault: true, first: false},
], rlist = [];

var lastmessages = {};

function refreshRoomlist() {
    arr_iterate(roomlist, function(room) {
        rlist.push(room.name);
    });
}

refreshRoomlist();

function errexit(res, msg) {
    res.json({
        status: "error", 
		errmsg: msg
	});
	return false;
}

app.get('/', function (req, res) {
  res.sendfile('public/chat.html');
});

io.sockets.on('connection', function (socket) {
    //on connection, send list of available rooms
    socket.emit('roomlist', {rooms: roomlist});
    //join some room
    socket.on("subscribe", function(data) {
        if(typeof data.to !== "string" || !in_array(data.to, rlist))
            return socket.emit('log', 'Wrong data passed with Subscribe command');
        socket.join(data.to);
        var lmsgs = (globalOptions.queueing)
            ? lastmessages[data.to]
            : false;
        socket.emit('subcribeApproval', {
            lastmessages: lmsgs,
            to: data.to
        });
    });
    //leave room
    socket.on("unsubscribe", function(data) {
        if(typeof data.from !== "string" || !in_array(data.from, rlist))
            return socket.emit('log', 'Wrong data passed with Unsubscribe command');
        socket.leave(data.from);
    });
    //receive message
    socket.on("sendmessage", function(data) {
        if(typeof data.room !== "string" 
            || typeof data.message !== "string"
            || !in_array(data.room, rlist)
            || data.message.length > 150
            || data.message.length < 1
        ) return socket.emit('log', 'Wrong data passed with Message');
        io.sockets.in(data.room).emit("newmessage", {message: data.message});
        if(globalOptions.queueing) {
            if(typeof lastmessages[data.room] === "undefined")
                lastmessages[data.room] = [];
            lastmessages[data.room].push(data.message);
            if(lastmessages[data.room].length >= globalOptions.messagestostore)
                lastmessages[data.room].shift();
        }
    });
    //user creates new room
    socket.on("newroom", function(data) {
        if(typeof data.room !== "string") 
            return socket.emit('log', 'Wrong data passed with Message');
        if(in_array(data.room, rlist))
            return socket.emit('newroomDenial', 'Room already exists');
        if(data.room.length >= globalOptions.maxRoomNameSize)
            return socket.emit('newroomDenial', 'Room name must be '+globalOptions.maxRoomNameSize+' or less characters long');
        roomlist.push({
            name: data.room,
            isDefault: false,
            first: false
        });
        refreshRoomlist();
        io.sockets.emit('newRoomCreated', {name: data.room});
    });
});

//useful shit

function in_array(needle, haystack)
{
    for(var key in haystack)
    {
        if(needle === haystack[key])
        {
            return true;
        }
    }
    return false;
}

function arr_iterate(array, callback) {
    var i=0, len = array.length;
    for ( ; i < len ; i++ ){
        callback(array[i]);
    }
}

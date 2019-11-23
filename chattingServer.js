/**
 * @author Jeongseyoung
 * @file chattingServer.js
 * @page NodeJs Server 
 */
var express = require("express");
//var routes = require('./routes');
var http = require("http");
var path = require("path");
var socketio = require("socket.io");
var app = express();
app.set("port", 1337);

var serverIp = "127.0.0.1";
var serverPort = app.get("port");
var sendClientIp;
var sendClientPort;

app.use(express.bodyParser());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

var httpServer = http.createServer(app).listen(app.get("port"), function(request, response) {
	console.log("===============  Socket IO server started  ================");
});

// upgrade http server to socket.io server
var io = socketio.listen(httpServer);
var roomId;
var userId;

// Server에 Client가 접속 하는 이벤트
io.sockets.on("connection", function(socket) {
	
    socket.on('join', function(data) {

    	roomId = data.roomId;
    	userId = data.userId;
    	
        socket.join(roomId);
        
        
        socket.set('roomId', roomId);
        socket.set('userId', userId);

        socket.emit('join', roomId);

        socket.broadcast.to(roomId).emit('join', userId);
        
    });

    socket.on('message', function(data) {
        socket.get('roomId', function(error, roomId) {
        	var date = new Date();
        	date = date.getHours() + ":" + date.getMinutes();
        	// Object로 date란 이름으로 args에 date담기
        	data.date = date;
        	
        	
        	//이벤트 발생시킨 클라이언트만 전송
        	socket.emit('message', data);
        	//이벤트 발생시킨 클라이언트 외에 접속한 클라이언트에만 전송
            socket.broadcast.to(roomId).emit('message', data);
        });
    });
});


/**
 * @author Jeongseyoung
 * @file webSocket-server.js
 * @page NodeJs Server 
 */
var express = require("express");
//var routes = require('./routes');
var http = require("http");
var path = require("path");
var socketio = require("socket.io");
var app = express();
app.set("port", 1337);

var serverIp = "192.168.0.218";
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
	var date = [];
	/* request error */
	request.on("error", function(err) {
		console.log("[request error] 송신한 서버의 데이터의 변수가 잘못 되었습니다.");
	});
	
	/* response error */
	response.on("error", function(err) {
		console.log("[response error] 수신할 서버의 데이터의 변수가 잘못 되었습니다.");
	});
	
	// NodeJs 서버에서 받을 데이터 수신
	request.on("data", function(chunk) {
		data.push(chunk);
		console.log("data chunk length : " + chunk.length);
	});
	
	
	// HTTP 통신으로 받는 측 
	request.on("end", function() {
		response.writeHead(200, {"Content-Type" : ""});
		response.end("===============  Socket IO server started  ================");
	});
});

// upgrade http server to socket.io server
var io = socketio.listen(httpServer);

// Server에 Client가 접속 하는 이벤트
io.sockets.on("connection", function(socket) {
	sendClientIp = socket.handshake.address.address;
	sendClientPort = socket.handshake.address.port;
	console.log("--------- [Server] ip:" + serverIp + " / port: " + serverPort + " --------- ");
	console.log("--------- [SendClient] ip:" + sendClientIp + " / port: " + sendClientPort + " --------- ");
	// 접속한 Client가 Server를 대상으로 호출할 이벤트
	socket.on("talkClient", function(data) {
		io.sockets.emit("toClient", data);
		console.log("       Message Moved to Client..    ");
		// 자신을 제외하고 다른 클라이언트에게 보냄
		// socket.broadcast.emit("toClient", data);
		// 해당 클라이언트에게만 보냄.
		// socket.emit("toClient", data.msg);
		console.log("       Message from client :       " + data.msg);
   });
	/*
	socket.emit("sendText", function(data) {
	
	});
	socket.emit("sendText",{data1: "1", data2 :"2", data3:"3"})
	*/
});

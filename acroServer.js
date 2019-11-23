/**
 * @author Jeong seyoung
 * @file acroServer.js
 * @page NodeJs Server 
 */



var   express = require("express")
	, http = require("http")
	, path = require("path")
	, socketio = require("socket.io")
	, app = express();

var   cluster = require("cluster")
	, os = require("os")
	, uuid = require("uuid");

var port = 3000;
cluster.schedulingPolicy = cluster.SCHED_RR;

var server = http.createServer(app);

var httpServer = server.listen(function(req, res) {
	console.log("Socket IO server listening on port 3000");
});

var io = socketio.listen(httpServer);
var learning = require("./learning.js");

// Server에 Client가 접속 하는 이벤트
io.sockets.on("connection", function(socket) {
	
	console.log("hello! " + socket.id);

	socket.on("command", function(data) {    
		var full_command = data.command + " " + data.path;
		console.log("full_command : " + full_command);

		exec(full_command , function (err, stdout, stderr) {
			if (err !== null) {
				socket.emit("cmd_err", "error");
				console.log(err);
			} else {
				socket.emit("cmd_out", stdout);
				console.log(stdout);
			} 
		});
	});
	
    socket.on("learning", function(data) {
    	learning.start(data, this);
    });
    
});


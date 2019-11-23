/**
 * @author Jeong seyoung
 * @file app.js
 * @page NodeJs Server 
 */



var app = require("express")();
var server = require("http").createServer(app);
var io = require("socket.io")(server);	
var exec = require("child_process").exec;

server.listen(3000, function() {
	console.log("Socket IO server listening on port 3000");
});     


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
});


/*

var express = require("express");
var http = require("http");
var app = express();
var port = 3000;
app.use(express.json());

var httpServer = http.createServer(app).listen(port, function() {
	console.log("Socket IO server listening on port 3000");
});     

var io = require("socket.io").listen(httpServer);
var exec = require("child_process").exec;

io.sockets.on("connection", function(socket) {
	console.log("hello! " + socket.id);

	socket.on("command", function(data) {    
		var full_command = data.command + " " + data.path;
		console.log("full_command : " + full_command);

		exec(full_command, { encoding : "euckr" }, function (err, stdout, stderr) {
			console.log("stdout: " + stdout);
			console.log("stderr: " + stderr);
			if (err !== null) {
				console.log("error: " + err);
			} else {
				console.log("it works!");
				socket.emit("command_response", stdout);
			}
		});
		socket.close();
	});
});

*/

/*
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);	
var exec = require('child_process').exec;

server.listen(3000, function() {
	console.log('Socket IO server listening on port 3000');
});     


io.sockets.on('connection', function(socket) {
	console.log('hello! ' + socket.id);

	socket.on('command', function(data) {    
		var full_command = data.command + " " + data.path;
		console.log('full_command : ' + full_command);

		exec(full_command , function (err, stdout, stderr) {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (err !== null) {
				console.log('error: ' + err);
			} else {
				console.log('it works!');
				socket.emit('command_response', stdout);
			}
		});
	});
});


*/
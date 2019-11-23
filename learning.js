/**
 * @author Jeong seyoung
 * @file learning.js
 * @page NodeJs Server 
 */


var fs = require("fs")
  , exec = require("child_process").exec;

module.exports = {
	start : function(data, socket) {
		var sendClientIp = socket.handshake.address.address;
		var sendClientPort = socket.handshake.address.port;
		console.log("--------- [Client Server] ip:" + sendClientIp + " / port: " + sendClientPort + " --------- ");
		
		
		//디렉토리 구조 가져오기 exec : linux commander execute.
		socket.get("cmd", function(error) {
//        	var url = "//STT/train_files/";
			var cmd = data.cmd + " " + data.path;
			var child = exec(cmd, function(error, stdout, stderr) {
				console.log("stdout : " + stdout);
				console.log("stderr : " + stderr);
				if (error != null) {
					console.log("exec error : " + error);
				} else {
					console.log("it works!");
			       	socket.emit("command_respone", stdout);
				}
			});
        });
	}
};

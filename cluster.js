/**
 * @author Jeong seyoung
 * @file cluster.js
 * @page NodeJs Server 
 */

var cluster = require("cluster");
var os = require("os");
var uuid = require("uuid");
const port = 3000;
// 키생성 - 서버 확인용
var instance_id = uuid.v4();
//os에서 워커 스케쥴 관리하게 함
cluster.schedulingPolicy = cluster.SCHED_NONE;
//라운드 로빈 상태로 클러스트
//cluster.schedulingPolicy = cluster.SCHED_RR;
/**
 * 워커 생성
 */
var cpuCount = os.cpus().length; // CPU 수
var workerCount = cpuCount / 2; // 2개의 컨테이너에 돌릴 예정 CPU수 / 2
 
// 마스터일 경우
if (cluster.isMaster) {
	console.log("마스터에 접속하였습니다.\n 서버 ID : " + instance_id + "서버 CPU 수 : " + cpuCount + "생성할 워커 수 : " + workerCount + "개의 워커가 생성됩니다\n");
   
    //워커 메시지 리스너
    var workerMsgListener = function(msg) {
       
            var worker_id = msg.worker_id;
           
            //마스터 아이디 요청
            if (msg.cmd === "MASTER_ID") {
                cluster.workers[worker_id].send({ 
                	cmd : "MASTER_ID" , master_id : instance_id
                });
            }
    }
   
    // CPU 수 만큼 워커 생성
    for (var i = 0; i < workerCount; i++) {
    	// 워커 생성(fork한 수만큼 생성 됨.)
        var worker = cluster.fork();
       
        // 워커의 요청메시지 리스너
        worker.on("message", workerMsgListener);
    }
   
    //워커가 online(웹페이지 접속)상태가 되었을때
    cluster.on("online", function(worker) {
    	console.log("생성된 워커의 아이디 : " + worker.process.pid);
    });
   
    //워커가 죽었을 경우 다시 살림
    cluster.on("exit", function(worker) {
        //다른 워커를 생성합니다.
        var worker = cluster.fork();
        //워커의 요청메시지 리스너
        worker.on("message", workerMsgListener);
    });
 
//워커일 경우
} else if(cluster.isWorker) {
    var express = require("express");
    var app = express();
    var worker_id = cluster.worker.id;
    var master_id;
   
    var server = app.listen(port, function() {});
   
    //마스터에게 master_id 요청
    process.send({worker_id : worker_id, cmd : "MASTER_ID"});
    process.on("message", function (msg) {
        if (msg.cmd === "MASTER_ID") {
            master_id = msg.master_id;
        }
    });
   
    app.get("/", function (req, res) {
        res.send("["+master_id+"] 서버의 워커 : ["+ cluster.worker.id+"]");
    });
}
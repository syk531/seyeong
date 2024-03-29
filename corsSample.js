/**
 * @author Jeong seyoung
 * @file corsSample.js
 * @page NodeJs Server 
 */


// Express 기본 모듈 불러오기
var   express = require("express")
	, http = require("http")
	, path = require("path");
// Express의 미들웨어 불러오기
var   bodyParser = require("body-parser")
	, cookieParser = require("cookie-parser")
	, serveStatic = require("serve-static")
	, errorHandler = require("errorhandler");
// 에러 핸들러 모듈 사용
var expressErrorHandler = require("express-error-handler");
// Session 미들웨어 불러오기
var expressSession = require("express-session");
// 모듈로 분리한 설정 파일 불러오기
var config = require("./config/config");
// 모듈로 분리한 데이터 베이스 파일 불러오기
var database = require("./database/database");
// 모듈로 분리한 라우팅 파일 불러오기
var route_loader = require("./route/route_loader");
// Socket.io 사용
var socketio = require("socket.io");
// cors 사용 - 클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
var cors = require("cors");
// 익스 프레스 객체 생성
var app = express();
// 뷰 엔진 설정 _언더바 2개
app.set("views", __dirname + "/views");
// 뷰엔진을 ejs로 설정
app.set("view engine", "ejs");
// 서버 변수 설정 및 static으로 public 폴더 설정
console.log("config.server_port : %d", config.server_port);
app.set("port", process.env.PORT || 3000);

// body-parser을 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended : false }))
// body-parser을 이용해 application/json 파싱
app.use(bodyParser.json());
// public 폴더를 static으로 오픈
app.use("/public", serveStatic(path.join(__dirname, "public")));
// cookie-parser 설정
app.use(cookieParser());
// Session 설정
app.use(expressSession({
	secret : "my key",
	resave : true,
	saveUninitialized : true
}));

// ========= Passport 사용 설정 =============
// Passport의 세션을 사용할 때는 그 전에 Express의 세션을 사용하는 코드가 있어야 함
app.use(passPort.initialize());
app.use(passPort.session());
app.use(flash());

// 클라이언트에서 ajax로 요청 시 다중 서버 접속(cors) 지원
app.use(cors());
// 라우팅 정보를 읽어 들여 라우팅 설정
var router = express.Router();
router_loader.init(app, router);

// passPort 설정
var configPassport = require("./config/passport");
configPassport(app, passport);

// passPort 라우팅 설정
var userPassport = require("./routes/user_passport");
userPassport(router, passport);

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
	serveStatic : {
		"404" : "./public/404.html"
	}
});
app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

// 서버 시작
// 확인 되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on("uncaughtException", function(error) {
	console.log("uncaughtException 발생함 : " + error + "\n 프로세스 종료하지 않고 유지");
	console.log(error.stack);
});
// 프로세스 종료 시에 데이터베이스 연결 해제
process.on("SIGTERM", function() {
	console.log("프로세스가 종료됩니다.");
	app.close();
});

app.on("close", function() {
	console.log("Express 서버 객체가 종료됩니다.");
	if(database.db) {
		database.db.close();
	}
});

// 시작된 서버 객체를 리턴받게 함
var server = http.createServer(app).listen(app.get("port"), function() {
	console.log("서버가 시작되었습니다. 포트 : " + app.get("port"));
	// 데이터베이스 초기화
	database.init(app, config);
});

// ================SOCKER IO 채팅 테스트 ====================
// socket.io 서버 시작
var io = socketio.listen(server);

// 클라이언트가 연결했을 때의 이벤트 처리
io.sockets.on("connection", function(socket) {
	console.log("connection info : " + JSON.stringify(socket.request.connection._peername));
	
	// 소켓 객체에 클라이언트 Host / Post 정보 속성으로 추가
	socket.remoteAddress = socket.request.connection._peername.address;
	socket.remotePort = socket.request.connection._peername.port;
});
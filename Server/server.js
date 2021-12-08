const http = require('http');
const fs   = require('fs');

var playerID;
var games = [];

let resFile = (path, res) => {
	fs.readFile(path, (err, data) => {
		if (err) {
			console.log('ERROR::FILE_READ\n' + err);
			res.end();
			return;
		}

		res.end(data, 'utf-8', (w_err) => {
			if (w_err) {
				console.log('ERROR::RESPONSE::END\n' + w_err);
				res.end();
				return;
			}
		});
	});
};

class Game {
	constructor(gameID, player1ID) {
		this.gameID = gameID;
		this.players = [player1ID,];
	}
}

const server = http.createServer((req, res) => {
	// handle the GET requests

	if (req.method == 'GET') {
		// handle images
		if (req.url.split('.').reverse()[0] == 'png') {
			res.writeHead(200, {
				'Content-Type': 'image/png'
			});

			resFile('./Server/' + req.url, res);
			return;
		}

		switch(req.url) {
			// pages
			case '/':
			case '/home.html':
				res.writeHead(200, {
					'Content-Type': 'text/html'
				});

				resFile('./Client/home.html', res);
				break;
			
			// stylesheets

			case '/stylesheets/h_style.css':
				res.writeHead(200, {
					'Content-Type': 'text/css'
				});

				resFile('./Client/stylesheets/h_style.css', res);
				break;

			case '/stylesheets/g_style.css':
				res.writeHead(200, {
					'Content-Type': 'text/css'
				});

				resFile('./Client/stylesheets/g_style.css', res);
				break;
			
			// scripts

			case '/script.js':
				res.writeHead(200, {
					'Content-Type': 'text/javascript'
				});

				resFile('./Client/script.js', res);
				break;

			// others

			case '/favicon.ico':
				res.end();
				break;

			default:
				console.log('GET : ' + req.url);
				res.end();
				break;
		}
	}

	// handle all the POST requests

	else if (req.method == 'POST') {
		let dataStr = "";

		req.on('data', (chunk) => {
			dataStr += chunk;
		});

		req.on('end', () => {
			dataStr     = dataStr.toString().split('&');
			let gameID  = dataStr[0].split('=')[1];
			let reqType = dataStr[1].split('=')[0];
			
			if (reqType == 'create') {
				playerID = generateID(8);
				games.push(new Game(gameID, playerID));

				switch(req.url) {
					case '/index.html':
						res.writeHead(200, {
							'Content-Type': 'text/html'
						});
		
						resFile('./Client/index.html', res);
						break;
					
					default:
						console.log('Unhandeled POST request: ' + req.url);
						res.end();
						break;
				}
			}

			else if(reqType == 'join') {
				res.end();
			}
		});
	}
});

let generateID = (len) => {
	let ID = "";
	for (let i = 0;i < len; i++) {
		ID += Math.floor(Math.round(Math.random()*100) / 10);
	}

	return ID;
}

server.on('clientError', (err, socket) => {
	socket.end('400 Bad request ' + err);
});

server.listen(8000, 'localhost', () => {
	console.log('listening at localhost:8000');
});
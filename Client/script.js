let WIN_HEIGHT;
let WIN_WIDTH;
let boardSrc;		// stores the original image dimensions

let chessBoard;		// stores the reference to chessboard element
let gridElement;
let cellElement;
let eventListeners = [];
for (let i = 0;i < 64; i++) eventListeners.push(null);

let selected = false;
let curTurn = 0;

let whitePieces = [];
let blackPieces = [];

let pieceMat = [
	[2, 2, 2, 2, 2, 2, 2, 2],
	[2, 2, 2, 2, 2, 2, 2, 2],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1, 1],
];

class Piece {
	constructor(type, color, posX, posY) {
		this.image = new Image();
		this.image.src = `./assets/sprites/${color[0]}_${type}.png`;
		this.type = type;
		this.color = color;

		this.pos = {
			x: posX,
			y: posY
		};

		this.moveCount = 0;
	}
};

class CellIndicator {
	constructor(type, posX, posY) {
		// type can be any of : move, capture
		this.type = type;
		this.pos = {
			x: posX,
			y: posY
		};

		let colorMap = ['rgba(18, 138, 237, 0.3)', 'rgba(240, 35, 13, 0.3)'];
		this.color = colorMap[['move', 'capture'].indexOf(type)];
	}
};

let initialize = () => {
	WIN_HEIGHT = window.innerHeight;
	WIN_WIDTH  = window.innerWidth;

	let ratio = {
		x: WIN_HEIGHT / boardSrc.y,
		y: WIN_WIDTH  / boardSrc.x
	};

	let scale = ratio.x < ratio.y ? ratio.x : ratio.y;
	
	// scale the image down to fit the screen perfectly
	chessBoard.height = boardSrc.y * scale;
	chessBoard.width  = boardSrc.x * scale;

	// align the image to the center
	chessBoard.style.paddingLeft = (WIN_WIDTH - chessBoard.width) / 2 + 'px';

	// align the grid to match the board
	gridElement.style.left = 488.5 * scale + (WIN_WIDTH - chessBoard.width) / 2 + 'px';
	gridElement.style.top  = 68 * scale + 'px';

	cellElement.forEach(cell => {
		cell.style.height = 118 * scale + 'px';
		cell.style.width  = 118 * scale + 'px';
		if (cell.children.length) {
			cell.children[0].width  = 114 * scale;
			cell.children[0].height = 114 * scale;

			cell.children[0].style.filter = `drop-shadow(-${4 * scale}px ${-7 * scale}px ${2 * scale}px #222)`;
		}
	});
};

window.onload = () => {
	chessBoard = document.querySelector('#board');
	gridElement = document.querySelector('#grid');
	cellElement = document.querySelectorAll('.t_col');

	boardSrc = {
		y: chessBoard.height,
		x: chessBoard.width
	};

	// load the sprites
	let pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
	for (let i = 0;i < 8; i++) {
		let piece = new Piece(pieces[i], 'w', i, 7);
		cellElement[56 + i].appendChild(piece.image);
		whitePieces.push(piece);

		let pawn = new Piece('pawn', 'w', i, 6);
		cellElement[48 + i].appendChild(pawn.image);
		whitePieces.push(pawn);
	}

	for (let i = 0;i < 8; i++) {
		let piece = new Piece(pieces[i], 'b', i, 0);
		cellElement[i].appendChild(piece.image);
		blackPieces.push(piece);
	
		let pawn = new Piece('pawn', 'b', i, 1);
		cellElement[8 + i].appendChild(pawn.image);
		blackPieces.push(pawn);
	}

	let activePiece = null;
	let cellStatus = [];
	for (let i = 0;i < 64; i++) cellStatus.push(0);

	whitePieces.forEach(piece => {
		piece.image.addEventListener('click', (event) => {

			if (curTurn != 0) return;
			clearAll();

			activePiece = piece;
			let moves = [];
			if (piece.type == 'pawn') {
				moves = PieceMovements.pawn(piece, 'white');
			}

			else if(piece.type == 'knight') {
				moves = PieceMovements.knight(piece, 'white');
			}

			else if(piece.type == 'rook') {
				moves = PieceMovements.rook(piece, 'white');
			}

			else if(piece.type == 'bishop') {
				moves = PieceMovements.bishop(piece, 'white');
			}

			else if(piece.type == 'queen') {
				moves = PieceMovements.bishop(piece, 'white');
				moves.push(...PieceMovements.rook(piece, 'white'));
				// console.log(moves);
			}

			else if(piece.type == 'king') {
				moves = PieceMovements.king(piece, 'white');
			}

			cellElement[piece.pos.y * 8 + piece.pos.x].style.backgroundColor = 'rgba(11, 232, 44, 0.3)';
			moves.forEach(move => {
				let index = move.pos.y * 8 + move.pos.x;
				cellElement[index].style.backgroundColor = move.color;
				if (move.type == 'move') cellStatus[index] = 1;
				else if(move.type == 'capture') cellStatus[index] = 2;
			});
		});
	});

	blackPieces.forEach(piece => {
		piece.image.addEventListener('click', (event) => {

			if (curTurn != 1) return;
			clearAll();

			activePiece = piece;
			let moves = [];
			if (piece.type == 'pawn') {
				moves = PieceMovements.pawn(piece, 'black');
			}

			else if(piece.type == 'knight') {
				moves = PieceMovements.knight(piece, 'black');
			}

			else if(piece.type == 'rook') {
				moves = PieceMovements.rook(piece, 'black');
			}

			else if(piece.type == 'bishop') {
				moves = PieceMovements.bishop(piece, 'black');
			}

			else if(piece.type == 'queen') {
				moves = PieceMovements.bishop(piece, 'black');
				moves.push(...PieceMovements.rook(piece, 'black'));
				// console.log(moves);
			}

			else if(piece.type == 'king') {
				moves = PieceMovements.king(piece, 'black');
			}

			cellElement[piece.pos.y * 8 + piece.pos.x].style.backgroundColor = 'rgba(11, 232, 44, 0.3)';
			moves.forEach(move => {
				let index = move.pos.y * 8 + move.pos.x;
				cellElement[index].style.backgroundColor = move.color;
				if (move.type == 'move') cellStatus[index] = 1;
				else if(move.type == 'capture') cellStatus[index] = 2;
			});
		});
	});

	for (let i = 0;i < 64; i++) {
		let cell = cellElement[i];
		cell.addEventListener('click', () => {
			if (cell.style.backgroundColor == 'rgba(11, 232, 44, 0.3)')
				return;
			
			// move 
			if (activePiece != null && cellStatus[i] == 1) {
				cell.appendChild(activePiece.image);

				pieceMat[activePiece.pos.y][activePiece.pos.x] = 0;
				activePiece.pos.y = Math.floor(i / 8);
				activePiece.pos.x = i % 8;
				pieceMat[activePiece.pos.y][activePiece.pos.x] = curTurn + 1;

				activePiece.moveCount += 1;

				clearAll();
				activePiece = null;
				curTurn = (curTurn + 1) % 2;
			}

			// capture
			if (activePiece != null && cellStatus[i] == 2) {
				let capturedType = cell.firstChild.src.split('/').reverse()[0].split('.')[0];

				cell.removeChild(cell.firstChild);
				cell.appendChild(activePiece.image);

				pieceMat[activePiece.pos.y][activePiece.pos.x] = 0;
				activePiece.pos.y = Math.floor(i / 8);
				activePiece.pos.x = i % 8;
				pieceMat[activePiece.pos.y][activePiece.pos.x] = curTurn + 1;

				activePiece.moveCount += 1;

				clearAll();
				activePiece = null;

				if (capturedType == 'b_king' || capturedType == 'w_king') {
					blackPieces.forEach(piece => {
						piece.image.replaceWith(piece.image.cloneNode(true));
					});

					whitePieces.forEach(piece => {
						piece.image.replaceWith(piece.image.cloneNode(true));
					});

					let alertBox = document.querySelector('#box');
					alertBox.children[0].innerHTML = `${['white', 'black'][curTurn]} won the game`;
					alertBox.style.visibility = 'visible';

					alertBox.children[1].addEventListener('click', (event) => {
						alertBox.style.visibility = 'hidden';
					});
				}

				curTurn = (curTurn + 1) % 2;
			}
		});
	}

	let clearAll = () => {
		for (let i = 0;i < 64; i++) {
			cellElement[i].style.backgroundColor = 'rgba(0, 0, 0, 0)';
			cellStatus[i] = 0;
		}
	};

	initialize();
};

// keep everything in perfect proportions
window.onresize = initialize;

class PieceMovements {
	static pawn(piece, color) {
		let moves = [];
		let enemy, ally;
		let next = [], capture = [];

		if (color == 'black') {
			enemy = 1;
			ally = 2;
			next = [[0, 1], [0, 2]];
			capture = [[1, 1], [-1, 1]];
		} else {
			enemy = 2;
			ally = 1;
			next = [[0, -1], [0, -2]];
			capture = [[1, -1], [-1, -1]];
		}

		if (piece.moveCount > 0) next.pop();
		// non capture cells
		for (let i = 0;i < next.length; i++) {
			let nextPos = {
				x: next[i][0] + piece.pos.x,
				y: next[i][1] + piece.pos.y
			};
			if (!isValidCell(nextPos.x, nextPos.y)) continue;

			if (pieceMat[nextPos.y][nextPos.x] == ally || pieceMat[nextPos.y][nextPos.x] == enemy) break;
			else if(pieceMat[nextPos.y][nextPos.x] == 0) {
				moves.push(new CellIndicator('move', nextPos.x, nextPos.y));
			}
		}

		// capture cells
		capture.forEach(pos => {
			if (isValidCell(piece.pos.x + pos[0], piece.pos.y + pos[1])) {
				if (pieceMat[pos[1] + piece.pos.y][pos[0] + piece.pos.x] == enemy) {
					moves.push(new CellIndicator('capture', piece.pos.x + pos[0], piece.pos.y + pos[1]));
				}
			}
		});

		return moves;
	}

	static knight(piece, color) {
		let moves = [];
		let enemy, ally;
		
		if (color == 'black') {
			enemy = 1;
			ally = 2;
		} else {
			enemy = 2;
			ally = 1;
		}

		let mPos = [[-1, -2], [1, -2], [-1, 2], [1, 2], [2, -1], [2, 1], [-2, -1], [-2, 1]];
		mPos.forEach(pos => {
			let newCell = {
				x: piece.pos.x + pos[0], 
				y: piece.pos.y + pos[1]
			};

			if (isValidCell(newCell.x, newCell.y)) {
				if (pieceMat[newCell.y][newCell.x] == 0) 
					moves.push(new CellIndicator('move', newCell.x, newCell.y));
				else if(pieceMat[newCell.y][newCell.x] == enemy)
					moves.push(new CellIndicator('capture', newCell.x, newCell.y));
			}
		});

		return moves;
	}

	static rook(piece, color) {
		let moves = [];
		let enemy, ally;
		
		if (color == 'black') {
			enemy = 1;
			ally = 2;
		} else {
			enemy = 2;
			ally = 1;
		}

		// up
		for (let i = piece.pos.y - 1; i >= 0; i--) {
			if (pieceMat[i][piece.pos.x] == ally) break;
			else if(pieceMat[i][piece.pos.x] == enemy) {
				moves.push(new CellIndicator('capture', piece.pos.x, i));
				break;
			}
			else {
				moves.push(new CellIndicator('move', piece.pos.x, i));
			}
		}

		// down
		for (let i = piece.pos.y + 1; i < 8; i++) {
			if (pieceMat[i][piece.pos.x] == ally) break;
			else if(pieceMat[i][piece.pos.x] == enemy) {
				moves.push(new CellIndicator('capture', piece.pos.x, i));
				break;
			}
			else {
				moves.push(new CellIndicator('move', piece.pos.x, i));
			}
		}

		// right
		for (let i = piece.pos.x + 1; i < 8; i++) {
			if (pieceMat[piece.pos.y][i] == ally) break;
			else if(pieceMat[piece.pos.y][i] == enemy) {
				moves.push(new CellIndicator('capture', i, piece.pos.y));
				break;
			}
			else {
				moves.push(new CellIndicator('move', i, piece.pos.y));
			}
		}

		// left
		for (let i = piece.pos.x - 1; i >= 0; i--) {
			if (pieceMat[piece.pos.y][i] == ally) break;
			else if(pieceMat[piece.pos.y][i] == enemy) {
				moves.push(new CellIndicator('capture', i, piece.pos.y));
				break;
			}
			else {
				moves.push(new CellIndicator('move', i, piece.pos.y));
			}
		}

		return moves;
	}

	static bishop(piece, color) {
		let moves = [];
		let enemy, ally;
		
		if (color == 'black') {
			enemy = 1;
			ally = 2;
		} else {
			enemy = 2;
			ally = 1;
		}

		// +1 +1
		for (let i = piece.pos.y + 1, j = piece.pos.x + 1; i < 8 && j < 8; i++, j++) {
			if (pieceMat[i][j] == ally) break;
			else if(pieceMat[i][j] == enemy) {
				moves.push(new CellIndicator('capture', j, i));
				break;
			}
			else {
				moves.push(new CellIndicator('move', j, i));
			}
		}

		// -1 -1
		for (let i = piece.pos.y - 1, j = piece.pos.x - 1; i >= 0 && j >= 0; i--, j--) {
			if (pieceMat[i][j] == ally) break;
			else if(pieceMat[i][j] == enemy) {
				moves.push(new CellIndicator('capture', j, i));
				break;
			}
			else {
				moves.push(new CellIndicator('move', j, i));
			}
		}

		// -1 +1
		for (let i = piece.pos.y - 1, j = piece.pos.x + 1; i >= 0 && j < 8; i--, j++) {
			if (pieceMat[i][j] == ally) break;
			else if(pieceMat[i][j] == enemy) {
				moves.push(new CellIndicator('capture', j, i));
				break;
			}
			else {
				moves.push(new CellIndicator('move', j, i));
			}
		}

		// +1 -1
		for (let i = piece.pos.y + 1, j = piece.pos.x - 1; i < 8 && j >= 0; i++, j--) {
			if (pieceMat[i][j] == ally) break;
			else if(pieceMat[i][j] == enemy) {
				moves.push(new CellIndicator('capture', j, i));
				break;
			}
			else {
				moves.push(new CellIndicator('move', j, i));
			}
		}

		return moves;
	}

	static king(piece, color) {
		let moves = [];
		let enemy, ally;
		
		if (color == 'black') {
			enemy = 1;
			ally = 2;
		} else {
			enemy = 2;
			ally = 1;
		}

		let places = [[-1, -1], [1, 1], [1, -1], [-1, 1], [1, 0], [0, 1], [-1, 0], [0, -1]];
		
		places.forEach(place => {
			let newPos = {
				x: place[0] + piece.pos.x,
				y: place[1] + piece.pos.y
			};
			
			if (isValidCell(newPos.x, newPos.y)) {
				if (pieceMat[newPos.y][newPos.x] == 0) {
					moves.push(new CellIndicator('move', newPos.x, newPos.y));
				}
				else if(pieceMat[newPos.y][newPos.x] == enemy) {
					moves.push(new CellIndicator('capture', newPos.x, newPos.y));
				}
			}
		});

		return moves;
	}
};

let isValidCell = (posX, posY) => {
	return (posX >= 0 && posX < 8) && (posY >= 0 && posY < 8);
}
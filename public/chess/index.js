const canvas = document.getElementById("myCanvas");
const g = canvas.getContext("2d");

let oldTime;

const blackPieces = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜', '♟︎', '♟︎', '♟︎', '♟︎', '♟︎', '♟︎', '♟︎', '♟︎', ]
    .reduce((a, c) => {
        a[c] = true;
        return a
    }, {});
const whitePieces = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖', '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙', ]
    .reduce((a, c) => {
        a[c] = true;
        return a
    }, {});

let state = [
    '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜',
    '♟︎', '♟︎', '♟︎', '♟︎', '♟︎', '♟︎', '♟︎', '♟︎',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
    '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙',
    '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖',
    'W',
];

const render = async (deltaTime) => {
    g.fillStyle = "black";
    g.fillRect(0, 0, 600, 600);

    const s = 50;

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {

            if ((x + y) % 2 == 0) {
                g.fillStyle = "lightgray";
            } else {
                g.fillStyle = "darkgray";
            }

            g.fillRect(x * s, y * s, s, s);
        }
    }

    g.fillStyle = "#5946B2";
    g.font = "30px Arial";
    g.textBaseline = 'middle';
    g.textAlign = 'center';

    const drawSymbol = (symbol, x, y) => {
        g.fillText(symbol, x * s + s / 2, y * s + s / 2);
    };

    drawSymbol('8', 8, 0);
    drawSymbol('7', 8, 1);
    drawSymbol('6', 8, 2);
    drawSymbol('5', 8, 3);
    drawSymbol('4', 8, 4);
    drawSymbol('3', 8, 5);
    drawSymbol('2', 8, 6);
    drawSymbol('1', 8, 7);

    drawSymbol('a', 0, 8);
    drawSymbol('b', 1, 8);
    drawSymbol('c', 2, 8);
    drawSymbol('d', 3, 8);
    drawSymbol('e', 4, 8);
    drawSymbol('f', 5, 8);
    drawSymbol('g', 6, 8);
    drawSymbol('h', 7, 8);    

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            drawSymbol(state[y * 8 + x], x, y);
        }
    }
};

const move = (state, source, target) => {
    console.log(source, target);

    // find piece
    const piece = state[(7 - (source.charCodeAt(1) - '1'.charCodeAt(0))) * 8 + (source.charCodeAt(0) - 'a'.charCodeAt(0))];

    const isWhitePiece = whitePieces[piece];
    const isBlackPiece = !isWhitePiece;

    const isWhiteTurn = state[64] === 'W';
    const isBlackTurn = !isWhiteTurn;

    if (isWhiteTurn && isBlackPiece) throw "Cannot move black piece because it is white's turn";
    if (isBlackTurn && isWhitePiece) throw "Cannot move white piece because it is black's turn";

    // find possible move for piece
    // check if move is in possible moves
    // move the piece
    state[(7 - (source.charCodeAt(1) - '1'.charCodeAt(0))) * 8 + (source.charCodeAt(0) - 'a'.charCodeAt(0))] = ' ';
    state[(7 - (target.charCodeAt(1) - '1'.charCodeAt(0))) * 8 + (target.charCodeAt(0) - 'a'.charCodeAt(0))] = piece;

    if (isWhiteTurn) state[64] = 'B';
    if (isBlackTurn) state[64] = 'W';

    return state;
};

state = move(state, "e2", "e4");
state = move(state, "e7", "e6");
state = move(state, "f2", "f4");
state = move(state, "f8", "c5");

const gameLoop = async (newTime) => {
    const deltaTime = newTime - oldTime;

    await render(deltaTime);

    oldTime = newTime;
    window.requestAnimationFrame(gameLoop);
};

window.requestAnimationFrame(gameLoop);

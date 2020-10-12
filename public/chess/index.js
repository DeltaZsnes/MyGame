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

const getIndex = (position) => {
    const alpha = position.charCodeAt(0);
    const digit = position.charCodeAt(1);
    const index = alpha - 'a'.charCodeAt(0) + (7 - (digit - '1'.charCodeAt(0))) * 8;
    return {index, alpha, digit};
};

const getSymbol = (state, position) => {
    const alpha = position.charCodeAt(0);
    const digit = position.charCodeAt(1);
    const symbol = state[(alpha - 'a'.charCodeAt(0)) + (7 - (digit - '1'.charCodeAt(0))) * 8];
    return {symbol, alpha, digit};
};

const getLegalTargets = (state, source) => {
    const { alpha, digit, symbol } = getSymbol(state, source);

    const isWhitePiece = whitePieces[symbol];
    const isBlackPiece = !isWhitePiece;

    const isWhiteTurn = state[64] === 'W';
    const isBlackTurn = !isWhiteTurn;

    if(isWhiteTurn && isBlackPiece) return [];
    if(isBlackTurn && isWhitePiece) return [];

    let legalTargets = [];

    switch(symbol){
        case '♙':{
            for(let i=1; i<=2; i++){
                let m = String.fromCharCode(alpha, (digit + i));

                // check board bounds
                if(digit + i > '8'.charCodeAt(0)) break;

                // check team block
                if(whitePieces[getSymbol(state, m).symbol]) break;

                legalTargets.push(m);
            }
            break;
        }
        case '♟︎':{
            for(let i=1; i<=2; i++){
                let m = String.fromCharCode(alpha, (digit - i));

                // check board bounds
                if(digit - i < '1'.charCodeAt(0)) break;

                // check team block
                if(whitePieces[getSymbol(state, m).symbol]) break;

                legalTargets.push(m);
            }
            break;
        }
        case ' ':
            break;
        default:
            throw "Unknown symbol";
    }

    return legalTargets;
};

const move = (state, source, target) => {
    console.log(source, target);

    const {symbol, digit, alpha} = getSymbol(state, source);
    
    const isWhitePiece = whitePieces[symbol];
    const isBlackPiece = !isWhitePiece;

    const isWhiteTurn = state[64] === 'W';
    const isBlackTurn = !isWhiteTurn;

    if (isWhiteTurn && isBlackPiece) throw "Cannot move black piece because it is white's turn";
    if (isBlackTurn && isWhitePiece) throw "Cannot move white piece because it is black's turn";

    // check if move is legal
    const legalTargets = getLegalTargets(state, source);
    if(!legalTargets.includes(target)) throw "The move target is illegal";

    const newState = [...state];

    // move the piece to the target location
    newState[getIndex(source).index] = ' ';
    newState[getIndex(target).index] = symbol;

    if (isWhiteTurn) newState[64] = 'B';
    if (isBlackTurn) newState[64] = 'W';

    return newState;
};

state = move(state, "e2", "e4");
state = move(state, "e7", "e6");
state = move(state, "f2", "f4");
// state = move(state, "f8", "c5");

const gameLoop = async (newTime) => {
    const deltaTime = newTime - oldTime;

    await render(deltaTime);

    oldTime = newTime;
    window.requestAnimationFrame(gameLoop);
};

window.requestAnimationFrame(gameLoop);

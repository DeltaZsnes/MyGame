const canvas = document.getElementById("myCanvas");
const g = canvas.getContext("2d");

let oldTime;

const ALPHA_a = 'a'.charCodeAt(0);
const ALPHA_h = 'h'.charCodeAt(0);
const DIGIT_1 = '1'.charCodeAt(0);
const DIGIT_7 = '7'.charCodeAt(0);
const INDEX_TURN = 64;
const WHITE_TURN = 'W';
const BLACK_TURN = 'B';

const whitePieces = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖', '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙', ]
    .reduce((a, c) => {
        a[c] = true;
        return a
    }, {});

const blackPieces = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜', '♟︎', '♟︎', '♟︎', '♟︎', '♟︎', '♟︎', '♟︎', '♟︎', ]
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
    WHITE_TURN,
];

const history = [];

const historyPush = (record) => {
    history.push(record);
    console.log(record);
};

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

const getLocation = (alpha, digit) => {
    return String.fromCharCode(alpha, digit);
};

const getIndex = (position) => {
    const alpha = position.charCodeAt(0);
    const digit = position.charCodeAt(1);
    const index = alpha - ALPHA_a + (7 - (digit - DIGIT_1)) * 8;
    return {index, alpha, digit};
};

const getSymbol = (state, position) => {
    const alpha = position.charCodeAt(0);
    const digit = position.charCodeAt(1);
    const symbol = state[(alpha - 'a'.charCodeAt(0)) + (7 - (digit - '1'.charCodeAt(0))) * 8];
    return {symbol, alpha, digit};
};

const outOfBounds = (position) => {
    const {index, alpha, digit} = getIndex(position);
    return alpha < ALPHA_a || ALPHA_h < alpha || digit < DIGIT_1 || DIGIT_7 < digit;
}

const whiteJumpMove = (targets, alpha, digit) => {
    const next = getLocation(alpha, digit);
    if(outOfBounds(next)) return;
    if(whitePieces[getSymbol(state, next).symbol]) return;
    targets.push(next);
};

const blackJumpMove = (targets, alpha, digit) => {
    const next = getLocation(alpha, digit);
    if(outOfBounds(next)) return;
    if(blackPieces[getSymbol(state, next).symbol]) return;
    targets.push(next);
};

const getLegalTargets = (state, source) => {
    const { alpha, digit, symbol } = getSymbol(state, source);

    const isWhitePiece = whitePieces[symbol];
    const isBlackPiece = !isWhitePiece;

    const isWhiteTurn = state[INDEX_TURN] === WHITE_TURN;
    const isBlackTurn = !isWhiteTurn;

    if(isWhiteTurn && isBlackPiece) return [];
    if(isBlackTurn && isWhitePiece) return [];

    const targets = [];

    switch(symbol){
        case '♙':{
            for(let i=1; i<=2; i++){
                whiteJumpMove(targets, alpha, digit + i);
            }
            break;
        }
        case '♟︎':{
            for(let i=1; i<=2; i++){
                blackJumpMove(targets, alpha, digit - i);
            }
            break;
        }
        case '♗':{
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha - i, digit - i);
                if(outOfBounds(next)) break;
                if(whitePieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(blackPieces[getSymbol(state, next).symbol]) break;
            }
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha - i, digit + i);
                if(outOfBounds(next)) break;
                if(whitePieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(blackPieces[getSymbol(state, next).symbol]) break;
            }
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha + i, digit - i);
                if(outOfBounds(next)) break;
                if(whitePieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(blackPieces[getSymbol(state, next).symbol]) break;
            }
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha + i, digit + i);
                if(outOfBounds(next)) break;
                if(whitePieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(blackPieces[getSymbol(state, next).symbol]) break;
            }
            break;
        }
        case '♝':{
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha - i, digit - i);
                if(outOfBounds(next)) break;
                if(blackPieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(whitePieces[getSymbol(state, next).symbol]) break;
            }
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha - i, digit + i);
                if(outOfBounds(next)) break;
                if(blackPieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(whitePieces[getSymbol(state, next).symbol]) break;
            }
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha + i, digit - i);
                if(outOfBounds(next)) break;
                if(blackPieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(whitePieces[getSymbol(state, next).symbol]) break;
            }
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha + i, digit + i);
                if(outOfBounds(next)) break;
                if(blackPieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(whitePieces[getSymbol(state, next).symbol]) break;
            }
            break;
        }
        case '♘':{
            whiteJumpMove(targets, alpha - 1, digit - 2);
            whiteJumpMove(targets, alpha - 1, digit + 2);
            whiteJumpMove(targets, alpha + 1, digit - 2);
            whiteJumpMove(targets, alpha + 1, digit + 2);
            whiteJumpMove(targets, alpha - 2, digit - 1);
            whiteJumpMove(targets, alpha - 2, digit + 1);
            whiteJumpMove(targets, alpha + 2, digit - 1);
            whiteJumpMove(targets, alpha + 2, digit + 1);
            break;
        }
        case '♞':{
            blackJumpMove(targets, alpha - 1, digit - 2);
            blackJumpMove(targets, alpha - 1, digit + 2);
            blackJumpMove(targets, alpha + 1, digit - 2);
            blackJumpMove(targets, alpha + 1, digit + 2);
            blackJumpMove(targets, alpha - 2, digit - 1);
            blackJumpMove(targets, alpha - 2, digit + 1);
            blackJumpMove(targets, alpha + 2, digit - 1);
            blackJumpMove(targets, alpha + 2, digit + 1);
            break;
        }
        case '♔':{
            whiteJumpMove(targets, alpha - 1, digit - 1);
            whiteJumpMove(targets, alpha - 1, digit + 0);
            whiteJumpMove(targets, alpha - 1, digit + 1);

            whiteJumpMove(targets, alpha + 0, digit - 1);
            whiteJumpMove(targets, alpha + 0, digit + 0);
            whiteJumpMove(targets, alpha + 0, digit + 1);

            whiteJumpMove(targets, alpha + 1, digit - 1);
            whiteJumpMove(targets, alpha + 1, digit + 0);
            whiteJumpMove(targets, alpha + 1, digit + 1);
            break;
        }
        case '♚':{
            whiteJumpMove(targets, alpha - 1, digit - 1);
            whiteJumpMove(targets, alpha - 1, digit + 0);
            whiteJumpMove(targets, alpha - 1, digit + 1);

            whiteJumpMove(targets, alpha + 0, digit - 1);
            whiteJumpMove(targets, alpha + 0, digit + 0);
            whiteJumpMove(targets, alpha + 0, digit + 1);

            whiteJumpMove(targets, alpha + 1, digit - 1);
            whiteJumpMove(targets, alpha + 1, digit + 0);
            whiteJumpMove(targets, alpha + 1, digit + 1);
            break;
        }
        case '♖':
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha + 0, digit - i);
                if(outOfBounds(next)) break;
                if(whitePieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(blackPieces[getSymbol(state, next).symbol]) break;
            }
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha + 0, digit + i);
                if(outOfBounds(next)) break;
                if(whitePieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(blackPieces[getSymbol(state, next).symbol]) break;
            }
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha - i, digit + 0);
                if(outOfBounds(next)) break;
                if(whitePieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(blackPieces[getSymbol(state, next).symbol]) break;
            }
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha + i, digit + 0);
                if(outOfBounds(next)) break;
                if(whitePieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(blackPieces[getSymbol(state, next).symbol]) break;
            }
            break;
        case '♜':
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha + 0, digit - i);
                if(outOfBounds(next)) break;
                if(blackPieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(whitePieces[getSymbol(state, next).symbol]) break;
            }
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha + 0, digit + i);
                if(outOfBounds(next)) break;
                if(blackPieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(whitePieces[getSymbol(state, next).symbol]) break;
            }
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha - i, digit + 0);
                if(outOfBounds(next)) break;
                if(blackPieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(whitePieces[getSymbol(state, next).symbol]) break;
            }
            for(let i=1; i<=8; i++){
                const next = getLocation(alpha + i, digit + 0);
                if(outOfBounds(next)) break;
                if(blackPieces[getSymbol(state, next).symbol]) break;
                targets.push(next);

                if(whitePieces[getSymbol(state, next).symbol]) break;
            }
            break;
        case ' ':
            break;
        default:
            throw "Symbol has no defined moves";
    }

    console.log({targets});
    return targets;
};

const move = (state, source, target) => {
    console.log(source, target);

    const {symbol, digit, alpha} = getSymbol(state, source);
    
    const isWhitePiece = whitePieces[symbol];
    const isBlackPiece = !isWhitePiece;

    const isWhiteTurn = state[INDEX_TURN] === WHITE_TURN;
    const isBlackTurn = !isWhiteTurn;

    if (isWhiteTurn && isBlackPiece) throw "Cannot move black piece because it is white's turn";
    if (isBlackTurn && isWhitePiece) throw "Cannot move white piece because it is black's turn";

    // check if move is legal
    const legalTargets = getLegalTargets(state, source);
    if(!legalTargets.includes(target)) {
        console.error(legalTargets);
        throw "The move target is illegal";
    }

    const newState = [...state];

    // move the piece to the target location
    newState[getIndex(source).index] = ' ';
    newState[getIndex(target).index] = symbol;

    if (isWhiteTurn) newState[INDEX_TURN] = BLACK_TURN;
    if (isBlackTurn) newState[INDEX_TURN] = WHITE_TURN;

    historyPush({
        source,
        target
    });
    return newState;
};

const canWhiteCastlingRight = (state, history) => {
    const king = getSymbol(state, "e1");
    if(king.symbol !== '♔') return false;

    const rook = getSymbol(state, "h1");
    if(rook.symbol !== '♖') return false;

    for(let move of history){
        if(move.source === "e1" || move.target === "e1" || move.source == "h1" || move.target == "h1") return false;
    }

    //todo check if path is under threat

    return true;
};

const whiteCastlingRight = (state) => {
    const newState = [...state];
    newState[getIndex("e1").index] = ' ';
    newState[getIndex("g1").index] = '♔';
    newState[getIndex("h1").index] = ' ';
    newState[getIndex("f1").index] = '♖';
    newState[INDEX_TURN] = BLACK_TURN;
    historyPush({ special: "whiteCastlingRight" });
    return newState;
};

const gameLoop = async (newTime) => {
    const deltaTime = newTime - oldTime;

    await render(deltaTime);

    oldTime = newTime;
    window.requestAnimationFrame(gameLoop);
};

gameLoop(null);

state = move(state, "e2", "e4");
state = move(state, "e7", "e6");
state = move(state, "f1", "c4");
state = move(state, "f8", "c5");
state = move(state, "g1", "f3");
state = move(state, "g8", "f6");
state = move(state, "d2", "d3");
state = move(state, "f6", "g4");
state = whiteCastlingRight(state);
state = move(state, "c5", "f2");
state = move(state, "f1", "f2");

window.requestAnimationFrame(gameLoop);

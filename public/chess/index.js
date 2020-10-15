const canvas = document.getElementById("myCanvas");
const g = canvas.getContext("2d");
let renderTime = new Date().getMilliseconds();
let thinkTime = new Date().getMilliseconds();

const ALPHA_a = 'a'.charCodeAt(0);
const ALPHA_h = 'h'.charCodeAt(0);
const DIGIT_1 = '1'.charCodeAt(0);
const DIGIT_8 = '8'.charCodeAt(0);
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

const render = async (newTime) => {
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

const scoreSymbol = (symbol) => {
    switch(symbol){
        case '♙':
        case '♟︎':
            return 1;

        case '♘':
        case '♞':
            return 2;

        case '♗':
        case '♝':
            return 3;

        case '♗':
        case '♝':
            return 3;

        case '♖':
        case '♜':
            return 5;

        case '♕':
        case '♛':
            return 9;

        case '♔':
        case '♚':
            return 9000;

        default:
            return 0;
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
    return alpha < ALPHA_a || ALPHA_h < alpha || digit < DIGIT_1 || DIGIT_8 < digit;
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

const addDiagonalMoves = (targets, allies, enemies, alpha, digit) => {
    for(let i=1; i<=8; i++){
        const next = getLocation(alpha - i, digit - i);
        if(outOfBounds(next)) break;
        if(allies[getSymbol(state, next).symbol]) break;
        targets.push(next);

        if(enemies[getSymbol(state, next).symbol]) break;
    }
    for(let i=1; i<=8; i++){
        const next = getLocation(alpha - i, digit + i);
        if(outOfBounds(next)) break;
        if(allies[getSymbol(state, next).symbol]) break;
        targets.push(next);

        if(enemies[getSymbol(state, next).symbol]) break;
    }
    for(let i=1; i<=8; i++){
        const next = getLocation(alpha + i, digit - i);
        if(outOfBounds(next)) break;
        if(allies[getSymbol(state, next).symbol]) break;
        targets.push(next);

        if(enemies[getSymbol(state, next).symbol]) break;
    }
    for(let i=1; i<=8; i++){
        const next = getLocation(alpha + i, digit + i);
        if(outOfBounds(next)) break;
        if(allies[getSymbol(state, next).symbol]) break;
        targets.push(next);

        if(enemies[getSymbol(state, next).symbol]) break;
    }
};

const addCrossMoves = (targets, allies, enemies, alpha, digit) => {
    for(let i=1; i<=8; i++){
        const next = getLocation(alpha + 0, digit - i);
        if(outOfBounds(next)) break;
        if(allies[getSymbol(state, next).symbol]) break;
        targets.push(next);

        if(enemies[getSymbol(state, next).symbol]) break;
    }

    for(let i=1; i<=8; i++){
        const next = getLocation(alpha + 0, digit + i);
        if(outOfBounds(next)) break;
        if(allies[getSymbol(state, next).symbol]) break;
        targets.push(next);

        if(enemies[getSymbol(state, next).symbol]) break;
    }

    for(let i=1; i<=8; i++){
        const next = getLocation(alpha - i, digit + 0);
        if(outOfBounds(next)) break;
        if(allies[getSymbol(state, next).symbol]) break;
        targets.push(next);

        if(enemies[getSymbol(state, next).symbol]) break;
    }

    for(let i=1; i<=8; i++){
        const next = getLocation(alpha + i, digit + 0);
        if(outOfBounds(next)) break;
        if(allies[getSymbol(state, next).symbol]) break;
        targets.push(next);

        if(enemies[getSymbol(state, next).symbol]) break;
    }
};

const whiteLost = (state) => {
    return !state.includes('♔');
};

const blackLost = (state) => {
    return !state.includes('♚');
};

const isGameOver = (state) => {
    return !state.includes('♔') || !state.includes('♚');
};

const getTargets = (state, source) => {
    const { alpha, digit, symbol } = getSymbol(state, source);
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
            addDiagonalMoves(targets, whitePieces, blackPieces, alpha, digit);
            break;
        }
        case '♝':{
            addDiagonalMoves(targets, blackPieces, whitePieces, alpha, digit);
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
            addCrossMoves(targets, whitePieces, blackPieces, alpha, digit);
            break;
        case '♜':
            addCrossMoves(targets, blackPieces, whitePieces, alpha, digit);
            break;
        case '♕':
            addCrossMoves(targets, whitePieces, blackPieces, alpha, digit);
            addDiagonalMoves(targets, whitePieces, blackPieces, alpha, digit);
            break;
        case '♛':
            addCrossMoves(targets, blackPieces, whitePieces, alpha, digit);
            addDiagonalMoves(targets, blackPieces, whitePieces, alpha, digit);
            break;
        case ' ':
            break;
        default:
            throw "Symbol has no defined moves";
    }

    return targets;
};

const exeMove = (state, source, target) => {
    const {symbol, digit, alpha} = getSymbol(state, source);
    
    const isWhitePiece = whitePieces[symbol];
    const isBlackPiece = !isWhitePiece;

    const isWhiteTurn = state[INDEX_TURN] === WHITE_TURN;
    const isBlackTurn = !isWhiteTurn;

    if (isWhiteTurn && isBlackPiece) throw "Cannot move black piece because it is white's turn";
    if (isBlackTurn && isWhitePiece) throw "Cannot move white piece because it is black's turn";

    const newState = [...state];

    // move the piece to the target location
    newState[getIndex(source).index] = ' ';
    newState[getIndex(target).index] = symbol;

    if (isWhiteTurn) newState[INDEX_TURN] = BLACK_TURN;
    if (isBlackTurn) newState[INDEX_TURN] = WHITE_TURN;

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
    return newState;
};

const whiteCastlingLeft = (state) => {
    const newState = [...state];
    newState[getIndex("e1").index] = ' ';
    newState[getIndex("b1").index] = '♔';
    newState[getIndex("a1").index] = ' ';
    newState[getIndex("d1").index] = '♖';
    newState[INDEX_TURN] = BLACK_TURN;
    return newState;
};

const blackCastlingRight = (state) => {
    const newState = [...state];
    newState[getIndex("e8").index] = ' ';
    newState[getIndex("g8").index] = '♚';
    newState[getIndex("h8").index] = ' ';
    newState[getIndex("f8").index] = '♜';
    newState[INDEX_TURN] = BLACK_TURN;
    return newState;
};

const blackCastlingLeft = (state) => {
    const newState = [...state];
    newState[getIndex("e8").index] = ' ';
    newState[getIndex("b8").index] = '♚';
    newState[getIndex("a8").index] = ' ';
    newState[getIndex("d8").index] = '♜';
    newState[INDEX_TURN] = BLACK_TURN;
    return newState;
};

const getChildren = (state, allies, enemies) => {
    let alliesMoves = [];
    let enemiesMoves = [];

    for(let alpha = ALPHA_a; alpha <= ALPHA_h; alpha++){
        for(let digit = DIGIT_1; digit <= DIGIT_8; digit++){
            const source = getLocation(alpha, digit);
            const symbol = getSymbol(state, source).symbol;
            
            if(enemies[symbol]){
                const targets = getTargets(state, source);
                enemiesMoves = enemiesMoves.concat(targets.map(target => ({ source, target })));
            }
        }
    }

    for(let alpha = ALPHA_a; alpha <= ALPHA_h; alpha++){
        for(let digit = DIGIT_1; digit <= DIGIT_8; digit++){
            const source = getLocation(alpha, digit);
            const symbol = getSymbol(state, source).symbol;
            
            if(allies[symbol]){
                let targets = getTargets(state, source);

                alliesMoves = alliesMoves.concat(targets.map(target => ({ source, target })));
            }
        }
    }

    let children = alliesMoves.map(({source, target}) => ({
        source,
        target,
        state: exeMove(state, source, target)
    }));

    children = children.filter(child => !isGameOver(child.state));
    return children;
};

const ai1 = new ai_random();
const ai2 = new ai_daniel();

const gameLoop = async (newTime) => {
    await render(newTime);
    
    if(newTime - thinkTime > 1000){
        const child = ai2.think(state);
        thinkTime = newTime;

        if(child){
            const { source, target} = child;
            state = exeMove(state, source, target);
            historyPush({source, target});
        }
    }

    window.requestAnimationFrame(gameLoop);
};

window.requestAnimationFrame(gameLoop);

// state = exeMove(state, "e2", "e4");
// state = exeMove(state, "e7", "e6");
// state = exeMove(state, "f1", "c4");
// state = exeMove(state, "f8", "c5");
// state = exeMove(state, "g1", "f3");
// state = exeMove(state, "g8", "f6");
// state = exeMove(state, "d2", "d3");
// state = exeMove(state, "f6", "g4");
// state = whiteCastlingRight(state);
// state = exeMove(state, "c5", "f2");
// state = exeMove(state, "f1", "f2");
// state = exeMove(state, "g4", "f2");
// state = exeMove(state, "g1", "f2");
// state = exeMove(state, "d8", "f6");
// state = exeMove(state, "f2", "g1");
// state = exeMove(state, "h7", "h5");
// state = exeMove(state, "c1", "g5");
// state = exeMove(state, "f6", "b2");
// state = exeMove(state, "b1", "d2");
// state = exeMove(state, "b7", "b6");
// state = exeMove(state, "g5", "f4");
// state = exeMove(state, "d7", "d6");
// state = exeMove(state, "a1", "b1");
// state = exeMove(state, "b2", "f6");
// state = exeMove(state, "f4", "g5");
// state = exeMove(state, "f6", "g6");
// state = exeMove(state, "c2", "c3");
// state = exeMove(state, "e6", "e5");
// state = exeMove(state, "d1", "a4");
// state = exeMove(state, "c8", "d7");
// state = exeMove(state, "c4", "b5");
// state = exeMove(state, "c7", "c6");
// state = exeMove(state, "b5", "a6");
// state = exeMove(state, "b8", "a6");
// state = exeMove(state, "a4", "a6");
// state = exeMove(state, "h5", "h4");
// state = exeMove(state, "h2", "h3");
// state = exeMove(state, "f7", "f6");
// state = exeMove(state, "g5", "e3");
// state = exeMove(state, "d7", "h3");
// state = exeMove(state, "g1", "f1");
// state = exeMove(state, "g6", "g2");
// state = exeMove(state, "f1", "e1");

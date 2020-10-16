const canvas = document.getElementById("myCanvas");
const g = canvas.getContext("2d");
let renderTime = new Date().getMilliseconds();
let thinkTime = new Date().getMilliseconds();

const ALPHA_a = 'a'.charCodeAt(0);
const ALPHA_h = 'h'.charCodeAt(0);
const DIGIT_1 = '1'.charCodeAt(0);
const DIGIT_2 = '2'.charCodeAt(0);
const DIGIT_7 = '7'.charCodeAt(0);
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

let currentState = [
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

const print = (state) => {
    let s = state[INDEX_TURN];
    s += "\n";
    for(let y = 0; y<8; y++){
        for(let x = 0; x<8; x++){
            const symbol = state[y * 8 + x];
            s += symbol == ' ' ? '▯' : symbol;
        }
        s += "\n";
    }
    return s;
};

const history = [];

const historyPush = (record) => {
    history.push(record);
    console.log(record.text);
};

const render = async (newTime) => {
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    g.fillStyle = "black";
    g.fillRect(0, 0, width, height);
    const s = Math.floor(Math.min(width, height) / 9);

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
            drawSymbol(currentState[y * 8 + x], x, y);
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

const outOfBounds = (position) => {
    const {index, alpha, digit} = getIndex(position);
    return alpha < ALPHA_a || ALPHA_h < alpha || digit < DIGIT_1 || DIGIT_8 < digit;
}

const getSymbol = (state, position) => {
    const alpha = position.charCodeAt(0);
    const digit = position.charCodeAt(1);
    const symbol = state[(alpha - ALPHA_a) + (7 - (digit - DIGIT_1)) * 8];
    return {symbol, alpha, digit};
};

const addMoveWalkNorth = (targets, state, allies, enemies, alpha, digit) => {
    {
        const next = getLocation(alpha, digit + 1);
        if(outOfBounds(next)) return;
        if(allies[getSymbol(state, next).symbol]) return;
        if(enemies[getSymbol(state, next).symbol]) return;
    }

    {
        const next = getLocation(alpha, digit + 2);
        if(outOfBounds(next)) return;
        if(allies[getSymbol(state, next).symbol]) return;
        if(enemies[getSymbol(state, next).symbol]) return;
        targets.push(next);
    }
};

const addMoveWalkSouth = (targets, state, allies, enemies, alpha, digit) => {
    {
        const next = getLocation(alpha, digit - 1);
        if(outOfBounds(next)) return;
        if(allies[getSymbol(state, next).symbol]) return;
        if(enemies[getSymbol(state, next).symbol]) return;
    }

    {
        const next = getLocation(alpha, digit - 2);
        if(outOfBounds(next)) return;
        if(allies[getSymbol(state, next).symbol]) return;
        if(enemies[getSymbol(state, next).symbol]) return;
        targets.push(next);
    }
};

const addMoveJump = (targets, state, allies, enemies, alpha, digit) => {
    const next = getLocation(alpha, digit);
    if(outOfBounds(next)) return;
    if(allies[getSymbol(state, next).symbol]) return;
    if(enemies[getSymbol(state, next).symbol]) return;
    targets.push(next);
};

const addAttackJump = (targets, state, allies, enemies, alpha, digit) => {
    const next = getLocation(alpha, digit);
    if(outOfBounds(next)) return;
    if(!enemies[getSymbol(state, next).symbol]) return;
    targets.push(next);
};

const addMoveAttackJump = (targets, state, allies, enemies, alpha, digit) => {
    const next = getLocation(alpha, digit);
    if(outOfBounds(next)) return;
    if(allies[getSymbol(state, next).symbol]) return;
    targets.push(next);
};

const addMoveAttackDiagonal = (targets, state, allies, enemies, alpha, digit) => {
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

const addMoveAttackCross = (targets, state, allies, enemies, alpha, digit) => {
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

const whiteWon = (state) => {
    return !state.includes('♚');
};

const blackWon = (state) => {
    return !state.includes('♔');
};

const isGameOver = (state) => {
    return !state.includes('♔') || !state.includes('♚');
};

const getTargets = (state, source) => {
    const { alpha, digit, symbol } = getSymbol(state, source);
    const targets = [];

    switch(symbol){
        case '♙':{
            if(digit == DIGIT_2) addMoveWalkNorth(targets, state, whitePieces, whitePieces, alpha, digit);
            addMoveJump(targets, state, whitePieces, blackPieces, alpha, digit + 1);
            addAttackJump(targets, state, whitePieces, blackPieces, alpha - 1, digit + 1);
            addAttackJump(targets, state, whitePieces, blackPieces, alpha + 1, digit + 1);
            break;
        }
        case '♟︎':{
            if(digit == DIGIT_7) addMoveWalkSouth(targets, state, blackPieces, whitePieces, alpha, digit);
            addMoveJump(targets, state, whitePieces, blackPieces, alpha, digit - 1);
            addAttackJump(targets, state, blackPieces, whitePieces, alpha - 1, digit - 1);
            addAttackJump(targets, state, blackPieces, whitePieces, alpha + 1, digit - 1);
            break;
        }
        case '♗':{
            addMoveAttackDiagonal(targets, state, whitePieces, blackPieces, alpha, digit);
            break;
        }
        case '♝':{
            addMoveAttackDiagonal(targets, state, blackPieces, whitePieces, alpha, digit);
            break;
        }
        case '♘':{
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha - 1, digit - 2);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha - 1, digit + 2);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha + 1, digit - 2);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha + 1, digit + 2);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha - 2, digit - 1);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha - 2, digit + 1);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha + 2, digit - 1);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha + 2, digit + 1);
            break;
        }
        case '♞':{
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha - 1, digit - 2);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha - 1, digit + 2);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha + 1, digit - 2);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha + 1, digit + 2);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha - 2, digit - 1);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha - 2, digit + 1);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha + 2, digit - 1);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha + 2, digit + 1);
            break;
        }
        case '♔':{
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha - 1, digit - 1);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha - 1, digit + 0);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha - 1, digit + 1);

            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha + 0, digit - 1);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha + 0, digit + 0);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha + 0, digit + 1);

            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha + 1, digit - 1);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha + 1, digit + 0);
            addMoveAttackJump(targets, state, whitePieces, blackPieces, alpha + 1, digit + 1);
            break;
        }
        case '♚':{
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha - 1, digit - 1);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha - 1, digit + 0);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha - 1, digit + 1);

            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha + 0, digit - 1);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha + 0, digit + 0);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha + 0, digit + 1);

            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha + 1, digit - 1);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha + 1, digit + 0);
            addMoveAttackJump(targets, state, blackPieces, whitePieces, alpha + 1, digit + 1);
            break;
        }
        case '♖':{
            addMoveAttackCross(targets, state, whitePieces, blackPieces, alpha, digit);
            break;
        }
        case '♜':{
            addMoveAttackCross(targets, state, blackPieces, whitePieces, alpha, digit);
            break;
        }
        case '♕':{
            addMoveAttackCross(targets, state, whitePieces, blackPieces, alpha, digit);
            addMoveAttackDiagonal(targets, state, whitePieces, blackPieces, alpha, digit);
            break;
        }
        case '♛':{
            addMoveAttackCross(targets, state, blackPieces, whitePieces, alpha, digit);
            addMoveAttackDiagonal(targets, state, blackPieces, whitePieces, alpha, digit);
            break;
        }
        case ' ':{
            break;
        }
        default:{
            throw "Symbol has no defined moves";
        }
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
                enemiesMoves = enemiesMoves.concat(targets.map(target => ({ symbol, source, target })));
            }
        }
    }

    for(let alpha = ALPHA_a; alpha <= ALPHA_h; alpha++){
        for(let digit = DIGIT_1; digit <= DIGIT_8; digit++){
            const source = getLocation(alpha, digit);
            const symbol = getSymbol(state, source).symbol;

            if(allies[symbol]){
                let targets = getTargets(state, source);

                if(symbol == '♔' || symbol == '♚'){
                    targets = targets.filter(target => !enemiesMoves.some(enemiesMove => enemiesMove.target == target));
                }

                alliesMoves = alliesMoves.concat(targets.map(target => ({ symbol, source, target })));
            }
        }
    }

    let children = alliesMoves.map(({symbol, source, target}) => {
        const s = getIndex(source);
        const t = getIndex(target);

        if(symbol == '♙' && t.digit == DIGIT_8){
            const newState = [...state];
            newState[s.index] = ' ';
            newState[t.index] = '♕';
            newState[INDEX_TURN] = 'B';

            return {
                text: symbol + " " + source + " to " + target + " -> " + "♕",
                state: newState,
            }
        }

        if(symbol == '♟︎' && t.digit == DIGIT_1){
            const newState = [...state];
            newState[s.index] = ' ';
            newState[t.index] = '♛';
            newState[INDEX_TURN] = 'W';

            return {
                text: symbol + " " + source + " to " + target + " -> " + "♛",
                state: newState,
            }
        }

        return {
            text: symbol + " " + source + " to " + target,
            state: exeMove(state, source, target),
        };
    });
    return children;
};

const ai1 = new ai_random();
const ai2 = new ai_daniel();

const thinkLoop = async (newTime) => {
    if(isGameOver(currentState)){
        console.log("game over");
        return;
    }

    if(newTime - thinkTime >= 1000){
        const child = ai2.think(currentState);
        thinkTime = newTime;

        if(child){
            currentState = child.state;
            historyPush({
                text: child.text,
                state: child.state,
            });
        }
    }

    window.requestAnimationFrame(gameLoop);
};

const gameLoop = async (newTime) => {
    await render(newTime);
    window.requestAnimationFrame(thinkLoop);
};

window.requestAnimationFrame(gameLoop);
console.log("game start");
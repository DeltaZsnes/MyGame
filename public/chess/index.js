const canvas = document.getElementById("myCanvas");
const g = canvas.getContext("2d");

let oldTime;

let state = [
    '♜','♞','♝','♚','♛','♝','♞','♜',
    '♟︎','♟︎','♟︎','♟︎','♟︎','♟︎','♟︎','♟︎',
    ' ',' ',' ',' ',' ',' ',' ',' ',
    ' ',' ',' ',' ',' ',' ',' ',' ',
    ' ',' ',' ',' ',' ',' ',' ',' ',
    ' ',' ',' ',' ',' ',' ',' ',' ',
    '♙','♙','♙','♙','♙','♙','♙','♙',
    '♖','♘','♗','♔','♕','♗','♘','♖',
    'W',
];

const render = async (deltaTime) => {
    g.fillStyle = "white";
    g.fillRect(0, 0, 600, 600);

    const s = 50;

    for(let y=0; y<8; y++){
        for(let x=0; x<8; x++){
        
            if((x + y) % 2 == 0){
                g.fillStyle = "gray";
            }
            else{
                g.fillStyle = "white";
            }

            g.fillRect(x * s, y * s, s, s);
        }
    }

    g.fillStyle = "black";
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

    for(let y=0; y<8; y++){
        for(let x=0; x<8; x++){
            drawSymbol(state[y * 8 + x], x, y);
        }
    }
};

const move = (state, source, target) => {
    console.log(source, target);
    console.log(source[0], source.charCodeAt(0) - 'a'.charCodeAt(0));
    console.log(source[1], 7 - (source.charCodeAt(1) - '1'.charCodeAt(0)) );
    return [...state];
};

state = move(state, "e2", "e4");
state = move(state, "e7", "e6");
state = move(state, "f2", "f4");
state = move(state, "f2", "f4");

const gameLoop = async (newTime) => {
    const deltaTime = newTime - oldTime;
    
    await render(deltaTime);
    
    oldTime = newTime;
    window.requestAnimationFrame(gameLoop);
};

window.requestAnimationFrame(gameLoop);

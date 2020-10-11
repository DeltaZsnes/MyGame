const canvas = document.getElementById("myCanvas");
const g = canvas.getContext("2d");

let oldTime;

const startState = [
    '♜','♞','♝','♚','♛','♝','♞','♜',
    '♟︎','♟︎','♟︎','♟︎','♟︎','♟︎','♟︎','♟︎',
    ' ',' ',' ',' ',' ',' ',' ',' ',
    ' ',' ',' ',' ',' ',' ',' ',' ',
    ' ',' ',' ',' ',' ',' ',' ',' ',
    ' ',' ',' ',' ',' ',' ',' ',' ',
    '♙','♙','♙','♙','♙','♙','♙','♙',
    '♖','♘','♗','♔','♕','♗','♘','♖',
];

const draw = (deltaTime) => {
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

    drawSymbol('A', 0, 8);
    drawSymbol('B', 1, 8);
    drawSymbol('C', 2, 8);
    drawSymbol('D', 3, 8);
    drawSymbol('E', 4, 8);
    drawSymbol('F', 5, 8);
    drawSymbol('G', 6, 8);
    drawSymbol('H', 7, 8);

    for(let y=0; y<8; y++){
        for(let x=0; x<8; x++){
            drawSymbol(startState[y * 8 + x], x, y);
        }
    }
};

const gameLoop = (newTime) => {
    const deltaTime = newTime - oldTime;
    
    draw(deltaTime);
    
    oldTime = newTime;
    // window.requestAnimationFrame(gameLoop);
};

window.requestAnimationFrame(gameLoop);

const canvas = document.getElementById("myCanvas");
const g = canvas.getContext("2d");

let oldTime;

const state = [
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

    for(let y=0; y<8; y++){
        for(let x=0; x<8; x++){
            const symbol = state[y * 8 + x];
            console.log(symbol);
            g.fillText(symbol, x * s + s / 2, y * s + s / 2);
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

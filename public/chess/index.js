const canvas = document.getElementById("myCanvas");
const g = canvas.getContext("2d");

let oldTime;

const state = "♖♘♗♔♕♗♘♖♙♙♙♙♙♙♙♙................................♟︎♟︎♟︎♟︎♟︎♟︎♟︎♟︎♜♞♝♚♛♝♞♜";

const draw = (deltaTime) => {
    g.fillStyle = "#FFFFFF";
    g.fillRect(0, 0, 600, 600);

    const s = 50;
    g.fillStyle = "#000000";

    for(let y=0; y<8; y++){
        for(let x=0; x<8; x++){
        
            if(x + y % 2 == 0){
                g.fillStyle = "#000000";
            }
            else{
                g.fillStyle = "#FFFFFF";
            }

            g.fillRect(x * s, y * s, s, s);
        }
    }

    g.fillStyle = "#000000";
    g.font = "30px Arial";

    for(let y=0; y<8; y++){
        for(let x=0; x<8; x++){
            const symbol = state[y * 8 + x];
            g.fillText(symbol, x * s, y * s);
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

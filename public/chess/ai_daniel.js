function ai_daniel() {
    this.scoreSymbol = (symbol) => {
        switch(symbol){
            case '♙':
            case '♟︎':
                return 1;
    
            case '♘':
            case '♞':
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

            case ' ':
                return 0;
    
            default:
                throw "Error unknown symbol";
        }
    };

    this.scoreState = (state, allies, enemies) => {
        let alliesScore = 0;
        let enemiesScore = 0;

        for(let i=0; i<64; i++){
            const symbol = state[i];
            const symbolScore = this.scoreSymbol(symbol);
            
            if(allies[symbol]){
                alliesScore += symbolScore;
            }

            if(enemies[symbol]){
                enemiesScore += symbolScore;
            }
        }

        return alliesScore - enemiesScore;
    };

    this.evaluate = (parent, allies, enemies) => {
        const key = parent.state.join("");
        if(this.visited[key]) return;

        this.visited[key] = true;

        if(parent.depth >= 4){
            parent.score = this.scoreState(parent.state, allies, enemies);
            this.grandchildren.push(parent);
            return;
        }

        const children = getChildren(parent.state, allies, enemies);
        
        for(let child of children){
            child.parent = parent;
            child.depth = parent.depth + 1;
            this.evaluate(child, enemies, allies);
        }
    };

    this.think = (state) => {
        this.visited = {};
        this.queue = [];
        this.grandchildren = [];

        const isWhiteTurn = state[INDEX_TURN] === WHITE_TURN;
        const isBlackTurn = !isWhiteTurn;
        const allies = isWhiteTurn ? whitePieces : blackPieces;
        const enemies = isWhiteTurn ? blackPieces : whitePieces;

        const root = {
            state,
            depth: 0,
            parent: null,
        };
        
        this.evaluate(root, allies, enemies);

        const best = this.grandchildren.reduce((a, c) => {
            if(c.score > a.score){
                return c;
            }
            
            if(c.score == a.score && Math.random() >= 0.5){
                return c;
            }

            return a;
        }, { score: Number.NEGATIVE_INFINITY, state: null });
        
        let parent = best.parent;
        
        while(parent.depth > 1){
            parent = parent.parent;
        }

        return parent;
    };

    return this;
}

function ai_daniel() {
    this.scoreSymbol = (symbol) => {
        switch(symbol){
            case '♙':
            case '♟︎':
                return 10;
    
            case '♘':
            case '♞':
            case '♗':
            case '♝':
                return 30;
    
            case '♖':
            case '♜':
                return 50;
    
            case '♕':
            case '♛':
                return 90;
    
            case '♔':
            case '♚':
                return 900;

            case ' ':
                return 0;
    
            default:
                throw "Error unknown symbol";
        }
    };

    this.scoreState = (state, allies, enemies) => {
        let alliesScore = 0;
        let enemiesScore = 0;

        for(let alpha = ALPHA_a; alpha <= ALPHA_h; alpha++){
            for(let digit = DIGIT_1; digit <= DIGIT_8; digit++){
                const source = getLocation(alpha, digit);
                const symbol = getSymbol(state, source).symbol;
                
                const symbolScore = this.scoreSymbol(symbol);
                const targets = getTargets(state, source);
                
                if(allies[symbol]){
                    alliesScore += symbolScore;
                    alliesScore += targets.length;
                }

                if(enemies[symbol]){
                    enemiesScore += symbolScore;
                    enemiesScore += targets.length;
                }
            }
        }

        return alliesScore - enemiesScore;
    };

    this.evaluate = (parent, allies, enemies) => {
        const key = parent.state.join("");
        if(this.visited[key]) return;

        this.visited[key] = true;

        if(parent.depth >= 3){
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
        console.log(state[INDEX_TURN]);

        const root = {
            state,
            depth: 0,
            parent: null,
        };
        
        this.evaluate(root, allies, enemies);

        for(let child of this.grandchildren){
            child.score = this.scoreState(child.state, allies, enemies);
            
            if(isWhiteTurn && whiteWon(child.state)){
                child.score += 100000;
            }
            if(isBlackTurn && blackWon(child.state)){
                child.score += 100000;
            }
        }

        let sorted = this.grandchildren.sort((a, b) => b.score - a.score);
        let best = sorted[0];
        
        // const best = this.grandchildren.reduce((a, c) => {
        //     if(c.score > a.score){
        //         return c;
        //     }
            
        //     if(c.score == a.score && Math.random() >= 0.5){
        //         return c;
        //     }

        //     return a;
        // }, { score: Number.NEGATIVE_INFINITY, state: null });

        let parent = best.parent;
        
        while(parent.depth > 1){
            parent = parent.parent;
        }

        return parent;
    };

    return this;
}

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

    this.think = (state) => {
        this.visited = {};
        this.queue = [];
        this.futures = [];

        const isWhiteTurn = state[INDEX_TURN] === WHITE_TURN;
        const isBlackTurn = !isWhiteTurn;
        const allies = isWhiteTurn ? whitePieces : blackPieces;
        const enemies = isWhiteTurn ? blackPieces : whitePieces;

        // depth 1 pick the best case scenario
        // depth 2 pick from depth 1 that has the best worst case scenario
        // depth 3 pick the best case scenario after picking depth 2
        // depth 4 pick from depth 1 that has the best worst case scenario
        // score should be computed recursively

        const root = {
            state,
            depth: 0,
        };
        const level1 = getChildren(state, allies, enemies);
        
        for(let child1 of level1){
            child1.parent = root;
            this.futures.push(child1);

            if(isGameOver(child1.state)){
                child1.score = Number.POSITIVE_INFINITY;
                continue;
            }

            const level2 = getChildren(child1.state, enemies, allies);

            for(let child2 of level2){
                child2.parent = child1;

                if(isGameOver(child2.state)){
                    child2.score = Number.NEGATIVE_INFINITY;
                }
                else{
                    child2.score = this.scoreState(child2.state, allies, enemies);
                }
                
                if(!child1.score) child1.score = child2.score;

                child1.score = Math.min(child1.score, child2.score);
            }
        }

        const best = this.futures.reduce((a, c) => {
            if(c.score > a.score){
                return c;
            }
            
            if(c.score == a.score && Math.random() >= 0.5){
                return c;
            }

            return a;
        }, { score: Number.NEGATIVE_INFINITY, state: null });

        // let parent = best;
        
        // while(parent.parent != root){
        //     parent = parent.parent;
        // }

        return best;
    };

    return this;
}

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

        const root = {
            state,
            depth: 0,
        };
        const level1 = getChildren(state, allies, enemies);
        
        for(let child1 of level1){
            child1.parent = root;

            if(isGameOver(child1.state)){
                child1.score = Number.POSITIVE_INFINITY;
                return child1;
            }
            // else{
            //     child1.score = this.scoreState(child1.state, allies, enemies);
            // }
            // this.futures.push(child1);

            const level2 = getChildren(child1.state, enemies, allies);

            for(let child2 of level2){
                child2.parent = child1;

                if(isGameOver(child2.state)){
                    child2.score = Number.NEGATIVE_INFINITY;
                }
                else{
                    child2.score = this.scoreState(child2.state, allies, enemies);
                }
                this.futures.push(child2);

                // const level3 = getChildren(child2.state, allies, enemies);

                // for(let child3 of level3){
                //     child3.parent = child2;

                //     if(isGameOver(child3.state)){
                //         child3.score = Number.POSITIVE_INFINITY;
                //     }
                //     else{
                //         child3.score = this.scoreState(child3.state, allies, enemies);
                //     }
                //     this.futures.push(child3);
                // }
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

        let parent = best;
        
        while(parent.parent != root){
            parent = parent.parent;
        }

        return parent;
    };

    return this;
}

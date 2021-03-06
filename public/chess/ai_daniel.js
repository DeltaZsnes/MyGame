function ai_daniel() {
    this.pastPick = {};

    this.scoreSymbol = (symbol) => {
        switch(symbol){
            case '♙':
            case '♟︎':
                return 100;
    
            case '♘':
            case '♞':
            case '♗':
            case '♝':
                return 300;
    
            case '♖':
            case '♜':
                return 500;
    
            case '♕':
            case '♛':
                return 900;
    
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

        for(let alpha = ALPHA_a; alpha <= ALPHA_h; alpha++){
            for(let digit = DIGIT_1; digit <= DIGIT_8; digit++){
                const source = getLocation(alpha, digit);
                const symbol = getSymbol(state, source).symbol;
                
                const symbolScore = this.scoreSymbol(symbol);
                
                if(allies[symbol]){
                    alliesScore += symbolScore;
                    alliesScore += getTargets(state, source).length;
                }

                if(enemies[symbol]){
                    enemiesScore += symbolScore;
                    enemiesScore += getTargets(state, source).length;
                }
            }
        }

        return alliesScore - enemiesScore;
    };

    this.think = (state) => {
        this.choices = [];

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
        root.children = level1;
        
        for(let child1 of level1){
            child1.parent = root;
            
            this.choices.push(child1);

            const key = child1.state.join(" ");
            if(this.pastPick[key]){
                child1.score = Number.NEGATIVE_INFINITY;
                continue;
            }

            if(isGameOver(child1.state)){
                child1.score = Number.POSITIVE_INFINITY;
                continue;
            }

            const level2 = getChildren(child1.state, enemies, allies);
            child1.children = level2;

            for(let child2 of level2){
                child2.parent = child1;

                if(isGameOver(child2.state)){
                    child2.score = Number.NEGATIVE_INFINITY;
                }
                else{
                    child2.score = this.scoreState(child2.state, allies, enemies);

                //     const level3 = getChildren(child1.state, enemies, allies);
                //     child2.children = level3;

                //     for(let child3 of level3){
                //         child3.parent = child2;

                //         if(isGameOver(child3.state)){
                //             child3.score = Number.POSITIVE_INFINITY;
                //         }
                //         else{
                //             child3.score = this.scoreState(child3.state, allies, enemies);

                //             const level4 = getChildren(child1.state, enemies, allies);
                //             child3.children = level4;

                //             for(let child4 of level4){
                //                 child4.parent = child3;

                //                 if(isGameOver(child4.state)){
                //                     child4.score = Number.NEGATIVE_INFINITY;
                //                 }
                //                 else{
                //                     child4.score = this.scoreState(child4.state, allies, enemies);
                //                 }

                //                 if(!child3.score) child3.score = child4.score;
                //                 child3.score = Math.min(child3.score, child4.score);        
                //             }
                //         }

                //         if(!child2.score) child2.score = child3.score;
                //         child2.score = Math.max(child2.score, child3.score);
                //     }
                }
                
                if(!child1.score) child1.score = child2.score;
                child1.score = Math.min(child1.score, child2.score);
            }
        }

        this.choices = this.choices.sort((a, b) => b.score - a.score);

        const best = this.choices.reduce((a, c) => {
            if(c.score > a.score){
                return c;
            }
            
            if(c.score == a.score && Math.random() >= 0.5){
                return c;
            }

            return a;
        }, { score: Number.NEGATIVE_INFINITY, state: null });

        {
            const key = best.state.join(" ");
            this.pastPick[key] = true;
        }
        return best;
    };

    return this;
}

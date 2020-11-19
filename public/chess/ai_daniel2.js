function ai_daniel2() {
    this.pastPick = {};
    this.depthMax = 3;

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

    this.alphaBetaMax = (state, allies, enemies, bestScore, worstScore, depth) => {
        depth = depth + 1;

        if(depth >= this.depthMax){
            return this.scoreState(state, allies, enemies);
        }

        const children = getChildren(state, allies, enemies);

        for(let child of children){
            if(isGameOver(child.state)){
                child.score = Number.NEGATIVE_INFINITY;
            }
            else{
                child.score = this.alphaBetaMin(child.state, allies, enemies, bestScore, worstScore, depth);
            }
            
            if(child.score >= worstScore){
                return worstScore;
            }
            
            if(child.score > bestScore){
                bestScore = child.score;
            }
        }

        return bestScore;
    };

    this.alphaBetaMin = (state, allies, enemies, bestScore, worstScore, depth) => {
        depth = depth + 1;
        
        if(depth >= this.depthMax){
            return this.scoreState(state, allies, enemies);
        }

        const children = getChildren(state, enemies, allies);

        for(let child of children){
            if(isGameOver(child.state)){
                child.score = Number.POSITIVE_INFINITY;
            }
            else{
                child.score = this.alphaBetaMax(child.state, allies, enemies, bestScore, worstScore, depth);
            }
            
            if(child.score <= bestScore){
                return bestScore;
            }
            
            if(child.score < worstScore){
                worstScore = child.score;
            }
        }

        return worstScore;
    };

    this.think = (state) => {
        this.choices = [];
        const isWhiteTurn = state[INDEX_TURN] === WHITE_TURN;
        const allies = isWhiteTurn ? whitePieces : blackPieces;
        const enemies = isWhiteTurn ? blackPieces : whitePieces;
        const children = getChildren(state, allies, enemies);
        
        for(let child of children){
            const key = child.state.join(" ");
            if(this.pastPick[key]){
                child.score = Number.NEGATIVE_INFINITY;
                this.choices.push(child);
                continue;
            }

            child.score = this.alphaBetaMin(child.state, allies, enemies, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 0);
            this.choices.push(child);
        }

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

        console.log(this.choices);
        console.log(best);
        return best;
    };

    return this;
}

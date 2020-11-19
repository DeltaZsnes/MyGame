function ai_daniel2() {
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

    this.alphaBetaMax = (state, allies, enemies, bestScore, worstScore, depth) => {
        depth = depth - 1;
        
        if(isGameOver(state)){
            return Number.NEGATIVE_INFINITY;
        }

        if(depth <= 0){
            return this.scoreState(state, allies, enemies);
        }

        const children = getChildren(state, allies, enemies);

        for(let child of children){
            child.score = this.alphaBetaMin(child.state, allies, enemies, bestScore, worstScore, depth);
            
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
        depth = depth - 1;
        
        if(isGameOver(state)){
            return Number.POSITIVE_INFINITY;
        }
        
        if(depth <= 0){
            return this.scoreState(state, allies, enemies);
        }

        const children = getChildren(state, enemies, allies);

        for(let child of children){
            child.score = this.alphaBetaMax(child.state, allies, enemies, bestScore, worstScore, depth);
            
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

            child.score = this.alphaBetaMin(child.state, allies, enemies, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 3);
            this.choices.push(child);
        }

        const bestPick = this.choices.reduce((best, candidate) => {
            if(candidate.score > best.score){
                return candidate;
            }
            
            if(candidate.score == best.score && Math.random() >= 0.5){
                return candidate;
            }

            return best;
        }, { score: Number.NEGATIVE_INFINITY, state: null });

        {
            const key = bestPick.state.join(" ");
            this.pastPick[key] = true;
        }

        return bestPick;
    };

    return this;
}

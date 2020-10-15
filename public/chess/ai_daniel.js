function ai_daniel() {
    this.visited = {};

    this.scoreState = (state, allies, enemies) => {
        let alliesScore = 0;
        let enemiesScore = 0;

        for(let i=0; i<64; i++){
            const symbol = state[i];
            const symbolScore = scoreSymbol(symbol);
            
            if(allies[symbol]){
                alliesScore += symbolScore;
            }

            if(enemies[symbol]){
                enemiesScore += symbolScore;
            }
        }

        return alliesScore - enemiesScore;
    };

    this.evaluate = (child, allies, enemies) => {
        const key = child.state.join("");
        if(this.visited[key]) return;

        this.visited[key] = true;

        child.score = this.scoreState(child.state, allies, enemies);

        const children = getChildren(state, allies, enemies);
    };

    this.think = (state) => {
        const isWhiteTurn = state[INDEX_TURN] === WHITE_TURN;
        const isBlackTurn = !isWhiteTurn;
        const allies = isWhiteTurn ? whitePieces : blackPieces;
        const enemies = isWhiteTurn ? blackPieces : whitePieces;

        const children = getChildren(state, allies, enemies);

        if (children.length == 0) {
            console.log("Game Over");
            return;
        }

        let thoughts = children.map(child => ({
            ...child,
            score: this.scoreState(child.state, allies, enemies),
        }));

        thoughts = thoughts.sort((a, b) => b.score - a.score);

        const choice = thoughts[0];
        return choice;
    };

    return this;
}

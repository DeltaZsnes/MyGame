function ai_daniel() {
    this.think = (state) => {
        const isWhiteTurn = state[INDEX_TURN] === WHITE_TURN;
        const isBlackTurn = !isWhiteTurn;
        const children = isWhiteTurn ? getChildren(state, whitePieces, blackPieces) : getChildren(state, blackPieces, whitePieces);

        if (children.length == 0) {
            console.log("Game Over");
            return;
        }

        const randomIndex = Math.floor(Math.random() * children.length);
        const child = children[randomIndex];
        return child;
    };

    return this;
}

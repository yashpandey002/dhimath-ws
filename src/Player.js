import { nanoid } from "nanoid";

export class Player {
    constructor() {
        this.playerId = nanoid(8);
        this.playerName = "";
        this.moves = [];
        this.currActive = false;
        this.socket;
    }

    getPlayerId() {
        return this.playerId;
    }

    setPlayerName(playerName) {
        this.playerName = playerName;
    }

    getPlayerName() {
        return this.playerName;
    }

    addMove(move) {
        this.moves.push(move);
    }

    getPlayerMoves() {
        return this.moves;
    }

    reverseActiveState() {
        return (this.currActive = this.getActiveState() ? false : true);
    }

    getActiveState() {
        return this.currActive;
    }

    addSocket(socket) {
        this.socket = socket;
    }

    getSocket() {
        return this.socket;
    }
}

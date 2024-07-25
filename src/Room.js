import { customAlphabet } from "nanoid";

export class Room {
    constructor() {
        this.roomId = this.generateRoomId();
        this.playerOneId;
        this.playerTwoId;
        this.availableMoves = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    getRoomId() {
        return this.roomId;
    }

    setPlayerOneId(playerId) {
        this.playerOneId = playerId;
    }

    getPlayerOneId() {
        return this.playerOneId;
    }

    setPlayerTwoId(playerId) {
        this.playerTwoId = playerId;
    }

    getPlayerTwoId() {
        return this.playerTwoId;
    }

    updateAvailableMoves(move) {
        const moveIndex = this.availableMoves.indexOf(move);
        this.availableMoves.splice(moveIndex, 1);
    }

    getAvailableMoves() {
        return this.availableMoves;
    }

    generateRoomId() {
        const roomId = customAlphabet(
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-",
            6
        );
        return roomId();
    }
}

import {
    CREATE_ROOM,
    ERROR,
    INVALID_MOVE,
    JOIN_ROOM,
    MOVE,
    ROOM_CREATED,
    ROOM_JOINED,
    ROOM_NOT_FOUND,
    GAME_SETUP,
    MOVE_UPDATE,
    GAME_END,
    DRAW,
    WIN,
    LOOSE,
} from "./messages.js";
import { Room } from "./Room.js";

export class Controller {
    constructor() {
        this.players = {};
        this.rooms = {};
    }

    addPlayer(player) {
        this.players[player.getPlayerId()] = player;
        this.addRoomHandler(player);
    }

    getPlayer(playerId) {
        return this.players[playerId];
    }

    addRoom(room) {
        this.rooms[room.getRoomId()] = room;
    }

    getRoom(roomId) {
        return this.rooms[roomId];
    }

    removePlayer(player) {
        delete this.players[player.playerId];
    }

    checkSumOfFifteen(arr) {
        for (let i = 0; i < arr.length - 2; i++) {
            for (let j = i + 1; j < arr.length - 1; j++) {
                for (let k = j + 1; k < arr.length; k++) {
                    // Check if sum of current three digits equals 15
                    if (arr[i] + arr[j] + arr[k] === 15) {
                        return [arr[i], arr[j], arr[k]];
                    }
                }
            }
        }

        return false;
    }

    addRoomHandler(player) {
        const playerSocket = player.getSocket();

        playerSocket.on("message", (message) => {
            const data = JSON.parse(message);

            if (!data.type) {
                playerSocket.send(
                    JSON.stringify({
                        type: ERROR,
                    })
                );

                return;
            }

            if (data.type === CREATE_ROOM) {
                if (!data.playerName) {
                    playerSocket.send(
                        JSON.stringify({
                            type: ERROR,
                        })
                    );

                    return;
                }

                player.setPlayerName(data.playerName);
                player.reverseActiveState();

                const room = new Room();
                room.setPlayerOneId(player.getPlayerId());

                this.addRoom(room);

                playerSocket.send(
                    JSON.stringify({
                        type: ROOM_CREATED,
                        roomId: room.getRoomId(),
                        playerId: player.getPlayerId(),
                    })
                );

                return;
            }

            if (data.type === JOIN_ROOM) {
                if (!data.playerName || !data.roomId) {
                    playerSocket.send(
                        JSON.stringify({
                            type: ERROR,
                        })
                    );

                    return;
                }

                const roomId = data.roomId;
                const room = this.getRoom(roomId);

                if (!room) {
                    playerSocket.send(
                        JSON.stringify({
                            type: ROOM_NOT_FOUND,
                        })
                    );

                    return;
                }

                player.setPlayerName(data.playerName);

                room.setPlayerTwoId(player.getPlayerId());

                playerSocket.send(
                    JSON.stringify({
                        type: ROOM_JOINED,
                        roomId: room.getRoomId(),
                        playerId: player.getPlayerId(),
                    })
                );

                const playerOne = this.getPlayer(room.getPlayerOneId());
                const playerTwo = this.getPlayer(room.getPlayerTwoId());

                // Temporary
                if (!playerOne || !playerTwo) {
                    console.log("Players not found");
                    return;
                }

                playerOne.getSocket().send(
                    JSON.stringify({
                        type: GAME_SETUP,
                        currActive: playerOne.getActiveState(),
                        opponentName: playerTwo.getPlayerName(),
                    })
                );

                playerTwo.getSocket().send(
                    JSON.stringify({
                        type: GAME_SETUP,
                        currActive: playerTwo.getActiveState(),
                        opponentName: playerOne.getPlayerName(),
                    })
                );

                return;
            }

            if (data.type === MOVE) {
                if (!data.roomId || !data.playerId) {
                    playerSocket.send(
                        JSON.stringify({
                            type: ERROR,
                        })
                    );

                    return;
                }

                const room = this.getRoom(data.roomId);
                if (!room) {
                    playerSocket.send(
                        JSON.stringify({
                            type: ERROR,
                        })
                    );

                    return;
                }
                const roomPlayerOne = room.getPlayerOneId();
                const roomPlayerTwo = room.getPlayerTwoId();

                if (
                    data.playerId !== roomPlayerOne &&
                    data.playerId !== roomPlayerTwo
                ) {
                    playerSocket.send(
                        JSON.stringify({
                            type: ERROR,
                        })
                    );

                    return;
                }
                const currentPlayerId = data.playerId;
                const opponentPlayerId =
                    currentPlayerId === roomPlayerOne
                        ? roomPlayerTwo
                        : roomPlayerOne;

                const currentPlayer = this.getPlayer(currentPlayerId);
                const opponentPlayer = this.getPlayer(opponentPlayerId);

                const move = data.move;
                if (move < 0 || move > 9) {
                    playerSocket.send(
                        JSON.stringify({
                            type: INVALID_MOVE,
                        })
                    );

                    return;
                }
                room.updateAvailableMoves(move);
                currentPlayer.addMove(move);

                opponentPlayer.getSocket().send(
                    JSON.stringify({
                        type: MOVE_UPDATE,
                        availableMoves: room.getAvailableMoves(),
                        opponentMoves: currentPlayer.getPlayerMoves(),
                    })
                );

                if (this.checkSumOfFifteen(currentPlayer.getPlayerMoves())) {
                    console.log(
                        this.checkSumOfFifteen(currentPlayer.getPlayerMoves())
                    );
                    currentPlayer.getSocket().send(
                        JSON.stringify({
                            type: GAME_END,
                            endType: WIN,
                            sum: this.checkSumOfFifteen(
                                currentPlayer.getPlayerMoves()
                            ),
                        })
                    );
                    opponentPlayer.getSocket().send(
                        JSON.stringify({
                            type: GAME_END,
                            endType: LOOSE,
                            sum: this.checkSumOfFifteen(
                                currentPlayer.getPlayerMoves()
                            ),
                        })
                    );

                    return;
                }

                if (room.getAvailableMoves().length === 0) {
                    currentPlayer.getSocket().send(
                        JSON.stringify({
                            type: GAME_END,
                            endType: DRAW,
                        })
                    );
                    opponentPlayer.getSocket().send(
                        JSON.stringify({
                            type: GAME_END,
                            endType: DRAW,
                        })
                    );

                    return;
                }
            }
        });
    }
}

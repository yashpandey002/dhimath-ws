import { WebSocketServer } from "ws";
import { Controller } from "./Controller.js";
import { Player } from "./Player.js";
import cors from "cors";

const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ port: PORT });

const controller = new Controller();

wss.on("connection", (socket) => {
    console.log("New client connected");
    const player = new Player();
    player.addSocket(socket);

    controller.addPlayer(player);

    socket.on("close", () => {
        controller.removePlayer(player);
    });
});

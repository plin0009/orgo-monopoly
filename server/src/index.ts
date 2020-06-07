import express from "express";
import http from "http";
import cors from "cors";
import socket from "socket.io";
import { Game, JoinRoomArgs, ChangeNameArgs } from "../../types";

import { generateRoomId, generatePlayerName } from "./generator";

const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socket(server);

const games: Record<string, Game> = {};

app.use(cors());
app.post("/create/", (_, res) => {
  let newRoomId = generateRoomId();
  while (newRoomId in games) {
    newRoomId = generateRoomId();
  }
  games[newRoomId] = { players: {}, turn: null };
  console.log(`created room ${newRoomId}`);
  res.json({ roomId: newRoomId });
});

io.on("connection", (socket) => {
  console.log("a user is connected");
  let currentRoomId: string | null = null;

  socket.on("joinRoom", ({ roomId }: JoinRoomArgs) => {
    if (!(roomId in games)) {
      socket.emit("errorNoRoom");
      return;
    }
    if (currentRoomId === roomId) {
      console.log("already here!");
      return;
    }
    console.log(`${socket.id} joined ${roomId}`);
    socket.join(roomId);
    currentRoomId = roomId;
    const game = games[roomId];
    const playerIDs = Object.keys(game.players);

    let name = generatePlayerName();
    let nameConflict = true;
    while (nameConflict) {
      nameConflict = false;

      for (let i = 0; i < playerIDs.length; i++) {
        if (name === game.players[playerIDs[i]].name) {
          nameConflict = true;
          name = generatePlayerName();
          break;
        }
      }
    }
    game.players[socket.id] = { name };

    socket.emit("joinedRoom", game);
    socket.to(roomId).emit("newPlayer", socket.id, { name });
  });
  socket.on("changeName", ({ name }: ChangeNameArgs) => {
    console.log(`${socket.id} is trying to change name to ${name}`);
  });
  socket.on("disconnect", () => {
    console.log(`disconnected from room ${currentRoomId}`);
    if (currentRoomId !== null) {
      delete games[currentRoomId].players[socket.id];
      socket.to(currentRoomId).emit("removePlayer", socket.id);
      if (Object.keys(games[currentRoomId].players).length === 0) {
        // todo: add cooldown before closing room
        console.log(`closing room ${currentRoomId}`);
        delete games[currentRoomId];
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

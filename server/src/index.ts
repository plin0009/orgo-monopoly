import express from "express";
import http from "http";
import cors from "cors";
import socket from "socket.io";
import {
  Game,
  JoinRoomArgs,
  ChangeNameArgs,
  ChooseCharacterArgs,
} from "../../types";

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
  games[newRoomId] = {
    players: {},
    characters: {},
    characterOrder: [],
    state: null,
  };
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
    game.players[socket.id] = { name, ready: false };

    socket.emit("joinedRoom", game);
    socket.to(roomId).emit("newPlayer", socket.id, { name });
  });

  socket.on("changeName", ({ name }: ChangeNameArgs) => {
    console.log(`${socket.id} is trying to change name to ${name}`);
  });

  socket.on("chooseCharacter", ({ character }: ChooseCharacterArgs) => {
    if (currentRoomId === null) {
      return;
    }
    const game = games[currentRoomId];

    if (game.characters[character]) {
      // emit error: character already taken
      return;
    }
    const oldCharacter = game.players[socket.id].character;
    if (oldCharacter !== undefined) {
      game.characterOrder.splice(game.characterOrder.indexOf(oldCharacter, 1));
      delete game.characters[oldCharacter];
    }

    game.characterOrder.push(character);
    game.characters[character] = socket.id;
    game.players[socket.id].character = character;

    io.in(currentRoomId).emit("choseCharacter", character, socket.id);
  });

  socket.on("chooseSpectate", () => {
    if (currentRoomId === null) {
      return;
    }
    const game = games[currentRoomId];

    const oldCharacter = game.players[socket.id].character;
    if (oldCharacter !== undefined) {
      game.characterOrder.splice(game.characterOrder.indexOf(oldCharacter, 1));
      delete game.characters[oldCharacter];
    }

    io.in(currentRoomId).emit("choseSpectate", socket.id);
  });

  socket.on("toggleReady", () => {
    if (currentRoomId === null) {
      return;
    }
    const game = games[currentRoomId];
    game.players[socket.id].ready = !game.players[socket.id].ready;
    io.in(currentRoomId).emit("toggledReady", socket.id);
  });

  socket.on("startGame", () => {
    if (currentRoomId === null) {
      return;
    }
    const game = games[currentRoomId];
    console.log(game.characterOrder);
    console.log(JSON.stringify(game.characters));
    console.log(JSON.stringify(game.players));

    io.in(currentRoomId).emit("startedGame");
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

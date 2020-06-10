import { setTimeout } from "timers";
import express from "express";
import http from "http";
import cors from "cors";
import socket from "socket.io";
import {
  Game,
  JoinRoomArgs,
  ChangeNameArgs,
  ChooseCharacterArgs,
  GamePlayer,
  RollingDiceTurnState,
  Board,
  StartTurnState,
  MovingTurnState,
} from "../../types";

import { generateRoomId, generatePlayerName } from "./generator";
import { startingBoard, startingCurrency, timers } from "./constants";

const port = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = socket(server);

const games: Record<string, Game> = {};

const allTimers: NodeJS.Timeout[] = [];

const setAndStoreTimeout = (callback: (...args: any[]) => void, ms: number) => {
  const timer: NodeJS.Timeout = setTimeout(callback, ms);
  allTimers.push(timer);
  return allTimers.length - 1;
};

const clearStoredTimeout = (id: number) => {
  clearTimeout(allTimers[id]);
};

app.use(cors());
app.post("/create/", (_, res) => {
  let newRoomId = generateRoomId();
  while (newRoomId in games) {
    newRoomId = generateRoomId();
  }
  games[newRoomId] = {
    players: {},
    characters: {},
    activePlayersList: [],
    state: null,
    timer: null,
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
    console.log(`${socket.id} joined ${roomId}`);
    socket.join(roomId);
    currentRoomId = roomId;
    const game = games[roomId];
    const playerIds = Object.keys(game.players);

    let name = generatePlayerName();
    let nameConflict = true;
    while (nameConflict) {
      nameConflict = false;

      for (let i = 0; i < playerIds.length; i++) {
        if (name === game.players[playerIds[i]].name) {
          nameConflict = true;
          name = generatePlayerName();
          break;
        }
      }
    }
    game.players[socket.id] = { name, ready: false };

    socket.emit("joinedRoom", game);
    socket.to(roomId).emit("newPlayer", { name }, socket.id);
  });

  socket.on("changeName", ({ name }: ChangeNameArgs) => {
    console.log(`${socket.id} is trying to change name to ${name}`);
    const game = games[currentRoomId!];
    game.players[socket.id].name = name;
    io.in(currentRoomId!).emit("changedName", name, socket.id);
  });

  socket.on("chooseCharacter", ({ character }: ChooseCharacterArgs) => {
    const game = games[currentRoomId!];

    if (game.characters[character]) {
      // emit error: character already taken
      return;
    }
    const oldCharacter = game.players[socket.id].character;
    if (oldCharacter !== undefined) {
      delete game.characters[oldCharacter];
    } else {
      game.activePlayersList.push(socket.id);
    }

    game.characters[character] = socket.id;
    game.players[socket.id].character = character;

    io.in(currentRoomId!).emit("choseCharacter", character, socket.id);
  });

  socket.on("chooseSpectate", () => {
    const game = games[currentRoomId!];

    const oldCharacter = game.players[socket.id].character;
    if (oldCharacter !== undefined) {
      game.activePlayersList.splice(
        game.activePlayersList.indexOf(socket.id, 1)
      );
      delete game.characters[oldCharacter];
    }

    io.in(currentRoomId!).emit("choseSpectate", socket.id);
  });

  socket.on("toggleReady", () => {
    const game = games[currentRoomId!];
    game.players[socket.id].ready = !game.players[socket.id].ready;
    io.in(currentRoomId!).emit("toggledReady", socket.id);

    const playerIds = Object.keys(game.players);
    for (let i = 0; i < playerIds.length; i++) {
      if (!game.players[playerIds[i]].ready) {
        // if was about to start game
        if (game.timer !== null) {
          clearStoredTimeout(game.timer);
          game.timer = null;
        }
        return;
      }
    }

    console.log(`about to start game ${currentRoomId}`);
    io.in(currentRoomId!).emit("aboutToStartGame");
    game.timer = setAndStoreTimeout(startGame, 5000);
  });

  const startGame = () => {
    const game = games[currentRoomId!];

    const gamePlayers: Record<string, GamePlayer> = {};
    const playerIds = Object.keys(game.players);

    for (let i = 0; i < playerIds.length; i++) {
      const playerId = playerIds[i];
      gamePlayers[playerId] = {
        currency: startingCurrency,
        properties: [],
        currentTile: 0,
      };
    }

    console.log(`starting game ${currentRoomId}`);

    startTurn({
      playerOrder: [...game.activePlayersList].sort(() => 0.5 - Math.random()),
      board: startingBoard,
      players: gamePlayers,
    });

    io.in(currentRoomId!).emit("startedGame", game.state);
  };

  const startTurn = (
    initialGameState: {
      playerOrder: string[];
      board: Board;
      players: Record<string, GamePlayer>;
    } | null
  ) => {
    const game = games[currentRoomId!];
    const state = game.state;

    let turn;

    if (state === null) {
      turn = 0;
    } else {
      const oldTurn = state.turn;

      turn = oldTurn + 1;
      if (turn === state.playerOrder.length) {
        turn = 0;
      }
    }

    const timer = setAndStoreTimeout(act, timers.startTurn);

    console.log(`starting turn`);

    game.state = {
      ...(initialGameState || state)!,
      turn,
      turnState: { timer, activity: "starting turn" } as StartTurnState,
      board: startingBoard,
    };
    console.log(JSON.stringify(game.state));
  };

  const act = () => {
    console.log(`player was too slow`);
  };

  socket.on("rollDice", () => {
    const game = games[currentRoomId!];
    const gameState = game.state!;
    if (gameState.playerOrder[gameState.turn] !== socket.id) {
      // not your turn
      return;
    }
    clearStoredTimeout(gameState.turnState.timer);

    const diceRoll = Math.ceil(Math.random() * 6);
    const timer = setAndStoreTimeout(() => {
      game.state!.turnState = {
        timer,
        activity: "moving",
        rolled: diceRoll,
        showTimer: false,
      } as MovingTurnState;

      io.in(currentRoomId!).emit("rolledDice", game.state!.turnState); // newTurnState event instead?
    }, timers.rollingDice);
    game.state!.turnState = {
      timer,
      showTimer: false,
    } as RollingDiceTurnState;
    io.in(currentRoomId!).emit("rollingDice", game.state!.turnState); // newTurnState event instead?
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

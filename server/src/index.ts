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
  Property,
  Utility,
  ActionData,
  ValueOf,
  Reaction,
  QuestionCollection,
  AnsweringQuestionTurnState,
  Answer,
} from "types";

import { generateRoomId, generatePlayerName } from "./generator";
import {
  startingBoard,
  currencies,
  timers,
  propertyBuyPrice,
  utilityBuyPrice,
  fullJailTerm,
  halfJailTerm,
  propertyQuestions,
  chanceSpinner,
  utilityQuestions,
  auctionQuestions,
  shuffledCopy,
} from "./constants";

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
        currency: currencies.starting,
        properties: [],
        utilities: [],
        currentTile: 0,
        jailed: 0,
      };
    }

    console.log(`starting game ${currentRoomId}`);

    const propertyQuestionDecks: QuestionCollection[] = propertyQuestions.map(
      shuffledCopy
    );
    const utilityQuestionDecks: QuestionCollection[] = utilityQuestions.map(
      shuffledCopy
    );
    const auctionQuestionDeck: QuestionCollection = shuffledCopy(
      auctionQuestions
    );

    startTurn({
      playerOrder: [...game.activePlayersList].sort(() => 0.5 - Math.random()),
      board: startingBoard,
      players: gamePlayers,
      propertyQuestionDecks,
      utilityQuestionDecks,
      auctionQuestionDeck,
    });

    // io.in(currentRoomId!).emit("startedGame", game.state);
  };

  const startTurn = (
    initialGameState: {
      playerOrder: string[];
      board: Board;
      players: Record<string, GamePlayer>;
      propertyQuestionDecks: QuestionCollection[];
      utilityQuestionDecks: QuestionCollection[];
      auctionQuestionDeck: QuestionCollection;
    } | null = null
  ) => {
    const game = games[currentRoomId!];
    const gameState = game.state;

    let turn;

    if (gameState === null) {
      turn = 0;
    } else {
      clearStoredTimeout(gameState.turnState.timer);
      const oldTurn = gameState.turn;

      turn = oldTurn + 1;
      if (turn === gameState.playerOrder.length) {
        turn = 0;
      }
    }

    const timer = setAndStoreTimeout(failedToAct, timers.startTurn);

    console.log(`starting turn`);

    game.state = {
      ...(initialGameState || gameState)!,
      turn,
      turnState: { timer, activity: "starting turn" } as StartTurnState,
    };

    if (game.state.players[game.state.playerOrder[game.state.turn]].jailed) {
    }

    io.in(currentRoomId!).emit("startedTurn", game.state);
  };

  const failedToAct = () => {
    const game = games[currentRoomId!];
    const gameState = game.state!;
    clearStoredTimeout(gameState.turnState.timer);
    console.log(`player was too slow`);

    // decide what to do based on turnState
  };

  socket.on("rollDice", () => {
    const game = games[currentRoomId!];
    const gameState = game.state!;
    if (gameState.playerOrder[gameState.turn] !== socket.id) {
      // not your turn
      return;
    }
    clearStoredTimeout(gameState.turnState.timer);

    const rollingDiceTimer = setAndStoreTimeout(moving, timers.rollingDice);

    gameState.turnState = {
      activity: "rolling dice",
      timer: rollingDiceTimer,
      showTimer: false,
    } as RollingDiceTurnState;

    io.in(currentRoomId!).emit("rollingDice", game.state!.turnState); // newTurnState event instead?
  });

  const moving = () => {
    const game = games[currentRoomId!];
    const gameState = game.state!;
    const diceRoll = Math.ceil(Math.random() * 6);
    clearStoredTimeout(gameState.turnState.timer);

    let newTile =
      (gameState.players[socket.id].currentTile + diceRoll) %
      gameState.board.length;
    gameState.players[socket.id].currentTile = newTile;
    let passedGo = false;

    if (newTile < diceRoll) {
      // passed GO
      passedGo = true;
      gameState.players[socket.id].currency += currencies.passGo;
    }

    const movingTimer = setAndStoreTimeout(moved, timers.moving);

    gameState.turnState = {
      timer: movingTimer,
      activity: "moving",
      rolled: diceRoll,
      showTimer: false,
    } as MovingTurnState;

    io.in(currentRoomId!).emit(
      "moving",
      gameState.turnState,
      newTile,
      passedGo ? currencies.passGo : 0,
      socket.id
    ); // newTurnState event instead?
  };

  const moved = () => {
    const game = games[currentRoomId!];
    const gameState = game.state!;

    clearStoredTimeout(gameState.turnState.timer);
    io.in(currentRoomId!).emit("moved", game.state!);
    acting();
  };

  const acting = () => {
    const game = games[currentRoomId!];
    const gameState = game.state!;

    const newTile = gameState.board[gameState.players[socket.id].currentTile];
    console.log(gameState.players[socket.id].currentTile);
    console.log("player landed on " + newTile.name);

    let data: ValueOf<ActionData> = null;

    switch (newTile.type) {
      case "property":
        data = {
          buyPrice: propertyBuyPrice(newTile as Property),
        };
        break;
      case "utility":
        data = { buyPrice: utilityBuyPrice() };
        break;
      case "jail":
        data = { fullBail: currencies.fullBail, halfBail: currencies.halfBail };
        break;
      case "auction":
        data = { bounty: currencies.auctionBounty };
        break;
      case "chance":
        game.state!.turnState = {
          activity: "acting",
          action: newTile.action,
          timer: setAndStoreTimeout(spinForChance, timers.nothing),
          showTimer: false,
        };
      case "go":
        game.state!.turnState = {
          activity: "acting",
          action: newTile.action,
          timer: setAndStoreTimeout(startTurn, timers.nothing),
          showTimer: false,
        };
        return;
      default:
        return;
      // return;
    }

    game.state!.turnState = {
      activity: "acting",
      action: newTile.action,
      timer: setAndStoreTimeout(failedToAct, timers.acting),
    };

    io.in(currentRoomId!).emit("acting", game.state!.turnState, data);
  };

  socket.on("reaction", (reaction: ValueOf<Reaction>) => {
    const game = games[currentRoomId!];
    const gameState = game.state!;

    clearStoredTimeout(gameState.turnState.timer);

    console.log(`received response ${reaction}`);

    switch (gameState.turnState.action) {
      case "buy property":
        if ((reaction as Reaction["buy property"]) === "accept") {
          // question time
          return askPropertyQuestion();
        }
        if ((reaction as Reaction["buy property"]) === "decline") {
          // next turn
          startTurn();
        }
        break;
      case "buy utility":
        if ((reaction as Reaction["buy utility"]) === "accept") {
          // question time
          return askUtilityQuestion();
        }
        if ((reaction as Reaction["buy utility"]) === "decline") {
          // next turn
          startTurn();
        }
        break;
      case "jail":
        if ((reaction as Reaction["jail"]) === "full") {
          // pay up, next turn
          return jail(0, currencies.fullBail);
        }
        if ((reaction as Reaction["jail"]) === "half") {
          // pay up, set as jailed for 3, next turn
          return jail(halfJailTerm, currencies.halfBail);
        }
        if ((reaction as Reaction["jail"]) === "stay") {
          // set as jailed for 6, next turn
          return jail(fullJailTerm, 0);
        }

        break;
      case "auction":
        if ((reaction as Reaction["auction"]) === "accept") {
          return askAuctionQuestion();
        }
        if ((reaction as Reaction["auction"]) === "decline") {
          startTurn();
        }
        break;
      default:
        return;
    }
  });

  const spinForChance = () => {
    const game = games[currentRoomId!];
    const gameState = game.state!;

    const spin = Math.random();
    let spinValue;
    for (let i = 0; i < chanceSpinner.length; i++) {
      spinValue = chanceSpinner[i].name;
      if (spin < chanceSpinner[i].maxValue) {
        break;
      }
    }
    console.log(`spun ${spin} ${spinValue}`);

    switch (spinValue) {
      case "Creativity":
        // add 100 to player's balance
        gameState.players[socket.id].currency += 100;
        break;
      case "Activity":
        // remove 100 to player's balance
        gameState.players[socket.id].currency -= 100;
        break;
      case "Service":
        // add 50 to everyone else's balance, subtracted from player's balance
        let total = 0;
        gameState.playerOrder.forEach((playerId) => {
          if (playerId === socket.id) {
            return;
          }
          gameState.players[playerId].currency += 50;
          total += 50;
        });

        gameState.players[socket.id].currency -= total;
        break;
    }
    io.in(currentRoomId!).emit("afterAction", gameState.players);
  };

  const jail = (turnsJailed: number, currencyLost: number) => {
    const game = games[currentRoomId!];
    const gameState = game.state!;

    gameState.players[socket.id].currency -= currencyLost;
    gameState.players[socket.id].jailed += turnsJailed;

    io.in(currentRoomId!).emit("afterAction", gameState.players);
  };

  const askQuestion = (questionDeck: QuestionCollection) => {
    const game = games[currentRoomId!];
    const gameState = game.state!;

    const question = questionDeck.splice(0, 1)[0];
    questionDeck.push(question);
    gameState.turnState = {
      activity: "answering question",
      question,
    } as AnsweringQuestionTurnState;
    io.in(currentRoomId!).emit("answeringQuestion", gameState.turnState);
  };

  const askPropertyQuestion = () => {
    const game = games[currentRoomId!];
    const gameState = game.state!;

    const currentTile = gameState.board[
      gameState.players[socket.id].currentTile
    ] as Property;
    const questionDeck =
      gameState.propertyQuestionDecks[currentTile.collection];
    askQuestion(questionDeck);
  };

  const askUtilityQuestion = () => {
    const game = games[currentRoomId!];
    const gameState = game.state!;

    const currentTile = gameState.board[
      gameState.players[socket.id].currentTile
    ] as Utility;
    const questionDeck = gameState.utilityQuestionDecks[currentTile.collection];
    askQuestion(questionDeck);
  };
  const askAuctionQuestion = () => {
    const game = games[currentRoomId!];
    const gameState = game.state!;
    askQuestion(gameState.auctionQuestionDeck);
  };

  socket.on("answerQuestion", (answer: Answer) => {
    const game = games[currentRoomId!];
    const gameState = game.state!;

    if (
      answer ===
      (gameState.turnState as AnsweringQuestionTurnState).question.correct
    ) {
      // buy the property
      const currentTilePosition = gameState.players[socket.id].currentTile;
      const currentTile = gameState.board[currentTilePosition];
      if (currentTile.type === "property") {
        gameState.players[socket.id].currency -= propertyBuyPrice(
          currentTile as Property
        );
        gameState.players[socket.id].properties.push(currentTilePosition);
        (currentTile as Property).ownerId = socket.id;
        io.in(currentRoomId!).emit("updateGameState", gameState);
        startTurn();
        return;
      }
      if (currentTile.type === "utility") {
        gameState.players[socket.id].currency -= utilityBuyPrice();
        gameState.players[socket.id].utilities.push(currentTilePosition);
        (currentTile as Utility).ownerId = socket.id;
        io.in(currentRoomId!).emit("updateGameState", gameState);
        startTurn();
        return;
      }
      if (currentTile.type === "auction") {
        // can auction now
        // auction time
        gameState.turnState = {
          timer: setAndStoreTimeout(failedToAct, timers.auctioning),
          activity: "auctioning",
        };
        return io
          .in(currentRoomId!)
          .emit("updateTurnState", gameState.turnState);
      }
    }
    // else,
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

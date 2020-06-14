import io from "socket.io-client";
import { SetStateAction, Dispatch } from "react";
import {
  JoinRoomArgs,
  ChangeNameArgs,
  Game,
  Player,
  GameError,
  ChooseCharacterArgs,
  Character,
  GameState,
  TurnState,
  ValueOf,
  ActionData,
  Reaction,
  GamePlayer,
  Answer,
} from "./types";

import update from "immutability-helper";

const server =
  process.env.NODE_ENV === "production"
    ? "https://orgo-monopoly-server.herokuapp.com"
    : "http://localhost:8000";
export const socket = io(server);

interface Updates {
  setGame: Dispatch<SetStateAction<Game | GameError>>;
  setMe: Dispatch<SetStateAction<string | null>>;
}
export const subscribeToUpdates = ({ setGame, setMe }: Updates) => {
  console.log(`subscribing to updates`);
  if (socket.id !== undefined) {
    setMe(socket.id);
  }
  socket.on("connect", () => {
    setMe(socket.id);
  });
  console.log(socket.id);
  setMe(socket.id);
  socket.on("errorNoRoom", () => {
    setGame(() => "not found");
  });
  socket.on("joinedRoom", (game: Game) => {
    console.log("joined room");
    console.log(game);
    setGame(() => game);
  });
  socket.on("newPlayer", (player: Player, playerId: string) => {
    setGame((g) => update(g, { players: { [playerId]: { $set: player } } }));
  });
  socket.on("removePlayer", (playerId: string) => {
    setGame((g) => update(g, { players: { $unset: [playerId] } }));
  });

  socket.on("changedName", (name: string, playerId: string) => {
    setGame((g) =>
      update(g, { players: { [playerId]: { name: { $set: name } } } })
    );
  });

  socket.on("choseCharacter", (character: Character, playerId: string) => {
    setGame((g) => {
      if (g === "loading" || g === "not found") {
        return g;
      }
      const oldCharacter = g.players[playerId].character;

      return update(g, {
        characters: {
          $unset: [oldCharacter!],
          [character]: { $set: playerId },
        },
        activePlayersList: {
          $push: oldCharacter === undefined ? [playerId] : [],
        },
        players: { [playerId]: { character: { $set: character } } },
      });
    });
  });
  socket.on("choseSpectate", (playerId: string) => {
    setGame((g) => {
      if (g === "loading" || g === "not found") {
        return g;
      }
      const oldCharacter = g.players[playerId].character;
      if (oldCharacter === undefined) {
        return g;
      }
      return update(g, {
        characters: { $unset: [oldCharacter] },
        activePlayersList: {
          $splice: [[g.activePlayersList.indexOf(playerId), 1]],
        },
        players: { [playerId]: { $unset: ["character"] } },
      });
    });
  });

  socket.on("toggledReady", (playerId: string) => {
    setGame((g) => {
      if (g === "loading" || g === "not found") {
        return g;
      }
      return update(g, {
        players: {
          [playerId]: { ready: { $set: !g.players[playerId].ready } },
        },
      });
    });
  });

  socket.on(
    "moving",
    (
      turnState: TurnState,
      newTile: number,
      passedGoBonus: number,
      playerId: string
    ) => {
      setGame((g) =>
        update(g, {
          state: {
            turnState: { $set: turnState },
            players: {
              [playerId]: {
                currentTile: { $set: newTile },
                currency: { $apply: (v) => v + passedGoBonus },
              },
            },
          },
        })
      );
    }
  );

  socket.on("updateGameState", (gameState: GameState) => {
    setGame((g) => update(g, { state: { $set: gameState } }));
  });
};

export const createRoom = async () => {
  const response = await fetch(`${server}/create`, { method: "POST" });
  const data = await response.json();
  return data.roomId;
};

export const joinRoom = ({ roomId }: JoinRoomArgs) => {
  socket.emit("joinRoom", { roomId });
};

export const changeName = ({ name }: ChangeNameArgs) => {
  socket.emit("changeName", { name });
};

export const chooseCharacter = ({ character }: ChooseCharacterArgs) => {
  socket.emit("chooseCharacter", { character });
};
export const chooseSpectate = () => {
  socket.emit("chooseSpectate");
};

export const toggleReady = () => {
  socket.emit("toggleReady");
};

export const rollDice = () => {
  socket.emit("rollDice");
};

export const respond = (reaction: ValueOf<Reaction>) => {
  console.log(`responding with ${reaction}`);
  socket.emit("reaction", reaction);
};

export const answerQuestion = (answer: Answer) => {
  socket.emit("answerQuestion", answer);
};

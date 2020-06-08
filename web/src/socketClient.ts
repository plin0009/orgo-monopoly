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
} from "../../types";

import update from "immutability-helper";

const server = "http://localhost:8000";
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
    console.log(JSON.stringify(game));
    setGame(() => game);
  });
  socket.on("newPlayer", (id: string, player: Player) => {
    setGame((g) => update(g, { players: { [id]: { $set: player } } }));
  });
  socket.on("removePlayer", (id: string) => {
    setGame((g) => update(g, { players: { $unset: [id] } }));
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
        characterOrder: {
          $splice: [
            [
              g.characterOrder.indexOf(oldCharacter!),
              oldCharacter === undefined ? 0 : 1,
            ],
          ],
          $push: [character],
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
        characterOrder: {
          $splice: [[g.characterOrder.indexOf(oldCharacter), 1]],
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

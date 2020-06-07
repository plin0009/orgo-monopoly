import io from "socket.io-client";
import { SetStateAction, Dispatch } from "react";
import {
  JoinRoomArgs,
  ChangeNameArgs,
  Game,
  Player,
  GameError,
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

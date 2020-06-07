import React, { useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { subscribeToUpdates, joinRoom, changeName } from "../socketClient";
import { Game, GameError } from "../../../types";

interface RoomPageParams {
  roomId: string;
}

const RoomPage = ({ match }: RouteComponentProps<RoomPageParams>) => {
  const roomId = match.params.roomId;
  const [game, setGame] = useState<Game | GameError>("loading");
  const [me, setMe] = useState<string | null>(null);

  // const [nameInput, setNameInput] = useState<string>("");

  useEffect(() => {
    subscribeToUpdates({ setGame, setMe });
    joinRoom({ roomId });
  }, [roomId]);

  return (
    <div className="App">
      {game === "loading" ? (
        <h1>Loading</h1>
      ) : game === "not found" ? (
        <h1>Room not found</h1>
      ) : (
        <div>
          <h1>Welcome{me !== null ? `, ${game.players[me].name}!` : "!"}</h1>
          <h2>Players</h2>
          {Object.keys(game.players).map((id) => (
            <p>{game.players[id].name}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomPage;

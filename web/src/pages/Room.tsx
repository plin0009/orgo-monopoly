import React, { useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import {
  subscribeToUpdates,
  joinRoom,
  changeName,
  chooseCharacter,
  chooseSpectate,
  toggleReady,
} from "../socketClient";
import { Game, GameError } from "../../../types";
import { characters } from "../constants";

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
          {Object.keys(game.players).map((playerId) => (
            <p key={playerId}>
              {game.players[playerId].name} is{" "}
              {game.players[playerId].character || "spectating"}
            </p>
          ))}
          <div>
            <h2>Choose character</h2>
            {characters.map((character) => (
              <button
                key={character}
                onClick={() => {
                  chooseCharacter({ character });
                }}
                disabled={game.characterOrder.includes(character)}
              >
                {character}
              </button>
            ))}
            <button
              onClick={() => {
                chooseSpectate();
              }}
            >
              Spectate
            </button>
          </div>
          <div>
            <button
              onClick={() => {
                toggleReady();
              }}
            >
              Ready
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;

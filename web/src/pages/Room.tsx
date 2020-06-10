import React, { useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import {
  subscribeToUpdates,
  joinRoom,
  changeName,
  chooseCharacter,
  chooseSpectate,
  toggleReady,
  rollDice,
} from "../socketClient";
import { Game, GameError, MovingTurnState } from "../../../types";
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
      ) : game.state === null ? (
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
                disabled={character in game.characters}
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
      ) : game.state.turnState.activity === "starting turn" ? (
        <div>
          <h1>
            It's {game.players[game.state.playerOrder[game.state.turn]].name}
            's turn
          </h1>
          {me === game.state.playerOrder[game.state.turn] ? (
            <button
              onClick={() => {
                rollDice();
              }}
            >
              Roll
            </button>
          ) : null}
        </div>
      ) : game.state.turnState.activity === "rolling dice" ? (
        <div>
          <h1>Rolling dice</h1>
        </div>
      ) : game.state.turnState.activity === "moving" ? (
        <div>
          <h1>
            {`${game.players[game.state.playerOrder[game.state.turn]].name}
            rolled a ${(game.state.turnState as MovingTurnState).rolled}`}
          </h1>
        </div>
      ) : null}
    </div>
  );
};

export default RoomPage;

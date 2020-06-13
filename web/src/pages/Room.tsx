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
  respond,
  answerQuestion,
} from "../socketClient";
import {
  Game,
  GameError,
  MovingTurnState,
  ValueOf,
  ActionData,
  AnsweringQuestionTurnState,
  MultipleChoiceQuestion,
} from "../../../types";
import { characters } from "../constants";
import Card, { ChoiceCard } from "../components/Card";
import Board from "../components/Board";

interface RoomPageParams {
  roomId: string;
}

const RoomPage = ({ match }: RouteComponentProps<RoomPageParams>) => {
  const roomId = match.params.roomId;
  const [game, setGame] = useState<Game | GameError>("loading");
  const [actionData, setActionData] = useState<ValueOf<ActionData> | null>(
    null
  );
  const [me, setMe] = useState<string | null>(null);

  const [changingName, setChangingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");

  useEffect(() => {
    subscribeToUpdates({ setGame, setActionData, setMe });
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
          <button
            onClick={() => {
              setChangingName((c) => !c);
            }}
          >
            Edit name
          </button>
          {changingName ? (
            <div>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <button
                onClick={() => {
                  changeName({ name: nameInput });
                }}
              >
                Change name
              </button>
            </div>
          ) : null}
          <h2>Players</h2>
          {Object.keys(game.players).map((playerId) => (
            <p key={playerId}>
              {game.players[playerId].name} is{" "}
              {game.players[playerId].character || "spectating"}
              {game.players[playerId].ready ? " and ready" : " and not ready"}
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
      ) : (
        <div className="gameScreen">
          <div className="leftGameScreen">
            <div className="board">
              <div className="boardImageWrapper">
                <Board
                  markers={game.state.playerOrder.map((playerId) => ({
                    character: game.players[playerId].character!,
                    position: game.state!.players[playerId].currentTile,
                  }))}
                />
              </div>
            </div>

            <div className="statusBar">
              {game.state.turnState.activity === "starting turn" ? (
                <>
                  <h1>
                    {`It's 
              ${
                game.players[game.state.playerOrder[game.state.turn]].name
              }'s turn`}
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
                </>
              ) : game.state.turnState.activity === "rolling dice" ? (
                <>
                  <h1>Rolling dice</h1>
                </>
              ) : game.state.turnState.activity === "moving" ? (
                <>
                  <h1>
                    {`${
                      game.players[game.state.playerOrder[game.state.turn]].name
                    }
            rolled a ${(game.state.turnState as MovingTurnState).rolled}`}
                  </h1>
                </>
              ) : null}
            </div>

            {me === game.state.playerOrder[game.state.turn] &&
            game.state.turnState.activity === "answering question" ? (
              <ChoiceCard
                color="#fff"
                title={
                  (game.state.turnState as AnsweringQuestionTurnState).question
                    .questionText
                }
                description="Choose the best answer."
                choices={[
                  (game.state.turnState as AnsweringQuestionTurnState).question
                    .correct,
                  ...((game.state.turnState as AnsweringQuestionTurnState)
                    .question as MultipleChoiceQuestion).wrong,
                ]
                  .sort(() => 0.5 - Math.random())
                  .map((answer) => ({
                    name: answer,
                    onClick: () => answerQuestion(answer),
                  }))}
              />
            ) : null}

            {me === game.state.playerOrder[game.state.turn] &&
            game.state.turnState.action !== undefined &&
            game.state.turnState.action !== "nothing" ? (
              game.state.turnState.action === "buy property" ? (
                <ChoiceCard
                  color="#0ff"
                  title={
                    game.state.board[
                      game.state.players[
                        game.state.playerOrder[game.state.turn]
                      ].currentTile
                    ].name
                  }
                  description={`Build a lab bench on ${
                    game.state.board[
                      game.state.players[
                        game.state.playerOrder[game.state.turn]
                      ].currentTile
                    ].name
                  } for ${
                    (actionData as ActionData["buy property"]).buyPrice
                  } C?`}
                  choices={[
                    { name: "Build", onClick: () => respond("accept") },
                    { name: "Decline", onClick: () => respond("decline") },
                  ]}
                />
              ) : game.state.turnState.action === "buy utility" ? (
                <ChoiceCard
                  color="#0ff"
                  title={
                    game.state.board[
                      game.state.players[
                        game.state.playerOrder[game.state.turn]
                      ].currentTile
                    ].name
                  }
                  description={`Purchase ${
                    game.state.board[
                      game.state.players[
                        game.state.playerOrder[game.state.turn]
                      ].currentTile
                    ].name
                  } for ${
                    (actionData as ActionData["buy utility"]).buyPrice
                  } C?`}
                  choices={[
                    { name: "Purchase", onClick: () => respond("accept") },
                    { name: "Decline", onClick: () => respond("decline") },
                  ]}
                />
              ) : game.state.turnState.action === "chance" ? (
                <Card color="#0ff" title="CAS">
                  <h2>Drawing a CAS card...</h2>
                </Card>
              ) : game.state.turnState.action === "jail" ? (
                <ChoiceCard
                  color="#0ff"
                  title="EE"
                  description={`You landed on the EE tile, sentenced to six turns of EE labour. You can bail for ${
                    (actionData as ActionData["jail"]).fullBail
                  } C, or attend EE meetings for three turns and ${
                    (actionData as ActionData["jail"]).halfBail
                  } C.`}
                  choices={[
                    { name: "Bail out", onClick: () => respond("full") },
                    { name: "Attend meetings", onClick: () => respond("half") },
                    { name: "Stay in EE jail", onClick: () => respond("stay") },
                  ]}
                />
              ) : game.state.turnState.action === "auction" ? (
                <ChoiceCard
                  color="#0ff"
                  title="TOK"
                  description={`You landed on the TOK tile. If you choose to trade properties with someone else, both parties receive a bounty of ${
                    (actionData as ActionData["auction"]).bounty
                  } C.`}
                  choices={[
                    { name: "Auction", onClick: () => respond("accept") },
                    { name: "Decline", onClick: () => respond("decline") },
                  ]}
                />
              ) : null
            ) : null}
          </div>
          <div className="rightGameScreen">
            <h1>Players</h1>
            {game.state.playerOrder.map((playerId) => {
              return (
                <h1 key={playerId}>
                  {`${game.players[playerId].name} is at tile 
              ${game.state!.players[playerId].currentTile}: 
              ${
                game.state!.board[game.state!.players[playerId].currentTile]
                  .name
              }`}
                </h1>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;

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
  StartTurnState,
  ValueOf,
  ActionData,
  AnsweringQuestionTurnState,
} from "../types";
import { characters, colorOfTile } from "../constants";
import Card, { ChoiceCard } from "../components/Card";
import Board from "../components/Board";
import PlayerTag from "../components/PlayerTag";
import CharacterButton from "../components/CharacterButton";

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

          <h2>Choose character</h2>
          <div className="chooseCharacter">
            {characters.map((character) => (
              <CharacterButton
                key={character}
                name={character}
                onClick={() => {
                  chooseCharacter({ character });
                }}
                taken={
                  game.characters[character] === undefined
                    ? undefined
                    : game.players[game.characters[character]!].name
                }
                ready={
                  game.characters[character] === undefined
                    ? false
                    : game.players[game.characters[character]!].ready
                }
                chosen={game.characters[character] === me}
              />
            ))}
          </div>
          <div>
            <button
              onClick={() => {
                chooseSpectate();
              }}
            >
              Spectate
            </button>
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
              <h1>{game.state.log[game.state.log.length - 1]}</h1>
              {me === game.state.playerOrder[game.state.turn] &&
              game.state.turnState.activity === "starting turn" ? (
                <div>
                  <button
                    onClick={() => rollDice()}
                    disabled={
                      (game.state.turnState as StartTurnState).options.roll ===
                      false
                    }
                  >
                    Roll
                  </button>
                  <button
                    onClick={() => {}}
                    disabled={
                      (game.state.turnState as StartTurnState).options
                        .upgrade === false
                    }
                  >
                    Upgrade
                  </button>
                  <button
                    onClick={() => {}}
                    disabled={
                      (game.state.turnState as StartTurnState).options.sell ===
                      false
                    }
                  >
                    Sell
                  </button>
                </div>
              ) : null}
            </div>

            {me === game.state.playerOrder[game.state.turn] &&
            game.state.turnState.activity === "answering question" ? (
              <ChoiceCard
                color={colorOfTile(
                  game.state.board[game.state.players[me].currentTile]
                ).toCSS(true)}
                title={
                  (game.state.turnState as AnsweringQuestionTurnState)
                    .questionPrompt.questionText
                }
                description="Choose the best answer."
                choices={(game.state!
                  .turnState as AnsweringQuestionTurnState).questionPrompt.choices?.map(
                  (answer) => ({
                    name: answer,
                    onClick: () => answerQuestion(answer),
                  })
                )}
              />
            ) : null}

            {me === game.state.playerOrder[game.state.turn] &&
            game.state.turnState.action !== undefined &&
            game.state.turnState.action !== "nothing" ? (
              game.state.turnState.action === "buy property" ? (
                <ChoiceCard
                  color={colorOfTile(
                    game.state.board[game.state.players[me].currentTile]
                  ).toCSS(true)}
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
                  color={colorOfTile(
                    game.state.board[game.state.players[me].currentTile]
                  ).toCSS(true)}
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
                <Card
                  color={colorOfTile(
                    game.state.board[game.state.players[me].currentTile]
                  ).toCSS(true)}
                  title="CAS"
                >
                  <h2>Drawing a CAS card...</h2>
                </Card>
              ) : game.state.turnState.action === "jail" ? (
                <ChoiceCard
                  color={colorOfTile(
                    game.state.board[game.state.players[me].currentTile]
                  ).toCSS(true)}
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
                  color={colorOfTile(
                    game.state.board[game.state.players[me].currentTile]
                  ).toCSS(true)}
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
            <div>
              <h1>Players</h1>
              {game.state.playerOrder.map((playerId) => {
                return (
                  <PlayerTag
                    player={game.players[playerId]}
                    gamePlayer={game.state!.players[playerId]}
                  />
                );
              })}
            </div>
            <h1>Log</h1>
            <div className="log">
              {game.state.log.map((message, index) => (
                <p key={index}>{message}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;

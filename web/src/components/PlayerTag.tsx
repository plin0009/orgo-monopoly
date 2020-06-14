import React from "react";
import { Player, GamePlayer } from "../types";
import { characterColors } from "../constants";

interface PlayerTagProps {
  player: Player;
  gamePlayer: GamePlayer;
}

const PlayerTag: React.FC<PlayerTagProps> = ({ player, gamePlayer }) => {
  return (
    <div className="playerTag">
      <p
        className="playerTagName"
        style={{ color: characterColors[player.character!].toCSS(true) }}
      >
        {player.name}
      </p>
      <p>{gamePlayer.currency} C</p>
    </div>
  );
};

export default PlayerTag;

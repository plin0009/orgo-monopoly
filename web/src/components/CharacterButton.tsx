import React from "react";
import { Character } from "../types";
import { characterColors } from "../constants";

interface CharacterButtonProps {
  name: Character;
  onClick: () => void;
  taken?: string;
  ready: boolean;
  chosen: boolean;
}
const CharacterButton: React.FC<CharacterButtonProps> = ({
  name,
  onClick,
  taken,
  ready,
  chosen,
}) => {
  return (
    <div>
      <button
        onClick={onClick}
        disabled={taken !== undefined}
        className="characterButton"
        style={{ backgroundColor: characterColors[name].toCSS(true) }}
      >
        <img
          src={`/assets/${name}.png`}
          alt={name}
          style={{ maxWidth: "100%" }}
        />
      </button>
      <p style={{ fontWeight: taken === undefined ? "normal" : "bold" }}>
        {taken || "-"} {chosen ? "(you)" : ""} {ready ? "(ready)" : ""}
      </p>
    </div>
  );
};

export default CharacterButton;

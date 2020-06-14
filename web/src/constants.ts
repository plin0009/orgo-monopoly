import paper from "paper";
import { Character, Tile, Property } from "./types";

export const characters: Character[] = ["Alfred", "Benny", "Nat", "Hal"];

export const characterColors: Record<Character, paper.Color> = {
  Alfred: new paper.Color(168 / 255, 60 / 255, 50 / 255),
  Benny: new paper.Color(109 / 255, 37 / 255, 147 / 255),
  Nat: new paper.Color(150 / 255, 176 / 255, 64 / 255),
  Hal: new paper.Color(61 / 255, 104 / 255, 137 / 255),
};

export const propertyColors: paper.Color[] = [
  new paper.Color(38 / 255, 161 / 255, 186 / 255),
  new paper.Color(60 / 255, 149 / 255, 198 / 255),
  new paper.Color(70 / 255, 112 / 255, 200 / 255),
  new paper.Color(71 / 255, 63 / 255, 196 / 255),
  new paper.Color(121 / 255, 72 / 255, 198 / 255),
  new paper.Color(168 / 255, 76 / 255, 198 / 255),
  new paper.Color(199 / 255, 83 / 255, 169 / 255),
  new paper.Color(195 / 255, 75 / 255, 123 / 255),
];

export const colorOfTile = (tile: Tile) => {
  switch (tile.type) {
    case "property":
      return propertyColors[(tile as Property).collection];
    case "utility":
      return new paper.Color(0, 0, 0);
    case "jail":
      return new paper.Color(0.3, 0.3, 0.3);
    case "auction":
      return new paper.Color(228 / 255, 204 / 255, 237 / 255);
  }
  return new paper.Color(0, 0, 0);
};

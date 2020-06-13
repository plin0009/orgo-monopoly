import paper from "paper";
import { Character } from "./types";

export const characters: Character[] = ["Alfred", "Benny", "Nat", "Hal"];

export const characterColors: Record<Character, paper.Color> = {
  Alfred: new paper.Color(168 / 255, 60 / 255, 50 / 255),
  Benny: new paper.Color(109 / 255, 37 / 255, 147 / 255),
  Nat: new paper.Color(150 / 255, 176 / 255, 64 / 255),
  Hal: new paper.Color(61 / 255, 104 / 255, 137 / 255),
};

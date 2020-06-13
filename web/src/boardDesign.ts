import { Character } from "../../types";
import { characters } from "./constants";

export const boardWidth = 2048;
export const boardHeight = 1582;

export const characterSize = 25;

const verticalCoords = [140, 310, 472, 634, 802, 965, 1126, 1288, 1454];
const horizontalCoords = [351, 524, 686, 850, 1016, 1184, 1348, 1512, 1688];

export const getMarkerPoint = (position: number, character: Character) => {
  let x = boardWidth / 2;
  let y = boardHeight / 2;
  if (position <= 8) {
    x = horizontalCoords[0];
    y = verticalCoords[8 - position];
  } else if (position <= 16) {
    x = horizontalCoords[position - 8];
    y = verticalCoords[0];
  } else if (position <= 24) {
    x = horizontalCoords[8];
    y = verticalCoords[position - 16];
  } else if (position <= 32) {
    x = horizontalCoords[32 - position];
    y = verticalCoords[8];
  }
  x += charactersX[character];
  y += (characters.indexOf(character) % 2 ? -0.5 : 0.5) * spreadY;
  return { x, y };
};

const spreadX = 30;
const spreadY = 30;

const charactersX = {
  Alfred: spreadX * -1.5,
  Benny: spreadX * -0.5,
  Nat: spreadX * 0.5,
  Hal: spreadX * 1.5,
};


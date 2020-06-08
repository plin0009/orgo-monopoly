export interface Player {
  name: string;
  character?: Character;
  ready: boolean;
}
export type Players = Record<string, Player>;
export type Character = "a" | "b" | "c" | "d" | "e";
export type Characters = {
  [P in Character]?: string;
};

export type Turn = number;

export interface JoinRoomArgs {
  roomId: string;
}

export interface ChangeNameArgs {
  name: string;
}

export interface ChooseCharacterArgs {
  character: Character;
}

export interface Game {
  players: Players;
  characters: Characters;
  characterOrder: Character[];
  state: GameState | null;
}

export interface GameState {
  turn: Turn;
}

export type GameError = "loading" | "not found";

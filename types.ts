export interface Player {
  name: string;
}
export type Players = Record<string, Player>;

export type Turn = number | null;

export interface JoinRoomArgs {
  roomId: string;
}

export interface ChangeNameArgs {
  name: string;
}

export interface Game {
  players: Players;
  turn: Turn;
}

export type GameError = "loading" | "not found";

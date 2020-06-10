export interface JoinRoomArgs {
  roomId: string;
}

export interface ChangeNameArgs {
  name: string;
}

export interface ChooseCharacterArgs {
  character: Character;
}

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

export interface Game {
  players: Players;
  characters: Characters;
  activePlayersList: string[];
  state: GameState | null;
  timer: number | null;
}

export interface GameState {
  playerOrder: string[];
  turn: Turn;
  turnState: TurnState;
  players: Record<string, GamePlayer>;
  board: Board;
}

export type Turn = number;

export type TurnStateActivity =
  | "starting turn"
  | "staying in jail"
  | "rolling dice"
  | "moving"
  | "deciding"
  | "buying property";

export interface TurnState {
  activity: TurnStateActivity;
  timer: number;
}
export interface StartTurnState extends TurnState {
  activity: "starting turn";
}
export interface JailedTurnState extends TurnState {
  activity: "staying in jail";
  showTimer: false;
}
export interface RollingDiceTurnState extends TurnState {
  activity: "rolling dice";
  showTimer: false;
}
export interface MovingTurnState extends TurnState {
  activity: "moving";
  rolled: number;
  showTimer: false;
}
export interface DecidingTurnState extends TurnState {
  activity: "deciding";
  action: string;
}
export interface BuyPropertyState extends TurnState {
  activity: "buying property";
  question: Question;
}

export interface GamePlayer {
  currency: number;
  properties: number[];
  currentTile: number;
}

export type Board = Tile[];

export interface Tile {
  name: string;
}

export interface Property extends Tile {
  baseValue: number;
  collection: number;
  upgrade: number;
  ownerId?: string;
}

export type QuestionType = "multiple choice" | "input";
export type Answer = string;

export interface Question {
  questionType: QuestionType;
  questionText: string;
  correct: Answer;
}

export interface MultipleChoiceQuestion extends Question {
  questionType: "multiple choice";
  wrong: Answer[];
}

export interface InputQuestion extends Question {
  questionType: "input";
}

export type QuestionCollection = Question[];

export type GameError = "loading" | "not found";

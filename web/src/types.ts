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
export type Character = "Alfred" | "Benny" | "Hal" | "Nat";
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
  propertyQuestionDecks: QuestionCollection[];
  utilityQuestionDecks: QuestionCollection[];
  auctionQuestionDeck: QuestionCollection;
}

export type Turn = number;

export type TurnStateActivity =
  | "starting turn"
  | "staying in jail"
  | "rolling dice"
  | "moving"
  | "acting"
  | "answering question"
  | "auctioning";

export type Action =
  | "buy property"
  | "buy utility"
  | "chance"
  | "jail"
  | "auction"
  | "nothing";

export type Reaction = {
  "buy property": "accept" | "decline";
  "buy utility": "accept" | "decline";
  chance: null;
  jail: "stay" | "half" | "full";
  auction: "accept" | "decline";
  nothing: null;
};

export interface TurnState {
  activity: TurnStateActivity;
  timer: number;
  action?: Action;
  showTimer?: boolean;
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
export interface ActingTurnState extends TurnState {
  activity: "acting";
  action: Action;
}

export interface ActionData {
  "buy property": {
    buyPrice: number;
  };
  "buy utility": { buyPrice: number };
  chance: null;
  jail: {
    fullBail: number;
    halfBail: number;
  };
  auction: { bounty: number };
  nothing: null;
}

export type ValueOf<
  T,
  U = {
    [K in keyof T]: T[K];
  }
> = U[keyof U];

export interface AnsweringQuestionTurnState extends TurnState {
  activity: "answering question";
  question: Question;
}

export interface GamePlayer {
  currency: number;
  properties: number[];
  utilities: number[];
  currentTile: number;
  jailed: number;
}

export type Board = Tile[];

export interface Tile {
  name: string;
  type: TileType;
  action: Action;
}

export type TileType =
  | "property"
  | "utility"
  | "chance"
  | "jail"
  | "auction"
  | "go";

export interface Property extends Tile {
  type: "property";
  action: "buy property";
  baseValue: number;
  collection: number;
  upgrade: number;
  ownerId?: string;
}

export interface Utility extends Tile {
  type: "utility";
  action: "buy utility";
  collection: number;
  ownerId?: string;
}

export interface Chance extends Tile {
  type: "chance";
  action: "chance";
}
export interface Jail extends Tile {
  type: "jail";
  action: "jail";
}
export interface Auction extends Tile {
  type: "auction";
  action: "auction";
}
export interface Go extends Tile {
  type: "go";
  action: "nothing";
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

export type Spinner = {
  name: string;
  maxValue: number;
}[];

export type GameError = "loading" | "not found";

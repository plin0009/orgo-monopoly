const adverbs = ["Never", "Always"];
const verbs = ["Eat", "Slice"];
const adjectives = ["Shredded", "Whole"];
const nouns = ["Wheat", "Apples"];

const animals = [
  "Alpaca",
  "Bear",
  "Cat",
  "Dog",
  "Eel",
  "Flounder",
  "Giraffe",
  "Hyena",
  "Iguana",
];

const choose = (list: string[]) =>
  list[Math.floor(Math.random() * list.length)];

export const generateRoomId = () =>
  `${choose(adverbs)}${choose(verbs)}${choose(adjectives)}${choose(nouns)}`;

export const generatePlayerName = () => `${choose(animals)}`;

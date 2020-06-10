import {
  Board,
  Tile,
  Property,
  Answer,
  MultipleChoiceQuestion,
  QuestionCollection,
} from "../../types";

const collectionToBaseValue = (collection: number) => {
  return 100 + collection * 50;
};

const property = (name: string, collection: number) =>
  ({
    name,
    collection,
    baseValue: collectionToBaseValue(collection),
    upgrade: 0,
  } as Property);

const go = () => ({ name: "GO" } as Tile);
const utility = (name: string) => ({ name } as Tile);
const chance = () => ({ asdasd: 1, name: "CAS" } as Tile);
const jail = () => ({ name: "EE" } as Tile);
const auction = () => ({ name: "TOK" } as Tile);

export const startingCurrency = 1000;

export const timers = {
  startTurn: 10000,
  rollingDice: 3000,
  rolledDice: 5000,
  deciding: 15000,
  answeringQuestion: (collection: number) => 30000 + collection * 5000,
  jailed: 5000,
  auctioning: 45000,
  chance: 10000,
};

export const startingBoard: Board = [
  go(),
  property("Alkane Avenue", 0),
  property("Benzene Boulevard", 0),
  property("Carboxylic Crescent", 0),
  utility("Utility 1"),
  property("Thermoset Trail", 1),
  property("Plastic Pines", 1),
  property("Monomer Meadow", 1),
  chance(),
  property("Trans Tunnel", 2),
  property("E-Z Exit", 2),
  property("Cis Crossing", 2),
  utility("Utility 2"),
  property("Polarimeter Parkway", 3),
  property("Enantiomer Express", 3),
  property("Chiral Center", 3),
  jail(),
  property("Reaction Ranch", 4),
  property("Racemic Route", 4),
  property("Radical Road", 4),
  utility("Utility 3"),
  property("Nucleophilic North", 5),
  property("Electrophilic East", 5),
  property("Substitution South", 5),
  auction(),
  property("Name Lane", 6),
  property("Line Lane", 6),
  property("Chain Lane", 6),
  utility("Utility 4"),
  property("Molecule Manor", 7),
  property("Compound Castle", 7),
  property("Pathway Palace", 7),
];

const multipleChoiceQuestion = (
  questionText: string,
  correct: Answer,
  wrong: Answer[]
) => ({ questionText, correct, wrong } as MultipleChoiceQuestion);

export const questions: QuestionCollection[] = [
  [
    multipleChoiceQuestion(
      "How many covalent bonds can a carbon atom form?",
      "4",
      ["3", "2", "6"]
    ),
    multipleChoiceQuestion(
      "What is the name for the delocalisation of electrons within a structure?",
      "Resonance",
      ["Resonant", "Revolvement", "Aromatic"]
    ),
    multipleChoiceQuestion(
      "Which type of bond is a saturated bond?",
      "Alkane",
      ["Alkene", "Alkyne", "Aliphatic"]
    ),
    multipleChoiceQuestion(
      "The empirical and molecular formulas of ethane are the same.",
      "False",
      ["True"]
    ),
    multipleChoiceQuestion(
      "Which carbon has a nitrile bond in most compounds?",
      "carbon 1",
      ["terminal carbon", "any carbon", "middle carbon"]
    ),
  ],
  [
    multipleChoiceQuestion("Monomers need to have unsaturation.", "True", [
      "False",
    ]),
  ],
  [],
  [],
  [],
  [],
  [],
  [],
];

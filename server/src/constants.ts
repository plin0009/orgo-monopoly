import {
  Board,
  Go,
  Chance,
  Jail,
  Auction,
  Property,
  Answer,
  MultipleChoiceQuestion,
  QuestionCollection,
  Utility,
  Spinner,
  QuestionReference,
} from "./types";

const collectionToBaseValue = (collection: number) => {
  return currencies.propertyBase + collection * currencies.propertyBonus;
};

const toNearestFive = (value: number) => Math.ceil(value / 5) * 5;
const propertyValue = ({ baseValue, upgrade }: Property) => {
  let multiplier = 1;
  switch (upgrade) {
    case 2:
      multiplier += 0.7;
    case 1:
      multiplier += 0.5;
  }
  return baseValue * multiplier;
};
const propertyUpgradedValue = ({ baseValue, upgrade }: Property) => {
  let multiplier = 1;
  switch (upgrade) {
    case 1:
      multiplier += 0.7;
    case 0:
      multiplier += 0.5;
  }
  return baseValue * multiplier;
};

export const propertyBuyPrice = (p: Property) => p.baseValue;
export const propertyUpgradePrice = (p: Property) => {
  switch (p.upgrade) {
    case 0:
      return p.baseValue * 0.5;
    case 1:
      return p.baseValue * 0.7;
  }
  return 0;
};
export const propertySellValue = (p: Property) =>
  valueToSellPrice(propertyValue(p));
export const propertyRentValue = (p: Property) =>
  valueToRentPrice(propertyValue(p));

export const propertyUpgradedRentValue = (p: Property) =>
  valueToRentPrice(propertyUpgradedValue(p));
export const propertyUpgradedSellValue = (p: Property) =>
  valueToSellPrice(propertyUpgradedValue(p));

export const utilityBuyPrice = () => utilityBaseValue;
export const utilitySellValue = () => valueToSellPrice(utilityBaseValue);
export const utilityRentValue = (count: number) =>
  valueToRentPrice(utilityBaseValue + count * utilityBonus);

const valueToSellPrice = (value: number) => toNearestFive(value * 0.7);
const valueToRentPrice = (value: number) => toNearestFive(value * 0.5);

export const propertyUpgradeNames = [
  "lab bench",
  "lab room",
  "research facility",
];
const property = (name: string, collection: number) =>
  ({
    type: "property",
    action: "buy property",
    name,
    collection,
    baseValue: collectionToBaseValue(collection),
    upgrade: 0,
  } as Property);

const go = () => ({ type: "go", action: "nothing", name: "GO" } as Go);
const utility = (name: string, collection: number) =>
  ({ type: "utility", action: "buy utility", name, collection } as Utility);
const chance = () =>
  ({ type: "chance", action: "chance", name: "CAS" } as Chance);
const jail = () => ({ type: "jail", action: "jail", name: "EE" } as Jail);
const auction = () =>
  ({ type: "auction", action: "auction", name: "TOK" } as Auction);

export const startingCurrency = 1000;
export const currencies = {
  starting: 1000,
  passGo: 200,
  utilityBase: 200,
  utilityBonus: 50,
  propertyBase: 100,
  propertyBonus: 50,
  fullBail: 200,
  halfBail: 100,
  auctionBounty: 100,
};
const utilityBaseValue = 200;
const utilityBonus = 50;

export const timers = {
  startTurn: 10000,
  rollingDice: 3000,
  moving: 5000,
  acting: 15000,
  answeringQuestion: (collection: number) => 30000 + collection * 5000,
  jailed: 5000,
  auctioning: 45000,
  chance: 10000,
  nothing: 5000,
};

export const fullJailTerm = 6;
export const halfJailTerm = 3;

export const startingBoard: Board = [
  go(),
  property("Alkane Avenue", 0),
  property("Benzene Boulevard", 0),
  property("Carboxylic Crescent", 0),
  utility("Lab Safety", 0),
  property("Thermoset Trail", 1),
  property("Plastic Pines", 1),
  property("Monomer Meadow", 1),
  chance(),
  property("Cis Crossing", 2),
  property("E/Z Exit", 2),
  property("Trans Tunnel", 2),
  utility("Lab Equipment", 1),
  property("Chiral Center", 3),
  property("Polarimeter Parkway", 3),
  property("Enantiomer Express", 3),
  jail(),
  property("Reaction Ranch", 4),
  property("Racemic Route", 4),
  property("Radical Road", 4),
  utility("IA Rules", 2),
  property("Nucleophilic North", 5),
  property("Electrophilic East", 5),
  property("Substitution South", 5),
  auction(),
  property("Chain Lane", 6),
  property("Name Lane", 6),
  property("Line Lane", 6),
  utility("Mr. Israel's Rules", 3),
  property("Pathway Palace", 7),
  property("Compound Castle", 7),
  property("Molecule Manor", 7),
];

export const sets: (properties: number[]) => number[] = (properties) => {
  const possible: number[][] = [];
  properties.forEach((property) => {
    const collection = (startingBoard[property] as Property).collection;
    if (possible[collection] === undefined) {
      possible[collection] = [];
    }
    possible[collection].push(property);
  });
  startingBoard.forEach((tile, tileIndex) => {
    if (tile.type === "property") {
      const collection = (tile as Property).collection;
      if (
        possible[collection] !== undefined &&
        possible[collection].indexOf(tileIndex) === -1
      ) {
        delete possible[collection];
      }
    }
  });
  const collections = possible.filter((e) => e);
  if (collections.length === 0) {
    return [];
  }
  return collections.reduce((prev, current) => [...prev, ...current]);
};

const multipleChoiceQuestion = (
  questionText: string,
  correct: Answer,
  wrong: Answer[]
) =>
  ({
    questionType: "multiple choice",
    questionText,
    correct,
    wrong,
  } as MultipleChoiceQuestion);

export const propertyQuestions: QuestionCollection[] = [
  [
    multipleChoiceQuestion(
      "How many covalent bonds can a carbon atom form?",
      "4",
      ["3", "2", "6"]
    ),
    multipleChoiceQuestion(
      "What is the name for the delocalisation of electrons within a structure?",
      "resonance",
      ["resonant", "revolvement", "romatic"]
    ),
    multipleChoiceQuestion(
      "Which type of bond is a saturated bond?",
      "alkane",
      ["alkene", "alkyne", "aliphatic"]
    ),
    multipleChoiceQuestion(
      "The empirical and molecular formulas of ethane are the same.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "Which carbon has a nitrile bond in most compounds?",
      "carbon 1",
      ["terminal carbon", "any carbon", "middle carbon"]
    ),
    multipleChoiceQuestion(
      "How is nitrogen bonded in an amine?",
      "single bonds only",
      ["single and double bonds", "double bonds only", "triple bonds only"]
    ),
    multipleChoiceQuestion(
      "There are no other neighbouring functional groups to amines.",
      "true",
      ["false"]
    ),
    multipleChoiceQuestion(
      "The carbon from the amide functional group must not be in the parent chain.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "Which of the following homologus series cannot have a molecular formula containing only two carbon atoms?",
      "ketone",
      ["aldehyde", "carboxylic acid", "ester"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for the halogeno group?",
      "halide",
      ["ane", "ether", "hydroxy"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for the alkyl group?",
      "ane",
      ["benzene", "ene", "yne"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for the phenyl group?",
      "benzene",
      ["phenyl", "ene", "yne"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for the ether group?",
      "ether",
      ["ene", "yne", "amine"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for the alkenyl group?",
      "ene",
      ["ane", "yne", "benzene"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for the amine group?",
      "amine",
      ["amino", "cyano", "amide"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for the hydroxyl group?",
      "ol",
      ["hydroxy", "one", "ene"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for ketones?",
      "one",
      ["al", "on", "onyl"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for aldehydes?",
      "al",
      ["one", "on", "yde"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for nitriles?",
      "nitrile",
      ["cyano", "amino", "amide"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for amides?",
      "amide",
      ["ide", "mide", "amino"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for esters?",
      "oate",
      ["ester", "ster", "ate"]
    ),
    multipleChoiceQuestion(
      "What is the parent chain suffix for the carboxyl group?",
      "oic acid",
      ["oate", "xyl", "oxyl"]
    ),
    multipleChoiceQuestion(
      "Only ketones are part of the carbonyl functional group.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion("What is the side group name for alkane?", "alkyl", [
      "alkane",
      "alk",
      "al",
    ]),
    multipleChoiceQuestion(
      "What is the side group name for benzene?",
      "phenyl",
      ["benzene", "cyclo", "ben"]
    ),
    multipleChoiceQuestion("What is the side group name for ether?", "alkoxy", [
      "ether",
      "alko",
      "oxy",
    ]),
    multipleChoiceQuestion(
      "What is the side group name for alcohol?",
      "hydroxy",
      ["hydroxyl", "alc", "hydro"]
    ),
    multipleChoiceQuestion("Aldehydes cannot be a side group", "true", [
      "false",
    ]),
    multipleChoiceQuestion("Ketones can be a side group", "false", ["true"]),
  ],

  [
    multipleChoiceQuestion("Monomers need to have unsaturation.", "true", [
      "false",
    ]),
    multipleChoiceQuestion(
      "Which conditions does addition polymerization not require?",
      "sulfuric acid",
      ["increased pressure", "increased temperature", "UV light"]
    ),
    multipleChoiceQuestion(
      "Which of the following is a catalyst used in addition polymerization?",
      "H2O2",
      ["TiCl3", "H2SO4", "Ni"]
    ),
    multipleChoiceQuestion(
      "Which term describes the position of tails?",
      "tacticity",
      ["tailicity", "syndiocity", "stereoisomerism"]
    ),
  ],

  [],

  [],

  [],

  [],

  [],

  [],
];

export const utilityQuestions = [
  [
    multipleChoiceQuestion("The flaps on goggles can be open.", "false", [
      "true",
    ]),
  ],
  [
    multipleChoiceQuestion(
      "What is the max temperature that the pH probe can withstand?",
      "60°C",
      ["50°C", "80°C", "70°C"]
    ),
  ],
  [],
  [],
];

export const auctionQuestions = [];

export const shuffledCopy = (questionDeck: QuestionCollection) =>
  shuffle(questionDeck.map((_question, index) => index));

export const shuffle = (list: any[]) =>
  [...list].sort(() => 0.5 - Math.random());

export const getQuestionFromDeck = ({
  category,
  collection,
  index,
}: QuestionReference) => {
  switch (category) {
    case "property":
      return propertyQuestions[collection!][index];
    case "utility":
      return utilityQuestions[collection!][index];
    case "auction":
      return auctionQuestions[index];
  }
};

export const chanceSpinner: Spinner = [
  {
    name: "Creativity",
    maxValue: 0.33,
  },
  { name: "Activity", maxValue: 0.67 },
  { name: "Service", maxValue: 1 },
];

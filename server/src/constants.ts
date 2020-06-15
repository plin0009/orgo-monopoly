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
  InputQuestion,
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
  wrong: Answer[],
  questionImage?: string
) =>
  ({
    questionType: "multiple choice",
    questionImage,
    questionText,
    correct,
    wrong,
  } as MultipleChoiceQuestion);

const inputQuestion = (
  questionText: string,
  correct: Answer,
  questionImage?: string
) =>
  ({
    questionType: "input",
    questionText,
    questionImage,
    correct,
  } as InputQuestion);

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
    multipleChoiceQuestion(
      "Which term means that the plastic will burn?",
      "thermoset",
      ["thermoplastic", "thermalset", "thermalplastic"]
    ),
    multipleChoiceQuestion(
      "Which type of plastic is recyclable?",
      "thermoplastic",
      ["thermoset", "thermalset", "thermalplastic"]
    ),
    multipleChoiceQuestion(
      "With the Ziegler-Natta catalyst, which condition is not needed?",
      "UV light",
      ["increased pressure", "increased temperature"]
    ),
    multipleChoiceQuestion(
      "With the dibenzyl peroxide catalyst, which conditions are needed?",
      "all of these",
      [
        "increased temperature and pressure",
        "increased temperature and UV light",
        "increased pressure and UV light",
      ]
    ),
    multipleChoiceQuestion(
      "With which catalyst does homolytic fission not occur?",
      "TiCl4",
      ["H2O2", "C14H10O4"]
    ),
    multipleChoiceQuestion(
      "If the chain length increases, the melting point will increase.",
      "true",
      ["false"]
    ),
    multipleChoiceQuestion(
      "If there is more branching, the melting point will increase.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "If there is less cross-linking, it will be less thermoset.",
      "true",
      ["false"]
    ),
    multipleChoiceQuestion("What is the common name for C2H2?", "acetylene", [
      "acetate",
      "ethene",
      "ethyne",
    ]),
    multipleChoiceQuestion(
      "What is the common name for CH3COOH?",
      "acetic acid",
      ["acetate", "vinegar", "ethanoic acid"]
    ),
    multipleChoiceQuestion(
      "What is the common name for antifreeze?",
      "ethylene glycol",
      ["ethanediol", "methylene", "glycolic acid"]
    ),
    multipleChoiceQuestion(
      "What is not a common name for C6H5OH?",
      "benzenol",
      ["benzalcohol", "phenol", "hydroxybenzene"]
    ),
    multipleChoiceQuestion("How many CH3 side groups are in toluene?", "one", [
      "two",
      "three",
      "none",
    ]),
    multipleChoiceQuestion("How many CH3 side groups are in xylene?", "two", [
      "one",
      "three",
      "none",
    ]),
    multipleChoiceQuestion("How many hydroxyl groups are in menthol?", "one", [
      "two",
      "three",
      "four",
    ]),
    multipleChoiceQuestion("How many NO2 side groups are in TNT?", "three", [
      "one",
      "two",
      "none",
    ]),
    multipleChoiceQuestion(
      "What is the common name for CH2O?",
      "formaldehyde",
      ["acetylene", "methanal", "acetone"]
    ),
  ],

  [
    multipleChoiceQuestion(
      "What is the type of isomer where two or more organic molecules share the same molecular formula but have a different arrangement of atoms in space?",
      "structural isomer",
      ["geometric isomer", "optical isomer", "E/Z isomer"]
    ),
    multipleChoiceQuestion(
      "Isomers are ___ ways of representing the ___ formula.",
      "different, same",
      ["different, different", "same, same", "same, different"]
    ),
    multipleChoiceQuestion("Double bonds allow free rotation.", "false", [
      "true",
    ]),
    multipleChoiceQuestion(
      "Cis/trans isomers share the same molecular formula and ___ but exhibit different ___.",
      "spatial arrangement, spatial geometries",
      [
        "spatial geometry, spatial arrangements",
        "position, geometries",
        "geometry, positions",
      ]
    ),
    multipleChoiceQuestion(
      "Trans and cis indicates the configuration of the ___.",
      "parent chain",
      ["side groups", "carbons", "molecular structure"]
    ),
    multipleChoiceQuestion(
      "Single bonds still have free rotation when they are in a cyclical chain.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "What type(s) of bonds can yield geometric isomers?",
      "double bond only",
      ["single bond only", "single and double bonds", "triple and double bonds"]
    ),
    multipleChoiceQuestion(
      "An unsaturated hydrocarbon is in ___ configuration",
      "cis or trans",
      ["cis only", "trans only", "linear"]
    ),
    multipleChoiceQuestion(
      "Cis hydrocarbons have a ___ melting point than trans hydrocarbons, and a ___ boiling point than trans hydrocarbons.",
      "lower, higher",
      ["higher, lower", "lower, lower", "higher, higher"]
    ),
    multipleChoiceQuestion(
      "For E/Z isomers, what is priority determined on?",
      "atomic mass",
      ["reactivity", "polarity", "solubility"]
    ),
    multipleChoiceQuestion(
      "E/Z structures cover ___.",
      "side groups and the parent chain",
      ["side groups only", "parent chain only"]
    ),
    multipleChoiceQuestion(
      "Here are two cis/trans isomers of pent-2-ene. Which is the cis isomer?",
      "2",
      ["1"],
      "image17.png"
    ),
    multipleChoiceQuestion(
      "A compound can exist as a maximum of two structural isomers.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "Structural isomers may come from different families of organic compounds.",
      "true",
      ["false"]
    ),
    multipleChoiceQuestion(
      "Are these compounds isomers?",
      "yes",
      ["no"],
      "image24.png"
    ),
    multipleChoiceQuestion(
      "Are these compounds isomers?",
      "no",
      ["yes"],
      "image14.png"
    ),
    multipleChoiceQuestion(
      "Structural isomers have different IUPAC names and may or may not belong to the same ___.",
      "functional group",
      ["family", "compound", "structure"]
    ),
    multipleChoiceQuestion(
      "What is the spatial orientation of the double bond in this molecule?",
      "E",
      ["cis", "trans", "Z"],
      "image6.png"
    ),
    multipleChoiceQuestion(
      "Which term best describes the two molecules?",
      "geometric isomers",
      ["structural isomers", "optical isomers", "no relation"],
      "image19.png"
    ),
    multipleChoiceQuestion("How many isomers does C6H14 have?", "five", [
      "three",
      "six",
      "eight",
    ]),
  ],

  [
    multipleChoiceQuestion(
      "Stereoisomers are molecules with the same molecular formula, ___ arrangement of atoms in space, ___ 3D orientation",
      "same, different",
      ["same, same", "different, different", "different, same"]
    ),
    multipleChoiceQuestion(
      "What are the two types of isomers?",
      "structural isomers and stereoisomers",
      [
        "structural isomers and geometric isomers",
        "optical isomers and structural isomers",
        "cis/trans isomers and E/Z isomers",
      ]
    ),
    multipleChoiceQuestion(
      "Optical isomers have different 3D arrangements due to the presence of ___.",
      "chiral center",
      ["electron configuration", "double bond", "polarity"]
    ),
    multipleChoiceQuestion(
      "A chiral center is an image that can be superimposed on the mirror image.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "A carbon with four different substitutes is a ___.",
      "chiral carbon",
      ["carbonal", "butanal", "achiral carbon"]
    ),
    multipleChoiceQuestion(
      "What must a chiral molecule contain?",
      "chiral carbon",
      ["chiral center", "four side groups", "reflection"]
    ),
    multipleChoiceQuestion(
      "How can enantiomers be distinguished?",
      "plane of polarized light",
      ["magnetic resonance imaging", "reflection of UV light"]
    ),
    multipleChoiceQuestion(
      "Enantiomers have the ___ physical properties and they rotate plane-polarized light ___.",
      "same, differently",
      ["different, differently", "same, samely", "different, samely"]
    ),
    multipleChoiceQuestion(
      "Enantiomers have the ___ chemical properties and they react with other optically active compounds ___.",
      "same, differently",
      ["different, differently", "same, samely", "different, samely"]
    ),
    multipleChoiceQuestion(
      "Polarimeters are used to observe how the enantiomers affects the plane-polarized light.",
      "true",
      ["false"]
    ),
    multipleChoiceQuestion(
      "If the polarimeter rotates +, it is counter-clockwise.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "Isomers that are not superimposable on their mirror images are enantiomers.",
      "true",
      ["false"]
    ),
    multipleChoiceQuestion(
      "Superimposable structures are enantiomers.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "Is this molecule chiral or achiral?",
      "achiral",
      ["chiral"],
      "image22.png"
    ),
    multipleChoiceQuestion(
      "Is this molecule chiral or achiral?",
      "achiral",
      ["chiral"],
      "image15.png"
    ),
    multipleChoiceQuestion(
      "Which of the following compounds is not chiral?",
      "4",
      ["1", "2", "3"],
      "image16.png"
    ),
    multipleChoiceQuestion(
      "Which of the following notations is not used to distinguish between pairs of enantiomers?",
      "E and Z",
      ["R and S", "+ and -", "D and L"]
    ),
    multipleChoiceQuestion(
      "Which of the three molecules is/are achiral?",
      "I and II",
      ["I only", "II only", "II and III"],
      "image27.png"
    ),
    multipleChoiceQuestion(
      "How many chiral atoms does the following molecule have?",
      "four",
      ["one", "two", "three"],
      "image2.png"
    ),
    multipleChoiceQuestion(
      "Which of the following structures is different from the other three?",
      "4",
      ["1", "2", "3"],
      "image21.png"
    ),
  ],

  [
    multipleChoiceQuestion(
      "What are the conditions not needed for the substitution of an alkane?",
      "SATP",
      ["heat", "UV light", "halogens"]
    ),
    multipleChoiceQuestion(
      "What is a byproduct of the free radical chain mechanism reaction?",
      "HCl (g)",
      ["HCl (aq)", "CCl", "HCl (l)"]
    ),
    multipleChoiceQuestion(
      "What is the second step of the free radical chain mechanism?",
      "propagation",
      ["initiation", "homolytic fission", "termination"]
    ),
    multipleChoiceQuestion(
      "When do the radicals react together during the free radical chain mechanism?",
      "termination",
      ["initiation", "propagation", "homolytic fission"]
    ),
    multipleChoiceQuestion(
      "During propagation, a ___ is reacted with, and ___ is produced.",
      "radical, radical",
      ["halogen, radical", "halogen, halogen", "radical, halogen"]
    ),
    multipleChoiceQuestion(
      "Heterolytic fission occurs in the halogenation of alkenes.",
      "true",
      ["false"]
    ),
    multipleChoiceQuestion(
      "What is the condition necessary for the halogenation of alkenes?",
      "SATP",
      ["heat", "H2SO4", "UV light"]
    ),
    multipleChoiceQuestion(
      "___ gas and ___ gas are not used for halogenation.",
      "fluorine, iodine.",
      ["fluorine, bromine", "bromine, iodine", "fluorine, hydrogen"]
    ),
    multipleChoiceQuestion(
      "What test is used to detect the presence of unsaturation?",
      "bromine water test",
      ["Lucas test", "litmus test", "Fluorescein test"]
    ),
    multipleChoiceQuestion(
      "When using a test to determine unsaturation, if there is unsaturation, there is a colour change from ___ to ___.",
      "reddish-brown, colourless",
      [
        "colourless, reddish-brown",
        "reddish-brown to purple",
        "colourless to purple.",
      ]
    ),
    multipleChoiceQuestion(
      "What % solution of bromine is used in the bromine water test?",
      "3%",
      ["5%", "6%", "2%"]
    ),
    multipleChoiceQuestion(
      "What is not a condition needed for the hydrogenation of alkene?",
      "H2SO4",
      ["increased temperature", "increased pressure", "nickel catalyst"]
    ),
    multipleChoiceQuestion(
      "How many moles of hydrogen gas can substitute one double bond for the hydrogenation of alkene?",
      "one mole",
      ["two moles", "three moles", "four moles"]
    ),
    inputQuestion(
      "Type in the name of the rule that states the carbon with more hydrogens will gain the hydrogen. One word only.",
      "Markovnikov"
    ),
    multipleChoiceQuestion(
      "What is the common condition needed for the hydrohalogenation of alkene, the halogenation of alkyne, and the halogenation of alkenes?",
      "SATP",
      ["heat", "increased pressure", "H2SO4"]
    ),
    multipleChoiceQuestion(
      "How many sigma and pi bonds are there in benzene?",
      "none",
      ["three and three", "four and two", "two and four"]
    ),
    multipleChoiceQuestion(
      "What catalyst is involved in the halogenation of benzene?",
      "AlCl3",
      ["H2SO4", "nickel", "HNO3"]
    ),
    inputQuestion(
      "Type in the byproduct of the halogenation of benzene in words. Hint: two words, no capitals.",
      "hydrochloric acid"
    ),
    multipleChoiceQuestion(
      "What temperature is best for the nitration of benzene?",
      "50°C",
      ["60°C", "48°C", "64°C"]
    ),
    multipleChoiceQuestion(
      "What byproduct is produced during the nitration of benzene?",
      "nitronium ion",
      ["nitrate", "nitric acid", "water"]
    ),
  ],

  [
    multipleChoiceQuestion(
      "Strong sulfuric acid is needed for the hydration of alkene.",
      "false",
      ["true"]
    ),
    inputQuestion(
      "What is the test used to differentiate between primary, secondary, and tertiary alcohols? No capitals, one word only.",
      "lucas"
    ),
    multipleChoiceQuestion(
      "What is the physical observation used for the Lucas test?",
      "solubility",
      ["colour", "density", "boiling point"]
    ),
    multipleChoiceQuestion(
      "What functional group is formed with the substitution of a halogenoalkane with NH3?",
      "amine",
      ["nitrile", "amide", "ester"]
    ),
    multipleChoiceQuestion(
      "Which condition is not involved in the substitution of a halogenoalkane with a nucleophile?",
      "increased pressure",
      ["EtOH/H2O", "low temperature"]
    ),
    multipleChoiceQuestion(
      "Elimination requires high temperature and diluted hydroxide ions.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "Zaitsev's rule involves a bulky and mild nucleophile",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "Hoffman's rule involves a small and strong nucleophile.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "Where is the ketone group located?",
      "middle carbon",
      ["first carbon", "terminal carbon", "any carbon"]
    ),
    multipleChoiceQuestion(
      "Where is the aldehyde group located?",
      "terminal carbon",
      ["middle carbon", "first carbon", "any carbon"]
    ),
    multipleChoiceQuestion(
      "In an oxidation of alcohol, what is the addition of a bond to oxygen at the expese of?",
      "alpha hydrogen",
      ["primary carbon", "primary hydrogen", "terminal hydrogen"]
    ),
    inputQuestion(
      "From a primary alcohol, what is the immediate product of oxidation?  No capitals, one word only.",
      "aldehyde"
    ),
    inputQuestion(
      "Type in the name of the product after oxidizing an aldehyde. No capitals.",
      "carboxylic acid"
    ),
    multipleChoiceQuestion(
      "What is produced from a secondary alcohol after oxidation?",
      "ketone",
      ["aldehyde", "carboxylic acid"]
    ),
    multipleChoiceQuestion(
      "A tertiary alcohol cannot oxidise because it has no alpha carbons.",
      "false",
      ["true"]
    ),
    inputQuestion(
      "What is the compound that can oxidize three times producing an aldehyde, carboxylic acid, and then carbon dioxide? No capitals, one word only.",
      "methanol"
    ),
    inputQuestion(
      "Type in the name of the method that isolates the oxidation of aldehyde to carboxylic acid. No capitals, two words.",
      "reflux method"
    ),
    multipleChoiceQuestion(
      "The distillation method can separate the desired molecule from ___ to ___ form.",
      "gaseous, liquid",
      ["liquid, gaseous", "liquid, solid", "solid, liquid"]
    ),
    multipleChoiceQuestion(
      "NaBH4/EtOH is an aggressive reducing agent.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "What is the catalyst used in the reduction of nitrobenzene?",
      "Sn",
      ["nickel", "H2SO4", "TiCl4"]
    ),
    multipleChoiceQuestion(
      "An ester is produced by ___ and ___.",
      "alcohol, carboxylic acid",
      ["alcohol, alcohol", "alcohol, amine", "amine, carboxylic acid"]
    ),
    multipleChoiceQuestion(
      "An amide is produced by ___ and ___.",
      "amine, carboxylic acid",
      ["alcohol, carboxylic acid", "alcohol, alcohol", "alcohol, amine"]
    ),
    multipleChoiceQuestion(
      "Which two products are formed from condensation of alcohol under the same conditions?",
      "ester and amide",
      ["ester and ether", "ether and amide", "ester and amine"]
    ),
    multipleChoiceQuestion(
      "What is the name of a nitrogen-based organic compound where nitrogen is single bonded to any and all bonding partners?",
      "amine",
      ["amide", "peptide"]
    ),
  ],

  [
    inputQuestion("Name this compound:", "3-ethylheptane", "image3.gif"),
    inputQuestion("Name this compound:", "hexan-2-ol", "image18.png"),
    inputQuestion(
      "Name this compound:",
      "2-phenylethyl propanoate",
      "image11.png"
    ),
    inputQuestion("Name this compound:", "2-aminoethanamide", "image1.png"),
    inputQuestion(
      "Name this compound:",
      "methyl-3-bromobutanoate",
      "image8.png"
    ),
    inputQuestion("Name this compound:", "1,5-dibromopentane", "image4.png"),
    inputQuestion(
      "Name this compound:",
      "3-methylpenta-1,4-diene",
      "image5.png"
    ),
    inputQuestion("Name this compound:", "3-ethylpent-2-ene", "image25.png"),
  ],

  [
    inputQuestion(
      "Name this compound:",
      "3,4-dimethylhexane-2,5-dione",
      "image26.png"
    ),
    inputQuestion("Name this compound:", "diphenylmethanone", "image7.png"),
    inputQuestion("Name this compound:", "heptanal", "image29.png"),
    inputQuestion(
      "Name this compound:",
      "3,7-dimethyloctan-3-ol",
      "image28.png"
    ),
    inputQuestion("Name this compound:", "5-methylhex-1-yne", "image10.png"),
    inputQuestion("Name this compound:", "1,6-diiodohexane", "image13.png"),
    inputQuestion(
      "Name this compound:",
      "ethyl-2-cyanoprop-2-enoate",
      "image12.png"
    ),
  ],
];

export const utilityQuestions = [
  [
    multipleChoiceQuestion("The flaps on goggles can be open.", "false", [
      "true",
    ]),
    multipleChoiceQuestion(
      "You can only use the step stool if you are less than 155 cm in height",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "If you break a glass equipment, the first thing to do is to get the dustpan.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "You can pour organic waste down the drain.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion("You can pour AlNO3 down the drain.", "false", [
      "true",
    ]),
    inputQuestion(
      "What is the white powder that we use to clean? No capitals.",
      "alconox"
    ),
  ],
  [
    multipleChoiceQuestion(
      "What is the max temperature that the pH probe can withstand?",
      "60°C",
      ["50°C", "80°C", "70°C"]
    ),
    multipleChoiceQuestion(
      "What do you use to move a crucible when in use?",
      "crucible tongs",
      ["gloves", "tweezers", "crucible rack"]
    ),
    multipleChoiceQuestion(
      "Which of the following should be in a burette during a titration?",
      "titrant",
      ["pH probe", "sample", "water"]
    ),
    multipleChoiceQuestion(
      "Where does the numbering start on a burette?",
      "near the very top",
      ["at the very top", "at the very bottom", "near the very bottom"]
    ),
    inputQuestion("What do you smell to clear your palette?", "coffee grounds"),
  ],
  [
    multipleChoiceQuestion(
      "What format do you use for citations in your IA?",
      "APA",
      ["MLA", "Chicago"]
    ),
    multipleChoiceQuestion(
      "How many marks is the personal engagement section out of?",
      "two",
      ["one", "three", "four"]
    ),
    multipleChoiceQuestion(
      "Do you need a hypothesis in the formal IA write up?",
      "no",
      ["yes"]
    ),
    multipleChoiceQuestion(
      "You must show a picture of each of your equipment in your diagram.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "How many parts are in the evaluation section?",
      "four",
      ["one", "three", "five"]
    ),
    multipleChoiceQuestion(
      "How many parts are involved in writing about one experimental error/suggested improvement?",
      "four",
      ["two", "three", "five"]
    ),
  ],
  [
    multipleChoiceQuestion(
      "Can you go between the lab benches during a lab?",
      "no",
      ["yes"]
    ),
    multipleChoiceQuestion(
      "You can return to your desk to get materials you need for the experiment when you have goggles.",
      "false",
      ["true"]
    ),
    multipleChoiceQuestion(
      "You must look at the meniscus with your own eyes.",
      "true",
      ["false"]
    ),
    multipleChoiceQuestion("You cannot share the stock solution.", "false", [
      "true",
    ]),
    multipleChoiceQuestion(
      "Which item are you not allowed to bring to the lab bench?",
      "calculator",
      ["pen", "paper", "ruler"]
    ),
    inputQuestion(
      "What does YSKB stand for? No capitals.",
      "you should know better"
    ),
    inputQuestion("What does DNF stand for? No capitals.", "does not follow"),
  ],
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

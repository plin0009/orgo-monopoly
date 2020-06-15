import React, { useState } from "react";
import { UpgradeData, SellData, Answer } from "../types";
import { propertyColors } from "../constants";

interface CardProps {
  color: string;
  title: string;
}

const Card: React.FC<CardProps> = ({ color, title, children }) => {
  return (
    <div className="cardWrapper">
      <div className="card" style={{ backgroundColor: color }}>
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
};

interface ChoiceCardProps extends CardProps {
  description: string;
  image?: string;
  choices?: { name: string; onClick: () => void }[];
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  color,
  title,
  description,
  image,
  choices,
}) => {
  return (
    <Card {...{ color, title }}>
      <h2>{description}</h2>
      {image !== undefined ? <img src={image} alt="loading" /> : null}
      {choices?.map(({ name, onClick }) => (
        <button key={name} onClick={onClick}>
          {name}
        </button>
      ))}
    </Card>
  );
};

interface InputCardProps extends CardProps {
  description: string;
  image?: string;
  onSubmit: (answer: Answer) => void;
}

export const InputCard: React.FC<InputCardProps> = ({
  color,
  title,
  description,
  image,
  onSubmit,
}) => {
  const [textInput, setTextInput] = useState<string>("");
  return (
    <Card {...{ color, title }}>
      <h2>{description}</h2>
      {image !== undefined ? <img src={image} alt="loading" /> : null}
      <input
        type="text"
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Your answer here"
      />
      <button onClick={() => onSubmit(textInput)}>Submit</button>
    </Card>
  );
};

interface UpgradeCardProps extends CardProps {
  upgradeData: UpgradeData;
  onUpgrade: (position: number) => void;
}
export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  color,
  title,
  upgradeData,
  onUpgrade,
}) => {
  return (
    <Card {...{ color, title }}>
      {upgradeData.map(
        ({
          name,
          position,
          collection,
          upgradePrice,
          currentRentValue,
          newRentValue,
          newSellValue,
        }) => (
          <div
            key={position}
            className=""
            style={{ color: propertyColors[collection].toCSS(true) }}
          >
            <p>{`Upgrade ${name} for ${upgradePrice} C`}</p>
            <p>{`Rent value will increase from  ${currentRentValue} C to ${newRentValue} C.`}</p>
            <p>{`New sell value: ${newSellValue}`}</p>
            <button onClick={() => onUpgrade(position)}>Upgrade</button>
          </div>
        )
      )}
    </Card>
  );
};

interface SellCardProps extends CardProps {
  sellData: SellData;
  onSell: (position: number) => void;
}
export const SellCard: React.FC<SellCardProps> = ({
  color,
  title,
  sellData,
  onSell,
}) => {
  return (
    <Card {...{ color, title }}>
      {sellData.map(({ name, collection, position, sellValue }) => (
        <div
          key={position}
          className=""
          style={{
            color: collection ? propertyColors[collection].toCSS(true) : "#000",
          }}
        >
          <p>{`Sell ${name} for ${sellValue}`}</p>
          <button onClick={() => onSell(position)}>Sell</button>
        </div>
      ))}
    </Card>
  );
};

export default Card;

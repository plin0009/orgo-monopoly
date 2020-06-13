import React from "react";

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
  choices: { name: string; onClick: () => void }[];
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  color,
  title,
  description,
  choices,
}) => {
  return (
    <Card {...{ color, title }}>
      <h2>{description}</h2>
      {choices.map(({ name, onClick }) => (
        <button key={name} onClick={onClick}>
          {name}
        </button>
      ))}
    </Card>
  );
};

export default Card;

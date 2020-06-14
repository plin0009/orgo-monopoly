import React, { useEffect, useRef } from "react";
import paper from "paper";
import {
  boardWidth,
  boardHeight,
  getMarkerPoint,
  characterSize,
  getPropertyPoint,
  propertySize,
} from "../boardDesign";
import { Character, Property, Utility } from "../types";
import { characterColors } from "../constants";

interface BoardProps {
  markers: { position: number; character: Character }[];
  properties: { property: Property; position: number; character: Character }[];
  utilities: { utility: Utility; position: number; character: Character }[];
}

const Board: React.FC<BoardProps> = ({ markers, properties, utilities }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    paper.setup(canvasRef.current!);
    new paper.Raster("/assets/board.png").position = new paper.Point(
      boardWidth / 2,
      boardHeight / 2
    );
    canvasRef.current!.width = boardWidth;
    canvasRef.current!.height = boardHeight;

    for (let i = 0; i < properties.length; i++) {
      const shape = new paper.Path.RegularPolygon(
        new paper.Point(getPropertyPoint(properties[i].position)),
        3 + properties[i].property.upgrade,
        propertySize
      );
      shape.fillColor = characterColors[properties[i].character].add(-0.2);
      shape.opacity = 0.8;
    }
    for (let i = 0; i < utilities.length; i++) {
      const shape = new paper.Path.Star(
        new paper.Point(getPropertyPoint(utilities[i].position)),
        5,
        propertySize,
        propertySize / 2
      );
      shape.fillColor = characterColors[utilities[i].character];
      shape.opacity = 0.6;
    }
    for (let i = 0; i < markers.length; i++) {
      new paper.Shape.Circle(
        new paper.Point(
          getMarkerPoint(markers[i].position, markers[i].character)
        ),
        characterSize
      ).fillColor = characterColors[markers[i].character];
    }
  }, [markers, properties, utilities]);
  return <canvas className="boardCanvas" ref={canvasRef} />;
};

export default Board;

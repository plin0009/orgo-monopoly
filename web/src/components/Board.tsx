import React, { useEffect, useRef } from "react";
import paper from "paper";
import {
  boardWidth,
  boardHeight,
  getMarkerPoint,
  characterSize,
} from "../boardDesign";
import { Character } from "../../../types";
import { characterColors } from "../constants";

interface BoardProps {
  markers: { position: number; character: Character }[];
}

const Board: React.FC<BoardProps> = ({ markers }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    paper.setup(canvasRef.current!);
    new paper.Raster("/assets/board.png").position = new paper.Point(
      boardWidth / 2,
      boardHeight / 2
    );
    canvasRef.current!.width = boardWidth;
    canvasRef.current!.height = boardHeight;

    for (let i = 0; i < markers.length; i++) {
      console.log(
        `marker ${i} ${markers[i].character} ${markers[i].position} `
      );
      new paper.Shape.Circle(
        new paper.Point(
          getMarkerPoint(markers[i].position, markers[i].character)
        ),
        characterSize
      ).fillColor = characterColors[markers[i].character];
    }
  }, [markers]);
  return <canvas className="boardCanvas" ref={canvasRef} />;
};

export default Board;

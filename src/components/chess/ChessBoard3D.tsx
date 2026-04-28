"use client";

import { useGameStore } from "@/store/useGameStore";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Suspense, useMemo, useState } from "react";
import Square3D from "./Square3D";
import ChessPiece3D from "./ChessPiece3D";
import { Square } from "chess.js";

// Helper to convert rank/file to 3D coordinates
function getPosition(square: string): [number, number, number] {
  const file = square.charCodeAt(0) - 97; // a=0, b=1 ...
  const rank = parseInt(square[1]) - 1;   // 1=0, 2=1 ...
  
  // Center the board at 0,0,0
  const x = file - 3.5;
  const z = 3.5 - rank; // Invert Z so white is at the bottom (+z)
  return [x, 0, z];
}

function Board() {
  const { chess, fen, turn, selectedSquare, setSelectedSquare, makeMove } = useGameStore();
  const [validMoves, setValidMoves] = useState<string[]>([]);
  
  const board = useMemo(() => chess.board(), [fen, chess]);

  const handleSquareClick = (square: string) => {
    if (selectedSquare) {
      // Try to move
      const moveResult = makeMove({ from: selectedSquare, to: square, promotion: "q" });
      if (moveResult) {
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        // If clicking another of own pieces, select it instead
        const piece = chess.get(square as Square);
        if (piece && piece.color === turn) {
          setSelectedSquare(square);
          const moves = chess.moves({ square: square as Square, verbose: true });
          setValidMoves(moves.map(m => m.to));
        } else {
          // Deselect
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    } else {
      // Select piece
      const piece = chess.get(square as Square);
      if (piece && piece.color === turn) {
        setSelectedSquare(square);
        const moves = chess.moves({ square: square as Square, verbose: true });
        setValidMoves(moves.map(m => m.to));
      }
    }
  };

  const squares = [];
  const pieces = [];

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const isLight = (rank + file) % 2 === 1;
      const fileChar = String.fromCharCode(97 + file);
      const squareId = `${fileChar}${8 - rank}` as string;
      const position = getPosition(squareId);
      
      const isSelected = selectedSquare === squareId;
      const isValidMove = validMoves.includes(squareId);

      squares.push(
        <Square3D 
          key={`square-${squareId}`} 
          position={position}
          color={isLight ? "light" : "dark"}
          isSelected={isSelected}
          isValidMove={isValidMove}
          onClick={() => handleSquareClick(squareId)}
        />
      );

      const piece = board[rank][file];
      if (piece) {
        pieces.push(
          <ChessPiece3D
            key={`piece-${squareId}-${piece.type}-${piece.color}`}
            type={piece.type}
            color={piece.color}
            position={[position[0], 0.1, position[2]]}
            isSelectable={piece.color === turn}
            onClick={() => handleSquareClick(squareId)}
          />
        );
      }
    }
  }

  return (
    <group>
      {squares}
      {pieces}
    </group>
  );
}

export default function ChessBoard3D() {
  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-2xl border border-slate-700/50">
      <Canvas camera={{ position: [0, 6, 6], fov: 50 }}>
        <color attach="background" args={["#0f172a"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Board />
          <ContactShadows position={[0, -0.1, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        </Suspense>
        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}

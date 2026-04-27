"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { PieceSymbol, Color } from "chess.js";
import { Sphere, Cylinder, Box, Cone } from "@react-three/drei";

interface ChessPiece3DProps {
  type: PieceSymbol;
  color: Color;
  position: [number, number, number];
  isSelectable: boolean;
  onClick: () => void;
}

export default function ChessPiece3D({ type, color, position, isSelectable, onClick }: ChessPiece3DProps) {
  const materialColor = color === "w" ? "#ffffff" : "#1e293b"; // white or dark slate
  
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ 
      color: materialColor,
      roughness: 0.3,
      metalness: 0.8,
    }),
    [materialColor]
  );

  // Geometric representations of chess pieces
  const renderGeometry = () => {
    switch (type) {
      case "p": // Pawn
        return (
          <group position={[0, 0.4, 0]}>
            <Cylinder args={[0.3, 0.4, 0.8]} material={material} />
            <Sphere args={[0.3]} position={[0, 0.5, 0]} material={material} />
          </group>
        );
      case "r": // Rook
        return (
          <group position={[0, 0.5, 0]}>
            <Cylinder args={[0.4, 0.4, 1]} material={material} />
            <Cylinder args={[0.45, 0.45, 0.2]} position={[0, 0.5, 0]} material={material} />
          </group>
        );
      case "n": // Knight
        return (
          <group position={[0, 0.6, 0]}>
            <Cylinder args={[0.3, 0.4, 1.2]} material={material} />
            <Box args={[0.6, 0.5, 0.3]} position={[0, 0.6, 0]} material={material} />
          </group>
        );
      case "b": // Bishop
        return (
          <group position={[0, 0.7, 0]}>
            <Cylinder args={[0.2, 0.4, 1.4]} material={material} />
            <Cone args={[0.3, 0.5]} position={[0, 0.7, 0]} material={material} />
          </group>
        );
      case "q": // Queen
        return (
          <group position={[0, 0.9, 0]}>
            <Cylinder args={[0.2, 0.4, 1.8]} material={material} />
            <Sphere args={[0.35]} position={[0, 0.9, 0]} material={material} />
          </group>
        );
      case "k": // King
        return (
          <group position={[0, 1.0, 0]}>
            <Cylinder args={[0.2, 0.4, 2.0]} material={material} />
            <Box args={[0.4, 0.4, 0.1]} position={[0, 1.0, 0]} material={material} />
            <Box args={[0.1, 0.4, 0.4]} position={[0, 1.0, 0]} material={material} />
          </group>
        );
      default:
        return null;
    }
  };

  return (
    <group 
      position={position} 
      onClick={(e) => {
        if (isSelectable) {
          e.stopPropagation();
          onClick();
        }
      }}
      onPointerOver={(e) => {
        if (isSelectable) {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      {renderGeometry()}
    </group>
  );
}

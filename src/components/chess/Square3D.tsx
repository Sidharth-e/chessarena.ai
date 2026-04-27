"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Box } from "@react-three/drei";

interface Square3DProps {
  position: [number, number, number];
  color: "light" | "dark";
  isSelected: boolean;
  isValidMove: boolean;
  onClick: () => void;
}

export default function Square3D({ position, color, isSelected, isValidMove, onClick }: Square3DProps) {
  const baseColor = color === "light" ? "#f1f5f9" : "#64748b"; // slate-100 or slate-500
  
  const materialColor = isSelected 
    ? "#38bdf8" // selected: sky-400
    : isValidMove 
      ? "#22c55e" // valid move: green-500
      : baseColor;

  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ 
      color: materialColor,
      roughness: 0.8,
      metalness: 0.1,
    }),
    [materialColor]
  );

  return (
    <Box 
      args={[1, 0.2, 1]} 
      position={position} 
      material={material}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      receiveShadow
    />
  );
}

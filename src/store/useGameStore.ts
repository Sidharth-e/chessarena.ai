import { create } from 'zustand';
import { Chess, Move } from 'chess.js';

interface GameState {
  chess: Chess;
  fen: string;
  pgn: string;
  turn: 'w' | 'b';
  isGameOver: boolean;
  winner: 'w' | 'b' | 'draw' | null;
  matchId: string | null;
  whiteProvider: string;
  blackProvider: string;
  selectedSquare: string | null;
  
  // Actions
  initGame: (matchId: string, whiteProvider: string, blackProvider: string) => void;
  makeMove: (move: string | { from: string; to: string; promotion?: string }) => Move | null;
  setSelectedSquare: (square: string | null) => void;
  resetGame: () => void;
  setMatchId: (id: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  chess: new Chess(),
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn: '',
  turn: 'w',
  isGameOver: false,
  winner: null,
  matchId: null,
  whiteProvider: 'human',
  blackProvider: 'human',
  selectedSquare: null,

  initGame: (matchId, whiteProvider, blackProvider) => {
    const newChess = new Chess();
    set({
      chess: newChess,
      fen: newChess.fen(),
      pgn: newChess.pgn(),
      turn: newChess.turn(),
      isGameOver: false,
      winner: null,
      matchId,
      whiteProvider,
      blackProvider,
      selectedSquare: null,
    });
  },

  makeMove: (move) => {
    const { chess } = get();
    try {
      const result = chess.move(move);
      if (result) {
        let winner: 'w' | 'b' | 'draw' | null = null;
        if (chess.isCheckmate()) {
          winner = chess.turn() === 'w' ? 'b' : 'w';
        } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
          winner = 'draw';
        }

        set({
          fen: chess.fen(),
          pgn: chess.pgn(),
          turn: chess.turn(),
          isGameOver: chess.isGameOver(),
          winner,
        });
      }
      return result;
    } catch (e) {
      // Invalid move
      return null;
    }
  },

  setSelectedSquare: (square) => set({ selectedSquare: square }),

  resetGame: () => {
    const newChess = new Chess();
    set({
      chess: newChess,
      fen: newChess.fen(),
      pgn: newChess.pgn(),
      turn: 'w',
      isGameOver: false,
      winner: null,
      selectedSquare: null,
    });
  },

  setMatchId: (id) => set({ matchId: id }),
}));

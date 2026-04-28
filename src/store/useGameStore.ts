import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Chess, Move } from 'chess.js';
import { PlayerConfig, DEFAULT_CONFIG } from '../config/models';

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
  
  globalSettings: { white: PlayerConfig; black: PlayerConfig };
  currentGameConfig: { white: PlayerConfig; black: PlayerConfig };
  
  // Actions
  initGame: (matchId: string, whiteConfig: PlayerConfig, blackConfig: PlayerConfig) => void;
  makeMove: (move: string | { from: string; to: string; promotion?: string }) => Move | null;
  setSelectedSquare: (square: string | null) => void;
  resetGame: () => void;
  setMatchId: (id: string) => void;
  setGlobalSettings: (config: { white: PlayerConfig; black: PlayerConfig }) => void;
  setCurrentGameConfig: (config: { white: PlayerConfig; black: PlayerConfig }) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      chess: new Chess(),
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      pgn: '',
      turn: 'w',
      isGameOver: false,
      winner: null,
      matchId: null,
      whiteProvider: 'Human',
      blackProvider: 'Human',
      selectedSquare: null,
      globalSettings: DEFAULT_CONFIG,
      currentGameConfig: DEFAULT_CONFIG,

      initGame: (matchId, whiteConfig, blackConfig) => {
        const newChess = new Chess();
        set({
          chess: newChess,
          fen: newChess.fen(),
          pgn: newChess.pgn(),
          turn: newChess.turn(),
          isGameOver: false,
          winner: null,
          matchId,
          whiteProvider: whiteConfig.provider,
          blackProvider: blackConfig.provider,
          selectedSquare: null,
          currentGameConfig: {
            white: whiteConfig,
            black: blackConfig
          }
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
        } catch {
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

      setGlobalSettings: (config) => set({ globalSettings: config }),
      setCurrentGameConfig: (config) => set({ currentGameConfig: config }),
    }),
    {
      name: 'chess-arena-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ globalSettings: state.globalSettings }),
    }
  )
);

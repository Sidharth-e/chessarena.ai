import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Chess, Move } from 'chess.js';
import { PlayerConfig, DEFAULT_CONFIG } from '../config/models';
import axios from 'axios';

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
  captured: { w: string[]; b: string[] };
  
  // Actions
  initGame: (matchId: string, whiteConfig: PlayerConfig, blackConfig: PlayerConfig, initialFen?: string, initialPgn?: string) => void;
  makeMove: (move: string | { from: string; to: string; promotion?: string }) => Move | null;
  setSelectedSquare: (square: string | null) => void;
  resetGame: () => void;
  setMatchId: (id: string) => void;
  setGlobalSettings: (config: { white: PlayerConfig; black: PlayerConfig }) => void;
  syncWithDb: () => Promise<void>;
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
      captured: { w: [], b: [] },

      initGame: (matchId, whiteConfig, blackConfig, initialFen, initialPgn) => {
        const newChess = new Chess(initialFen);
        if (initialPgn) {
          try {
            newChess.loadPgn(initialPgn);
          } catch (e) {
            console.error("Failed to load PGN:", e);
          }
        }

        // Calculate captured pieces from board state
        const currentPieces: Record<'w' | 'b', Record<string, number>> = {
          w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
          b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
        };

        newChess.board().forEach(row => {
          row.forEach(piece => {
            if (piece) {
              currentPieces[piece.color][piece.type]++;
            }
          });
        });

        const STARTING_PIECES = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
        const newCaptured = { w: [] as string[], b: [] as string[] };

        Object.entries(STARTING_PIECES).forEach(([type, count]) => {
          // Missing Black pieces were captured by White
          for (let i = 0; i < count - currentPieces.b[type]; i++) {
            newCaptured.w.push(type);
          }
          // Missing White pieces were captured by Black
          for (let i = 0; i < count - currentPieces.w[type]; i++) {
            newCaptured.b.push(type);
          }
        });

        set({
          chess: newChess,
          fen: newChess.fen(),
          pgn: newChess.pgn(),
          turn: newChess.turn(),
          isGameOver: newChess.isGameOver(),
          winner: null,
          matchId,
          whiteProvider: whiteConfig.provider,
          blackProvider: blackConfig.provider,
          selectedSquare: null,
          currentGameConfig: {
            white: whiteConfig,
            black: blackConfig
          },
          captured: newCaptured
        });
      },

      makeMove: (move) => {
        const { chess, captured } = get();
        try {
          const result = chess.move(move);
          if (result) {
            let winner: 'w' | 'b' | 'draw' | null = null;
            if (chess.isCheckmate()) {
              winner = chess.turn() === 'w' ? 'b' : 'w';
            } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
              winner = 'draw';
            }

            const newCaptured = { ...captured };
            if (result.captured) {
              newCaptured[result.color].push(result.captured);
            }

            set({
              fen: chess.fen(),
              pgn: chess.pgn(),
              turn: chess.turn(),
              isGameOver: chess.isGameOver(),
              winner,
              captured: newCaptured
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
          pgn: '',
          turn: 'w',
          isGameOver: false,
          winner: null,
          selectedSquare: null,
          matchId: null,
          captured: { w: [], b: [] }
        });
      },

      setMatchId: (id) => set({ matchId: id }),

      setGlobalSettings: (config) => {
        set({ globalSettings: config });
        // Background sync to DB
        axios.post('/api/user-config', config).catch(err => console.error("Failed to sync settings to DB:", err));
      },

      syncWithDb: async () => {
        try {
          const res = await axios.get('/api/user-config');
          if (res.data && !res.data.error) {
            set({ globalSettings: { white: res.data.white, black: res.data.black } });
          }
        } catch (err) {
          console.error("Failed to fetch settings from DB:", err);
        }
      },

      setCurrentGameConfig: (config) => set({ currentGameConfig: config }),
    }),
    {
      name: 'chess-arena-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ globalSettings: state.globalSettings }),
    }
  )
);

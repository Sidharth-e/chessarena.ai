"use client";

import { useState, useEffect } from "react";
import ChessBoard3D from "@/components/chess/ChessBoard3D";
import { useGameStore } from "@/store/useGameStore";
import { BrainCircuit, RotateCcw, Trophy, Activity, ArrowLeft } from "lucide-react";
import { MatchSetup } from "@/components/chess/MatchSetup";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import axios from "axios";

export default function PlayPage() {
  const { 
    fen, 
    pgn, 
    turn, 
    isGameOver, 
    winner, 
    matchId, 
    currentGameConfig,
    makeMove, 
    resetGame 
  } = useGameStore();

  const [isThinking, setIsThinking] = useState(false);
  const [lastThoughtProcess, setLastThoughtProcess] = useState("");

  // AI Game Loop
  useEffect(() => {
    if (isGameOver || !matchId) return;

    const isWhiteTurn = turn === "w";
    const currentConfig = isWhiteTurn ? currentGameConfig.white : currentGameConfig.black;

    if (currentConfig.provider !== "Human" && !isThinking) {
      const fetchAIMove = async () => {
        setIsThinking(true);
        setLastThoughtProcess(`Waiting for ${currentConfig.provider} to think...`);
        try {
          const res = await axios.post("/api/llm-move", {
            fen,
            pgn,
            provider: currentConfig.provider,
            model: currentConfig.model,
            color: isWhiteTurn ? "white" : "black"
          });

          if (res.data.move) {
            makeMove(res.data.move);
            setLastThoughtProcess(res.data.thoughtProcess || `Played ${res.data.move}`);
          } else if (res.data.error) {
            setLastThoughtProcess(`Error: ${res.data.error}`);
          }
        } catch (error: unknown) {
          console.error(error);
          const message = error instanceof Error ? error.message : "Unknown error";
          setLastThoughtProcess(`Error fetching move: ${message}`);
        } finally {
          setIsThinking(false);
        }
      };

      const timer = setTimeout(() => {
        fetchAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [fen, pgn, turn, isGameOver, matchId, currentGameConfig, makeMove, isThinking]);

  if (!matchId) {
    return (
      <main className="min-h-screen bg-slate-900 p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl space-y-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Menu
            </Button>
          </Link>
          <MatchSetup />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4" /> Exit to Menu
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              MATCH: {matchId.substring(0, 8)}...
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Match Status & Info */}
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Players</h3>
                </div>
                
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg border transition-colors ${turn === 'w' ? 'bg-white/10 border-white/20' : 'bg-slate-900/50 border-slate-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">WHITE</span>
                        <span className="text-slate-400 text-xs">{currentGameConfig.white.provider} {currentGameConfig.white.model && `(${currentGameConfig.white.model})`}</span>
                      </div>
                      {turn === 'w' && !isGameOver && <Activity className="w-4 h-4 text-blue-400 ml-auto animate-pulse" />}
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border transition-colors ${turn === 'b' ? 'bg-white/10 border-white/20' : 'bg-slate-900/50 border-slate-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-700 shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">BLACK</span>
                        <span className="text-slate-400 text-xs">{currentGameConfig.black.provider} {currentGameConfig.black.model && `(${currentGameConfig.black.model})`}</span>
                      </div>
                      {turn === 'b' && !isGameOver && <Activity className="w-4 h-4 text-blue-400 ml-auto animate-pulse" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Status</h3>
                {isGameOver ? (
                  <div className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg flex flex-col items-center justify-center text-center space-y-2">
                    <Trophy className="w-8 h-8 text-blue-400" />
                    <span className="font-bold text-blue-400 text-xl">
                      {winner === 'w' ? 'White Wins!' : winner === 'b' ? 'Black Wins!' : 'Draw!'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${turn === 'w' ? 'bg-white' : 'bg-slate-500'}`} />
                    <span className="text-slate-200 font-medium">
                      {turn === 'w' ? "White's Turn" : "Black's Turn"}
                    </span>
                    {isThinking && <span className="text-xs text-blue-400 ml-auto animate-pulse">Thinking...</span>}
                  </div>
                )}
              </div>

              <Button variant="secondary" onClick={resetGame} className="w-full">
                <RotateCcw className="w-4 h-4" />
                Reset Match
              </Button>
            </div>

            {/* AI Thought Process Console */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-blue-500" />
                Cognition Stream
              </h3>
              <div className="h-48 overflow-y-auto font-mono text-xs text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-800/50 whitespace-pre-wrap leading-relaxed">
                {lastThoughtProcess || "Waiting for initial move..."}
              </div>
            </div>
          </div>

          {/* Center Column: 3D Board */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-8 shadow-2xl">
              <ChessBoard3D />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

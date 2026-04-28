"use client";

import { useState, useEffect } from "react";
import ChessBoard3D from "@/components/chess/ChessBoard3D";
import { ThoughtHistory } from "@/components/chess/ThoughtHistory";
import { useGameStore } from "@/store/useGameStore";
import { RotateCcw, Trophy, Activity, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { MatchSetup } from "@/components/chess/MatchSetup";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import axios from "axios";
import { updateMatchMove, finalizeMatch } from "@/app/actions/match";
import { useMutation } from "@tanstack/react-query";

const PIECE_SYMBOLS: Record<string, string> = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚'
};

function CapturedPieces({ pieces, isWhiteCapture }: { pieces: string[], isWhiteCapture: boolean }) {
  if (pieces.length === 0) return <div className="h-6" />;
  
  const order = ['q', 'r', 'b', 'n', 'p'];
  const sortedPieces = [...pieces].sort((a, b) => order.indexOf(a) - order.indexOf(b));

  return (
    <div className="flex flex-wrap gap-0.5 mt-1 min-h-[24px]">
      {sortedPieces.map((p, i) => (
        <span 
          key={i} 
          className={`text-xl leading-none ${isWhiteCapture ? 'text-slate-950' : 'text-white'} drop-shadow-sm`}
        >
          {PIECE_SYMBOLS[p]}
        </span>
      ))}
    </div>
  );
}

export default function PlayPage() {
  const { 
    fen, 
    pgn, 
    turn, 
    isGameOver, 
    winner, 
    matchId, 
    currentGameConfig,
    captured,
    makeMove, 
    resetGame 
  } = useGameStore();

  const [lastThoughtProcess, setLastThoughtProcess] = useState("");
  const [thoughtHistory, setThoughtHistory] = useState<Array<{
    moveNumber: number;
    color: string;
    san: string;
    thought: string;
    timestamp: string;
  }>>([]);

  const aiMoveMutation = useMutation({
    mutationFn: async (config: { fen: string; pgn: string; provider: string; model: string; color: string }) => {
      const res = await axios.post("/api/llm-move", config);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.move) {
        const moveResult = makeMove(data.move);
        if (moveResult && matchId) {
          updateMatchMove(
            matchId, 
            moveResult.after, 
            pgn + " " + data.move, 
            data.move, 
            data.thoughtProcess
          );

          // Add to thought history
          setThoughtHistory(prev => [...prev, {
            moveNumber: Math.floor(pgn.split(" ").filter(Boolean).length / 2) + 1,
            color: turn === 'w' ? "White" : "Black",
            san: data.move,
            thought: data.thoughtProcess || "",
            timestamp: new Date().toISOString()
          }]);
        }
        setLastThoughtProcess(data.thoughtProcess || `Played ${data.move}`);
      } else if (data.error) {
        setLastThoughtProcess(`Error: ${data.error}`);
      }
    },
    onError: (error: unknown) => {
      console.error(error);
      const err = error as { response?: { data?: { error?: string; retryAfter?: string } }; message?: string };
      const message = err.response?.data?.error || err.message || "Unknown error";
      const retryAfter = err.response?.data?.retryAfter;
      
      setLastThoughtProcess(`Error fetching move: ${message}${retryAfter ? ` (Retry in ${retryAfter})` : ""}`);
    },
    retry: (failureCount, error: unknown) => {
      const err = error as { response?: { status?: number; data?: { retryAfter?: string } } };
      // Retry more for 429 if we have a retryAfter hint, but still limit total attempts
      if (err.response?.status === 429 && failureCount < 3) return true;
      return false;
    },
    retryDelay: (attemptIndex, error: unknown) => {
      const err = error as { response?: { data?: { retryAfter?: string } } };
      const retryAfter = err.response?.data?.retryAfter;
      if (retryAfter) {
        const seconds = parseFloat(retryAfter.replace('s', ''));
        if (!isNaN(seconds)) return (seconds + 1) * 1000;
      }
      return Math.min(1000 * 2 ** attemptIndex, 10000);
    },
  });

  // AI Game Loop
  useEffect(() => {
    if (isGameOver || !matchId) return;

    const isWhiteTurn = turn === "w";
    const currentConfig = isWhiteTurn ? currentGameConfig.white : currentGameConfig.black;

    if (currentConfig.provider !== "Human" && !aiMoveMutation.isPending && !aiMoveMutation.isError) {
      const timer = setTimeout(() => {
        aiMoveMutation.mutate({
          fen,
          pgn,
          provider: currentConfig.provider,
          model: currentConfig.model,
          color: isWhiteTurn ? "white" : "black"
        });
        setLastThoughtProcess(`Waiting for ${currentConfig.provider} to think...`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [fen, pgn, turn, isGameOver, matchId, currentGameConfig, makeMove, aiMoveMutation]);

  // Handle manual retry
  const handleRetry = () => {
    const isWhiteTurn = turn === "w";
    const currentConfig = isWhiteTurn ? currentGameConfig.white : currentGameConfig.black;
    
    aiMoveMutation.mutate({
      fen,
      pgn,
      provider: currentConfig.provider,
      model: currentConfig.model,
      color: isWhiteTurn ? "white" : "black"
    });
    setLastThoughtProcess(`Retrying: Waiting for ${currentConfig.provider} to think...`);
  };

  // Finalize Match
  useEffect(() => {
    if (isGameOver && matchId) {
      const result = winner === 'w' ? '1-0' : winner === 'b' ? '0-1' : '1/2-1/2';
      finalizeMatch(matchId, result);
    }
  }, [isGameOver, winner, matchId]);

  useEffect(() => {
    if (matchId) {
      import("@/app/actions/match").then(({ getMatch }) => {
        getMatch(matchId).then((result) => {
          if (result.success && result.match) {
            const history = (result.match.moves as Array<{ san: string; thoughtProcess?: string; timestamp: string }>).map((m, index: number) => ({
              moveNumber: Math.floor(index / 2) + 1,
              color: index % 2 === 0 ? "White" : "Black",
              san: m.san,
              thought: m.thoughtProcess || "",
              timestamp: m.timestamp
            })).filter((h) => h.thought);
            setThoughtHistory(history);
          }
        });
      });
    }
  }, [matchId]);

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
                        <CapturedPieces pieces={captured.w} isWhiteCapture={true} />
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
                        <CapturedPieces pieces={captured.b} isWhiteCapture={false} />
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
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${turn === 'w' ? 'bg-white' : 'bg-slate-500'}`} />
                      <span className="text-slate-200 font-medium">
                        {turn === 'w' ? "White's Turn" : "Black's Turn"}
                      </span>
                      {aiMoveMutation.isPending && <span className="text-xs text-blue-400 ml-auto animate-pulse">Thinking...</span>}
                    </div>
                    
                    {aiMoveMutation.isError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
                          <AlertCircle className="w-4 h-4" />
                          <span>Move Generation Failed</span>
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={handleRetry}
                          className="w-full bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-200 text-xs h-8"
                        >
                          <RefreshCw className={`w-3 h-3 mr-2 ${aiMoveMutation.isPending ? 'animate-spin' : ''}`} />
                          Retry Move
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button variant="secondary" onClick={resetGame} className="w-full">
                <RotateCcw className="w-4 h-4" />
                Reset Match
              </Button>
            </div>

            <ThoughtHistory 
              history={thoughtHistory}
              isThinking={aiMoveMutation.isPending}
              currentThinkingMessage={lastThoughtProcess}
            />
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

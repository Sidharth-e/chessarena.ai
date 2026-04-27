"use client";

import { useState, useEffect } from "react";
import ChessBoard3D from "@/components/chess/ChessBoard3D";
import { useGameStore } from "@/store/useGameStore";
import { BrainCircuit, Play, RotateCcw, Trophy, Activity, Skull } from "lucide-react";
import axios from "axios";

const PROVIDERS = ["Human", "OpenAI", "Anthropic", "Gemini", "Azure", "Grok", "Perplexity"];
const MODELS: Record<string, string[]> = {
  "OpenAI": ["gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo"],
  "Anthropic": ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
  "Gemini": ["gemini-1.5-pro", "gemini-1.5-flash"],
  "Azure": ["gpt-4", "gpt-35-turbo"],
  "Grok": ["grok-1", "grok-1.5"],
  "Perplexity": ["llama-3-sonar-large-32k-chat", "llama-3-sonar-small-32k-chat"]
};

export default function Home() {
  const { fen, pgn, turn, isGameOver, winner, makeMove, resetGame } = useGameStore();
  
  const [whiteProvider, setWhiteProvider] = useState("Human");
  const [whiteModel, setWhiteModel] = useState("");
  const [blackProvider, setBlackProvider] = useState("OpenAI");
  const [blackModel, setBlackModel] = useState("gpt-4o");
  
  const [isThinking, setIsThinking] = useState(false);
  const [lastThoughtProcess, setLastThoughtProcess] = useState("");

  // Set default models when provider changes
  useEffect(() => {
    if (whiteProvider !== "Human" && (!whiteModel || !MODELS[whiteProvider]?.includes(whiteModel))) {
      setWhiteModel(MODELS[whiteProvider][0]);
    }
  }, [whiteProvider]);

  useEffect(() => {
    if (blackProvider !== "Human" && (!blackModel || !MODELS[blackProvider]?.includes(blackModel))) {
      setBlackModel(MODELS[blackProvider][0]);
    }
  }, [blackProvider]);

  // AI Game Loop
  useEffect(() => {
    if (isGameOver) return;
    
    const isWhiteTurn = turn === "w";
    const currentProvider = isWhiteTurn ? whiteProvider : blackProvider;
    const currentModel = isWhiteTurn ? whiteModel : blackModel;

    if (currentProvider !== "Human" && !isThinking) {
      const fetchAIMove = async () => {
        setIsThinking(true);
        setLastThoughtProcess(`Waiting for ${currentProvider} to think...`);
        try {
          const res = await axios.post("/api/llm-move", {
            fen,
            pgn,
            provider: currentProvider,
            model: currentModel,
            color: isWhiteTurn ? "white" : "black"
          });

          if (res.data.move) {
            makeMove(res.data.move);
            setLastThoughtProcess(res.data.thoughtProcess || `Played ${res.data.move}`);
          } else if (res.data.error) {
            setLastThoughtProcess(`Error: ${res.data.error}`);
          }
        } catch (error: any) {
          console.error(error);
          setLastThoughtProcess(`Error fetching move: ${error.message}`);
        } finally {
          setIsThinking(false);
        }
      };

      // Slight delay so the UI updates
      const timer = setTimeout(() => {
        fetchAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [fen, turn, isGameOver, whiteProvider, whiteModel, blackProvider, blackModel, makeMove, isThinking]);

  return (
    <main className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <BrainCircuit className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            AI Chess Arena
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Watch the world's most powerful LLMs battle it out on a 3D chess board. 
            Select your fighters and let the game begin.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Player Configs */}
          <div className="space-y-6">
            <div className="card space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                White Player
              </h2>
              
              <div>
                <label className="label-text">Provider</label>
                <select 
                  className="input-field"
                  value={whiteProvider}
                  onChange={(e) => setWhiteProvider(e.target.value)}
                >
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {whiteProvider !== "Human" && (
                <div>
                  <label className="label-text">Model</label>
                  <select 
                    className="input-field"
                    value={whiteModel}
                    onChange={(e) => setWhiteModel(e.target.value)}
                  >
                    {MODELS[whiteProvider]?.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="card space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-900 border border-slate-600 shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
                Black Player
              </h2>
              
              <div>
                <label className="label-text">Provider</label>
                <select 
                  className="input-field"
                  value={blackProvider}
                  onChange={(e) => setBlackProvider(e.target.value)}
                >
                  {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {blackProvider !== "Human" && (
                <div>
                  <label className="label-text">Model</label>
                  <select 
                    className="input-field"
                    value={blackModel}
                    onChange={(e) => setBlackModel(e.target.value)}
                  >
                    {MODELS[blackProvider]?.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="card space-y-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-5 h-5 text-info" />
                Match Status
              </h3>
              
              {isGameOver ? (
                <div className="p-4 bg-success/20 border border-success/30 rounded-lg flex flex-col items-center justify-center text-center space-y-2">
                  <Trophy className="w-8 h-8 text-success" />
                  <span className="font-bold text-success text-xl">
                    {winner === 'w' ? 'White Wins!' : winner === 'b' ? 'Black Wins!' : 'Draw!'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${turn === 'w' ? 'bg-white' : 'bg-slate-500'}`} />
                  <span className="text-slate-300 font-medium">
                    {turn === 'w' ? "White's Turn" : "Black's Turn"}
                  </span>
                  {isThinking && <span className="text-sm text-info ml-auto animate-pulse">Thinking...</span>}
                </div>
              )}

              <button onClick={resetGame} className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
                <RotateCcw className="w-4 h-4" />
                Reset Game
              </button>
            </div>
          </div>

          {/* Center Column: 3D Board */}
          <div className="lg:col-span-2 space-y-6">
            <ChessBoard3D />

            {/* AI Thought Process Console */}
            <div className="card bg-slate-950 border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                AI Thought Process
              </h3>
              <div className="h-32 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-900 p-4 rounded border border-slate-800 whitespace-pre-wrap">
                {lastThoughtProcess || "Awaiting AI reasoning..."}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

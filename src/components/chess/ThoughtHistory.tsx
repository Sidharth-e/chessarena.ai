import React, { useEffect, useRef } from "react";
import { BrainCircuit } from "lucide-react";

interface ThoughtEntry {
  moveNumber: number;
  color: string;
  san: string;
  thought: string;
  timestamp: string;
}

interface ThoughtHistoryProps {
  history: ThoughtEntry[];
  isThinking: boolean;
  currentThinkingMessage: string;
}

export function ThoughtHistory({ history, isThinking, currentThinkingMessage }: ThoughtHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isThinking, currentThinkingMessage]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 flex flex-col h-64">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2 shrink-0">
        <BrainCircuit className="w-4 h-4 text-blue-500" />
        Cognition Stream
      </h3>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto font-mono text-xs text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-800/50 space-y-4 leading-relaxed scroll-smooth"
      >
        {history.length === 0 && !isThinking && (
          <div className="text-slate-600 italic">Waiting for initial move...</div>
        )}
        
        {history.map((entry, i) => (
          <div key={i} className="border-l-2 border-slate-800 pl-3 py-1 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-tighter">
              <span>Move {entry.moveNumber} • {entry.color} ({entry.san})</span>
              <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div className="whitespace-pre-wrap">{entry.thought}</div>
          </div>
        ))}

        {isThinking && (
          <div className="border-l-2 border-blue-500/30 pl-3 py-1 animate-pulse">
            <div className="text-[10px] text-blue-400/60 uppercase tracking-tighter">Thinking...</div>
            <div className="text-blue-400/80 italic">{currentThinkingMessage}</div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { getRecentMatches, getMatch } from '@/app/actions/match';
import { Button } from '@/components/ui/Button';
import { X, History, PlayCircle } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Match {
  _id: string;
  whiteProvider: string;
  blackProvider: string;
  whiteModel: string;
  blackModel: string;
  result: string;
  createdAt: string;
  fen: string;
  pgn: string;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({ isOpen, onClose }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { initGame } = useGameStore();

  useEffect(() => {
    let isMounted = true;
    
    if (isOpen) {
      const fetchMatches = async () => {
        setIsLoading(true);
        try {
          const result = await getRecentMatches(20);
          if (isMounted && result.success) {
            setMatches((result.matches as Match[]) || []);
          }
        } catch (error) {
          console.error("Failed to fetch matches:", error);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      
      fetchMatches();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleContinueMatch = async (matchId: string) => {
    setIsLoading(true);
    const result = await getMatch(matchId);
    if (result.success && result.match) {
      const match = result.match;
      const whiteConfig = { provider: match.whiteProvider, model: match.whiteModel };
      const blackConfig = { provider: match.blackProvider, model: match.blackModel };
      
      // We re-initialize the chess instance with the saved FEN and PGN
      initGame(match._id, whiteConfig, blackConfig, match.fen, match.pgn);
      
      // TODO: Ensure useGameStore can handle resuming from a specific FEN/PGN
      // For this task, we focus on the UI to choose.
      onClose();
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Match History</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-400 animate-pulse">Retrieving match archives...</p>
            </div>
          )}

          {!isLoading && matches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 italic">No matches found in the archives.</p>
            </div>
          )}

          {!isLoading && matches.map((match) => (
            <div 
              key={match._id}
              className="group bg-slate-800/50 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 rounded-xl p-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {match._id.substring(0, 8)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(match.createdAt).toLocaleDateString()} {new Date(match.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-tighter">White</span>
                      <span className="text-sm text-white font-medium">{match.whiteProvider}</span>
                    </div>
                    <div className="text-slate-700 font-black italic">VS</div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-tighter text-right">Black</span>
                      <span className="text-sm text-white font-medium text-right">{match.blackProvider}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end mr-4">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Result</span>
                    <span className={`text-sm font-bold ${match.result === '1-0' ? 'text-green-400' : match.result === '0-1' ? 'text-red-400' : 'text-slate-400'}`}>
                      {match.result || 'In Progress'}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleContinueMatch(match._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Load
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 rounded-b-2xl">
          <p className="text-[10px] text-slate-600 uppercase text-center font-bold tracking-widest">
            Match logs are persisted automatically via Arena Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

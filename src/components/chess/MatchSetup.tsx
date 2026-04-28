"use client";

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { PlayerConfigCard } from './PlayerConfigCard';
import { Button } from '@/components/ui/Button';
import { createMatch } from '@/app/actions/match';
import { PlayerConfig } from '@/config/models';
import { Rocket, Settings2, Play, History } from 'lucide-react';
import { MatchHistoryModal } from './MatchHistoryModal';

export const MatchSetup: React.FC = () => {
  const { globalSettings, initGame } = useGameStore();
  const [setupMode, setSetupMode] = useState<'selection' | 'manual'>('selection');
  const [localConfig, setLocalConfig] = useState<{ white: PlayerConfig; black: PlayerConfig }>(globalSettings);
  const [isStarting, setIsStarting] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleStartMatch = async (config: { white: PlayerConfig; black: PlayerConfig }) => {
    setIsStarting(true);
    try {
      const result = await createMatch(
        config.white.provider,
        config.black.provider,
        config.white.model,
        config.black.model
      );

      if (result.success && result.matchId) {
        initGame(result.matchId, config.white, config.black);
      } else {
        console.error("Failed to create match:", result.error);
        alert("Failed to start match. Please try again.");
      }
    } catch (error) {
      console.error("Error starting match:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsStarting(false);
    }
  };

  if (setupMode === 'selection') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 shadow-2xl max-w-2xl mx-auto">
        <h2 className="text-3xl font-black text-white mb-2 italic tracking-tighter">PREPARE FOR BATTLE</h2>
        <p className="text-slate-400 mb-8 text-center">Select your match configuration to begin the arena.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
          <button
            onClick={() => handleStartMatch(globalSettings)}
            disabled={isStarting}
            className="flex flex-col items-center p-6 bg-blue-600/10 border border-blue-500/30 rounded-xl hover:bg-blue-600/20 transition-all group text-left"
          >
            <Rocket className="w-10 h-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-1">Quick Start</h3>
            <p className="text-sm text-slate-400 text-center">Jump in with your saved default settings.</p>
          </button>

          <button
            onClick={() => setSetupMode('manual')}
            disabled={isStarting}
            className="flex flex-col items-center p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all group text-left"
          >
            <Settings2 className="w-10 h-10 text-slate-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-1">Manual Setup</h3>
            <p className="text-sm text-slate-400 text-center">Customize players and models for this match.</p>
          </button>
        </div>

        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <History className="w-4 h-4" />
          View Match History
        </button>

        <MatchHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-8 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 shadow-2xl max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter">MANUAL SETUP</h2>
          <p className="text-slate-400">Configure combatants for the next engagement.</p>
        </div>
        <Button variant="ghost" onClick={() => setSetupMode('selection')} disabled={isStarting}>
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <PlayerConfigCard
          title="White Pieces"
          config={localConfig.white}
          onChange={(newConfig) => setLocalConfig({ ...localConfig, white: newConfig })}
        />
        <PlayerConfigCard
          title="Black Pieces"
          config={localConfig.black}
          onChange={(newConfig) => setLocalConfig({ ...localConfig, black: newConfig })}
        />
      </div>

      <Button 
        variant="primary" 
        size="lg" 
        className="w-full py-4 text-xl font-black"
        onClick={() => handleStartMatch(localConfig)}
        disabled={isStarting}
      >
        {isStarting ? (
          "INITIALIZING..."
        ) : (
          <>
            <Play className="fill-current" />
            COMMENCE MATCH
          </>
        )}
      </Button>
    </div>
  );
};

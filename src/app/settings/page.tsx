"use client";

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { PlayerConfigCard } from '@/components/chess/PlayerConfigCard';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Settings2 } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { globalSettings, setGlobalSettings } = useGameStore();

  const handleUpdateWhite = (newConfig: any) => {
    setGlobalSettings({ ...globalSettings, white: newConfig });
  };

  const handleUpdateBlack = (newConfig: any) => {
    setGlobalSettings({ ...globalSettings, black: newConfig });
  };

  return (
    <main className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings2 className="w-8 h-8 text-blue-500" />
              Global Settings
            </h1>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl space-y-8">
          <div className="space-y-2">
            <p className="text-slate-400">
              Configure the default AI providers and models for new matches. 
              These settings are saved locally and used for "Quick Start".
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                Default White
              </h2>
              <PlayerConfigCard
                title=""
                config={globalSettings.white}
                onChange={handleUpdateWhite}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-700" />
                Default Black
              </h2>
              <PlayerConfigCard
                title=""
                config={globalSettings.black}
                onChange={handleUpdateBlack}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700 flex justify-end">
            <Link href="/">
              <Button variant="primary" className="px-8">
                <Save className="w-4 h-4" />
                Save & Exit
              </Button>
            </Link>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-400">
          <strong>Pro Tip:</strong> You can still override these settings for individual matches using the "Manual Setup" option in the Play arena.
        </div>
      </div>
    </main>
  );
}

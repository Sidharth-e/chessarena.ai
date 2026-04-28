"use client";

import React from "react";
import Link from "next/link";
import { BrainCircuit, Play, Settings, Trophy, Cpu } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600/10 rounded-3xl border border-blue-500/20 mb-4 animate-bounce-slow">
            <BrainCircuit className="w-16 h-16 text-blue-500" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent tracking-tighter">
            AI CHESS <br /> ARENA
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            The ultimate battleground for Large Language Models. 
            Watch GPT-4o, Claude 3.5, and Gemini Pro 1.5 clash in high-stakes 3D chess.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/play" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-64 h-16 text-xl font-bold shadow-lg shadow-blue-600/20">
              <Play className="w-6 h-6 fill-current" />
              START GAME
            </Button>
          </Link>
          <Link href="/settings" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-64 h-16 text-xl font-bold">
              <Settings className="w-6 h-6" />
              SETTINGS
            </Button>
          </Link>
        </div>

        {/* Stats / Features Brief */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-white font-bold mb-1">Elo Ranked</h3>
            <p className="text-slate-500 text-sm">LLM leaderboard coming soon</p>
          </div>
          <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm">
            <BrainCircuit className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="text-white font-bold mb-1">Multi-Model</h3>
            <p className="text-slate-500 text-sm">Support for 10+ providers</p>
          </div>
          <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm">
            <Cpu className="w-8 h-8 text-white mx-auto mb-3" />
            <h3 className="text-white font-bold mb-1">Open Source</h3>
            <p className="text-slate-500 text-sm">Built with Next.js & Three.js</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 text-slate-600 text-sm font-medium">
        v1.0.0-alpha • Designed for the future of AI
      </footer>
    </main>
  );
}

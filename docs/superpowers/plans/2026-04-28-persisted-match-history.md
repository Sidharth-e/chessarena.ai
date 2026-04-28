# Persisted Match History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a cumulative, persisted history of AI thought processes in the Cognition Stream UI.

**Architecture:** Use `IMatch` model's existing `moves` array to store and retrieve thought processes. A new `ThoughtHistory` component will handle rendering and auto-scrolling.

**Tech Stack:** React, TypeScript, Next.js Server Actions, Mongoose, Lucide React.

---

### Task 1: Initialize Thought History State

**Files:**
- Modify: `src/app/play/page.tsx`

- [ ] **Step 1: Add state for thought history**

```typescript
// Inside PlayPage component
const [thoughtHistory, setThoughtHistory] = useState<Array<{
  moveNumber: number;
  color: string;
  san: string;
  thought: string;
  timestamp: string;
}>>([]);
```

- [ ] **Step 2: Initialize history from fetched match**

Add a `useEffect` to fetch the match data if `matchId` exists and populate the `thoughtHistory`.

```typescript
useEffect(() => {
  if (matchId) {
    import("@/app/actions/match").then(({ getMatch }) => {
      getMatch(matchId).then((result) => {
        if (result.success && result.match) {
          const history = result.match.moves.map((m: any, index: number) => ({
            moveNumber: Math.floor(index / 2) + 1,
            color: index % 2 === 0 ? "White" : "Black",
            san: m.san,
            thought: m.thoughtProcess || "",
            timestamp: m.timestamp
          })).filter((h: any) => h.thought);
          setThoughtHistory(history);
        }
      });
    });
  }
}, [matchId]);
```

- [ ] **Step 3: Commit**

```bash
git add src/app/play/page.tsx
git commit -m "feat: init thought history state and load from match"
```

### Task 2: Create ThoughtHistory Component

**Files:**
- Create: `src/components/chess/ThoughtHistory.tsx`

- [ ] **Step 1: Implement the scrollable history component**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chess/ThoughtHistory.tsx
git commit -m "feat: create ThoughtHistory component with auto-scroll"
```

### Task 3: Integrate History in PlayPage

**Files:**
- Modify: `src/app/play/page.tsx`

- [ ] **Step 1: Import ThoughtHistory**

```typescript
import { ThoughtHistory } from "@/components/chess/ThoughtHistory";
```

- [ ] **Step 2: Update onSuccess mutation to append to history**

```typescript
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
      
      // Append to history
      const isWhite = turn === "w";
      setThoughtHistory(prev => [...prev, {
        moveNumber: Math.floor(pgn.split(" ").filter(Boolean).length / 2) + 1,
        color: isWhite ? "White" : "Black",
        san: data.move,
        thought: data.thoughtProcess || `Played ${data.move}`,
        timestamp: new Date().toISOString()
      }]);
    }
    setLastThoughtProcess(""); // Clear single thought process state
  } else if (data.error) {
    setLastThoughtProcess(`Error: ${data.error}`);
  }
},
```

- [ ] **Step 3: Replace old Cognition Stream UI with ThoughtHistory component**

```tsx
// Replace the old Cognition Stream block with this:
<ThoughtHistory 
  history={thoughtHistory}
  isThinking={aiMoveMutation.isPending}
  currentThinkingMessage={lastThoughtProcess}
/>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/play/page.tsx
git commit -m "feat: integrate ThoughtHistory in PlayPage"
```

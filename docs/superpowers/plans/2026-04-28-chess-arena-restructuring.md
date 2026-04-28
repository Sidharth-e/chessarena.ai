# Chess Arena Restructuring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transition the Chess Arena to a modular, routed architecture with global settings and hybrid persistence.

**Architecture:** Use Next.js App Router for distinct Home, Settings, and Play pages. Centralize configuration in `src/config` and UI in `src/components/ui`. Implement a tiered persistence strategy using Zustand, localStorage, and MongoDB.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Zustand, MongoDB, Lucide React.

---

### Task 1: Centralized Model Configuration

**Files:**
- Create: `src/config/models.ts`

- [ ] **Step 1: Create the centralized configuration file**

```typescript
export const PROVIDERS = ["Human", "OpenAI", "Anthropic", "Gemini", "Azure", "Grok", "Perplexity"];

export const MODELS: Record<string, string[]> = {
  "OpenAI": ["gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo"],
  "Anthropic": ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
  "Gemini": ["gemini-3.1-pro-preview", "gemini-3-flash-preview"],
  "Azure": ["gpt-4", "gpt-35-turbo"],
  "Grok": ["grok-1", "grok-1.5"],
  "Perplexity": ["llama-3-sonar-large-32k-chat", "llama-3-sonar-small-32k-chat"]
};

export interface PlayerConfig {
  provider: string;
  model: string;
}

export const DEFAULT_CONFIG: { white: PlayerConfig; black: PlayerConfig } = {
  white: { provider: "Human", model: "" },
  black: { provider: "OpenAI", model: "gpt-4o" }
};
```

- [ ] **Step 2: Commit**
```bash
git add src/config/models.ts
git commit -m "feat: centralize LLM provider and model configuration"
```

---

### Task 2: Reusable UI Components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Select.tsx`

- [ ] **Step 1: Create Button component**
```tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'info';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    info: "bg-indigo-600 hover:bg-indigo-700 text-white"
  };
  
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
```

- [ ] **Step 2: Create Select component**
```tsx
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-semibold text-slate-400">{label}</label>}
      <select 
        className={`w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};
```

- [ ] **Step 3: Commit**
```bash
git add src/components/ui/Button.tsx src/components/ui/Select.tsx
git commit -m "feat: add reusable Button and Select UI components"
```

---

### Task 3: Update Game Store for Hybrid Persistence

**Files:**
- Modify: `src/store/useGameStore.ts`
- Create: `src/models/UserConfig.ts`

- [ ] **Step 1: Create UserConfig Mongoose model**
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserConfig extends Document {
  white: { provider: string; model: string };
  black: { provider: string; model: string };
}

const UserConfigSchema: Schema = new Schema({
  white: {
    provider: { type: String, default: 'Human' },
    model: { type: String, default: '' }
  },
  black: {
    provider: { type: String, default: 'OpenAI' },
    model: { type: String, default: 'gpt-4o' }
  }
}, { timestamps: true });

export default mongoose.models.UserConfig || mongoose.model<IUserConfig>('UserConfig', UserConfigSchema);
```

- [ ] **Step 2: Update Zustand Store**
Update `GameState` interface to include `globalSettings` and `currentGameConfig`. Use `persist` middleware for `localStorage`.

- [ ] **Step 3: Commit**
```bash
git add src/models/UserConfig.ts src/store/useGameStore.ts
git commit -m "feat: update store for hybrid persistence and global settings"
```

---

### Task 4: Player Config and Match Setup Components

**Files:**
- Create: `src/components/chess/PlayerConfigCard.tsx`
- Create: `src/components/chess/MatchSetup.tsx`

- [ ] **Step 1: Implement PlayerConfigCard**
- [ ] **Step 2: Implement MatchSetup overlay**
- [ ] **Step 3: Commit**
```bash
git add src/components/chess/PlayerConfigCard.tsx src/components/chess/MatchSetup.tsx
git commit -m "feat: add PlayerConfigCard and MatchSetup components"
```

---

### Task 5: Routing - Home, Settings, and Play Pages

**Files:**
- Modify: `src/app/page.tsx` (Move old content to `/play` and make this the Home Menu)
- Create: `src/app/settings/page.tsx`
- Create: `src/app/play/page.tsx`

- [ ] **Step 1: Refactor Home page to Menu**
- [ ] **Step 2: Create Settings page**
- [ ] **Step 3: Create Play page with MatchSetup integration**
- [ ] **Step 4: Commit**
```bash
git add src/app/page.tsx src/app/settings/page.tsx src/app/play/page.tsx
git commit -m "feat: implement routed architecture (Home, Settings, Play)"
```

---

### Task 6: MongoDB Sync API

**Files:**
- Create: `src/app/api/user-config/route.ts`

- [ ] **Step 1: Implement GET and POST handlers for UserConfig**
- [ ] **Step 2: Commit**
```bash
git add src/app/api/user-config/route.ts
git commit -m "feat: add API route for MongoDB user configuration sync"
```

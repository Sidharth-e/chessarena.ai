# Design Doc: Chess Arena Restructuring (Home, Settings, Routing)

## 1. Overview
Transition the AI Chess Arena from a single-page view to a multi-page routed architecture with centralized configuration, global settings, and a dedicated pre-game flow.

## 2. Goals
- **Routing:** Separate Home, Settings, and Game Arena.
- **Modularity:** Extract LLM configurations and UI components for reuse.
- **Global Settings:** Persistent default configurations for White and Black players.
- **Pre-game Flow:** A "Match Preparation" stage to choose between default or custom settings.

## 3. Architecture & Routing
### Routes
- `/`: **Home Menu**. Hero section with "Start Game" and "Settings" buttons.
- `/settings`: **Global Configuration**. Manage default providers and models.
- `/play`: **The Arena**. Handles match initialization and gameplay.

### Centralized Configuration (`src/config/models.ts`)
Move provider and model data into a shared config:
- `PROVIDERS`: Array of supported LLM providers.
- `MODELS`: Map of providers to their available models.
- `DEFAULT_CONFIG`: Initial fallback settings.

## 4. State Management (`src/store/useGameStore.ts`)
Update the store to handle persistence and match setup:
- `globalSettings`: The persistent defaults (synced to `localStorage`).
- `currentGameConfig`: Settings for the active match.
- `setGlobalSettings(config)`: Updates defaults.
- `initMatch(config)`: Resets game state with specific player settings.

## 5. UI Components
### Reusable UI (`src/components/ui/`)
- `Button.tsx`: Consistent styling for primary/secondary actions.
- `Select.tsx`: Standardized dropdown for provider/model selection.

### Chess Components (`src/components/chess/`)
- `PlayerConfigCard.tsx`: Used in `/settings` and `/play` to configure an LLM player.
- `MatchSetup.tsx`: The initial view on `/play` to choose between "Quick Start" (defaults) and "Manual Setup".

## 6. Detailed Flow
1. **Landing:** User arrives at `/`.
2. **Setup Defaults:** User optionally visits `/settings` to set preferred LLMs.
3. **Start Game:** User clicks "Start Game" on `/` -> Navigates to `/play`.
4. **Match Prep:** `/play` renders `MatchSetup`.
   - **Quick Start:** Immediately calls `initMatch(globalSettings)`.
   - **Customize:** Shows two `PlayerConfigCard`s, then calls `initMatch(customSettings)`.
5. **Gameplay:** Board renders and AI loop begins using `currentGameConfig`.

## 7. Persistence (Hybrid Strategy)
To ensure settings are both instant and durable, we will use a tiered approach:
- **Zustand:** Primary runtime state for immediate UI responsiveness.
- **`localStorage`:** Persist `globalSettings` on the client for instant hydration during page loads (middleware-based sync).
- **MongoDB:** Store user preferences in a `UserConfig` collection for long-term durability and cross-device sync.
  - A background sync process will ensure `localStorage` and MongoDB stay aligned.
  - Match-specific configurations will be saved within the `Match` model in MongoDB.

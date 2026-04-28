# Design Spec - Persisted Match History & Cognition Stream

## 1. Overview
The goal is to enhance the "Cognition Stream" UI to show a cumulative history of all AI thought processes for a given match, persisted in the database.

## 2. Requirements
- Display a scrollable history of all AI thought processes.
- Fetch and display thoughts from previous moves on page load/refresh.
- Automatically scroll to the latest thought entry.
- Identify each thought by move number, color, and move played (SAN).

## 3. Architecture & Data Flow
- **Data Model:** Use the existing `IMatch` interface which contains a `moves` array with `thoughtProcess`.
- **Backend:** 
  - `getMatch` server action returns the full `moves` array.
  - `updateMatchMove` appends the current thought to the `moves` array.
- **Frontend:**
  - `PlayPage` will fetch match data on mount.
  - Transform `match.moves` into a displayable history format.
  - Update history state when `aiMoveMutation` succeeds.

## 4. Components & UI
- **PlayPage:** 
  - New state `thoughtHistory` initialized from the fetched match.
  - `useEffect` to scroll the "Cognition Stream" container to the bottom.
- **Cognition Stream UI:**
  - Map through `thoughtHistory`.
  - Display format: `[Move N - Color] SAN: Thought`.

## 5. Implementation Steps
1. Update `getMatch` usage in `PlayPage` (if needed) to ensure initial history is loaded.
2. Modify `PlayPage` state to handle an array of thoughts.
3. Update `aiMoveMutation.onSuccess` to append to the history.
4. Enhance the "Cognition Stream" JSX to render the array with auto-scroll.
5. Add a loading state for the initial match fetch.

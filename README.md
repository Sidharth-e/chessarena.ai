# AI Chess Arena ♟️🤖

AI Chess Arena is a modern, high-performance web application featuring a 3D chess board where you can pit different Large Language Models (LLMs) against each other or play against them yourself. 

Built with Next.js, React Three Fiber, and LangChain, this project enables real-time chess matches using models from OpenAI, Anthropic, Google (Gemini), Azure, Grok, and Perplexity.

## Tech Stack
- **Framework**: [Next.js (App Router)](https://nextjs.org)
- **3D Graphics**: [Three.js](https://threejs.org/) + [React Three Fiber](https://r3f.docs.pmnd.rs/) + [Drei](https://github.com/pmndrs/drei)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Game Logic**: [chess.js](https://github.com/jhlywa/chess.js)
- **AI Integrations**: [LangChain JS](https://js.langchain.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via Mongoose)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

### Prerequisites
Make sure you have Node.js and **pnpm** installed (this project strictly uses `pnpm` for package management).

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Variables
Copy the example environment file and fill in your API keys and MongoDB connection string.
```bash
cp .env.example .env.local
```
*Note: You do not need to fill in all API keys, only the ones for the providers you intend to use.*

### 3. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features
- **3D Interface**: Fully interactive, geometrically generated 3D chess pieces and board.
- **Provider Agnostic**: Easily switch between OpenAI, Anthropic, Gemini, Grok, and more.
- **Thought Streaming**: Watch the AI's internal thought process as it evaluates the FEN board state and decides on a move.
- **Match History**: Saves completed matches to MongoDB.

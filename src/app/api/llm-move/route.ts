import { NextResponse } from "next/server";
import { ChatOpenAI, AzureChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Chess } from "chess.js";

function getLLM(provider: string, model: string) {
  switch (provider.toLowerCase()) {
    case "openai":
      return new ChatOpenAI({
        modelName: model,
        temperature: 0.1, // Low temp for more deterministic valid moves
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    case "azure":
      return new AzureChatOpenAI({
        modelName: model,
        temperature: 0.1,
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
        azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
        azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
        azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
      });
    case "anthropic":
      return new ChatAnthropic({
        modelName: model,
        temperature: 0.1,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      });
    case "gemini":
      return new ChatGoogleGenerativeAI({
        model: model,
        temperature: 0.1,
        apiKey: process.env.GOOGLE_API_KEY,
        maxRetries: 2,
      });
    case "grok":
      return new ChatOpenAI({
        modelName: model,
        temperature: 0.1,
        openAIApiKey: process.env.GROK_API_KEY,
        configuration: {
          baseURL: "https://api.x.ai/v1",
        },
      });
    case "perplexity":
      return new ChatOpenAI({
        modelName: model,
        temperature: 0.1,
        openAIApiKey: process.env.PERPLEXITY_API_KEY,
        configuration: {
          baseURL: "https://api.perplexity.ai",
        },
      });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fen, pgn, provider, model, color } = body;

    if (!fen || !provider || !model || !color) {
      return NextResponse.json(
        { error: "Missing required fields: fen, provider, model, color" },
        { status: 400 }
      );
    }

    const llm = getLLM(provider, model);
    const chess = new Chess(fen);
    
    // Check if the game is already over
    if (chess.isGameOver()) {
       return NextResponse.json({ error: "Game is already over" }, { status: 400 });
    }

    const legalMoves = chess.moves();

    const systemPrompt = `You are an expert chess engine. You are playing as ${color}.
Current board state in FEN: ${fen}
Current game PGN: ${pgn}
Valid legal moves in standard algebraic notation (SAN) for you: ${legalMoves.join(", ")}

Your task:
Choose the BEST legal move from the list above. Think step by step about the board state, potential threats, and tactics.
Then, on the final line of your response, output ONLY the chosen move in SAN format (e.g., e4, Nf3, O-O). Do not put any other text on the final line.`;

    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage("What is your next move?"),
    ]);

    const content = typeof response.content === "string" ? response.content : response.content[0].toString();
    
    // Extract the last line which should be the move
    const lines = content.trim().split("\n");
    const chosenMove = lines[lines.length - 1].trim();

    // Verify if it's a legal move
    if (!legalMoves.includes(chosenMove)) {
      console.warn(`LLM attempted illegal move: ${chosenMove}. Falling back to random legal move.`);
      // Fallback: Pick a random legal move if LLM hallucinates
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return NextResponse.json({ 
        move: randomMove, 
        thoughtProcess: content,
        warning: `LLM suggested illegal move '${chosenMove}'. Random legal move played instead.` 
      });
    }

    return NextResponse.json({ 
      move: chosenMove,
      thoughtProcess: content 
    });

  } catch (error: unknown) {
    console.error("LLM Move Error:", error);
    
    const err = error as { 
      status?: number; 
      response?: { status?: number }; 
      message?: string;
      errorDetails?: Array<{ '@type'?: string; retryDelay?: string }>;
    };

    // Handle rate limiting specifically
    if (err.status === 429 || err.response?.status === 429 || err.message?.includes("429")) {
      let retryAfter = null;
      let specificMessage = "Rate limit exceeded. Please wait a moment before trying again.";

      // Try to extract specific retry delay from Google Generative AI error
      if (err.errorDetails) {
        const quotaFailure = err.errorDetails.find((d) => d['@type']?.includes('QuotaFailure'));
        const retryInfo = err.errorDetails.find((d) => d['@type']?.includes('RetryInfo'));
        
        if (retryInfo?.retryDelay) {
          // Format like "29s" or "29.332s"
          retryAfter = retryInfo.retryDelay;
          specificMessage = `Rate limit exceeded. Gemini suggests retrying in ${retryAfter}.`;
        } else if (quotaFailure) {
          specificMessage = "Gemini quota exceeded. You may have reached your free tier limit for this model.";
        }
      }

      return NextResponse.json(
        { 
          error: specificMessage,
          details: error.message,
          retryAfter: retryAfter
        },
        { status: 429 }
      );
    }

    const message = error instanceof Error ? error.message : "Failed to generate move";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

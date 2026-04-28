"use server";

import connectToDatabase from "@/lib/mongoose";
import { Match } from "@/models/Match";

export async function createMatch(whiteProvider: string, blackProvider: string, whiteModel: string, blackModel: string) {
  try {
    await connectToDatabase();
    
    const newMatch = new Match({
      whiteProvider,
      blackProvider,
      whiteModel,
      blackModel,
    });
    
    await newMatch.save();
    return { success: true, matchId: newMatch._id.toString() };
  } catch (error: unknown) {
    console.error("Error creating match:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getMatch(matchId: string) {
  try {
    await connectToDatabase();
    const match = await Match.findById(matchId).lean();
    if (!match) return { success: false, error: "Match not found" };
    
    // Convert ObjectId to string for client component consumption
    return { 
      success: true, 
      match: {
        ...match,
        _id: match._id.toString(),
        createdAt: match.createdAt?.toISOString(),
        updatedAt: match.updatedAt?.toISOString(),
        moves: match.moves.map(m => {
          const move = m as { san: string; fen: string; timestamp: Date; thoughtProcess?: string; _id?: { toString: () => string } };
          return {
            ...move,
            _id: move._id?.toString(),
            timestamp: move.timestamp?.toISOString()
          };
        })
      }
    };
  } catch (error: unknown) {
    console.error("Error fetching match:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function updateMatchMove(matchId: string, fen: string, pgn: string, san: string, thoughtProcess?: string) {
  try {
    await connectToDatabase();
    
    const match = await Match.findById(matchId);
    if (!match) return { success: false, error: "Match not found" };
    
    match.fen = fen;
    match.pgn = pgn;
    match.moves.push({
      san,
      fen,
      timestamp: new Date(),
      thoughtProcess
    });
    
    await match.save();
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating match:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function finalizeMatch(matchId: string, result: "1-0" | "0-1" | "1/2-1/2" | "*") {
  try {
    await connectToDatabase();
    await Match.findByIdAndUpdate(matchId, {
      status: "completed",
      result
    });
    return { success: true };
  } catch (error: unknown) {
    console.error("Error finalizing match:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

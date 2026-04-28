"use server";

import connectToDatabase from "@/lib/mongoose";
import { Match } from "@/models/Match";

export async function getRecentMatches(limit: number = 10) {
  try {
    await connectToDatabase();
    const matches = await Match.find()
      .select("-moves") // Exclude moves for the list view to avoid serialization issues and improve performance
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return {
      success: true,
      matches: matches.map(m => ({
        ...m,
        _id: m._id.toString(),
        createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
        updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
      }))
    };
  } catch (error: unknown) {
    console.error("Error fetching recent matches:", error);
    return { success: false, error: "Failed to fetch matches" };
  }
}

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
    
    // Convert ObjectId and Dates to plain strings for client component consumption
    return { 
      success: true, 
      match: {
        ...match,
        _id: match._id.toString(),
        createdAt: match.createdAt instanceof Date ? match.createdAt.toISOString() : match.createdAt,
        updatedAt: match.updatedAt instanceof Date ? match.updatedAt.toISOString() : match.updatedAt,
        moves: (match.moves || []).map((m: { 
          san: string; 
          fen: string; 
          timestamp: Date | string; 
          thoughtProcess?: string; 
          _id?: { toString: () => string } 
        }) => ({
          ...m,
          _id: m._id?.toString(),
          timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
        }))
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

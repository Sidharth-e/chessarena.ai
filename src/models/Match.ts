import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMatch extends Document {
  whiteProvider: string;
  blackProvider: string;
  whiteModel: string;
  blackModel: string;
  pgn: string;
  fen: string;
  status: "active" | "completed" | "error";
  result: "1-0" | "0-1" | "1/2-1/2" | "*";
  moves: Array<{
    san: string;
    fen: string;
    timestamp: Date;
    thoughtProcess?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MoveSchema = new Schema({
  san: { type: String, required: true },
  fen: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  thoughtProcess: { type: String },
});

const MatchSchema = new Schema<IMatch>(
  {
    whiteProvider: { type: String, required: true },
    blackProvider: { type: String, required: true },
    whiteModel: { type: String, required: true },
    blackModel: { type: String, required: true },
    pgn: { type: String, default: "" },
    fen: { type: String, required: true, default: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" },
    status: { type: String, enum: ["active", "completed", "error"], default: "active" },
    result: { type: String, enum: ["1-0", "0-1", "1/2-1/2", "*"], default: "*" },
    moves: [MoveSchema],
  },
  { timestamps: true }
);

export const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);

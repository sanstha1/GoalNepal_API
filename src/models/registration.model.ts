import mongoose, { Document, Schema } from "mongoose";

const PlayerSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  position: { type: String, trim: true },
  jerseyNumber: { type: Number },
});

const RegistrationSchema: Schema = new Schema(
  {
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    teamName: { type: String, required: true, trim: true },
    captainName: { type: String, required: true, trim: true },
    captainPhone: { type: String, required: true, trim: true },
    captainEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    playerCount: { type: Number, required: true, min: 1 },
    players: [PlayerSchema],
    feePaid: { type: Number, default: 0 },         
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    registeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export interface IPlayer {
  name: string;
  position?: string;
  jerseyNumber?: number;
}

export interface IRegistration extends Document {
  tournamentId: mongoose.Types.ObjectId;
  teamName: string;
  captainName: string;
  captainPhone: string;
  captainEmail: string;
  playerCount: number;
  players: IPlayer[];
  feePaid: number;                                  
  status: "pending" | "approved" | "rejected";
  registeredBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const RegistrationModel =
  mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);
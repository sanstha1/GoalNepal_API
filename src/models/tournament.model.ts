import mongoose, { Document, Schema } from "mongoose";

const TournamentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    type: {
      type: String,
      enum: ["football", "futsal"],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    organizer: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    prize: {
      type: String,
      trim: true,
    },
    maxTeams: {
      type: Number,
      min: 2,
    },
    bannerImage: {
      type: String,
      trim: true,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export interface ITournament extends Document {
  title: string;
  type: "football" | "futsal";
  location: string;
  startDate: Date;
  endDate: Date;
  organizer?: string;
  description?: string;
  prize?: string;
  maxTeams?: number;
  bannerImage?: string | null;
  createdBy: mongoose.Types.ObjectId;
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const TournamentModel =
  mongoose.models.Tournament ||
  mongoose.model<ITournament>("Tournament", TournamentSchema);
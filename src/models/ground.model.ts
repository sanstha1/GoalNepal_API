import mongoose, { Schema, Document } from "mongoose";

export interface IGround extends Document {
  name: string;
  contact: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt: Date;
  updatedAt: Date;
}

const GroundSchema = new Schema<IGround>(
  {
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) => v.length === 2,
          message: "Coordinates must be [longitude, latitude]",
        },
      },
    },
  },
  { timestamps: true }
);

GroundSchema.index({ location: "2dsphere" });

export const Ground = mongoose.model<IGround>("Ground", GroundSchema);
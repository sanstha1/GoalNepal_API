import mongoose, { Document, Schema } from "mongoose";

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["NEW_TOURNAMENT", "REGISTRATION_PENDING"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "NEW_TOURNAMENT" | "REGISTRATION_PENDING";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
import mongoose, { Document, Schema } from "mongoose";

const UserSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    profilePicture: {
      type: String,
      trim: true,
      default: "default-profile.png",
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  profilePicture?: string;
  role: "admin" | "user";
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

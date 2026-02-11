import mongoose from "mongoose";
import { MONGODB_URI } from "../config/env";

const connect = async (uri: string) => {
  try {
    if (!uri) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(uri);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database error:", error);
    process.exit(1);
  }
};

export const connectDatabase = async () => {
  await connect(MONGODB_URI);
};

export const connectDatabaseTest = async () => {
  await connect(`${MONGODB_URI}_test`);
};

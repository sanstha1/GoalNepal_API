import mongoose from "mongoose";
import { connectDatabaseTest } from "../database/mangodb";

beforeAll(async () => {
    await connectDatabaseTest();
});

afterAll(async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
        }
    } catch (err) {
        // ignore cleanup errors
    }
});
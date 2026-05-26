import mongoose from "mongoose";
import { Ground } from "./src/models/ground.model";
import dotenv from "dotenv";

dotenv.config();

const sampleGrounds = [
  {
    name: "Kathmandu Futsal Arena",
    contact: "9841000001",
    address: "New Baneshwor, Kathmandu",
    location: { type: "Point" as const, coordinates: [85.3433, 27.6939] },
  },
  {
    name: "Lalitpur Futsal Center",
    contact: "9841000002",
    address: "Pulchowk, Lalitpur",
    location: { type: "Point" as const, coordinates: [85.3175, 27.6667] },
  },
  {
    name: "Thamel Sports Ground",
    contact: "9841901003",
    address: "Thamel, Kathmandu",
    location: { type: "Point" as const, coordinates: [85.3111, 27.7172] },
  },
  {
    name: "Bhaktapur Futsal Club",
    contact: "9841036704",
    address: "Suryabinayak, Bhaktapur",
    location: { type: "Point" as const, coordinates: [85.4298, 27.6711] },
  },
  {
    name: "Patan Futsal Zone",
    contact: "9841000005",
    address: "Mangal Bazar, Patan",
    location: { type: "Point" as const, coordinates: [85.3273, 27.6727] },
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/goalnepal");
  await Ground.deleteMany({});
  await Ground.insertMany(sampleGrounds);
  console.log(`Seeded ${sampleGrounds.length} grounds.`);
  await mongoose.disconnect();
}

seed().catch(console.error);
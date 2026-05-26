import { Request, Response } from "express";
import { Ground } from "../models/ground.model";

export const getNearbyGrounds = async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ success: false, message: "lat and lng are required" });
    return;
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);
  const radiusKm = parseFloat((radius as string) || "10");

  if (isNaN(latitude) || isNaN(longitude)) {
    res.status(400).json({ success: false, message: "Invalid lat or lng values" });
    return;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    res.status(400).json({ success: false, message: "lat/lng out of valid range" });
    return;
  }

  const radiusMeters = Math.min(radiusKm, 50) * 1000;

  const grounds = await Ground.find({
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: radiusMeters,
      },
    },
  }).select("name contact address location");

  res.status(200).json({ success: true, data: grounds, total: grounds.length });
};

export const getAllGrounds = async (_req: Request, res: Response): Promise<void> => {
  const grounds = await Ground.find().select("name contact address location");
  res.status(200).json({ success: true, data: grounds, total: grounds.length });
};

export const createGround = async (req: Request, res: Response): Promise<void> => {
  const { name, contact, address, lat, lng } = req.body;

  if (!name || !contact || lat === undefined || lng === undefined) {
    res.status(400).json({ success: false, message: "name, contact, lat, and lng are required" });
    return;
  }

  const ground = await Ground.create({
    name,
    contact,
    address: address || "",
    location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
  });

  res.status(201).json({ success: true, data: ground });
};
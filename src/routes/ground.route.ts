import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { lat, lng, radius = 5000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "lat and lng query params are required" });
  }

  const query = `
    [out:json][timeout:25];
    (
      node["leisure"="pitch"]["sport"="football"](around:${radius},${lat},${lng});
      node["leisure"="pitch"]["sport"="soccer"](around:${radius},${lat},${lng});
      node["sport"="futsal"](around:${radius},${lat},${lng});
      way["leisure"="pitch"]["sport"="football"](around:${radius},${lat},${lng});
      way["leisure"="pitch"]["sport"="soccer"](around:${radius},${lat},${lng});
      way["sport"="futsal"](around:${radius},${lat},${lng});
      node["leisure"="sports_centre"]["sport"="football"](around:${radius},${lat},${lng});
      way["leisure"="sports_centre"]["sport"="football"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  try {
    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      `data=${encodeURIComponent(query)}`,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const elements = response.data.elements as any[];

    const grounds = elements
      .map((el) => {
        const latitude = el.lat ?? el.center?.lat;
        const longitude = el.lon ?? el.center?.lon;
        if (!latitude || !longitude) return null;

        return {
          id: el.id,
          name: el.tags?.name || el.tags?.["name:en"] || "Unnamed Ground",
          lat: latitude,
          lng: longitude,
          sport: el.tags?.sport || "football",
          surface: el.tags?.surface || null,
          type: el.tags?.leisure || el.tags?.amenity || "pitch",
        };
      })
      .filter(Boolean);

    return res.json({ grounds });
  } catch (err: any) {
    console.error("Overpass API error:", err.message);
    return res.status(500).json({ error: "Failed to fetch grounds from Overpass API" });
  }
});

export default router;
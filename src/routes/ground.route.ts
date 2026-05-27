import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

router.get("/", async (req: Request, res: Response) => {
  const { lat, lng, radius = 10000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "lat and lng query params are required" });
  }

  const query = `
    [out:json][timeout:30];
    (
      node["leisure"="pitch"](around:${radius},${lat},${lng});
      way["leisure"="pitch"](around:${radius},${lat},${lng});
      node["leisure"="pitch"]["sport"~"football|soccer|futsal",i](around:${radius},${lat},${lng});
      way["leisure"="pitch"]["sport"~"football|soccer|futsal",i](around:${radius},${lat},${lng});
      node["sport"~"football|soccer|futsal",i](around:${radius},${lat},${lng});
      way["sport"~"football|soccer|futsal",i](around:${radius},${lat},${lng});
      node["leisure"="sports_centre"]["sport"~"football|soccer|futsal",i](around:${radius},${lat},${lng});
      way["leisure"="sports_centre"]["sport"~"football|soccer|futsal",i](around:${radius},${lat},${lng});
      node["leisure"="sports_centre"](around:${radius},${lat},${lng});
      way["leisure"="sports_centre"](around:${radius},${lat},${lng});
    );
    out center tags;
  `;

  let lastError: any = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await axios.post(
        endpoint,
        `data=${encodeURIComponent(query)}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 35000,
        }
      );

      const elements = response.data.elements as any[];

      const seen = new Set<number>();
      const grounds = elements
        .map((el) => {
          const latitude = el.lat ?? el.center?.lat;
          const longitude = el.lon ?? el.center?.lon;
          if (!latitude || !longitude) return null;
          if (seen.has(el.id)) return null;
          seen.add(el.id);

          const sport = el.tags?.sport || el.tags?.leisure || "pitch";
          const isSportsRelated =
            /football|soccer|futsal|pitch|sports/i.test(sport) ||
            el.tags?.leisure === "pitch" ||
            el.tags?.leisure === "sports_centre";

          if (!isSportsRelated) return null;

          return {
            id: el.id,
            name: el.tags?.name || el.tags?.["name:en"] || el.tags?.["name:ne"] || "Unnamed Ground",
            lat: latitude,
            lng: longitude,
            sport,
            surface: el.tags?.surface || null,
            type: el.tags?.leisure || el.tags?.amenity || "pitch",
          };
        })
        .filter(Boolean);

      return res.json({ grounds, source: endpoint });
    } catch (err: any) {
      console.error(`Overpass error on ${endpoint}:`, err.message);
      lastError = err;
    }
  }

  console.error("All Overpass endpoints failed:", lastError?.message);
  return res.status(500).json({ error: "Failed to fetch grounds from Overpass API" });
});

export default router;
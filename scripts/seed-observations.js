// Seed species_observations with realistic demo data for the dashboard
// Usage: node scripts/seed-observations.js
// Requires: MONGODB_URI (and optionally MONGODB_DB if URI has no db name)

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Minimal .env loader so the script can pick up values from .env.local/.env
function loadDotEnv() {
  const candidates = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
  ];
  for (const file of candidates) {
    try {
      if (!fs.existsSync(file)) continue;
      const txt = fs.readFileSync(file, "utf8");
      txt.split(/\r?\n/).forEach((line) => {
        if (!line || /^\s*#/.test(line)) return;
        const idx = line.indexOf("=");
        if (idx === -1) return;
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim().replace(/^['\"]|['\"]$/g, "");
        if (process.env[key] == null) process.env[key] = val;
      });
    } catch (_) {
      // ignore
    }
  }
}

loadDotEnv();

function getEnv(name, fallback) {
  const v = process.env[name];
  return v == null || v === "" ? fallback : v;
}

function getDbNameFromUri(uri) {
  try {
    const afterProtocol = uri.replace(/^mongodb(\+srv)?:\/\//, "");
    const path = afterProtocol.split("/")[1] || "";
    const db = path.split("?")[0];
    return db || null;
  } catch (_) {
    return null;
  }
}

function randomChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function pickThreatByWaterQuality(wq) {
  if (wq >= 7.5) return "low";
  if (wq >= 5.5) return "medium";
  if (wq >= 3.5) return "high";
  return "critical";
}

async function main() {
  const uri = getEnv("MONGODB_URI");
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  let dbName = getDbNameFromUri(uri) || getEnv("MONGODB_DB");
  if (!dbName) {
    console.error(
      "No database name found. Add the DB name in MONGODB_URI (recommended) or set MONGODB_DB."
    );
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 30000,
  });

  try {
    console.log("[seed] Connecting to MongoDB...");
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection("species_observations");

    console.log("[seed] Creating helpful indexes (if not present)...");
    await Promise.all([
      col.createIndex({ createdAt: -1 }),
      col.createIndex({ region: 1, createdAt: -1 }),
      col.createIndex({ species: 1 }),
    ]);

    const regions = ["pacific", "atlantic", "indian", "arctic"];
    const speciesPool = [
      "Blue Whale",
      "Loggerhead Turtle",
      "Giant Manta Ray",
      "Great White Shark",
      "Humboldt Squid",
      "Atlantic Cod",
      "Clownfish",
      "Emperor Penguin",
      "Narwhal",
      "Sea Otter",
      "Sardine",
      "Yellowfin Tuna",
      "Coral Grouper",
      "Dugong",
      "Seahorse",
      "Sperm Whale",
      "Albatross",
      "Krill",
      "Flying Fish",
      "Anglerfish",
    ];
    const statuses = [
      "Least Concern",
      "Near Threatened",
      "Vulnerable",
      "Endangered",
      "Critically Endangered",
    ];

    const now = new Date();
    const monthsBack = 6; // seed last 6 months
    const docs = [];
    const totalDocs = 100; // target ~100 documents

    for (let i = 0; i < totalDocs; i++) {
      const region = randomChoice(regions);
      const species = randomChoice(speciesPool);
      const status = randomChoice(statuses);

      // distribute dates across last 6 months
      const daysAgo = Math.floor(Math.random() * monthsBack * 30);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // region-influenced temps and coords (very rough)
      const regionProfiles = {
        pacific: { temp: [6, 28], lat: [-40, 40], lon: [-160, -120] },
        atlantic: { temp: [5, 26], lat: [-30, 50], lon: [-60, -20] },
        indian: { temp: [8, 30], lat: [-35, 20], lon: [50, 100] },
        arctic: { temp: [2, 8], lat: [65, 80], lon: [-160, 40] },
      };
      const prof = regionProfiles[region];
      const temperature = Math.round(randomInRange(prof.temp[0], prof.temp[1]) * 10) / 10;
      const coordinates = [
        Math.round(randomInRange(prof.lat[0], prof.lat[1]) * 1000) / 1000,
        Math.round(randomInRange(prof.lon[0], prof.lon[1]) * 1000) / 1000,
      ];

      const waterQuality = Math.round(randomInRange(2, 9) * 10) / 10; // 2.0 - 9.0
      const threatLevel = pickThreatByWaterQuality(waterQuality);
      const speciesCount = Math.floor(randomInRange(5, 300));
      const depth = Math.floor(randomInRange(10, 3500));
      const location = `${region.toUpperCase()} ${Math.abs(coordinates[0]).toFixed(1)}/${
        Math.abs(coordinates[1]).toFixed(1)
      }`;

      docs.push({
        createdAt,
        region,
        species,
        speciesCount,
        conservationStatus: status,
        waterQuality,
        threatLevel,
        temperature,
        depth,
        coordinates,
        location,
      });
    }

    console.log(`[seed] Inserting ${docs.length} documents into species_observations...`);
    const result = await col.insertMany(docs);
    console.log(`[seed] Inserted ${result.insertedCount} documents.`);

    console.log("[seed] Done. You can now refresh the dashboard.");
  } catch (err) {
    console.error("[seed] Failed:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();



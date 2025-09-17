// lib/mongodb.ts
import mongoose from "mongoose";
import type { Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Remove unsupported query params from Mongo URI (e.g. tlsMinVersion)
 * This avoids MongoParseError when the installed driver/version doesn't accept them.
 */
function stripUnsupportedMongoOptions(uri: string) {
  const idx = uri.indexOf("?");
  if (idx === -1) return uri;
  const base = uri.substring(0, idx);
  const query = uri.substring(idx + 1);
  const keep = query
    .split("&")
    .filter((p) => {
      const key = p.split("=")[0].toLowerCase();
      // filter out options that older/newer drivers sometimes don't accept
      return !(
        key === "tlsminversion" ||
        key === "tlsversion" ||
        key === "sslminversion"
      );
    });
  return keep.length ? `${base}?${keep.join("&")}` : base;
}

/**
 * Ensure a db name is present in the URI. If missing and MONGODB_DB is set,
 * append it before any query string. This aligns the app with seed scripts
 * that may use MONGODB_DB when the URI has no db segment.
 */
function ensureDbInUri(uri: string, dbName?: string | null) {
  if (!dbName) return uri;
  try {
    // split off query part
    const qIdx = uri.indexOf("?");
    const base = qIdx === -1 ? uri : uri.substring(0, qIdx);
    const query = qIdx === -1 ? "" : uri.substring(qIdx);

    // after protocol, check for path segment
    const protoMatch = base.match(/^mongodb(\+srv)?:\/\//);
    if (!protoMatch) return uri;
    const proto = protoMatch[0];
    const rest = base.substring(proto.length);

    // rest is host[/db]
    const slashIdx = rest.indexOf("/");
    const hasDb = slashIdx !== -1 && rest.substring(slashIdx + 1).length > 0;
    if (hasDb) return uri; // already has db

    const hostPart = slashIdx === -1 ? rest : rest.substring(0, slashIdx);
    const rebuilt = `${proto}${hostPart}/${dbName}${query}`;
    return rebuilt;
  } catch {
    return uri;
  }
}

/* Use cleaned URI to avoid unsupported option errors */
const NORMALIZED_URI = ensureDbInUri(MONGODB_URI, MONGODB_DB);
const CLEANED_MONGODB_URI = stripUnsupportedMongoOptions(NORMALIZED_URI);

interface GlobalWithMongoose {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}
declare const global: GlobalWithMongoose;

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}
const cached = global.mongoose;

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // minimal, safe options — don't force TLS options in the URI or here
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 1,
    } as mongoose.ConnectOptions;

    // avoid deprecation warnings
    mongoose.set("strictQuery", true);

    cached.promise = mongoose.connect(CLEANED_MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected successfully");
  } catch (e) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", e);
    throw e;
  }

  return cached.conn;
}

/** Backwards-compatible helpers some examples use */
export async function connectToDatabase(): Promise<{ db: Db | null; connection: typeof mongoose }> {
  await connectDB();
  return { db: mongoose.connection.db ?? null, connection: mongoose };
}

/** Get native `mongodb` Db instance */
export async function getDatabase(): Promise<Db> {
  await connectDB();
  if (!mongoose.connection.db) throw new Error("MongoDB not connected (no native db)");
  return mongoose.connection.db;
}

export default connectDB;

import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI não definida no .env.local")
}

// Cache global para evitar múltiplas conexões em dev (hot reload)
let cached = (global as any).__mongoose

if (!cached) {
  cached = (global as any).__mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "losning_crm",
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

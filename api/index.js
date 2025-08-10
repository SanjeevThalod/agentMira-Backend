import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "../server.js";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB connected");
}

export default async function handler(req, res) {
  await connectDB();
  app(req, res);
}

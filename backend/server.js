// 1. FORCE NODE.JS TO USE PUBLIC DNS (Fixes querySrv ECONNREFUSED on Windows)
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); 

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const fileRoutes = require("./routes/fileRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Unified CORS Configuration (Allows both Vercel production and local Vite)
app.use(cors({
  origin: [
    'https://share-easyfrontend.vercel.app', 
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files cleanly
app.use("/files", express.static(path.join(__dirname, "uploads")));

// 3. Application Routes
// This flags all routes inside fileRoutes with a "/api" prefix
app.use("/api", fileRoutes);

// Simple Health Check Home Route
app.get("/", (req, res) => {
  res.json({ success: true, message: "ShareEasy API is operational" });
});

// 4. Strict IPv4 MongoDB Connection Logic
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Critical Error: MONGO_URI is missing from your .env file.");
  process.exit(1);
}

console.log("🔄 Connecting to MongoDB Atlas...");
mongoose.connect(MONGO_URI, {
  family: 4, // Forces Node to prioritize IPv4, crushing connection drops
})
.then(() => {
  console.log("✅ MongoDB Database Connected Successfully!");
  app.listen(PORT, () => {
    console.log(`🚀 ShareEasy Backend running on port: ${PORT}`);
  });
})
.catch((error) => {
  console.error("❌ MongoDB connection error details:");
  console.error(error.message);
});
// 1. FORCE NODE.JS TO USE PUBLIC DNS (This fixes the querySrv ECONNREFUSED bug on Windows)
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); 

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const cors = require('cors');
app.use(cors({
  origin: ['https://share-easyfrontend.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

const fileRoutes = require("./routes/fileRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middleware Configurations
app.use(cors({
  origin: "http://localhost:5173", // Points to your default Vite frontend port
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files cleanly
app.use("/files", express.static(path.join(__dirname, "uploads")));

// 3. Application Routes
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
  // Start listening only after a successful database handshake
  app.listen(PORT, () => {
    console.log(`🚀 ShareEasy Backend running on: http://localhost:${PORT}`);
  });
})
.catch((error) => {
  console.error("❌ MongoDB connection error details:");
  console.error(error.message);
});
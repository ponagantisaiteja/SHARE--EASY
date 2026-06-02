// 1. FORCE NODE.JS TO USE PUBLIC DNS (Fixes querySrv ECONNREFUSED bugs on Windows/Linux clouds)
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); 

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const fileRoutes = require("./routes/fileRoutes");

const app = express();
// Render assigns a dynamic port via process.env.PORT automatically
// const PORT = process.env.PORT || 5000;
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://shareeasy-backend-zg8w.onrender.com";

// 2. Unified CORS Middleware Settings
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

// 3. Application Routes Integration
// Flags all child routing modules with a base "/api" endpoint prefix
app.use("/api", fileRoutes);

// General API Operational Status Verification
app.get("/", (req, res) => {
  res.json({ success: true, message: "ShareEasy API is operational" });
});

// 4. Database Connection Routine
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Critical Error: MONGO_URI is missing from environment variables.");
  process.exit(1);
}

console.log("🔄 Initializing MongoDB Atlas Handshake...");
mongoose.connect(MONGO_URI, {
  family: 4, // Forces Node to prioritize IPv4 to combat unexpected cloud dropouts
})
.then(() => {
  console.log("✅ MongoDB Database Connected Successfully!");
  app.listen(PORT, () => {
    console.log(`🚀 ShareEasy Backend live on system port: ${PORT}`);
  });
})
.catch((error) => {
  console.error("❌ MongoDB connection failed error details:");
  console.error(error.message);
});
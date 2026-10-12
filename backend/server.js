// 1. DNS Resolution Fix (Keeps cloud environments stable)
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config"; 

// ⚠️ IMPORTANT: In ES Modules, you MUST explicitly include the ".js" file extension
import fileRoutes from "./routes/fileRoutes.js"; 

const app = express();

// Workaround for __dirname (since standard __dirname doesn't exist in ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Environment Variables & Constants
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// 3. CORS Configuration (Local development only for your fresh start)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 4. Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Static Files Serving
app.use("/files", express.static(path.join(__dirname, "uploads")));

// 6. Application Routes Integration
app.use("/api", fileRoutes);

// General API Operational Status Verification
app.get("/", (req, res) => {
  res.json({ success: true, message: "ShareEasy API is operational" });
});

// 7. Database Connection & Server Startup Routine
if (!MONGO_URI) {
  console.error("❌ Critical Error: MONGO_URI is missing from environment variables.");
  process.exit(1);
}

console.log("🔄 Initializing MongoDB Atlas Handshake...");

mongoose.connect(MONGO_URI, {
  family: 4, // Forces Node to prioritize IPv4
})
.then(() => {
  console.log("✅ MongoDB Database Connected Successfully!");
  app.listen(PORT, () => {
    console.log(`🚀 ShareEasy Backend live on port: ${PORT}`);
  });
})
.catch((error) => {
  console.error("❌ MongoDB connection failed error details:");
  console.error(error.message);
});
const express = require("express");
const multer = require("multer");
const path = require("path");
const QRCode = require("qrcode");
const fs = require("fs");
const File = require("../models/File"); // Verified lowercase filename 'file.js'

const router = express.Router();

// 1. Ensure uploads directory exists cleanly
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 2. Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Clean spaces and special characters from original name to avoid URL issues
    const sanitizedName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

// 3. Initialize Upload Middleware (Must be defined BEFORE your routes run)
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB file limit
});

// 4. File Upload Route
// Route maps directly to: POST /api/upload (due to the prefix in server.js)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    // Generate accurate download URLs for production or development
    const fileUrl = `${req.protocol}://${req.get("host")}/files/${req.file.filename}`;
    
    // Generate QR code data URL
    const qrCodeUrl = await QRCode.toDataURL(fileUrl);
    
    // Save record tracking details to MongoDB
    const newFile = new File({
      filename: req.file.filename,
      fileUrl,
      qrCodeUrl,
    });

    await newFile.save();

    return res.status(201).json({ 
      success: true,
      message: "File uploaded and registered successfully!",
      file: {
        id: newFile._id,
        filename: newFile.filename,
        fileUrl, 
        qrCodeUrl,
      }
    });

  } catch (error) {
    console.error("❌ Upload Route Error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Upload failed internal server error",
      details: error.message 
    });
  }
});

module.exports = router;
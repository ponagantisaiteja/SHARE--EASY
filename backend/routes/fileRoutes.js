const express = require("express");
const multer = require("multer");
const path = require("path");
const QRCode = require("qrcode");
const fs = require("fs");
const File = require("../models/File"); // Adjusted to match lowercase filename 'file.js'

const router = express.Router();

// Ensure uploads directory exists cleanly
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
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

// File upload limits (optional but recommended: e.g., 50MB)
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } 
});

// File Upload Route
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    // Generate accurate paths and URLs
    const fileUrl = `${req.protocol}://${req.get("host")}/files/${req.file.filename}`;
    
    // Generate QR code data URL
    const qrCodeUrl = await QRCode.toDataURL(fileUrl);
    
    // Save record to MongoDB
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
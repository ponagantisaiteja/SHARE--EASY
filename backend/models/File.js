const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    qrCodeUrl: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true // Automatically tracks creation and update times
  }
);

module.exports = mongoose.model("File", fileSchema);
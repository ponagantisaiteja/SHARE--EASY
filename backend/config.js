const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI;

    if (!dbURI) {
      throw new Error("MONGO_URI is missing from your environment variables!");
    }

    // Force IPv4 parsing via family: 4 to overcome local router/DNS connection refusals
    await mongoose.connect(dbURI, {
      family: 4 
    });

    console.log("✅ MongoDB connected successfully to Atlas cluster");
  } catch (error) {
    console.error("❌ MongoDB connection error details:");
    console.error(error.message);
    // Smooth failure handling: don't crash the server instantly so you can still read logs
  }
};

module.exports = connectDB; 
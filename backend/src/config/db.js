const mongoose = require("mongoose");

async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB || undefined,
  });
  // eslint-disable-next-line no-console
  console.log("Connected to MongoDB");
}

module.exports = { connectToDatabase };

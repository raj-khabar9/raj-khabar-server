import mongoose from "mongoose";

const connectDB = async () => {
  let URL = process.env.MONGO_URI || process.env.MONGODB_URI;
  try {
    if (process.env.NODE_ENV === "production") {
      URL = process.env.MONGO_PROD_URI || process.env.MONGO_URI || process.env.MONGODB_URI;
    }
    if (!URL) {
      throw new Error("No MongoDB connection URI provided in environment variables (checked MONGO_PROD_URI, MONGO_URI, and MONGODB_URI).");
    }
    await mongoose.connect(URL);
    console.log("MongoDB connected successfully to " + (process.env.NODE_ENV || "development"));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;

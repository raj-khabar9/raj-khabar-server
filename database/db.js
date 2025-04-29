import mongoose from "mongoose";

const connectDB = async () => {
  const URL = process.env.MONGO_URI;
  try {
    await mongoose.connect(URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;

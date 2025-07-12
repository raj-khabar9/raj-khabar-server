import mongoose from "mongoose";

const connectDB = async () => {
  let URL = process.env.MONGO_URI;
  try {
    if (process.env.NODE_ENV === "production") {
      URL = process.env.MONGO_PROD_URI;
    }
    await mongoose.connect(URL);
    console.log("MongoDB connected successfully to " + process.env.NODE_ENV);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;

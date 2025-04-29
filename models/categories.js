import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    iconUrl: {
      type: String,
      default: "https://example.com/default-icon.png" // Default icon URL
    }
  },
  { timestamps: true }
);
export default mongoose.model("Category", categorySchema);

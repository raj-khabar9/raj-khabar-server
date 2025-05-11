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
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    parentSlug: {
      type: String
    },
    iconUrl: {
      type: String,
      default: "https://example.com/default-icon.png" // Default icon URL
    },
    isVisibleOnHome: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);
export default mongoose.model("Category", categorySchema);

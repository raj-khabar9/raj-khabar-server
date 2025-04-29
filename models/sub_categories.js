import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["", "image"],
      default: "text"
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    parentSlug: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("SubCategory", subCategorySchema);

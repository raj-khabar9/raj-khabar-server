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
      enum: ["post", "table", "card"]
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    parentSlug: {
      type: String,
      required: true
    },
    tableStructure: {
      type: mongoose.Schema.Types.ObjectId
    },
    tableStructureSlug: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("SubCategory", subCategorySchema);

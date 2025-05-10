import mongoose from "mongoose";

const tablePostSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    parentSlug: {
      type: String,
      required: true
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    subcategorySlug: {
      type: String,
      required: true
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true
    },
    rowData: [
      {
        row: {
          type: String
        },
        isLink: {
          type: Boolean,
          default: false
        },
        link_type: {
          type: String,
          enum: ["web-view", "external", "pdf"],
          default: "internal"
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("TablePost", tablePostSchema);

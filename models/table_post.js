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
    tableStructureSlug: {
      type: String,
      required: true
    },
    table_Structure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TableStructure"
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
          enum: ["pdf", "external", "web-view", "internal"],
          required: function () {
            return this.isLink === true;
          }
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("TablePost", tablePostSchema);

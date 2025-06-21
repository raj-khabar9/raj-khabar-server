import mongoose from "mongoose";

const cardStructureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  topField: {
    type: String
  },
  cardHeading: {
    type: String,
    required: true
  },
  middleField: {
    type: String
  },
  link: {
    link: {
      type: String
    },
    link_type: {
      type: String,
      enum: ["pdf", "external", "web-view", "internal"]
    }
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
  subCategorySlug: {
    type: String,
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true
  }
});

export default mongoose.model("CardStructure", cardStructureSchema);

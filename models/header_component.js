import mongoose from "mongoose";

const headerComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  heading: {
    type: String,
    required: true
  },
  link: {
    link: {
      type: String,
      required: true
    },
    link_type: {
      type: String,
      enum: ["pdf", "external", "web-view"],
      required: true
    }
  },
  parentSlug: {
    type: String,
    required: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  subCategorySlug: {
    type: String,
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

export default mongoose.model("HeaderComponent", headerComponentSchema);

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    imageUrl: {
      type: String,
      default: "https://example.com/default-image.png" // Default image URL
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    categorySlug: {
      type: String,
      required: true
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true
    },
    subCategorySlug: {
      type: String,
      required: true
    },
    tags: {
      type: [String] // Array of strings for tags
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft"
    },
    type: {
      type: String,
      default: "post"
    },
    isVisibleInCarousel: {
      type: Boolean,
      default: false
    },
    sendNotification: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date,
      default: null // Date when the post is published
    },
    updatedAt: {
      type: Date,
      default: null // Date when the post is last updated
    },
    createdAt: {
      type: Date,
      default: Date.now // Date when the post is created
    }
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);

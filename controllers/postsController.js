import posts from "../models/posts.js";
import categories from "../models/categories.js";
import sub_categories from "../models/sub_categories.js";

export const createPost = async (req, res) => {
  const {
    title,
    slug,
    content,
    description,
    categoryslug,
    subcategoryslug,
    imageUrl,
    tags,
    status,
    publishedAt,
    updatedAt,
    createdAt
  } = req.body;

  if (!title || !content || !categoryslug || !subcategoryslug || !slug) {
    return res.status(400).json({
      success: false,
      message: "Title, slug, content, category, and subcategory are required"
    });
  }

  try {
    const existingPost = await posts.findOne({ slug });
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: `Post with slug ${slug} already exists`
      });
    }
  } catch (error) {
    console.error("Error checking existing post:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }

  // Check if the category and subcategory exist in the database
  const category = await categories.findOne({ slug: categoryslug });
  if (!category) {
    return res.status(400).json({
      success: false,
      message: `Category with slug ${categoryslug} does not exist`
    });
  }
  // Check if the subcategory exists in the database and belongs to the category
  const subcategory = await sub_categories.findOne({
    slug: subcategoryslug,
    parentCategory: category._id
  });
  if (!subcategory) {
    return res.status(400).json({
      success: false,
      message: `Subcategory with slug ${subcategoryslug} does not exist in category ${categoryslug}`
    });
  }

  if (subcategory.type != "posts") {
    return res.status(400).json({
      success: false,
      message: `Subcategory with slug ${subcategoryslug} is not a post type`,
      subcategoryType: subcategory.type
    });
  }

  try {
    const newPost = new posts({
      title,
      slug,
      content,
      description,
      category: category._id,
      categorySlug: categoryslug,
      subCategory: subcategory._id,
      subCategorySlug: subcategoryslug,
      imageUrl: imageUrl,
      tags: tags || [],
      status: status || "draft",
      publishedAt: publishedAt || Date.now(),
      updatedAt: updatedAt || Date.now(),
      createdAt: createdAt || Date.now()
    });

    await newPost.save();

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost
    });
  } catch (error) {
    console.error("Error in createPost:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const getPosts = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;

  const filters = {};

  // Optional status filter (e.g., "published", "draft")
  if (status) {
    filters.status = status;
  }

  try {
    const totalPosts = await posts.countDocuments();
    const totalPages = Math.ceil(totalPosts / limit);
    const allPosts = await posts
      .find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "slug")
      .populate("subCategory", "slug");

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts: allPosts,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error("Error in getPosts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// fetch posts by category slug and subcategory slug
export const getPostsByCategoryAndSubcategory = async (req, res) => {
  const { categorySlug } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const subCategorySlug = req.params.subcategorySlug;

  try {
    const category = await categories.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with slug '${categorySlug}' not found`
      });
    }

    const subCategory = await sub_categories.findOne({
      slug: subCategorySlug,
      parentCategory: category._id
    });
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: `Subcategory with slug '${subCategorySlug}' not found in category '${categorySlug}'`
      });
    }

    if (!subCategory.type || subCategory.type !== "posts") {
      return res.status(404).json({
        success: false,
        message: `Subcategory with slug '${subCategorySlug}' is not a post type in category '${categorySlug}'`
      });
    }

    const totalPosts = await posts.countDocuments({
      category: category._id,
      subCategory: subCategory._id
    });
    const totalPages = Math.ceil(totalPosts / limit);

    const allPosts = await posts
      .find({
        category: category._id,
        subCategory: subCategory._id
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "slug")
      .populate("subCategory", "slug");

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts: allPosts,
      totalPages,
      currentPage: Number(page)
    });
  } catch (error) {
    console.error("Error in getPostsByCategoryAndSubcategory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const searchPosts = async (req, res) => {
  const { query } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  if (!query || query.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Search query is required"
    });
  }

  console.log("Query:", query);

  try {
    const filter = {
      title: { $regex: query, $options: "i" } // Case-insensitive match
    };

    const totalPosts = await posts.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit);

    const allPosts = await posts
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("category", "slug")
      .populate("subCategory", "slug");

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts: allPosts,
      totalPages,
      currentPage: Number(page)
    });
  } catch (error) {
    console.error("Error in searchPosts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

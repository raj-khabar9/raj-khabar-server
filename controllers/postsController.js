import posts from "../models/posts.js";
import categories from "../models/categories.js";
import sub_categories from "../models/sub_categories.js";
import { uploadToS3, updateS3File } from "../utils/uploadToS3.js";

export const createPost = async (req, res) => {
  try {
    // Parse fields from req.body (for non-file fields)

    const {
      title,
      slug,
      content,
      description,
      categoryslug,
      subcategoryslug,
      tags,
      status,
      type,
      isVisibleInCarousel,
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

    if (subcategory.type != "post") {
      return res.status(400).json({
        success: false,
        message: `Subcategory with slug ${subcategoryslug} is not a post type`,
        subcategoryType: subcategory.type
      });
    }
    console.log("accessing before image upload");

    // Upload image to S3 if present
    let imageUrl = "";
    if (req.file) {
      try {
        imageUrl = await uploadToS3(req.file); // Your uploadToS3 should return the S3 URL
        console.log("Image uploaded to S3:", imageUrl);
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Image upload to S3 failed",
          error: error.message
        });
      }
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
        imageUrl,
        tags: tags || [],
        status: status || "draft",
        isVisibleInCarousel,
        type,
        publishedAt: publishedAt || Date.now(),
        updatedAt: updatedAt || Date.now(),
        createdAt: createdAt || Date.now()
      });

      await newPost.save();

      return res.status(200).json({
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
  } catch (error) {
    console.error("Error in createPost:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
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
      .populate("category", "slug name")
      .populate("subCategory", "slug name");

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

    if (!subCategory.type || subCategory.type !== "post") {
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

export const getCaroucelPost = async (req, res) => {
  try {
    // Fetch carousel posts with status 'Published' and visibility true
    const getCaroucelPosts = await posts.find({
      isVisibleInCarousel: true,
      status: "published"
    });

    if (getCaroucelPosts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No posts available for carousel"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts: getCaroucelPosts
    });
  } catch (error) {
    console.error("Error fetching carousel posts:", error);
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

export const getPostBySlug = async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: "Post slug is required"
    });
  }

  try {
    const post = await posts
      .findOne({ slug })
      .populate("category", "slug")
      .populate("subCategory", "slug");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Post with slug '${slug}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      post
    });
  } catch (error) {
    console.error("Error in getPostBySlug:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Post ID is required"
    });
  }

  try {
    const post = await posts.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Post with ID '${id}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (error) {
    console.error("Error in deletePost:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Post ID is required"
    });
  }

  try {
    const post = await posts.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Post with ID '${id}' not found`
      });
    }

    // Only allow specific fields to be updated
    const updatableFields = [
      "title",
      "slug",
      "content",
      "description",
      "category",
      "categorySlug",
      "subCategory",
      "subCategorySlug",
      "tags",
      "status",
      "isVisibleInCarousel",
      "type",
      "publishedAt"
    ];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    // --- Handle image update and upload to S3 ---
    if (req.file) {
      try {
        const imageUrl = await updateS3File(req.file, post.imageUrl);
        post.imageUrl = imageUrl;
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Image upload to S3 failed",
          error: error.message
        });
      }
    }

    // --- Category/Subcategory validation (as you already have) ---
    if (req.body.categorySlug || req.body.subCategorySlug) {
      const categorySlug = req.body.categorySlug || post.categorySlug;
      const subCategorySlug = req.body.subCategorySlug || post.subCategorySlug;

      // Validate category
      const category = await categories.findOne({ slug: categorySlug });
      if (!category) {
        return res.status(400).json({
          success: false,
          message: `Category with slug ${categorySlug} does not exist`
        });
      }

      // Validate subcategory and its relation to category
      const subcategory = await sub_categories.findOne({
        slug: subCategorySlug,
        parentCategory: category._id
      });
      if (!subcategory) {
        return res.status(400).json({
          success: false,
          message: `Subcategory with slug ${subCategorySlug} does not exist in category ${categorySlug}`
        });
      }

      if (subcategory.type !== "post") {
        return res.status(400).json({
          success: false,
          message: `Subcategory with slug ${subCategorySlug} is not a post type`
        });
      }

      // Update the references to the correct ObjectIds
      post.category = category._id;
      post.categorySlug = categorySlug;
      post.subCategory = subcategory._id;
      post.subCategorySlug = subCategorySlug;
    }

    // Always update updatedAt
    post.updatedAt = Date.now();

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post
    });
  } catch (error) {
    console.error("Error in updatePost:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

import Category from "../models/categories.js";
import SubCategory from "../models/sub_categories.js";
import Post from "../models/posts.js";
import TablePost from "../models/table_post.js";
import CardStructure from "../models/card_structure.js";

/**
 * GET /api/category/:slug/overview?subcategory=<slug>
 * Returns essential data for a main category page:
 * - category info
 * - subcategories (id, name, slug)
 * - posts (id, title, imageUrl, subCategory, createdAt)
 * - tablePosts (id, name, subCategory, createdAt)
 * - cardPosts (id, name, subCategory, createdAt)
 */
export const getCategoryOverview = async (req, res) => {
  try {
    const { slug } = req.params;
    const { subcategory } = req.query;

    // 1. Get main category info (only essentials)
    const category = await Category.findOne({ slug }).select(
      "name slug description iconUrl isVisibleOnHome"
    );
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // 2. Get subcategories for this category (essentials only)
    const subcategories = await SubCategory.find({
      parentCategory: category._id
    }).select("name slug description type");

    // 3. Build filter for posts, tablePosts, cardPosts
    let subcategoryFilter = {};
    if (subcategory) {
      const subcat = await SubCategory.findOne({
        slug: subcategory,
        parentCategory: category._id
      });
      if (subcat) {
        subcategoryFilter = { subCategory: subcat._id };
      }
    } else {
      // All subcategories under this category
      subcategoryFilter = {
        subCategory: { $in: subcategories.map((sc) => sc._id) }
      };
    }

    // 4. Fetch posts (essentials only)
    const posts = await Post.find(subcategoryFilter)
      .select("title slug imageUrl subCategory createdAt")
      .sort({ createdAt: -1 })
      .limit(12)
      .populate({ path: "subCategory", select: "name slug" });

    // 5. Fetch table posts (essentials only)
    const tablePosts = await TablePost.find(subcategoryFilter)
      .select("name slug subCategory rowData createdAt")
      .sort({ createdAt: -1 })
      .limit(8)
      .populate({ path: "subCategory", select: "name slug" });

    // 6. Fetch card posts (essentials only)
    const cardPosts = await CardStructure.find(subcategoryFilter)
      .select("name slug subCategory cardHeading createdAt")
      .sort({ createdAt: -1 })
      .limit(8)
      .populate({ path: "subCategory", select: "name slug" });

    return res.json({
      success: true,
      category,
      subcategories,
      posts,
      tablePosts,
      cardPosts
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

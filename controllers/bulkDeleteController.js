import posts from "../models/posts.js";
import card_structure from "../models/card_structure.js";
import table_post from "../models/table_post.js";
import tableStructure from "../models/table-structure.js";
import categories from "../models/categories.js";
import sub_categories from "../models/sub_categories.js";
import social_media from "../models/social_media.js";
import header_component from "../models/header_component.js";

// Bulk delete posts
export const bulkDeletePosts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of post IDs to delete"
      });
    }

    // Validate that all IDs are valid ObjectIds
    const validIds = ids.filter(id => id && id.toString().match(/^[0-9a-fA-F]{24}$/));
    
    if (validIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "Some IDs are invalid"
      });
    }

    const result = await posts.deleteMany({ _id: { $in: validIds } });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} post(s)`,
      deletedCount: result.deletedCount,
      requestedCount: ids.length
    });
  } catch (error) {
    console.error("Error in bulkDeletePosts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Bulk delete cards
export const bulkDeleteCards = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of card IDs to delete"
      });
    }

    const validIds = ids.filter(id => id && id.toString().match(/^[0-9a-fA-F]{24}$/));
    
    if (validIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "Some IDs are invalid"
      });
    }

    const result = await card_structure.deleteMany({ _id: { $in: validIds } });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} card(s)`,
      deletedCount: result.deletedCount,
      requestedCount: ids.length
    });
  } catch (error) {
    console.error("Error in bulkDeleteCards:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Bulk delete table posts
export const bulkDeleteTablePosts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of table post IDs to delete"
      });
    }

    const validIds = ids.filter(id => id && id.toString().match(/^[0-9a-fA-F]{24}$/));
    
    if (validIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "Some IDs are invalid"
      });
    }

    const result = await table_post.deleteMany({ _id: { $in: validIds } });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} table post(s)`,
      deletedCount: result.deletedCount,
      requestedCount: ids.length
    });
  } catch (error) {
    console.error("Error in bulkDeleteTablePosts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Bulk delete table structures
export const bulkDeleteTableStructures = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of table structure IDs to delete"
      });
    }

    const validIds = ids.filter(id => id && id.toString().match(/^[0-9a-fA-F]{24}$/));
    
    if (validIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "Some IDs are invalid"
      });
    }

    // Check if any table structures are being used by subcategories
    const structuresToDelete = await tableStructure.find({ _id: { $in: validIds } });
    const structureSlugs = structuresToDelete.map(s => s.slug);
    
    const dependentSubcategories = await sub_categories.find({ 
      tableStructureSlug: { $in: structureSlugs } 
    });

    if (dependentSubcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete table structures. They are being used by ${dependentSubcategories.length} subcategory(ies)`,
        dependentSubcategories: dependentSubcategories.map(sub => ({ 
          name: sub.name, 
          slug: sub.slug,
          tableStructureSlug: sub.tableStructureSlug
        }))
      });
    }

    // Check if any table posts are using these structures
    const dependentTablePosts = await table_post.find({ 
      tableStructureSlug: { $in: structureSlugs } 
    });

    if (dependentTablePosts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete table structures. They are being used by ${dependentTablePosts.length} table post(s)`,
        dependentTablePosts: dependentTablePosts.map(post => ({ 
          name: post.name, 
          slug: post.slug,
          tableStructureSlug: post.tableStructureSlug
        }))
      });
    }

    const result = await tableStructure.deleteMany({ _id: { $in: validIds } });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} table structure(s)`,
      deletedCount: result.deletedCount,
      requestedCount: ids.length
    });
  } catch (error) {
    console.error("Error in bulkDeleteTableStructures:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Bulk delete categories (with cascade delete of subcategories)
export const bulkDeleteCategories = async (req, res) => {
  try {
    const { ids, force = false } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of category IDs to delete"
      });
    }

    const validIds = ids.filter(id => id && id.toString().match(/^[0-9a-fA-F]{24}$/));
    
    if (validIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "Some IDs are invalid"
      });
    }

    let deletedCategories = 0;
    let deletedSubcategories = 0;
    let deletedPosts = 0;
    let deletedCards = 0;
    let deletedTablePosts = 0;
    let deletedHeaderComponents = 0;
    let errors = [];

    for (const id of validIds) {
      try {
        // Find the category
        const category = await categories.findById(id);
        if (!category) {
          errors.push(`Category with ID ${id} not found`);
          continue;
        }

        // Check for dependent content if not force delete
        if (!force) {
          const subcategoriesCount = await sub_categories.countDocuments({ parentCategory: id });
          const postsCount = await posts.countDocuments({ category: id });
          const cardsCount = await card_structure.countDocuments({ parentCategory: id });
          const tablePostsCount = await table_post.countDocuments({ parentCategory: id });
          const headerComponentsCount = await header_component.countDocuments({ parentCategory: id });

          if (subcategoriesCount > 0 || postsCount > 0 || cardsCount > 0 || tablePostsCount > 0 || headerComponentsCount > 0) {
            errors.push(`Category "${category.name}" has dependent content (${subcategoriesCount} subcategories, ${postsCount} posts, ${cardsCount} cards, ${tablePostsCount} table posts, ${headerComponentsCount} header components). Use force=true to delete.`);
            continue;
          }
        }

        // Delete dependent content (cascade delete)
        const subcategoriesResult = await sub_categories.deleteMany({ parentCategory: id });
        deletedSubcategories += subcategoriesResult.deletedCount;

        const postsResult = await posts.deleteMany({ category: id });
        deletedPosts += postsResult.deletedCount;

        const cardsResult = await card_structure.deleteMany({ parentCategory: id });
        deletedCards += cardsResult.deletedCount;

        const tablePostsResult = await table_post.deleteMany({ parentCategory: id });
        deletedTablePosts += tablePostsResult.deletedCount;

        const headerComponentsResult = await header_component.deleteMany({ parentCategory: id });
        deletedHeaderComponents += headerComponentsResult.deletedCount;

        // Delete the category
        await categories.findByIdAndDelete(id);
        deletedCategories++;

      } catch (error) {
        errors.push(`Error deleting category ${id}: ${error.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Bulk delete completed`,
      results: {
        deletedCategories,
        deletedSubcategories,
        deletedPosts,
        deletedCards,
        deletedTablePosts,
        deletedHeaderComponents,
        requestedCount: ids.length
      },
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error in bulkDeleteCategories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Bulk delete subcategories
export const bulkDeleteSubcategories = async (req, res) => {
  try {
    const { ids, force = false } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of subcategory IDs to delete"
      });
    }

    const validIds = ids.filter(id => id && id.toString().match(/^[0-9a-fA-F]{24}$/));
    
    if (validIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "Some IDs are invalid"
      });
    }

    let deletedSubcategories = 0;
    let deletedPosts = 0;
    let deletedCards = 0;
    let deletedTablePosts = 0;
    let deletedHeaderComponents = 0;
    let errors = [];

    for (const id of validIds) {
      try {
        // Find the subcategory
        const subcategory = await sub_categories.findById(id);
        if (!subcategory) {
          errors.push(`Subcategory with ID ${id} not found`);
          continue;
        }

        // Check for dependent content if not force delete
        if (!force) {
          const postsCount = await posts.countDocuments({ subCategory: id });
          const cardsCount = await card_structure.countDocuments({ subCategory: id });
          const tablePostsCount = await table_post.countDocuments({ subCategory: id });
          const headerComponentsCount = await header_component.countDocuments({ subCategory: id });

          if (postsCount > 0 || cardsCount > 0 || tablePostsCount > 0 || headerComponentsCount > 0) {
            errors.push(`Subcategory "${subcategory.name}" has dependent content (${postsCount} posts, ${cardsCount} cards, ${tablePostsCount} table posts, ${headerComponentsCount} header components). Use force=true to delete.`);
            continue;
          }
        }

        // Delete dependent content (cascade delete)
        const postsResult = await posts.deleteMany({ subCategory: id });
        deletedPosts += postsResult.deletedCount;

        const cardsResult = await card_structure.deleteMany({ subCategory: id });
        deletedCards += cardsResult.deletedCount;

        const tablePostsResult = await table_post.deleteMany({ subCategory: id });
        deletedTablePosts += tablePostsResult.deletedCount;

        const headerComponentsResult = await header_component.deleteMany({ subCategory: id });
        deletedHeaderComponents += headerComponentsResult.deletedCount;

        // Delete the subcategory
        await sub_categories.findByIdAndDelete(id);
        deletedSubcategories++;

      } catch (error) {
        errors.push(`Error deleting subcategory ${id}: ${error.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Bulk delete completed`,
      results: {
        deletedSubcategories,
        deletedPosts,
        deletedCards,
        deletedTablePosts,
        deletedHeaderComponents,
        requestedCount: ids.length
      },
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error in bulkDeleteSubcategories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Bulk delete social media links
export const bulkDeleteSocialMedia = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of social media IDs to delete"
      });
    }

    const validIds = ids.filter(id => id && id.toString().match(/^[0-9a-fA-F]{24}$/));
    
    if (validIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "Some IDs are invalid"
      });
    }

    const result = await social_media.deleteMany({ _id: { $in: validIds } });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} social media link(s)`,
      deletedCount: result.deletedCount,
      requestedCount: ids.length
    });
  } catch (error) {
    console.error("Error in bulkDeleteSocialMedia:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Bulk delete header components
export const bulkDeleteHeaderComponents = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of header component IDs to delete"
      });
    }

    const validIds = ids.filter(id => id && id.toString().match(/^[0-9a-fA-F]{24}$/));
    
    if (validIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "Some IDs are invalid"
      });
    }

    const result = await header_component.deleteMany({ _id: { $in: validIds } });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} header component(s)`,
      deletedCount: result.deletedCount,
      requestedCount: ids.length
    });
  } catch (error) {
    console.error("Error in bulkDeleteHeaderComponents:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Universal bulk delete with content type
export const universalBulkDelete = async (req, res) => {
  try {
    const { contentType, ids, force = false } = req.body;

    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: "Content type is required"
      });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of IDs to delete"
      });
    }

    // Route to appropriate bulk delete function
    switch (contentType.toLowerCase()) {
      case 'posts':
        return await bulkDeletePosts(req, res);
      case 'cards':
        return await bulkDeleteCards(req, res);
      case 'table-posts':
        return await bulkDeleteTablePosts(req, res);
      case 'table-structures':
        return await bulkDeleteTableStructures(req, res);
      case 'categories':
        return await bulkDeleteCategories(req, res);
      case 'subcategories':
        return await bulkDeleteSubcategories(req, res);
      case 'social-media':
        return await bulkDeleteSocialMedia(req, res);
      case 'header-components':
        return await bulkDeleteHeaderComponents(req, res);
      default:
        return res.status(400).json({
          success: false,
          message: `Unsupported content type: ${contentType}. Supported types: posts, cards, table-posts, table-structures, categories, subcategories, social-media, header-components`
        });
    }
  } catch (error) {
    console.error("Error in universalBulkDelete:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Get content statistics (useful for bulk operations)
export const getContentStatistics = async (req, res) => {
  try {
    const stats = {
      posts: await posts.countDocuments(),
      publishedPosts: await posts.countDocuments({ status: 'published' }),
      draftPosts: await posts.countDocuments({ status: 'draft' }),
      cards: await card_structure.countDocuments(),
      tablePosts: await table_post.countDocuments(),
      tableStructures: await tableStructure.countDocuments(),
      categories: await categories.countDocuments(),
      subcategories: await sub_categories.countDocuments(),
      socialMedia: await social_media.countDocuments(),
      headerComponents: await header_component.countDocuments()
    };

    // Get category breakdown
    const categoryBreakdown = await categories.aggregate([
      {
        $lookup: {
          from: 'subcategories',
          localField: '_id',
          foreignField: 'parentCategory',
          as: 'subcategories'
        }
      },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'category',
          as: 'posts'
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          subcategoryCount: { $size: '$subcategories' },
          postCount: { $size: '$posts' }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: "Content statistics fetched successfully",
      data: {
        overall: stats,
        categoryBreakdown
      }
    });
  } catch (error) {
    console.error("Error in getContentStatistics:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

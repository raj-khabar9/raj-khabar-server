import categories from "../models/categories.js";
import sub_categories from "../models/sub_categories.js";
import tableStructure from "../models/table-structure.js";
import { uploadToS3 } from "../utils/uploadToS3.js";

// These function are used to create, update, and delete categories in the database

export const createCategory = async (req, res) => {
  const { name, slug, description, parentSlug, isVisibleOnHome } = req.body;

  // Check if the category already exists
  const existingCategory = await categories.findOne({ slug });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: `Category with slug ${slug} already exists`
    });
  }

  let iconUrl = "";
  if (req.file) {
    try {
      iconUrl = await uploadToS3(req.file); // Your uploadToS3 should return the S3 URL
      console.log("Icon uploaded to S3:", iconUrl);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Icon upload to S3 failed",
        error: error.message
      });
    }
  }

  let parentCategory = "";

  if (parentSlug) {
    parentCategory = await categories.findOne({ slug: parentSlug });
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: `Parent category with slug '${parentSlug}' not found`
      });
    }
  }

  try {
    const newCategory = new categories({
      name,
      slug,
      description,
      iconUrl,
      parentCategory: parentCategory._id || null,
      parentSlug,
      isVisibleOnHome
    });
    await newCategory.save();
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: newCategory
    });
  } catch (error) {
    console.error("Error in createCategory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const updateCategory = async (req, res) => {
  const { slug } = req.params; // Slug identifies the category
  const { name } = req.body; // New name to update

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required to update the category"
    });
  }

  try {
    // Find category by slug
    const category = await categories.findOne({ slug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with slug ${slug} not found`
      });
    }

    // Update the name
    category.name = name; // Assuming slug remains the same for simplicity
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category name updated successfully",
      category
    });
  } catch (error) {
    console.error("Error in updateCategoryName:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const deleteCategory = async (req, res) => {
  const { slug } = req.params;
  let deletedcatgories = [];

  // Check if the category exists

  const category = await categories.findOne({ slug });
  if (!category) {
    return res.status(404).json({
      success: false,
      message: `Category with slug '${slug}' not found`
    });
  }
  try {
    const deletedSubcategories = await sub_categories.deleteMany({
      parentCategory: category._id
    });
    if (deletedSubcategories.deletedCount > 0) {
      console.log(`Deleted ${deletedSubcategories.deletedCount} subcategories`);
      deletedcatgories.push(deletedSubcategories);
    } else {
      console.log("No subcategories found for deletion");
    }
  } catch (error) {
    console.error("Error in deleting subcategories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while deleting subcategories"
    });
  }

  try {
    const deletedCategory = await categories.findOneAndDelete({ slug });

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: `Category with slug '${slug}' not found`
      });
    }

    deletedcatgories.push(deletedCategory);
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }

  return res.status(200).json({
    success: true,
    message: `Category '${slug}' deleted successfully`,
    category: deletedcatgories
  });
};

// This function is used to fetch the all categories
export const getAllCategories = async (req, res) => {
  try {
    const allCategories = await categories.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories: allCategories
    });
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// These function are used to create, update, and delete sub-categories in the database

export const createSubcategory = async (req, res) => {
  const { name, slug, description, type, parentSlug, tableStructureSlug } =
    req.body;

  if (!name || !slug || !parentSlug || !type) {
    return res.status(400).json({
      success: false,
      message: "Name, slug, and parentSlug are required"
    });
  }

  try {
    // Step 1: Get parent category
    const parentCategory = await categories.findOne({ slug: parentSlug });
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: `Parent category with slug '${parentSlug}' not found`
      });
    }

    // Step 2: Check for duplicate slug
    const existingSubcategory = await sub_categories.findOne({
      slug: slug,
      parentCategory: parentCategory._id
    });
    if (existingSubcategory) {
      return res.status(400).json({
        success: false,
        message: `Subcategory with slug '${slug}' already exists`
      });
    }

    let tableStruct = null;

    if (type === "table") {
      tableStruct = await tableStructure.findOne({ slug: tableStructureSlug });
      if (!tableStruct) {
        return res.status(400).json({
          success: false,
          message: `Table structure with slug ${tableStructureSlug} does not exist`
        });
      }
    }

    // Step 3: Create subcategory
    const newSubcategory = new sub_categories({
      name,
      slug,
      description,
      type,
      parentCategory: parentCategory._id,
      parentSlug, // Store the slug of the parent category
      tableStructure: tableStruct ? tableStruct._id : null,
      tableStructureSlug
    });

    await newSubcategory.save();

    return res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      subcategory: newSubcategory
    });
  } catch (error) {
    console.error("Error in createSubcategory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

export const updateSubcategory = async (req, res) => {
  const { slug } = req.params; // Slug identifies the subcategory
  const { name } = req.body; // New name to update

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required to update the subcategory"
    });
  }

  try {
    // Find subcategory by slug
    const subcategory = await sub_categories.findOne({ slug });
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: `Subcategory with slug ${slug} not found`
      });
    }

    // Update the name
    subcategory.name = name; // Assuming slug remains the same for simplicity
    await subcategory.save();

    return res.status(200).json({
      success: true,
      message: "Subcategory name updated successfully",
      subcategory
    });
  } catch (error) {
    console.error("Error in updateSubcategoryName:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

export const deleteSubcategory = async (req, res) => {
  const { slug } = req.params;

  try {
    const deletedSubcategory = await sub_categories.findOneAndDelete({ slug });

    if (!deletedSubcategory) {
      return res.status(404).json({
        success: false,
        message: `Subcategory with slug '${slug}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Subcategory '${slug}' deleted successfully`,
      subcategory: deletedSubcategory
    });
  } catch (error) {
    console.error("Error in deleteSubcategory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

export const getAllSubcategoriesOfCategory = async (req, res) => {
  const { slug } = req.params; // Slug identifies the category

  try {
    // Find the category by slug
    const category = await categories.findOne({ slug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with slug '${slug}' not found`
      });
    }

    // Find all subcategories that belong to this category
    const subcategories = await sub_categories.find({
      parentCategory: category._id
    });

    return res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      subcategories
    });
  } catch (error) {
    console.error("Error in getAllSubcategoriesOfCategory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

export const getCategoriesWithSubcategories = async (req, res) => {
  try {
    const result = await categories.aggregate([
      {
        $lookup: {
          from: "subcategories", // must match your MongoDB collection name
          localField: "slug",
          foreignField: "parentSlug",
          as: "subcategories"
        }
      },
      {
        $lookup: {
          from: "categories", // must match your MongoDB collection name
          localField: "slug",
          foreignField: "parentSlug",
          as: "maincategories"
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Categories with subcategories fetched successfully",
      categories: result
    });
  } catch (error) {
    console.error("Aggregation Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

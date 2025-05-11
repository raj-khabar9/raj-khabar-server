import tableStructure from "../models/table-structure.js";
import table_post from "../models/table_post.js";
import categories from "../models/categories.js";
import sub_categories from "../models/sub_categories.js";

export const createTableStructure = async (req, res) => {
  const { name, slug, description, columns } = req.body;

  if (!name || !slug || !columns) {
    return res.status(400).json({
      success: false,
      message: "Name, slug, and columns are required"
    });
  }

  try {
    const existingTable = await tableStructure.findOne({ slug });
    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: `Table with slug ${slug} already exists`
      });
    }
  } catch (error) {
    console.error("Error checking existing table:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }

  try {
    const newTable = new tableStructure({
      name,
      slug,
      description,
      columns
    });

    await newTable.save();

    return res.status(201).json({
      success: true,
      message: "Table created successfully",
      rowData: newTable
    });
  } catch (error) {
    console.error("Error creating table:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const createTablePost = async (req, res) => {
  const {
    name,
    slug,
    parentSlug,
    subcategorySlug,
    tableStructureSlug,
    rowData
  } = req.body;

  if (
    !slug ||
    !name ||
    !parentSlug ||
    !subcategorySlug ||
    !tableStructureSlug
  ) {
    return res.status(400).json({
      success: false,
      message: "Table slug, Name, Parent category, Sub category are required"
    });
  }

  if (!rowData || rowData.length < 2) {
    return res.status(400).json({
      success: false,
      message: "rowData must be an Table with at least 2 Columns"
    });
  }

  try {
    // Check if the table structure columns count equqals to the rowData count
    const tableStruct = await tableStructure.findOne({
      slug: tableStructureSlug
    });
    if (!tableStruct) {
      return res.status(400).json({
        success: false,
        message: `Table structure with slug ${tableStructureSlug} does not exist`
      });
    }

    // Check if the category and subcategory exist in the rowDatabase
    const category = await categories.findOne({ slug: parentSlug });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Category with slug ${parentSlug} does not exist`
      });
    }
    // Check if the subcategory exists in the rowDatabase and belongs to the category
    const subcategory = await sub_categories.findOne({
      slug: subcategorySlug,
      parentCategory: category._id
    });
    if (!subcategory) {
      return res.status(400).json({
        success: false,
        message: `Subcategory with slug ${subcategorySlug} does not exist in category ${parentSlug}`
      });
    }

    // check if the post already exists
    const existingPost = await table_post.findOne({
      slug: slug,
      parentCategory: category._id,
      subCategory: subcategory._id
    });
    if (existingPost) {
      return res.status(400).json({
        success: false,
        message: `Post with slug ${slug} already exists`
      });
    }

    if (rowData.isLink === true) {
      if (!rowData.link_type) {
        return res.status(400).json({
          success: false,
          message: "link_type is required for link type columns"
        });
      }
    }

    if (tableStruct.columns.length !== rowData.length) {
      return res.status(400).json({
        success: false,
        message: `You can add only ${tableStruct.columns.length} rows in ${tableStruct}`
      });
    }

    const newPost = new table_post({
      name,
      slug,
      rowData,
      parentCategory: category._id,
      parentSlug: parentSlug,
      subcategorySlug: subcategorySlug,
      subCategory: subcategory._id,
      tableStructureSlug: tableStructureSlug,
      table_Structure: tableStruct._id
    });

    await newPost.save();

    return res.status(201).json({
      success: true,
      message: "Table post created successfully",
      rowData: newPost
    });
  } catch (error) {
    console.error("Error creating table post:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const getTablePostsByCategoryAndSubcategory = async (req, res) => {
  const { categorySlug } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  let table = null; // Initialize table to null
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

    if (!subCategory.type) {
      return res.status(404).json({
        success: false,
        message: `please add a type to the subcategory '${subCategorySlug}' in category '${categorySlug}'`
      });
    }

    if (subCategory.type.includes("Table")) {
      table = await tableStructure.findOne({ slug: subCategory.type });
    } else if (subCategory.type.includes("card")) {
      // Handle card type if needed
    }

    const totalPosts = await table_post.countDocuments({
      parentCategory: category._id,
      subCategory: subCategory._id
    });
    const totalPages = Math.ceil(totalPosts / limit);

    const allPosts = await table_post
      .find({
        parentCategory: category._id,
        subCategory: subCategory._id
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("parentCategory", "slug")
      .populate("subCategory", "slug");

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      table: table,
      table_post: allPosts,
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

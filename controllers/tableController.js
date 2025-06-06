import tableStructure from "../models/table-structure.js";
import table_post from "../models/table_post.js";
import categories from "../models/categories.js";
import sub_categories from "../models/sub_categories.js";
import header_component from "../models/header_component.js";

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
      message: "Internal Server Error",
      error: error
    });
  }
};

export const getTableStructure = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search && search.trim() !== "") {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { slug: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      };
    }

    const total = await tableStructure.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const tableStructures = await tableStructure
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      message: "Table structures fetched successfully",
      rowData: tableStructures,
      total,
      totalPages,
      currentPage: Number(page)
    });
  } catch (error) {
    console.error("Error fetching table structures:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
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
      message: "Internal Server Error",
      error: error
    });
  }
};

export const getTablePosts = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const skip = (page - 1) * limit;

  try {
    let filter = {};

    // Search filter
    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } }
      ];
    }

    const totalPosts = await table_post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit);

    const allPosts = await table_post
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("parentCategory", "slug")
      .populate("subCategory", "slug");

    return res.status(200).json({
      success: true,
      message: "All table posts fetched successfully",
      rowData: allPosts,
      total: totalPosts,
      totalPages,
      currentPage: Number(page)
    });
  } catch (error) {
    console.error("Error fetching all table posts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

export const getTablePostsByCategoryAndSubcategory = async (req, res) => {
  const { categorySlug, subcategorySlug } = req.params;
  const { page = 1, limit = 10, search = "" } = req.query;
  const skip = (page - 1) * limit;

  try {
    let filter = {};
    let table = null;
    let fetchHeaderComponent = [];

    // If both category and subcategory are provided, filter accordingly
    if (categorySlug && subcategorySlug) {
      const category = await categories.findOne({ slug: categorySlug });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Category with slug '${categorySlug}' not found`
        });
      }

      const subCategory = await sub_categories.findOne({
        slug: subcategorySlug,
        parentCategory: category._id
      });
      if (!subCategory) {
        return res.status(404).json({
          success: false,
          message: `Subcategory with slug '${subcategorySlug}' not found in category '${categorySlug}'`
        });
      }

      if (!subCategory.type) {
        return res.status(404).json({
          success: false,
          message: `please add a type to the subcategory '${subcategorySlug}' in category '${categorySlug}'`
        });
      }

      table = await tableStructure.findOne({
        slug: subCategory.tableStructureSlug
      });

      fetchHeaderComponent = await header_component.find({
        parentCategory: category._id,
        subCategory: subCategory._id
      });

      filter.parentCategory = category._id;
      filter.subCategory = subCategory._id;
    }

    // Search filter (applies to all cases)
    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } }
      ];
    }

    // Count and fetch posts
    const totalPosts = await table_post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit);

    const allPosts = await table_post
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("parentCategory", "slug")
      .populate("subCategory", "slug");

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      table: table,
      header_component: fetchHeaderComponent,
      table_post: allPosts,
      total: totalPosts,
      totalPages,
      currentPage: Number(page)
    });
  } catch (error) {
    console.error("Error in getTablePostsByCategoryAndSubcategory:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

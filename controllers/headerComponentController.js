import header_component from "../models/header_component.js";
import categories from "../models/categories.js";
import sub_categories from "../models/sub_categories.js";

export const createHeaderComponent = async (req, res) => {
  const { name, slug, heading, link, parentSlug, subCategorySlug } = req.body;

  if (!name || !slug || !heading || !link || !parentSlug || !subCategorySlug) {
    return res.status(400).json({
      success: false,
      message:
        "name, slug, heading, downloadLink, parentSlug, subCategorySlug are required"
    });
  }

  try {
    const category = await categories.findOne({ slug: parentSlug });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Parent category with slug '${parentSlug}' not found`
      });
    }

    const subCategories = await sub_categories.findOne({
      slug: subCategorySlug,
      parentCategory: category._id
    });
    if (!subCategories) {
      return res.status(400).json({
        success: false,
        message: `Sub category does not exist with ${subCategorySlug} slug in the Parent Category`
      });
    }

    // Check if subcategory type is "table"
    if (subCategories.type !== "table") {
      return res.status(400).json({
        success: false,
        message: `Header components can only be created for subcategories with type "table". Current type: ${subCategories.type}`
      });
    }

    // Check if a header component already exists for this subcategory
    const existingComponent = await header_component.findOne({
      parentCategory: category._id,
      subCategory: subCategories._id
    });

    if (existingComponent) {
      return res.status(400).json({
        success: false,
        message: `A header component already exists for this subcategory. Only one header component is allowed per subcategory.`
      });
    }

    // Check for duplicate slug across all components
    const duplicateSlug = await header_component.findOne({
      slug: slug
    });

    if (duplicateSlug) {
      return res.status(400).json({
        success: false,
        message: `Header Component with slug "${slug}" already exists. Please choose a different slug.`
      });
    }

    const newHeaderComponent = new header_component({
      name,
      slug,
      heading,
      link,
      parentCategory: category._id,
      parentSlug,
      subCategory: subCategories._id,
      subCategorySlug
    });

    await newHeaderComponent.save();

    return res.status(200).json({
      success: true,
      message: "Header Component created successfully",
      headerComponent: newHeaderComponent
    });
  } catch (error) {
    console.error("Error while creating header component:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the header component",
      error: error.message
    });
  }
};

// Get all header components with pagination and filtering
export const getAllHeaderComponents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      parentSlug,
      subCategorySlug,
      search
    } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (parentSlug) filter.parentSlug = parentSlug;
    if (subCategorySlug) filter.subCategorySlug = subCategorySlug;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { heading: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } }
      ];
    }

    // Optimized query with population and lean
    const headerComponents = await header_component
      .find(filter)
      .populate("parentCategory", "name slug")
      .populate("subCategory", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await header_component.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Header components fetched successfully",
      data: {
        headerComponents,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error("Error while fetching header components:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching header components",
      error: error.message
    });
  }
};

// Get single header component by ID
export const getHeaderComponentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Header component ID is required"
      });
    }

    const headerComponent = await header_component
      .findById(id)
      .populate("parentCategory", "name slug")
      .populate("subCategory", "name slug")
      .lean();

    if (!headerComponent) {
      return res.status(404).json({
        success: false,
        message: "Header component not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Header component fetched successfully",
      data: headerComponent
    });
  } catch (error) {
    console.error("Error while fetching header component:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the header component",
      error: error.message
    });
  }
};

// Update header component
export const updateHeaderComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, heading, link, parentSlug, subCategorySlug } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Header component ID is required"
      });
    }

    // Check if header component exists
    const existingComponent = await header_component.findById(id);
    if (!existingComponent) {
      return res.status(404).json({
        success: false,
        message: "Header component not found"
      });
    }

    // Validate required fields
    if (
      !name ||
      !slug ||
      !heading ||
      !link ||
      !parentSlug ||
      !subCategorySlug
    ) {
      return res.status(400).json({
        success: false,
        message:
          "name, slug, heading, link, parentSlug, subCategorySlug are required"
      });
    }

    // Validate parent category
    const category = await categories.findOne({ slug: parentSlug });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Parent category with slug '${parentSlug}' not found`
      });
    }

    // Validate subcategory
    const subCategories = await sub_categories.findOne({
      slug: subCategorySlug,
      parentCategory: category._id
    });
    if (!subCategories) {
      return res.status(400).json({
        success: false,
        message: `Sub category does not exist with ${subCategorySlug} slug in the Parent Category`
      });
    }

    // Check if subcategory type is "table"
    if (subCategories.type !== "table") {
      return res.status(400).json({
        success: false,
        message: `Header components can only be created for subcategories with type "table". Current type: ${subCategories.type}`
      });
    }

    // Check for duplicate slug across all components (excluding current component)
    const duplicateSlug = await header_component.findOne({
      slug: slug,
      _id: { $ne: id }
    });

    if (duplicateSlug) {
      return res.status(400).json({
        success: false,
        message: `Header Component with slug "${slug}" already exists. Please choose a different slug.`
      });
    }

    // Check if another header component already exists for this subcategory (only if changing subcategory)
    if (
      existingComponent.subCategory.toString() !== subCategories._id.toString()
    ) {
      const existingComponentForSubcategory = await header_component.findOne({
        parentCategory: category._id,
        subCategory: subCategories._id
      });

      if (existingComponentForSubcategory) {
        return res.status(400).json({
          success: false,
          message: `A header component already exists for this subcategory. Only one header component is allowed per subcategory.`
        });
      }
    }

    // Update the component
    const updatedComponent = await header_component
      .findByIdAndUpdate(
        id,
        {
          name,
          slug,
          heading,
          link,
          parentCategory: category._id,
          parentSlug,
          subCategory: subCategories._id,
          subCategorySlug
        },
        { new: true, runValidators: true }
      )
      .populate("parentCategory", "name slug")
      .populate("subCategory", "name slug");

    return res.status(200).json({
      success: true,
      message: "Header component updated successfully",
      data: updatedComponent
    });
  } catch (error) {
    console.error("Error while updating header component:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the header component",
      error: error.message
    });
  }
};

// Delete header component
export const deleteHeaderComponent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Header component ID is required"
      });
    }

    // Check if header component exists
    const existingComponent = await header_component.findById(id);
    if (!existingComponent) {
      return res.status(404).json({
        success: false,
        message: "Header component not found"
      });
    }

    // Delete the component
    await header_component.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Header component deleted successfully"
    });
  } catch (error) {
    console.error("Error while deleting header component:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the header component",
      error: error.message
    });
  }
};

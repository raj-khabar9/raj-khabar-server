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

    const existingComponent = await header_component.findOne({
      slug: slug,
      parentCategory: category._id,
      subCategory: subCategories._id
    });

    if (existingComponent) {
      return res.status(400).json({
        success: false,
        message: `Header Component with ${slug} slug already exist in the sub category`
      });
    }

    //count component posts
    const componentCount = await header_component.countDocuments();
    if (componentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `One Sub Category can only have on Header Component.`
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

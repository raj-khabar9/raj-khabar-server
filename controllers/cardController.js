import card_structure from "../models/card_structure.js";
import categories from "../models/categories.js";
import sub_categories from "../models/sub_categories.js";

export const createCardPost = async (req, res) => {
  const {
    name,
    slug,
    topField,
    cardHeading,
    middleField,
    link,
    parentSlug,
    subCategorySlug
  } = req.body;

  if (!name || !slug || !cardHeading || !parentSlug || !subCategorySlug) {
    return res.status(400).json({
      success: false,
      message: "Card slug, Name, Parent category, Sub category are required"
    });
  }

  try {
    //fetching the parent and sub category
    const category = await categories.findOne({ slug: parentSlug });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Category with slug ${parentSlug} does not exist`
      });
    }

    const subCategories = await sub_categories.findOne({
      slug: subCategorySlug,
      parentCategory: category._id
    });
    if (!subCategories) {
      return res.status(400).json({
        success: false,
        message: `Subcategory with slug ${subCategorySlug} does not exist in category ${parentSlug}`
      });
    }

    if (subCategories.type !== "card") {
      return res.status(400).json({
        sucess: false,
        message: `${subCategorySlug} is not of type card.`
      });
    }

    // checking for existing card
    const cardExists = await card_structure.findOne({
      slug: slug,
      parentCategory: category._id,
      subCategory: subCategories._id
    });

    if (cardExists) {
      return res.status(400).json({
        success: false,
        message: `Card already exist with the ${slug}`
      });
    }

    const newCard = new card_structure({
      name,
      slug,
      topField,
      cardHeading,
      middleField,
      link,
      parentCategory: category._id,
      parentSlug,
      subCategory: subCategories._id,
      subCategorySlug
    });

    await newCard.save();

    return res.status(201).json({
      success: true,
      message: "Card created successfully",
      rowData: newCard
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

export const getCardPostsByCategory = async (req, res) => {
  const { parentSlug, subCategorySlug } = req.params;

  if (!parentSlug || !subCategorySlug) {
    return res.status(400).json({
      success: false,
      message: "Both parentSlug and subCategorySlug are required"
    });
  }

  try {
    // Find the parent category
    const category = await categories.findOne({ slug: parentSlug });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Category with slug ${parentSlug} does not exist`
      });
    }

    // Find the subcategory
    const subCategory = await sub_categories.findOne({
      slug: subCategorySlug,
      parentCategory: category._id
    });

    if (!subCategory) {
      return res.status(400).json({
        success: false,
        message: `Subcategory with slug ${subCategorySlug} does not exist in category ${parentSlug}`
      });
    }

    if (subCategory.type !== "card") {
      return res.status(400).json({
        success: false,
        message: `${subCategorySlug} is not of type card.`
      });
    }

    // Fetch all matching cards
    const cards = await card_structure.find({
      parentCategory: category._id,
      subCategory: subCategory._id
    });

    return res.status(200).json({
      success: true,
      message: "Cards fetched successfully",
      data: cards
    });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

export const getAllCardPosts = async (req, res) => {
  try {
    const cards = await card_structure.find();

    return res.status(200).json({
      success: true,
      message: "Cards fetched successfully",
      data: cards
    });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

export const getCardPostBySlug = async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: "Slug is required"
    });
  }

  try {
    const card = await card_structure.findOne({ slug });
    if (!card) {
      return res.status(404).json({
        success: false,
        message: `Card with slug ${slug} not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Card fetched successfully",
      data: card
    });
  } catch (error) {
    console.error("Error fetching card:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

export const updateCardPost = async (req, res) => {
  const { slug } = req.params;
  const { name, topField, cardHeading, middleField, link, parentSlug, subCategorySlug } = req.body;

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: "Slug is required"
    });
  }

  try {
    // Find the card by slug
    const card = await card_structure.findOne({ slug });
    if (!card) {
      return res.status(404).json({
        success: false,
        message: `Card with slug ${slug} not found`
      });
    }

    // Optionally update category/subcategory if provided
    if (parentSlug) {
      const category = await categories.findOne({ slug: parentSlug });
      if (!category) {
        return res.status(400).json({
          success: false,
          message: `Category with slug ${parentSlug} does not exist`
        });
      }
      card.parentCategory = category._id;
      card.parentSlug = parentSlug;
    }
    if (subCategorySlug && card.parentCategory) {
      const subCategory = await sub_categories.findOne({
        slug: subCategorySlug,
        parentCategory: card.parentCategory
      });
      if (!subCategory || subCategory.type !== "card") {
        return res.status(400).json({
          success: false,
          message: `Subcategory with slug ${subCategorySlug} is invalid or not of type card`
        });
      }
      card.subCategory = subCategory._id;
      card.subCategorySlug = subCategorySlug;
    }

    // Update allowed fields
    if (name !== undefined) card.name = name;
    if (topField !== undefined) card.topField = topField;
    if (cardHeading !== undefined) card.cardHeading = cardHeading;
    if (middleField !== undefined) card.middleField = middleField;
    if (link !== undefined) card.link = link;

    await card.save();

    return res.status(200).json({
      success: true,
      message: "Card updated successfully",
      updatedCard: card
    });
  } catch (error) {
    console.error("Error updating card:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

export const deleteCardPost = async (req, res) => {
  const { slug, parentSlug, subCategorySlug } = req.params;

  if (!slug || !parentSlug || !subCategorySlug) {
    return res.status(400).json({
      success: false,
      message: "Slug, parentSlug, and subCategorySlug are required"
    });
  }

  try {
    // Find category and subcategory
    const category = await categories.findOne({ slug: parentSlug });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Category with slug ${parentSlug} does not exist`
      });
    }

    const subCategory = await sub_categories.findOne({
      slug: subCategorySlug,
      parentCategory: category._id
    });

    if (!subCategory || subCategory.type !== "card") {
      return res.status(400).json({
        success: false,
        message: `Subcategory with slug ${subCategorySlug} is invalid or not of type card`
      });
    }

    // Find and delete the card
    const deletedCard = await card_structure.findOneAndDelete({
      slug,
      parentCategory: category._id,
      subCategory: subCategory._id
    });

    if (!deletedCard) {
      return res.status(404).json({
        success: false,
        message: `Card with slug ${slug} not found in the specified category and subcategory`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Card deleted successfully",
      deletedCard
    });
  } catch (error) {
    console.error("Error deleting card:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

export const deleteCardById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Card id is required"
    });
  }

  try {
    const deletedCard = await card_structure.findByIdAndDelete(id);
    if (!deletedCard) {
      return res.status(404).json({
        success: false,
        message: `Card with id ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Card deleted successfully",
      deletedCard
    });
  } catch (error) {
    console.error("Error deleting card:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

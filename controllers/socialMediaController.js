import social_media from "../models/social_media.js";

export const createSocialMediaCard = async (req, res) => {
  const { name, slug, link, type } = req.body;

  if (!name || !link || !slug || !type) {
    return res.status(400).json({
      success: false,
      message: "name and link both are required fields"
    });
  }

  try {
    const existingSocialMediaHandle = await social_media.findOne({
      slug: slug
    });
    if (existingSocialMediaHandle) {
      return res.status(400).json({
        success: false,
        message: `social media already exist with ${slug} slug.`
      });
    }

    //creating new record
    const newSocialCard = new social_media({
      name,
      slug,
      link,
      type
    });

    await newSocialCard.save();
    console.log("excecuting");

    return res.status(200).json({
      success: true,
      message: "social link created successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

export const updateSocialMediaCard = async (req, res) => {
  const { id } = req.params;
  const { name, slug, link, type } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Card id is required"
    });
  }

  if (!name || !link || !slug || !type) {
    return res.status(400).json({
      success: false,
      message: "name, slug, link and type are required fields"
    });
  }

  try {
    const updatedCard = await social_media.findByIdAndUpdate(
      id,
      { name, slug, link, type },
      { new: true, runValidators: true }
    );

    if (!updatedCard) {
      return res.status(404).json({
        success: false,
        message: `Card with id ${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Card updated successfully",
      data: updatedCard
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

export const getAllSocialMediaCards = async (req, res) => {
  try {
    const socialMediaCards = await social_media.find({});

    return res.status(200).json({
      success: true,
      message: "Fetched all social media cards successfully",
      data: socialMediaCards
    });
  } catch (error) {
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
    const deletedCard = await social_media.findByIdAndDelete(id);
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
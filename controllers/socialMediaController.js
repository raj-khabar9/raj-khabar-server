import social_media from "../models/social_media.js";

export const createSocialMediaCard = async (req, res) => {
  const { name, slug, link, type } = req.body;

  if (!name || !link || !slug || !type) {
    res.status(400).json({
      success: false,
      message: "name and link both are required fields"
    });
  }

  try {
    const existingSocialMediaHandle = await social_media.findOne({
      slug: slug
    });
    if (existingSocialMediaHandle) {
      res.status(400).json({
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
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};
export const getAllSocialMediaCards = async (req, res) => {
  try {
    const socialMediaCards = await social_media.find({});

    res.status(200).json({
      success: true,
      message: "Fetched all social media cards successfully",
      data: socialMediaCards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error
    });
  }
};

import AdType from "../models/ad_type.js";
import AppSetting from "../models/app_setting.js";
import { body, validationResult } from "express-validator";

// Validation rules for creating and updating an Ad Type
export const validateAdType = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("slug").notEmpty().withMessage("Slug is required").trim(),
  body("description"),
  body("ad_unit_id").notEmpty().withMessage("Ad unit ID is required").trim(),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either 'active' or 'inactive'"),
  body("type")
    .optional()
    .isIn([
      "banner",
      "interstitial",
      "native_advanced",
      "rewarded",
      "rewarded_interstitial",
      "app_open"
    ])
    .withMessage("Invalid ad type"),
  body("platform")
    .optional()
    .isIn(["android", "ios", "all"])
    .withMessage("Platform must be 'android', 'ios', or 'all'")
];

// Create a new Ad Type
export const createAdType = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const { name, slug, description, status, type, platform, ad_unit_id } = req.body;

  try {
    // Check for unique slug
    const existingAdType = await AdType.findOne({ slug });
    if (existingAdType) {
      return res.status(400).json({
        success: false,
        message: `Ad type with slug '${slug}' already exists`
      });
    }

    const newAdType = new AdType({
      name,
      slug,
      description,
      status,
      type,
      platform,
      ad_unit_id
    });

    await newAdType.save();

    return res.status(201).json({
      success: true,
      message: "Ad type created successfully",
      adType: newAdType
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Get all Ad Types
export const getAllAdTypes = async (req, res) => {
  try {
    const adTypes = await AdType.find().sort({ createdAt: -1 });
    
    // Fetch app settings to get adsEnabled status
    let settings = await AppSetting.findOne();
    if (!settings) {
      settings = await AppSetting.create({ adsEnabled: true });
    }

    return res.status(200).json({
      success: true,
      message: "Ad types fetched successfully",
      adsEnabled: settings.adsEnabled,
      adTypes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Get Ad Type by Slug
export const getAdTypeBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const adType = await AdType.findOne({ slug });
    if (!adType) {
      return res.status(404).json({
        success: false,
        message: `Ad type with slug '${slug}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ad type fetched successfully",
      adType
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Update an Ad Type by Slug
export const updateAdType = async (req, res) => {
  const { slug: existingSlug } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const { name, slug, description, status, type, platform, ad_unit_id } = req.body;

  try {
    const adType = await AdType.findOne({ slug: existingSlug });

    if (!adType) {
      return res.status(404).json({
        success: false,
        message: `Ad type with slug '${existingSlug}' not found`
      });
    }

    // Check if the user is trying to update the slug to an existing one
    if (slug && slug !== existingSlug) {
      const slugExists = await AdType.findOne({ slug });
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: `Ad type with slug '${slug}' already exists`
        });
      }
    }

    // Update fields
    if (name !== undefined) adType.name = name;
    if (slug !== undefined) adType.slug = slug;
    if (description !== undefined) adType.description = description;
    if (status !== undefined) adType.status = status;
    if (type !== undefined) adType.type = type;
    if (platform !== undefined) adType.platform = platform;
    if (ad_unit_id !== undefined) adType.ad_unit_id = ad_unit_id;

    // update the modification timestamp
    adType.updatedAt = Date.now();

    await adType.save();

    return res.status(200).json({
      success: true,
      message: "Ad type updated successfully",
      adType
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Delete an Ad Type by Slug
export const deleteAdType = async (req, res) => {
  const { slug } = req.params;

  try {
    const deletedAdType = await AdType.findOneAndDelete({ slug });

    if (!deletedAdType) {
      return res.status(404).json({
        success: false,
        message: `Ad type with slug '${slug}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Ad type '${slug}' deleted successfully`,
      adType: deletedAdType
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

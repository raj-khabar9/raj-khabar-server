import AppSetting from "../models/app_setting.js";

// Get App Settings
export const getAppSettings = async (req, res) => {
    try {
        let settings = await AppSetting.findOne();
        if (!settings) {
            settings = await AppSetting.create({ adsEnabled: true });
        }
        return res.status(200).json({
            success: true,
            settings
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Toggle or Update Ads Setting
export const updateAdsSetting = async (req, res) => {
    try {
        const { adsEnabled } = req.body;
        
        if (typeof adsEnabled !== "boolean") {
             return res.status(400).json({ success: false, message: "adsEnabled must be a boolean" });
        }

        let settings = await AppSetting.findOne();
        if (!settings) {
            settings = new AppSetting({ adsEnabled });
        } else {
            settings.adsEnabled = adsEnabled;
            settings.updatedAt = Date.now();
        }

        await settings.save();

        return res.status(200).json({
            success: true,
            message: "App settings updated successfully",
            settings
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

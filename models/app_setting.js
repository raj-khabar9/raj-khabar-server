import mongoose from "mongoose";

const appSettingSchema = new mongoose.Schema({
    adsEnabled: {
        type: Boolean,
        default: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("AppSetting", appSettingSchema);

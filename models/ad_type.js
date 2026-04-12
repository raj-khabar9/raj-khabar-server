import mongoose from "mongoose";

const adTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    type: {
        type: String,
        enum: ["banner", "interstitial", "native_advanced", "rewarded", "rewarded_interstitial", "app_open"],
        default: "banner"
    },
    platform: {
        type: String,
        enum: ["android", "ios", "all"],
        default: "all"
    },
    ad_unit_id: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("AdType", adTypeSchema);
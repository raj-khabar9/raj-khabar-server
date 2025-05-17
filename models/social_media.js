import mongoose from "mongoose";

const socialMediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    enum: [
      "instagram",
      "whatsApp",
      "telegram",
      "facebook",
      "x",
      "youtube",
      "privacy-policy",
      "terms-of-services"
    ],
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ["social", "privacy"]
  },
  link: {
    type: String,
    required: true
  }
});

export default mongoose.model("SocialMedia", socialMediaSchema);

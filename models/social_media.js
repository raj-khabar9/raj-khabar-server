import mongoose from "mongoose";

const allowedSocialSlugs = [
  "instagram",
  "whatsapp",
  "telegram",
  "facebook",
  "x",
  "youtube"
];

const socialMediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        if (this.type === "social") {
          return allowedSocialSlugs.includes(value);
        }
        return true; // Allow any slug if type is "policy"
      },
      message: (props) => `${props.value} is not a valid slug for type "social"`
    }
  },
  type: {
    type: String,
    required: true,
    enum: ["social", "policy"]
  },
  link: {
    type: String,
    required: true
  }
});

export default mongoose.model("SocialMedia", socialMediaSchema);

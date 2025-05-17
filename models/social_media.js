import mongoose from "mongoose";

const socialMediaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  }
});

export default mongoose.model("SocialMedia", socialMediaSchema);

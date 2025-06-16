import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilePhoto: {
    type: String,
    required: false
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);
export default User;

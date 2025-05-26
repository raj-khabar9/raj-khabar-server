import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: `User already exists ${email}`
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const newNser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword // Store the hashed password
    });

    await newNser.save(); // Save the user to the database
    return res
      .status(200)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error in register:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // compare the password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, findUser.password);
    if (isPasswordValid) {
      const token = jwt.sign(
        { userId: findUser._id, email: findUser.email },
        process.env.JWT_SECRET
      );
      // Set the token in the cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in production
        sameSite: "None", // <-- ADD THIS
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: findUser,
        token
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error in login:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    });
    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Error in logout:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const updatePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    // Get the user based on the token (authMiddleware adds userId to req.user)
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Ensure the email entered matches the logged-in user's email
    if (user.email !== email) {
      return res.status(403).json({
        success: false,
        message: "Entered email does not match the logged-in user"
      });
    }

    // Compare old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Old password is incorrect" });
    }

    // Hash and update the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    });
    return res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error in updatePassword:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

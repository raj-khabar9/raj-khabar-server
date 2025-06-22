import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadToS3, updateS3File } from "../utils/uploadToS3.js";

export const register = async (req, res) => {
  const { firstName, lastName, email, password, role, isSuperAdmin, isActive } =
    req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: `User already exists ${email}`
      });
    }

    // Check super admin limit
    if (isSuperAdmin === true || isSuperAdmin === "true") {
      const superAdminCount = await User.countDocuments({ isSuperAdmin: true });
      if (superAdminCount >= 2) {
        return res.status(403).json({
          success: false,
          message: "Only 2 super admins are allowed."
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    let profilePhoto = "";
    if (req.file) {
      try {
        const imageUrl = await uploadToS3(req.file);
        profilePhoto = imageUrl;
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Image upload to S3 failed",
          error: error.message
        });
      }
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      profilePhoto,
      role,
      isSuperAdmin: isSuperAdmin === true || isSuperAdmin === "true",
      isActive: isActive !== undefined ? isActive : true,
      password: hashedPassword // Store the hashed password
    });

    await newUser.save(); // Save the user to the database
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

    // Check if user is active
    if (findUser.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is deactivated. Please contact the administrator."
      });
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
        sameSite: "None",
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

export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by your authMiddleware after verifying JWT
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, user: null, message: "Not authenticated" });
    }
    // Fetch the full user from DB (optional, for fresh data)
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, user: null, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, user: null, message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // req.user is set by authMiddleware after verifying JWT
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Handle profile photo upload (if file is sent)
    if (req.file) {
      try {
        const imageUrl = await updateS3File(req.file);
        user.profilePhoto = imageUrl;
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Image upload to S3 failed",
          error: error.message
        });
      }
    }

    await user.save();
    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userObj
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // req.user is set by authMiddleware after verifying JWT
    const requestingUser = await User.findById(req.user.userId);
    if (!requestingUser) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
    if (!requestingUser.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only super admins can view all users."
      });
    }

    const users = await User.find().select("-password");
    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const manageUser = async (req, res) => {
  try {
    // Only super admin can manage users
    const requestingUser = await User.findById(req.user.userId);
    if (!requestingUser || !requestingUser.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only super admins can manage users."
      });
    }

    const { userId } = req.params; // user to update
    const { role, isActive } = req.body;
    console.log("Requesting User:", requestingUser);
    console.log("User to Update ID:", userId);
    console.log("Role to Update:", role);
    console.log("isActive to Update:", isActive);

    // Prevent changing super admin status for other super admins
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (userToUpdate.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Cannot modify another super admin."
      });
    }

    // Update allowed fields
    if (role) userToUpdate.role = role;
    if (typeof isActive === "boolean") userToUpdate.isActive = isActive;

    await userToUpdate.save();

    const userObj = userToUpdate.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userObj
    });
  } catch (error) {
    console.error("Error in manageUser:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

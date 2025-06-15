import { uploadToS3, listS3Files } from "../utils/uploadToS3.js";

export const uploadImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileUrl = await uploadToS3(file);
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

export const listAllFiles = async (req, res) => {
  try {
    const files = await listS3Files(req, res);
    return res.status(200).json({
      success: true,
      files
    });
  } catch (error) {
    console.error("Error listing S3 files:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to list files",
      error
    });
  }
};

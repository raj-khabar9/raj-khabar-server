import { uploadToS3 } from "../utils/uploadToS3.js";

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


import { uploadToS3, listS3Files, deleteFromS3 } from "../utils/uploadToS3.js";

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

export const deleteFile = async (req, res) => {
  const { key } = req.params;
  try {
    await deleteFromS3(key);
    return res.status(200).json({
      success: true,
      message: "File deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete file",
      error: error.message
    });
  }
};

export const bulkDeleteFiles = async (req, res) => {
  const { keys } = req.body;
  if (!keys || !Array.isArray(keys) || keys.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide an array of file keys to delete"
    });
  }

  try {
    const promises = keys.map(key => deleteFromS3(key));
    await Promise.all(promises);

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${keys.length} file(s)`,
      deletedCount: keys.length
    });
  } catch (error) {
    console.error("Error bulk deleting S3 files:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to bulk delete files",
      error: error.message
    });
  }
};

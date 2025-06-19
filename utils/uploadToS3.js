import { clients3 } from "./s3_credentials.js";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export const uploadToS3 = async (file, key = null) => {
  const fileName = key || `${uuidv4()}${path.extname(file.originalname)}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer
  };

  try {
    const command = new PutObjectCommand(params);
    await clients3.send(command);

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log("File uploaded successfully:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

export const deleteFromS3 = async (fileName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName
  };

  try {
    const command = new DeleteObjectCommand(params);
    await clients3.send(command);
    console.log("File deleted successfully:", fileName);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error("Failed to delete file from S3");
  }
};

export const updateS3File = async (newFile, oldUrl) => {
  try {
    const oldImageUrl = oldUrl;
    const key = oldImageUrl.split(".amazonaws.com/")[1];
    const newImageUrl = await uploadToS3(newFile, key);
    return newImageUrl;
  } catch (error) {
    console.error("Error updating S3 file:", error);
    throw new Error("Failed to update file in S3");
  }
};

export const listS3Files = async (req, res) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME
    };

    const command = new ListObjectsV2Command(params);
    const data = await clients3.send(command);

    const files = await Promise.all(
      (data.Contents || []).map(async (item) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: item.Key
        });
        const url = await getSignedUrl(clients3, getObjectCommand); // 1 hour
        return {
          key: item.Key,
          url,
          size: item.Size,
          lastModified: item.LastModified
        };
      })
    );

    return files;
  } catch (error) {
    console.error("Error listing S3 files:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to list files",
        error: error.message // Only send the error message, not the whole object
      });
    }
  }
};

import cloudinary from "../config/cloudinary.js";
import { v2 } from "cloudinary";

export const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "blog/avatars",
        resource_type: "image",
        format: mimetype.split("/")[1], // 'image/jpeg' → 'jpeg'
      },
      (error, result) => {
        if (error || !result)
          return reject(
            new Error(error?.message ?? "Cloudinary upload failed"),
          );
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    uploadStream.end(buffer); // pipe the buffer into the stream
  });
};

export const deleteFromCloudinary = async (publicId) => {
  await v2.uploader.destroy(publicId);
};


import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (base64Image: string): Promise<string> => {
  // Check if already a URL
  if (base64Image.startsWith('http')) {
      return base64Image;
  }

  try {
    // Cloudinary expects base64 to be just the data or full data uri?
    // It handles full data URI nicely.
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'goingmarry_products',
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== 'ok') {
            console.error(`Failed to delete image ${publicId}:`, result);
        } else {
             console.log(`Deleted image ${publicId}`);
        }
    } catch (error) {
        console.error(`Error deleting image ${publicId}:`, error);
    }
};

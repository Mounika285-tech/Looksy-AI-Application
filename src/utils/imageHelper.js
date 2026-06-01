import * as ImageManipulator from 'expo-image-manipulator';
import { CLOUDINARY_CONFIG } from '../config/cloudinary';

/**
 * Optimizes an image by resizing and compressing it.
 * @param {string} uri - The local URI of the image to optimize.
 * @returns {Promise<{uri: string, width: number, height: number}>} - The optimized image result.
 */
export const optimizeImage = async (uri) => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
};

/**
 * Uploads an optimized image to Cloudinary.
 * @param {string} localUri - The local URI of the image.
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
export const uploadToCloudinary = async (localUri) => {
  try {
    const data = new FormData();
    data.append('file', {
      uri: localUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    data.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    data.append('cloud_name', CLOUDINARY_CONFIG.cloudName);

    const response = await fetch(CLOUDINARY_CONFIG.apiUrl, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Cloudinary upload failed: ${errText}`);
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw error;
  }
};

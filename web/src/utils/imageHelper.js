import { CLOUDINARY_CONFIG } from '../config/cloudinary';

/**
 * Uploads a file object to Cloudinary.
 * @param {File} file - The file object from browser input.
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
export const uploadToCloudinary = async (file) => {
  try {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    data.append('cloud_name', CLOUDINARY_CONFIG.cloudName);

    const response = await fetch(CLOUDINARY_CONFIG.apiUrl, {
      method: 'POST',
      body: data,
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

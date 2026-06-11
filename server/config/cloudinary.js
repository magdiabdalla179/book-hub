const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder = 'bookhub', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, ...options },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

/**
 * Generate a signed URL for private ebook downloads
 * @param {string} publicId - Cloudinary public ID
 * @param {number} expiresIn - Seconds until expiration
 * @returns {string} Signed URL
 */
const generateSignedUrl = (publicId, expiresIn = 3600) => {
  const timestamp = Math.floor(Date.now() / 1000) + expiresIn;
  return cloudinary.utils.private_download_url(publicId, 'pdf', {
    expires_at: timestamp,
    attachment: true,
  });
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary, generateSignedUrl };

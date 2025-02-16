require('dotenv').config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Ensure environment variables are loaded
if (
  !process.env.CLOUD_NAME ||
  !process.env.CLOUD_API_KEY ||
  !process.env.CLOUD_API_SECRET
) {
  console.error('Cloudinary environment variables are missing!');
  process.exit(1); // Exit the process if variables are not set
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Log Cloudinary API key (For Debugging, remove in production)
console.log('Cloudinary API Key:', process.env.CLOUD_API_KEY);

// Configure Multer to use Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const resourceType = file.mimetype.startsWith('video') ? 'video' : 'image';

    return {
      folder: 'Idcard',
      resource_type: resourceType,
      allowed_formats: [
        'jpeg',
        'jpg',
        'png',
        'mp4',
        'mov',
        'wmv',
        'pdf',
        'svg',
      ],
    };
  },
});

module.exports = { cloudinary, storage };

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allow all file types (images, PDFs, docs, etc.) by using resource_type: 'auto'
exports.uploadFile = async (buffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'auto', public_id: `bills/${filename}` },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');

// Abstraction: can swap to GCS later
exports.uploadFile = async (buffer, filename, mimetype) => {
  const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType: mimetype });
    uploadStream.end(buffer, (err, file) => {
      if (err) return reject(err);
      resolve(`/api/finance/files/${file._id}`);
    });
  });
};

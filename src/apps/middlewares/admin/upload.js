const config = require("config");
const cloudService = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const uploadCloud = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudService,
    params: {
      folder: config.get("cloud.cloudFolder"),
      allowedFormats: ['jpg', 'png'],
      public_id: (req, file) => {
        return file.originalname;
      }
    }
  })
});

module.exports = uploadCloud;

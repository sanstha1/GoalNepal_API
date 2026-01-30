const multer = require("multer");
const path = require("path");

const maxSize = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("public", "profile_pictures"));
  },
  filename: (req, file, cb) => {
    const userId = req.params.userId;
    const ext = path.extname(file.originalname);
    cb(null, `pro-pic-${userId}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Image format not supported"), false);
  }
  cb(null, true);
};

const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});

module.exports = uploadProfilePicture;
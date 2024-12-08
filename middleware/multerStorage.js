const multer = require('multer');
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the folder dynamically
    const uploadDir =
      req.uploadTarget === "carousel"
        ? path.join(__dirname, "..", "uploads", "carousel")
        : path.join(__dirname, "..", "uploads");
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
module.exports = storage;
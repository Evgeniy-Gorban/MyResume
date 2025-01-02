const multer = require('multer');
const path = require('path');

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/products");
  },
  filename: (req, file, cb) => {
    const uniqName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqName + path.extname(file.originalname));
  }
})

const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Непідтримуваний формат файлу"), false);
    }
    cb(null, true);
  }
})

module.exports = uploadProductImage;
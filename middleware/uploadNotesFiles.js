const multer = require('multer');

const notesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/notes");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
})

const uploadNotesFiles = multer({
  storage: notesStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["text/plain"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Непідтримуваний формат файлу"), false);
    }
    cb(null, true);
  }
})

module.exports = uploadNotesFiles;
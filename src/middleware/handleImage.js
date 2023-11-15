const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const memoryStorage = multer.memoryStorage();
const uploadS3 = multer({ storage: memoryStorage });

module.exports = {
  upload,
  uploadS3,
};

import multer from "multer";

//save karo file ko inside servers memory
const storage = multer.memoryStorage();

//only images upload karega user.
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 5* 1024* 1024} //image to be not more than 5mb.
});

export default upload;
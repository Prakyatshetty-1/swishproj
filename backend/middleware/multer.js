import multer from "multer";
import path from "path";
import fs from "fs";


//uploads wali folder banau if it not exists.
const uploadDir = "uploads/";
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

//save karo file ko iss destination par with an unique name.
const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null,uploadDir);
    },
    filename: (req,file,cb) =>{
        cb(null,Date.now() + path.extname(file.originalname));
    }
});

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
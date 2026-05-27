import multer from "multer";
import path from "path";
import fs from "fs";
import { error } from "console";
import { Response ,NextFunction } from "express";


// Multer configuration 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "media/";

    if (file.fieldname === "avatar") {
      folder += "avatars";
    } else if (file.fieldname === "banner") {
      folder += "banners";
    } else if (file.fieldname === "tweet_img") {
      folder += "tweets";
    }

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {

    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});


const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, and GIF files are allowed!"));
  }

  cb(null, true);
};

export const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});



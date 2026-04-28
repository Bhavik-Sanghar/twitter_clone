import multer from "multer";
import path from "path";
import fs from "fs";

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

export const upload = multer({ storage });

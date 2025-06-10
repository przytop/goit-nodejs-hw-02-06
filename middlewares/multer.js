import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const tmpDir = path.join(process.cwd(), "tmp");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path
      .extname(file.originalname)
      .toLowerCase()}`;
    cb(null, uniqueName);
  },
});
const extensionsWhitelist = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const mimeTypesWhitelist = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: async (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      !extensionsWhitelist.includes(ext) ||
      !mimeTypesWhitelist.includes(file.mimetype)
    ) {
      return cb(null, false);
    }
    cb(null, true);
  },
});

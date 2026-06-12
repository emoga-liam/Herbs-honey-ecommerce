import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "..", "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const router = Router();

// POST /api/uploads/image  (admin only)
router.post("/uploads/image", upload.single("image"), (req, res): void => {
  if (!req.session?.adminId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const imageUrl = `/api/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

export default router;

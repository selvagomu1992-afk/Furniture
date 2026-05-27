// src/middleware/upload.js — Multer + Sharp image pipeline
import multer from 'multer';
import sharp from 'sharp';
import cloudinary from '../config/cloudinary.js';

// Store in memory for sharp processing
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Process with sharp → upload to Cloudinary
export const processAndUpload = async (buffer, folder = 'jangid/products') => {
  // Optimise: resize, convert to webp
  const optimised = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'webp',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    stream.end(optimised);
  });
};

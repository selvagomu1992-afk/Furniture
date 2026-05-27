// src/controllers/uploadController.js — Cloudinary image upload
import { processAndUpload } from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// ─── UPLOAD IMAGE ───────────────────────────────
// POST /api/upload
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided' });
  }

  const folder = req.query.folder || 'jangid/products';
  const result = await processAndUpload(req.file.buffer, folder);

  res.status(201).json({
    success: true,
    url:       result.secure_url,
    publicId:  result.public_id,
    width:     result.width,
    height:    result.height,
    format:    result.format,
  });
});

// ─── DELETE IMAGE (Admin) ────────────────────────
// DELETE /api/upload/:publicId
export const deleteImage = asyncHandler(async (req, res) => {
  const publicId = decodeURIComponent(req.params.publicId);
  await cloudinary.uploader.destroy(publicId);
  res.json({ success: true, message: 'Image deleted' });
});

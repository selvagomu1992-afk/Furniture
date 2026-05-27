// src/routes/upload.js
import { Router } from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/',         protect, upload.single('image'), uploadImage);
router.delete('/:publicId', protect, adminOnly, deleteImage);

export default router;

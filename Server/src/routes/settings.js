// src/routes/settings.js — Public settings (no auth required)
import { Router } from 'express';
import { getPublicAddress } from '../controllers/adminController.js';

const router = Router();

// GET /api/settings/address — used by homepage to show dynamic company contact info
router.get('/address', getPublicAddress);

export default router;

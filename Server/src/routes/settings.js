// src/routes/settings.js — Public settings (no auth required)
import { Router } from 'express';
import { getPublicAddress, getActiveHeroSlides, getActiveFeaturedTypes } from '../controllers/adminController.js';

const router = Router();

// GET /api/settings/address — used by homepage to show dynamic company contact info
router.get('/address', getPublicAddress);

// GET /api/settings/hero-slides — active hero slides for homepage carousel
router.get('/hero-slides', getActiveHeroSlides);

// GET /api/settings/featured-types — active featured types for homepage carousel
router.get('/featured-types', getActiveFeaturedTypes);

export default router;

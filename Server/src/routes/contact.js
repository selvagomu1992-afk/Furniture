// src/routes/contact.js
import { Router } from 'express';
import { submitContact, getContactMessages, markRead } from '../controllers/contactController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/',             submitContact);
router.get ('/',             protect, adminOnly, getContactMessages);
router.patch('/:id/read',   protect, adminOnly, markRead);

export default router;

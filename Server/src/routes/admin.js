import { Router } from 'express';
import { getDashboard, getUsers, getUser } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', protect, adminOnly, getDashboard);
router.get('/users',     protect, adminOnly, getUsers);
router.get('/users/:id', protect, adminOnly, getUser);

export default router;

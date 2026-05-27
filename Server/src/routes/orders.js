// src/routes/orders.js
import { Router } from 'express';
import { placeOrder, getMyOrders, getOrder, updateOrderStatus, getAllOrders } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Customer
router.post('/',     protect, placeOrder);
router.get ('/my',   protect, getMyOrders);
router.get ('/:id',  protect, getOrder);

// Admin
router.get ('/',               protect, adminOnly, getAllOrders);
router.patch('/:id/status',    protect, adminOnly, updateOrderStatus);

export default router;

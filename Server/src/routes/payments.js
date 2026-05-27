// src/routes/payments.js
import { Router } from 'express';
import { createPaymentSession, paymentWebhook, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/create-session',     protect, createPaymentSession);
router.post('/webhook',                     paymentWebhook);      // No auth — Cashfree calls this
router.get ('/verify/:orderId',    protect, verifyPayment);

export default router;

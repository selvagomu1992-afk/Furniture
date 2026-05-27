// src/controllers/paymentController.js — Cashfree integration
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import prisma from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const cf = new Cashfree(
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY,
  process.env.CASHFREE_ENV === 'production' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
);

// ─── CREATE PAYMENT SESSION ─────────────────────
// POST /api/payments/create-session
export const createPaymentSession = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'orderId is required' });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: req.user.id },
    include: { user: true },
  });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (order.paymentStatus === 'PAID') {
    return res.status(400).json({ success: false, message: 'Order is already paid' });
  }

  const cashfreeOrderId = `FCH_${order.referenceCode}`;

  // Create order on Cashfree
  const request = {
    order_amount: order.estimatedPrice,
    order_currency: 'INR',
    order_id: cashfreeOrderId,
    customer_details: {
      customer_id:    order.user.id,
      customer_email: order.user.email,
      customer_name:  `${order.user.firstName} ${order.user.lastName}`,
      customer_phone: order.user.phone || '9999999999',
    },
    order_meta: {
      return_url: `${process.env.CLIENT_URL}/order-success.html?order_id=${orderId}`,
    },
    order_note: `Jangid commission - ${order.referenceCode}`,
  };

  const response = await cf.PGCreateOrder('2023-08-01', request);
  const { payment_session_id, cf_order_id } = response.data;

  // Save session ID to order
  await prisma.order.update({
    where: { id: orderId },
    data: { cashfreeOrderId: cf_order_id, paymentSessionId: payment_session_id },
  });

  res.json({
    success: true,
    paymentSessionId: payment_session_id,
    cashfreeOrderId: cf_order_id,
    amount: order.estimatedPrice,
  });
});

// ─── PAYMENT WEBHOOK ────────────────────────────
// POST /api/payments/webhook
export const paymentWebhook = asyncHandler(async (req, res) => {
  const body = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
  const { data, type } = body;

  if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
    const { order } = data;

    await prisma.order.updateMany({
      where: { cashfreeOrderId: order.cf_order_id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        finalPrice: order.order_amount,
      },
    });

    console.log(`✅ Payment confirmed for Cashfree order: ${order.cf_order_id}`);
  }

  if (type === 'PAYMENT_FAILED_WEBHOOK') {
    const { order } = data;

    await prisma.order.updateMany({
      where: { cashfreeOrderId: order.cf_order_id },
      data: { paymentStatus: 'FAILED' },
    });
  }

  res.json({ success: true });
});

// ─── VERIFY PAYMENT ─────────────────────────────
// GET /api/payments/verify/:orderId
export const verifyPayment = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.orderId, userId: req.user.id },
    select: { paymentStatus: true, status: true, referenceCode: true },
  });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, paymentStatus: order.paymentStatus, orderStatus: order.status, referenceCode: order.referenceCode });
});

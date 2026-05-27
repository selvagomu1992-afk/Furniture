// src/controllers/orderController.js
import prisma from '../config/db.js';
import { inngest } from '../inngest/client.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// ─── PLACE ORDER ────────────────────────────────
// POST /api/orders
export const placeOrder = asyncHandler(async (req, res) => {
  const {
    productId,
    material = 'walnut',
    finish = 'natural',
    upholstery,
    dimension = 'standard',
    customDimensions,
    notes,
    timeline = 'standard',
    estimatedPrice,
    deliveryAddress,
    country,
  } = req.body;

  if (!productId || !estimatedPrice || !deliveryAddress || !country) {
    return res.status(400).json({
      success: false,
      message: 'productId, estimatedPrice, deliveryAddress, and country are required',
    });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      material,
      finish,
      upholstery,
      dimension,
      customDimensions,
      notes,
      timeline,
      estimatedPrice: Number(estimatedPrice),
      deliveryAddress,
      country,
      items: {
        create: [{
          productId,
          price: product.basePrice,
          quantity: 1,
        }],
      },
    },
    include: {
      items: { include: { product: { select: { name: true, imageUrl: true } } } },
      user:  { select: { firstName: true, lastName: true, email: true } },
    },
  });

  // Fire order confirmation email via Inngest
  await inngest.send({
    name: 'order/placed',
    data: { order, user: order.user },
  });

  res.status(201).json({ success: true, order });
});

// ─── MY ORDERS ──────────────────────────────────
// GET /api/orders/my
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: { select: { name: true, imageUrl: true, slug: true } } } },
    },
  });

  res.json({ success: true, count: orders.length, orders });
});

// ─── SINGLE ORDER ───────────────────────────────
// GET /api/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, order });
});

// ─── UPDATE ORDER STATUS (Admin) ────────────────
// PATCH /api/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: { user: { select: { email: true, firstName: true } } },
  });

  res.json({ success: true, order });
});

// ─── ALL ORDERS (Admin) ─────────────────────────
// GET /api/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / Number(limit)),
    orders,
  });
});

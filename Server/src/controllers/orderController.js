// src/controllers/orderController.js
import prisma from '../config/db.js';
import transporter from '../config/mailer.js';
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

  // Send order confirmation email directly (non-blocking)
  transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: order.user.email,
    subject: `Commission Received — Ref: ${order.referenceCode} | Jangid`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:'Georgia',serif;background:#F5F0E8;margin:0;padding:0;">
        <div style="max-width:580px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:#2C1810;padding:32px 40px;text-align:center;">
            <h1 style="color:#F5F0E8;font-size:1.3rem;font-weight:300;letter-spacing:0.06em;margin:0;">JANGID</h1>
          </div>
          <div style="padding:40px;">
            <div style="background:#F5F0E8;border-radius:8px;padding:20px 24px;margin-bottom:28px;border-left:3px solid #7A8B6F;">
              <p style="margin:0;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:#7A4F36;">Commission Reference</p>
              <p style="margin:6px 0 0;font-size:1.4rem;color:#2C1810;font-weight:500;">${order.referenceCode}</p>
            </div>
            <h2 style="font-size:1.6rem;font-weight:400;color:#2C1810;margin:0 0 16px;">Commission received, ${order.user.firstName}.</h2>
            <p style="color:#4A2E1E;line-height:1.8;margin-bottom:24px;">Thank you for your order. Our team will review your specifications and reach out within <strong>48 hours</strong> with a full quote and production timeline.</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr style="border-bottom:1px solid #E8DFD0;">
                <td style="padding:10px 0;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A4F36;">Piece</td>
                <td style="padding:10px 0;text-align:right;color:#2C1810;">${order.items?.[0]?.product?.name || 'Custom Piece'}</td>
              </tr>
              <tr style="border-bottom:1px solid #E8DFD0;">
                <td style="padding:10px 0;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A4F36;">Material</td>
                <td style="padding:10px 0;text-align:right;color:#2C1810;text-transform:capitalize;">${order.material}</td>
              </tr>
              <tr style="border-bottom:1px solid #E8DFD0;">
                <td style="padding:10px 0;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A4F36;">Lead Time</td>
                <td style="padding:10px 0;text-align:right;color:#2C1810;text-transform:capitalize;">${order.timeline}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A4F36;">Estimated Total</td>
                <td style="padding:10px 0;text-align:right;font-size:1.2rem;color:#C4714A;">$${order.estimatedPrice?.toLocaleString()}</td>
              </tr>
            </table>
            <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:#2C1810;color:#F5F0E8;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:0.875rem;letter-spacing:0.08em;text-transform:uppercase;font-family:'Inter',sans-serif;">Visit Jangid</a>
          </div>
          <div style="padding:20px 40px;border-top:1px solid #E8DFD0;color:#7A4F36;font-size:0.75rem;">
            <p style="margin:0;">Questions? Reply to this email or call us.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }).catch(err => console.error('❌ Order confirmation email failed:', err));

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

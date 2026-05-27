import prisma from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// ─── DASHBOARD (existing) ────────────────────────
export const getDashboard = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalCollections,
    totalContactMessages,
    unreadMessages,
    revenueResult,
    ordersByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.collection.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.order.aggregate({ _sum: { finalPrice: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.groupBy({ by: ['status'], _count: true }),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalCollections,
      totalContactMessages,
      unreadMessages,
      totalRevenue: revenueResult._sum.finalPrice ?? 0,
    },
    ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count })),
  });
});

// ─── USERS (existing) ────────────────────────────
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        country: true,
        newsletter: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ success: true, count: users.length, total, pages: Math.ceil(total / Number(limit)), users });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, firstName: true, lastName: true, email: true, role: true,
      phone: true, country: true, address: true, newsletter: true, createdAt: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: { select: { name: true, slug: true } } } } },
      },
    },
  });

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
});

// ─── COLLECTIONS ──────────────────────────────
export const getCollections = asyncHandler(async (_req, res) => {
  const collections = await prisma.collection.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  res.json({ success: true, collections });
});

export const createCollection = asyncHandler(async (req, res) => {
  const { name, slug, description, imageUrl } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ success: false, message: 'Name and slug are required' });
  }
  const collection = await prisma.collection.create({
    data: { name, slug, description, imageUrl },
  });
  res.status(201).json({ success: true, collection });
});

export const updateCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, imageUrl } = req.body;
  const collection = await prisma.collection.update({
    where: { id },
    data: { name, slug, description, imageUrl },
  });
  res.json({ success: true, collection });
});

export const deleteCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Unlink products before deleting
  await prisma.product.updateMany({ where: { collectionId: id }, data: { collectionId: null } });
  await prisma.collection.delete({ where: { id } });
  res.json({ success: true, message: 'Collection deleted' });
});

// ─── PRODUCTS ─────────────────────────────────
export const getAdminProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, collection, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {};
  if (category) where.category = category;
  if (collection) where.collectionId = collection;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { collection: { select: { id: true, name: true } }, _count: { select: { orderItems: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ success: true, count: products.length, total, pages: Math.ceil(total / Number(limit)), products });
});

export const getAdminProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { collection: { select: { id: true, name: true } } },
  });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, slug, category, description, basePrice, imageUrl, badge, materials, inStock, collectionId } = req.body;
  if (!name || !slug || !category || !description || basePrice === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const product = await prisma.product.create({
    data: { name, slug, category, description, basePrice: Number(basePrice), imageUrl, badge, materials, inStock, collectionId },
  });
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, category, description, basePrice, imageUrl, badge, materials, inStock, collectionId } = req.body;
  const product = await prisma.product.update({
    where: { id },
    data: { name, slug, category, description, basePrice: basePrice !== undefined ? Number(basePrice) : undefined, imageUrl, badge, materials, inStock, collectionId },
  });
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id } });
  res.json({ success: true, message: 'Product deleted' });
});

// ─── ORDERS ────────────────────────────────────
export const getAdminOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, payment } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};
  if (status) where.status = status;
  if (payment) where.paymentStatus = payment;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, address: true } },
        items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ success: true, count: orders.length, total, pages: Math.ceil(total / Number(limit)), orders });
});

export const getAdminOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, address: true } },
      items: { include: { product: { select: { id: true, name: true, slug: true, imageUrl: true, basePrice: true } } } },
    },
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ['PENDING','CONFIRMED','IN_PRODUCTION','QUALITY_CHECK','SHIPPED','DELIVERED','CANCELLED'];
  if (!valid.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  const order = await prisma.order.update({ where: { id }, data: { status } });
  res.json({ success: true, order });
});

export const updateOrderItemQty = asyncHandler(async (req, res) => {
  const { id, itemId } = req.params;
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }
  const item = await prisma.orderItem.findUnique({ where: { id: itemId }, include: { order: true } });
  if (!item || item.orderId !== id) {
    return res.status(404).json({ success: false, message: 'Order item not found' });
  }
  const updated = await prisma.orderItem.update({
    where: { id: itemId },
    data: { quantity: Math.floor(quantity) },
  });
  const allItems = await prisma.orderItem.findMany({ where: { orderId: id } });
  const estimatedPrice = allItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  await prisma.order.update({ where: { id }, data: { estimatedPrice } });
  res.json({ success: true, item: updated, estimatedPrice });
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;
  const valid = ['UNPAID','PAID','REFUNDED','FAILED'];
  if (!valid.includes(paymentStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid payment status' });
  }
  const order = await prisma.order.update({ where: { id }, data: { paymentStatus } });
  res.json({ success: true, order });
});

// ─── RATES (Delivery & Pricing Settings) ──────
export const getRates = asyncHandler(async (_req, res) => {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ['delivery_rate', 'tax_rate', 'minimum_order'] } },
  });
  const rates = {};
  for (const s of settings) rates[s.key] = s.value;
  res.json({ success: true, rates });
});

export const updateRates = asyncHandler(async (req, res) => {
  const allowed = ['delivery_rate', 'tax_rate', 'minimum_order'];
  const upserts = [];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key },
          update: { value: String(req.body[key]) },
          create: { key, value: String(req.body[key]) },
        })
      );
    }
  }

  await Promise.all(upserts);
  const rates = {};
  for (const key of allowed) {
    const s = await prisma.setting.findUnique({ where: { key } });
    if (s) rates[key] = s.value;
  }

  res.json({ success: true, rates });
});

// ─── ADDRESS (Company Contact Info) ───────────
export const getAddress = asyncHandler(async (_req, res) => {
  const keys = ['company_name', 'company_address', 'company_phone', 'company_email'];
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const address = {};
  for (const s of settings) address[s.key.replace('company_', '')] = s.value;
  res.json({ success: true, address });
});

// ─── PUBLIC ADDRESS (No Auth — for homepage) ──
export const getPublicAddress = asyncHandler(async (_req, res) => {
  const keys = ['company_name', 'company_address', 'company_phone', 'company_email'];
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const address = {};
  for (const s of settings) address[s.key.replace('company_', '')] = s.value;
  res.json({ success: true, address });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const allowed = ['company_name', 'company_address', 'company_phone', 'company_email'];
  const upserts = [];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      upserts.push(
        prisma.setting.upsert({
          where: { key },
          update: { value: String(req.body[key]) },
          create: { key, value: String(req.body[key]) },
        })
      );
    }
  }

  await Promise.all(upserts);
  const address = {};
  for (const key of allowed) {
    const s = await prisma.setting.findUnique({ where: { key } });
    if (s) address[key.replace('company_', '')] = s.value;
  }

  res.json({ success: true, address });
});

// ─── ENQUIRIES (Contact Messages) ─────────────
export const getEnquiries = asyncHandler(async (req, res) => {
  const { unread, page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = unread === 'true' ? { read: false } : {};

  const [messages, total, unreadCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  res.json({ success: true, count: messages.length, total, unreadCount, messages });
});

export const markEnquiryRead = asyncHandler(async (req, res) => {
  const msg = await prisma.contactMessage.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  res.json({ success: true, message: msg });
});

// ─── PINCODE CRUD ──────────────────────────────────
export const getPincodes = asyncHandler(async (_req, res) => {
  const pincodes = await prisma.pincode.findMany({ orderBy: { pincode: 'asc' } });
  res.json({ success: true, pincodes });
});

export const createPincode = asyncHandler(async (req, res) => {
  const { pincode, deliveryCharge, areaName } = req.body;
  if (!pincode || deliveryCharge == null) {
    return res.status(400).json({ success: false, message: 'Pincode and delivery charge required' });
  }
  const existing = await prisma.pincode.findUnique({ where: { pincode } });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Pincode already exists' });
  }
  const p = await prisma.pincode.create({
    data: { pincode, deliveryCharge: parseFloat(deliveryCharge), areaName: areaName || '' },
  });
  res.status(201).json({ success: true, pincode: p });
});

export const updatePincode = asyncHandler(async (req, res) => {
  const { deliveryCharge, areaName } = req.body;
  const p = await prisma.pincode.update({
    where: { id: req.params.id },
    data: { deliveryCharge: parseFloat(deliveryCharge), areaName },
  });
  res.json({ success: true, pincode: p });
});

export const deletePincode = asyncHandler(async (req, res) => {
  await prisma.pincode.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

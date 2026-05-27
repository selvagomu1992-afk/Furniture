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

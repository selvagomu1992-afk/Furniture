import prisma from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getDashboard = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalContactMessages,
    unreadMessages,
    revenueResult,
    ordersByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.order.aggregate({ _sum: { finalPrice: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.groupBy({ by: ['status'], _count: true }),
  ]);

  const totalRevenue = revenueResult._sum.finalPrice ?? 0;

  const monthlyRevenue = await prisma.$queryRawUnsafe(`
    SELECT
      to_char("createdAt", 'YYYY-MM') AS month,
      SUM("finalPrice") AS revenue
    FROM orders
    WHERE "paymentStatus" = 'PAID'
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalContactMessages,
      unreadMessages,
      totalRevenue,
    },
    ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count })),
    monthlyRevenue,
  });
});

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

  res.json({
    success: true,
    count: users.length,
    total,
    pages: Math.ceil(total / Number(limit)),
    users,
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      phone: true,
      country: true,
      address: true,
      newsletter: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { select: { name: true, slug: true } } } },
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, user });
});

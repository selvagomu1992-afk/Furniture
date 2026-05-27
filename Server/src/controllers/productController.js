// src/controllers/productController.js
import prisma from '../config/db.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// ─── GET ALL PRODUCTS ───────────────────────────
// GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const { category, sort, search } = req.query;

  const where = {};
  if (category) where.category = category.toUpperCase();
  if (search)   where.name = { contains: search, mode: 'insensitive' };

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc')  orderBy = { basePrice: 'asc' };
  if (sort === 'price_desc') orderBy = { basePrice: 'desc' };
  if (sort === 'name_asc')   orderBy = { name: 'asc' };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    select: {
      id: true, name: true, slug: true, category: true,
      description: true, basePrice: true, imageUrl: true,
      badge: true, materials: true, inStock: true,
    },
  });

  res.json({ success: true, count: products.length, products });
});

// ─── GET SINGLE PRODUCT ─────────────────────────
// GET /api/products/:slug
export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
  });

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, product });
});

// ─── CREATE PRODUCT (Admin) ─────────────────────
// POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const { name, slug, category, description, basePrice, imageUrl, badge, materials } = req.body;

  if (!name || !slug || !category || !description || !basePrice) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const product = await prisma.product.create({
    data: { name, slug, category: category.toUpperCase(), description, basePrice: Number(basePrice), imageUrl, badge, materials: materials || [] },
  });

  res.status(201).json({ success: true, product });
});

// ─── UPDATE PRODUCT (Admin) ─────────────────────
// PATCH /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ success: true, product });
});

// ─── DELETE PRODUCT (Admin) ─────────────────────
// DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Product deleted' });
});

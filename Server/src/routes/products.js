// src/routes/products.js
import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get ('/',     getProducts);
router.get ('/:slug', getProduct);
router.post('/',     protect, adminOnly, createProduct);
router.patch('/:id', protect, adminOnly, updateProduct);
router.delete('/:id',protect, adminOnly, deleteProduct);

export default router;

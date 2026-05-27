import { Router } from 'express';
import {
  getDashboard, getUsers, getUser,
  getCollections, createCollection, updateCollection, deleteCollection,
  getAdminProducts, getAdminProduct, createProduct, updateProduct, deleteProduct,
  getRates, updateRates,
  getAddress, updateAddress,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// Dashboard & Users
router.get('/dashboard', protect, adminOnly, getDashboard);
router.get('/users',     protect, adminOnly, getUsers);
router.get('/users/:id', protect, adminOnly, getUser);

// Collections CRUD
router.get('/collections',         protect, adminOnly, getCollections);
router.post('/collections',        protect, adminOnly, createCollection);
router.put('/collections/:id',     protect, adminOnly, updateCollection);
router.delete('/collections/:id',  protect, adminOnly, deleteCollection);

// Products CRUD
router.get('/products',        protect, adminOnly, getAdminProducts);
router.get('/products/:id',    protect, adminOnly, getAdminProduct);
router.post('/products',       protect, adminOnly, createProduct);
router.put('/products/:id',    protect, adminOnly, updateProduct);
router.delete('/products/:id', protect, adminOnly, deleteProduct);

// Rates
router.get('/rates',  protect, adminOnly, getRates);
router.put('/rates',  protect, adminOnly, updateRates);

// Address / Company Info
router.get('/address',  protect, adminOnly, getAddress);
router.put('/address',  protect, adminOnly, updateAddress);

export default router;

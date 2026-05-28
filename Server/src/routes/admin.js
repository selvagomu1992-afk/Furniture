import { Router } from 'express';
import {
  getDashboard, getUsers, getUser,
  getCollections, createCollection, updateCollection, deleteCollection,
  getAdminProducts, getAdminProduct, createProduct, updateProduct, deleteProduct,
  getAdminOrders, getAdminOrder, updateOrderStatus, updatePaymentStatus, updateOrderItemQty,
  getRates, updateRates,
  getAddress, updateAddress,
  getEnquiries, markEnquiryRead,
  getPincodes, createPincode, updatePincode, deletePincode,
  getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide,
  getFeaturedTypes, createFeaturedType, updateFeaturedType, deleteFeaturedType,
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

// Orders
router.get('/orders',              protect, adminOnly, getAdminOrders);
router.get('/orders/:id',          protect, adminOnly, getAdminOrder);
router.patch('/orders/:id/status', protect, adminOnly, updateOrderStatus);
router.patch('/orders/:id/payment', protect, adminOnly, updatePaymentStatus);
router.patch('/orders/:id/items/:itemId', protect, adminOnly, updateOrderItemQty);

// Rates
router.get('/rates',  protect, adminOnly, getRates);
router.put('/rates',  protect, adminOnly, updateRates);

// Address / Company Info
router.get('/address',  protect, adminOnly, getAddress);
router.put('/address',  protect, adminOnly, updateAddress);

// Enquiries (Contact Messages)
router.get('/enquiries',          protect, adminOnly, getEnquiries);
router.patch('/enquiries/:id/read', protect, adminOnly, markEnquiryRead);

// Pincodes
router.get('/pincodes',   protect, adminOnly, getPincodes);
router.post('/pincodes',  protect, adminOnly, createPincode);
router.put('/pincodes/:id', protect, adminOnly, updatePincode);
router.delete('/pincodes/:id', protect, adminOnly, deletePincode);

// Hero Slides
router.get('/hero-slides',            protect, adminOnly, getHeroSlides);
router.post('/hero-slides',           protect, adminOnly, createHeroSlide);
router.put('/hero-slides/:id',        protect, adminOnly, updateHeroSlide);
router.delete('/hero-slides/:id',     protect, adminOnly, deleteHeroSlide);

// Featured Types
router.get('/featured-types',         protect, adminOnly, getFeaturedTypes);
router.post('/featured-types',        protect, adminOnly, createFeaturedType);
router.put('/featured-types/:id',     protect, adminOnly, updateFeaturedType);
router.delete('/featured-types/:id',  protect, adminOnly, deleteFeaturedType);

export default router;

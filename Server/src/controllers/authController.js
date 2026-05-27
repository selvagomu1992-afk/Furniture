// src/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { inngest } from '../inngest/client.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user.id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:        user.id,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role:      user.role,
    },
  });
};

// ─── REGISTER ───────────────────────────────────
// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, newsletter } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with that email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { firstName, lastName, email, passwordHash, newsletter: !!newsletter },
  });

  // Fire welcome email in background
  await inngest.send({
    name: 'user/registered',
    data: { firstName: user.firstName, email: user.email },
  });

  sendTokenResponse(user, 201, res);
});

// ─── LOGIN ──────────────────────────────────────
// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  sendTokenResponse(user, 200, res);
});

// ─── GET CURRENT USER ───────────────────────────
// GET /api/auth/me  (protected)
export const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      phone: true, country: true, address: true, role: true,
      newsletter: true, createdAt: true,
      orders: { select: { id: true, referenceCode: true, status: true, createdAt: true }, take: 5, orderBy: { createdAt: 'desc' } },
    },
  });
  res.json({ success: true, user });
});

// ─── UPDATE PROFILE ─────────────────────────────
// PATCH /api/auth/me  (protected)
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, country, address, newsletter } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { firstName, lastName, phone, country, address, newsletter },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, country: true, address: true, newsletter: true },
  });

  res.json({ success: true, user });
});

// ─── FORGOT PASSWORD ────────────────────────────
// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({ success: true, message: 'If that account exists, a reset link has been sent' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password.html?token=${resetToken}`;

  await inngest.send({
    name: 'user/password-reset-requested',
    data: { email: user.email, firstName: user.firstName, resetUrl },
  });

  res.json({ success: true, message: 'If that account exists, a reset link has been sent' });
});

// ─── RESET PASSWORD ─────────────────────────────
// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  res.json({ success: true, message: 'Password reset successfully — please sign in' });
});

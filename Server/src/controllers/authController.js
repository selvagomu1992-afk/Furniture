// src/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/db.js';
import transporter from '../config/mailer.js';
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
      phone:     user.phone,
      country:   user.country,
      address:   user.address,
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

  // Fire welcome email directly (non-blocking)
  transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Welcome to Jangid 🌿',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:'Georgia',serif;background:#F5F0E8;margin:0;padding:0;">
        <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;margin-top:40px;">
          <div style="background:#2C1810;padding:40px 40px 32px;text-align:center;">
            <div style="width:52px;height:52px;background:#F5F0E8;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:600;color:#2C1810;margin-bottom:16px;">J</div>
            <h1 style="color:#F5F0E8;font-size:1.6rem;font-weight:300;margin:0;letter-spacing:0.04em;">JANGID</h1>
            <p style="color:rgba(245,240,232,0.6);font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;margin:8px 0 0;">Handcrafted for lifetimes</p>
          </div>
          <div style="padding:40px;">
            <h2 style="font-size:1.8rem;font-weight:400;color:#2C1810;margin:0 0 16px;">Welcome, ${user.firstName}.</h2>
            <p style="color:#4A2E1E;line-height:1.8;margin-bottom:20px;">Your Jangid account is ready. You can now track commissions, manage your wishlist, and get early access to new collections.</p>
            <p style="color:#4A2E1E;line-height:1.8;margin-bottom:32px;">Every piece we create starts with a conversation. When you're ready to begin yours, we're here.</p>
            <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:#2C1810;color:#F5F0E8;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:0.875rem;letter-spacing:0.08em;text-transform:uppercase;font-family:'Inter',sans-serif;">Explore Collections</a>
          </div>
          <div style="padding:24px 40px;border-top:1px solid #E8DFD0;color:#7A4F36;font-size:0.78rem;line-height:1.6;">
            <p style="margin:0;">&copy; 2025 Jangid &middot; <a href="${process.env.CLIENT_URL}" style="color:#C4714A;">jangid.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }).catch(err => console.error('❌ Welcome email failed:', err));

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

  // Send login notification email directly (non-blocking)
  const loginTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const ipAddress = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip || 'Unknown';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'New Sign-In to Your Jangid Account',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:'Georgia',serif;background:#F5F0E8;margin:0;padding:0;">
        <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:#2C1810;padding:28px 36px;text-align:center;">
            <h1 style="color:#F5F0E8;font-size:1.2rem;font-weight:300;letter-spacing:0.06em;margin:0;">JANGID</h1>
          </div>
          <div style="padding:40px;">
            <h2 style="font-size:1.5rem;font-weight:400;color:#2C1810;margin:0 0 16px;">New Sign-In Detected</h2>
            <p style="color:#4A2E1E;line-height:1.8;margin-bottom:24px;">Hi ${user.firstName}, we noticed a new sign-in to your Jangid account.</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
              <tr style="border-bottom:1px solid #E8DFD0;">
                <td style="padding:10px 0;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A4F36;">Time</td>
                <td style="padding:10px 0;text-align:right;color:#2C1810;">${loginTime}</td>
              </tr>
              <tr style="border-bottom:1px solid #E8DFD0;">
                <td style="padding:10px 0;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A4F36;">IP Address</td>
                <td style="padding:10px 0;text-align:right;color:#2C1810;">${ipAddress}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A4F36;">Device</td>
                <td style="padding:10px 0;text-align:right;color:#2C1810;font-size:0.82rem;">${userAgent}</td>
              </tr>
            </table>
            <p style="color:#4A2E1E;line-height:1.8;margin-bottom:28px;">If this was you, no action is needed. If you didn't sign in, please reset your password immediately.</p>
            <a href="${process.env.CLIENT_URL}/login.html" style="display:inline-block;background:#C4714A;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:0.875rem;letter-spacing:0.08em;text-transform:uppercase;font-family:'Inter',sans-serif;">Secure My Account</a>
          </div>
          <div style="padding:20px 40px;border-top:1px solid #E8DFD0;color:#7A4F36;font-size:0.72rem;line-height:1.6;">
            <p style="margin:0;">If you didn't attempt to sign in, please contact us immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }).catch(err => console.error('❌ Login notification email failed:', err));

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
      orders: { select: { id: true, referenceCode: true, status: true, paymentStatus: true, estimatedPrice: true, finalPrice: true, createdAt: true }, take: 50, orderBy: { createdAt: 'desc' } },
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

  transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Reset your Jangid password',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:'Georgia',serif;background:#F5F0E8;margin:0;padding:0;">
        <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:#2C1810;padding:28px 36px;text-align:center;">
            <h1 style="color:#F5F0E8;font-size:1.2rem;font-weight:300;letter-spacing:0.06em;margin:0;">JANGID</h1>
          </div>
          <div style="padding:40px;">
            <h2 style="font-size:1.5rem;font-weight:400;color:#2C1810;margin:0 0 16px;">Password Reset</h2>
            <p style="color:#4A2E1E;line-height:1.8;margin-bottom:28px;">Hi ${user.firstName}, click the button below to reset your password. This link expires in <strong>30 minutes</strong>.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#C4714A;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:0.875rem;letter-spacing:0.08em;text-transform:uppercase;font-family:'Inter',sans-serif;">Reset Password</a>
            <p style="color:#7A4F36;font-size:0.78rem;margin-top:24px;line-height:1.6;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }).catch(err => console.error('❌ Password reset email failed:', err));

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

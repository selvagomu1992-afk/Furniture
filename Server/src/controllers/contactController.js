// src/controllers/contactController.js
import prisma from '../config/db.js';
import transporter from '../config/mailer.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// ─── SUBMIT CONTACT FORM ────────────────────────
// POST /api/contact
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required' });
  }

  // Save to DB
  const record = await prisma.contactMessage.create({
    data: { name, email, subject: subject || 'General', message },
  });

  // Notify studio team
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      process.env.SMTP_USER,
    subject: `📬 New Contact: ${subject || 'General'} from ${name}`,
    html: `
      <div style="font-family:sans-serif;padding:24px;max-width:520px;">
        <h2 style="color:#2C1810;">New contact message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border-color:#E8DFD0;" />
        <p style="white-space:pre-wrap;color:#4A2E1E;">${message}</p>
      </div>
    `,
  }).catch(err => console.warn('Studio notify failed:', err.message));

  // Auto-reply to sender
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: "We've received your message — Jangid",
    html: `
      <div style="font-family:'Georgia',serif;background:#F5F0E8;padding:40px;max-width:520px;margin:0 auto;border-radius:12px;">
        <h2 style="color:#2C1810;font-weight:400;">Thank you, ${name}.</h2>
        <p style="color:#4A2E1E;line-height:1.8;">We've received your message and will be in touch within <strong>24–48 hours</strong>.</p>
        <p style="color:#7A4F36;font-size:0.85rem;">— The Jangid Team</p>
      </div>
    `,
  }).catch(err => console.warn('Auto-reply failed:', err.message));

  res.status(201).json({ success: true, message: "Message received — we'll be in touch soon!", id: record.id });
});

// ─── GET ALL MESSAGES (Admin) ───────────────────
// GET /api/contact
export const getContactMessages = asyncHandler(async (req, res) => {
  const { unread } = req.query;
  const where = unread === 'true' ? { read: false } : {};

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, count: messages.length, messages });
});

// ─── MARK AS READ (Admin) ────────────────────────
// PATCH /api/contact/:id/read
export const markRead = asyncHandler(async (req, res) => {
  const msg = await prisma.contactMessage.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  res.json({ success: true, message: msg });
});

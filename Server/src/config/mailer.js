// src/config/mailer.js — Nodemailer transporter
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup (non-fatal)
transporter.verify((err) => {
  if (err) {
    console.warn('⚠️  Mailer not connected:', err.message);
  } else {
    console.log('✉️  Mailer ready');
  }
});

export default transporter;

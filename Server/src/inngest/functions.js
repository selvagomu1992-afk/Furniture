// src/inngest/functions.js — Background job functions
import { inngest } from './client.js';
import transporter from '../config/mailer.js';

// ─── WELCOME EMAIL ──────────────────────────────
export const sendWelcomeEmail = inngest.createFunction(
  { id: 'send-welcome-email', name: 'Send Welcome Email', triggers: { event: 'user/registered' } },
  async ({ event, step }) => {
    const { firstName, email } = event.data;

    await step.run('send-email', async () => {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to Furnicher Studio 🌿',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family:'Georgia',serif;background:#F5F0E8;margin:0;padding:0;">
            <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;margin-top:40px;">
              <div style="background:#2C1810;padding:40px 40px 32px;text-align:center;">
                <div style="width:52px;height:52px;background:#F5F0E8;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:600;color:#2C1810;margin-bottom:16px;">F</div>
                <h1 style="color:#F5F0E8;font-size:1.6rem;font-weight:300;margin:0;letter-spacing:0.04em;">FURNICHER</h1>
                <p style="color:rgba(245,240,232,0.6);font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;margin:8px 0 0;">Handcrafted for lifetimes</p>
              </div>
              <div style="padding:40px;">
                <h2 style="font-size:1.8rem;font-weight:400;color:#2C1810;margin:0 0 16px;">Welcome, ${firstName}.</h2>
                <p style="color:#4A2E1E;line-height:1.8;margin-bottom:20px;">Your Furnicher account is ready. You can now track commissions, manage your wishlist, and get early access to new collections.</p>
                <p style="color:#4A2E1E;line-height:1.8;margin-bottom:32px;">Every piece we create starts with a conversation. When you're ready to begin yours, we're here.</p>
                <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:#2C1810;color:#F5F0E8;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:0.875rem;letter-spacing:0.08em;text-transform:uppercase;font-family:'Inter',sans-serif;">Explore Collections</a>
              </div>
              <div style="padding:24px 40px;border-top:1px solid #E8DFD0;color:#7A4F36;font-size:0.78rem;line-height:1.6;">
                <p style="margin:0;">© 2025 Furnicher Studio · 12 Artisan Lane, Burlington, VT · <a href="${process.env.CLIENT_URL}" style="color:#C4714A;">furnicher.com</a></p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    });

    return { sent: true, email };
  }
);

// ─── ORDER CONFIRMATION EMAIL ───────────────────
export const sendOrderConfirmation = inngest.createFunction(
  { id: 'send-order-confirmation', name: 'Send Order Confirmation', triggers: { event: 'order/placed' } },
  async ({ event, step }) => {
    const { order, user } = event.data;

    await step.run('send-confirmation-email', async () => {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `Commission Received — Ref: ${order.referenceCode} | Furnicher`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family:'Georgia',serif;background:#F5F0E8;margin:0;padding:0;">
            <div style="max-width:580px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;">
              <div style="background:#2C1810;padding:32px 40px;text-align:center;">
                <h1 style="color:#F5F0E8;font-size:1.3rem;font-weight:300;letter-spacing:0.06em;margin:0;">FURNICHER</h1>
              </div>
              <div style="padding:40px;">
                <div style="background:#F5F0E8;border-radius:8px;padding:20px 24px;margin-bottom:28px;border-left:3px solid #7A8B6F;">
                  <p style="margin:0;font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:#7A4F36;">Commission Reference</p>
                  <p style="margin:6px 0 0;font-size:1.4rem;color:#2C1810;font-weight:500;">${order.referenceCode}</p>
                </div>
                <h2 style="font-size:1.6rem;font-weight:400;color:#2C1810;margin:0 0 16px;">Commission received, ${user.firstName}.</h2>
                <p style="color:#4A2E1E;line-height:1.8;margin-bottom:24px;">Thank you for your order. Our team will review your specifications and reach out within <strong>48 hours</strong> with a full quote and production timeline.</p>
                
                <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                  <tr style="border-bottom:1px solid #E8DFD0;">
                    <td style="padding:10px 0;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A4F36;">Piece</td>
                    <td style="padding:10px 0;text-align:right;color:#2C1810;">${order.items?.[0]?.product?.name || 'Custom Piece'}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #E8DFD0;">
                    <td style="padding:10px 0;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A4F36;">Material</td>
                    <td style="padding:10px 0;text-align:right;color:#2C1810;text-transform:capitalize;">${order.material}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #E8DFD0;">
                    <td style="padding:10px 0;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A4F36;">Lead Time</td>
                    <td style="padding:10px 0;text-align:right;color:#2C1810;text-transform:capitalize;">${order.timeline}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A4F36;">Estimated Total</td>
                    <td style="padding:10px 0;text-align:right;font-size:1.2rem;color:#C4714A;">$${order.estimatedPrice?.toLocaleString()}</td>
                  </tr>
                </table>

                <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:#2C1810;color:#F5F0E8;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:0.875rem;letter-spacing:0.08em;text-transform:uppercase;font-family:'Inter',sans-serif;">Visit Furnicher</a>
              </div>
              <div style="padding:20px 40px;border-top:1px solid #E8DFD0;color:#7A4F36;font-size:0.75rem;">
                <p style="margin:0;">Questions? Reply to this email or call +1 (802) 555-0147</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    });

    return { sent: true, orderId: order.id };
  }
);

// ─── PASSWORD RESET EMAIL ───────────────────────
export const sendPasswordResetEmail = inngest.createFunction(
  { id: 'send-password-reset', name: 'Send Password Reset Email', triggers: { event: 'user/password-reset-requested' } },
  async ({ event, step }) => {
    const { email, firstName, resetUrl } = event.data;

    await step.run('send-reset-email', async () => {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Reset your Furnicher password',
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family:'Georgia',serif;background:#F5F0E8;margin:0;padding:0;">
            <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;">
              <div style="background:#2C1810;padding:28px 36px;text-align:center;">
                <h1 style="color:#F5F0E8;font-size:1.2rem;font-weight:300;letter-spacing:0.06em;margin:0;">FURNICHER</h1>
              </div>
              <div style="padding:40px;">
                <h2 style="font-size:1.5rem;font-weight:400;color:#2C1810;margin:0 0 16px;">Password Reset</h2>
                <p style="color:#4A2E1E;line-height:1.8;margin-bottom:28px;">Hi ${firstName}, click the button below to reset your password. This link expires in <strong>30 minutes</strong>.</p>
                <a href="${resetUrl}" style="display:inline-block;background:#C4714A;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:0.875rem;letter-spacing:0.08em;text-transform:uppercase;font-family:'Inter',sans-serif;">Reset Password</a>
                <p style="color:#7A4F36;font-size:0.78rem;margin-top:24px;line-height:1.6;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    });

    return { sent: true };
  }
);

export const inngestFunctions = [
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendPasswordResetEmail,
];

const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text]
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'BookHub'}" <${process.env.FROM_EMAIL || 'noreply@bookhub.rw'}>`,
    to,
    subject,
    html,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetUrl - Password reset URL
 */
const sendPasswordResetEmail = async (email, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; font-size: 28px;">📚 BookHub</h1>
      </div>
      <h2 style="color: #f1f5f9;">Reset Your Password</h2>
      <p style="color: #94a3b8;">You requested a password reset. Click the button below to set a new password. This link expires in 15 minutes.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="color: #64748b; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'BookHub — Password Reset Request',
    html,
  });
};

/**
 * Send order confirmation email
 * @param {string} email
 * @param {Object} order
 */
const sendOrderConfirmationEmail = async (email, order) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1;">📚 BookHub</h1>
      </div>
      <h2 style="color: #22c55e;">✅ Order Confirmed!</h2>
      <p>Thank you for your purchase. Your order number is <strong style="color: #6366f1;">${order.orderNumber}</strong>.</p>
      <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Total:</strong> RWF ${order.total.toLocaleString()}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Status:</strong> ${order.orderStatus}</p>
      </div>
      <p style="color: #64748b;">You'll receive another email when your order ships.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `BookHub — Order Confirmed #${order.orderNumber}`,
    html,
  });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendOrderConfirmationEmail };

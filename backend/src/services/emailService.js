import { config } from '../config/env.js';

class EmailService {
  constructor() {
    this.apiKey = config.brevo.apiKey;
    this.sender = {
      name: config.brevo.senderName,
      email: config.brevo.senderEmail,
    };
    if (!this.apiKey) console.error('[EmailService] BREVO_API_KEY is missing; transactional email is disabled.');
    if (!this.sender.email || !this.sender.name) console.warn('[EmailService] BREVO_SENDER_EMAIL and BREVO_SENDER_NAME must be set to a verified Brevo sender.');
  }

  async sendEmail({ to, subject, htmlContent, textContent }) {
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(to).trim())) {
      console.error('[EmailService] Invalid or missing recipient email:', to);
      return { success: false, error: 'A valid recipient email is required' };
    }
    if (!this.apiKey) {
      console.error('[EmailService] Brevo API key is not configured.');
      return { success: false, error: 'Brevo API key is not configured' };
    }
    if (!this.sender.email || !this.sender.name) {
      console.error('[EmailService] Brevo sender is not configured; set BREVO_SENDER_EMAIL and BREVO_SENDER_NAME.');
      return { success: false, error: 'Brevo sender is not configured' };
    }

    try {
      const payload = {
        sender: this.sender,
        to: [{ email: String(to).trim() }],
        subject,
        htmlContent,
      };

      if (textContent) {
        payload.textContent = textContent;
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error(`[EmailService] Brevo API error (${response.status}):`, responseBody);
        return { success: false, statusCode: response.status, error: responseBody };
      }

      const data = responseBody;
      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error('[EmailService] Brevo request failed:', { message: error.message, cause: error.cause?.message });
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(email, resetUrl) {
    const subject = 'Reset Your Ergocraft Password';
    const textContent = `Reset your Ergocraft password by visiting: ${resetUrl}. This link will expire in 15 minutes. If you did not request this, please ignore this email.`;
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #171717; background-color: #FAF8F5;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #9A6B3A; margin: 0; font-family: Georgia, serif; letter-spacing: 1px;">ERGOCRAFT</h1>
          <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 2px; color: #5C3D1E; text-transform: uppercase;">SEATING PVT. LTD.</p>
        </div>
        <div style="background-color: #FFFFFF; padding: 32px; border: 1px solid #E8E3DA; border-radius: 4px;">
          <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; color: #1E1B18;">Password Reset Request</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #4B463E;">We received a request to reset your Ergocraft account password. Click the link below to choose a new password:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background-color: #9A6B3A; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 2px; font-weight: 500; font-size: 14px; letter-spacing: 0.5px; display: inline-block;">RESET PASSWORD</a>
          </div>
          <p style="font-size: 13px; color: #78716C; line-height: 1.5;">This link will expire in <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email or contact support.</p>
        </div>
        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #A8A29E;">
          &copy; ${new Date().getFullYear()} Ergocraft Seating Pvt. Ltd. All rights reserved.
        </div>
      </div>
    `;

    return this.sendEmail({ to: email, subject, htmlContent, textContent });
  }

  async sendOwnerOrderNotificationEmail(order, recipient) {
    const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
    const items = (order.items || []).map((item) =>
      `<tr><td>${escapeHtml(item.name)}</td><td>${Number(item.quantity)}</td><td>${money(item.unitPrice)}</td><td>${money(item.subtotal)}</td></tr>`
    ).join('');
    const address = order.shippingAddress || {};
    const shipping = [address.street, address.landmark, address.city, address.state, address.postalCode, address.country].filter(Boolean).map(escapeHtml).join(', ');
    const date = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    let adminBase = (process.env.ADMIN_URL || config.adminUrl || '').split(',')[0].trim().replace(/\/+$/, '');
    if (!adminBase || ((config.env === 'production' || process.env.NODE_ENV === 'production') && (adminBase.includes('localhost') || adminBase.includes('127.0.0.1')))) {
      adminBase = 'https://ergo-craft-qedw.vercel.app';
    }
    const adminUrl = adminBase ? `${adminBase}/orders?id=${encodeURIComponent(order._id)}` : '';
    const subject = `New confirmed order ${order.orderNumber} — Ergocraft`;
    const textContent = [
      `Order ${order.orderNumber} (${date})`, `Customer: ${order.customerDetails?.name || ''}`,
      `Email: ${order.customerDetails?.email || ''}`, `Phone: ${order.customerDetails?.phone || ''}`,
      `Shipping: ${shipping}`, ...(order.items || []).map((item) => `${item.name} × ${item.quantity}: ${money(item.subtotal)}`),
      `Subtotal: ${money(order.pricing?.subtotal)}`, `Discount: ${money(order.pricing?.discount)}`,
      `Total: ${money(order.pricing?.total)}`, `Payment: ${order.paymentStatus}`,
      `Razorpay reference: ${order.paymentDetails?.paymentId || 'Not applicable'}`,
      ...(adminUrl ? [`Admin: ${adminUrl}`] : []),
    ].join('\n');
    const htmlContent = `<div style="font-family:Arial,sans-serif;color:#292a25;max-width:680px;margin:auto"><h1 style="color:#35443a">New confirmed order</h1><p><strong>${escapeHtml(order.orderNumber)}</strong> · ${escapeHtml(date)}</p><h2>Customer</h2><p>${escapeHtml(order.customerDetails?.name)}<br>${escapeHtml(order.customerDetails?.email)}<br>${escapeHtml(order.customerDetails?.phone)}</p><h2>Ship to</h2><p>${shipping}</p><table style="width:100%;border-collapse:collapse"><thead><tr><th align="left">Product</th><th>Qty</th><th align="right">Unit</th><th align="right">Subtotal</th></tr></thead><tbody>${items}</tbody></table><p>Subtotal: ${money(order.pricing?.subtotal)}<br>Discount: ${money(order.pricing?.discount)}<br><strong>Total: ${money(order.pricing?.total)}</strong></p><p>Payment status: ${escapeHtml(order.paymentStatus)}<br>Razorpay reference: ${escapeHtml(order.paymentDetails?.paymentId || 'Not applicable')}</p>${adminUrl ? `<p><a href="${escapeHtml(adminUrl)}">View order in admin</a></p>` : ''}</div>`;
    return this.sendEmail({ to: recipient, subject, htmlContent, textContent });
  }

  async sendPasswordResetConfirmationEmail(email) {
    const subject = 'Your Ergocraft Password Has Been Reset';
    const textContent = `Your Ergocraft password was successfully changed. If you did not perform this change, please contact support@ergocraft.in immediately.`;
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #171717; background-color: #FAF8F5;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #9A6B3A; margin: 0; font-family: Georgia, serif; letter-spacing: 1px;">ERGOCRAFT</h1>
          <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 2px; color: #5C3D1E; text-transform: uppercase;">SEATING PVT. LTD.</p>
        </div>
        <div style="background-color: #FFFFFF; padding: 32px; border: 1px solid #E8E3DA; border-radius: 4px;">
          <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; color: #1E1B18;">Password Reset Confirmed</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #4B463E;">The password for your Ergocraft account (${email}) has been successfully updated.</p>
          <p style="font-size: 13px; color: #78716C; line-height: 1.5; margin-top: 20px;">If you made this change, no further action is required. If you did NOT change your password, please contact our support team immediately.</p>
        </div>
        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #A8A29E;">
          &copy; ${new Date().getFullYear()} Ergocraft Seating Pvt. Ltd. All rights reserved.
        </div>
      </div>
    `;

    return this.sendEmail({ to: email, subject, htmlContent, textContent });
  }

  async sendOrderConfirmationEmail(order) {
    const isCod = order.paymentDetails?.provider === 'cod';
    const subject = isCod
      ? `Order Confirmed (Cash on Delivery) #${order.orderNumber} — Ergocraft Seating`
      : `Order Confirmation #${order.orderNumber} — Ergocraft Seating`;
    const itemsHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #E8E3DA;">
            <strong>${item.name}</strong><br>
            <span style="font-size: 12px; color: #78716C;">SKU: ${item.sku}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #E8E3DA; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #E8E3DA; text-align: right;">₹${item.subtotal.toLocaleString('en-IN')}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #171717; background-color: #FAF8F5;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #9A6B3A; margin: 0; font-family: Georgia, serif; letter-spacing: 1px;">ERGOCRAFT</h1>
          <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 2px; color: #5C3D1E; text-transform: uppercase;">SEATING PVT. LTD.</p>
        </div>
        <div style="background-color: #FFFFFF; padding: 32px; border: 1px solid #E8E3DA; border-radius: 4px;">
          <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; color: #1E1B18;">Thank you for your order!</h2>
          <p style="font-size: 14px; color: #4B463E;">Order Number: <strong>${order.orderNumber}</strong></p>
          <p style="font-size: 14px; color: #4B463E;">We are preparing your artisanal seating for shipment.</p>
          ${
            isCod
              ? `<div style="background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-size: 13px; color: #92400E;">
                  <strong>Payment Method: Cash on Delivery (COD)</strong><br>
                  Please keep ₹${order.pricing.total.toLocaleString('en-IN')} ready in cash or UPI QR scan upon courier arrival.
                </div>`
              : ''
          }
          
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
            <thead>
              <tr style="background-color: #F5F2EB; color: #1E1B18;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">Subtotal:</td>
                <td style="padding: 12px; text-align: right;">₹${order.pricing.subtotal.toLocaleString('en-IN')}</td>
              </tr>
              ${order.pricing.discount > 0 ? `
              <tr>
                <td colspan="2" style="padding: 8px 12px; text-align: right; font-weight: 600; color: #047857;">Additional Chair Discount${order.pricing.chairDiscountPercentage ? ` (${order.pricing.chairDiscountPercentage}%)` : ''}:</td>
                <td style="padding: 8px 12px; text-align: right; color: #047857; font-weight: 600;">-₹${order.pricing.discount.toLocaleString('en-IN')}</td>
              </tr>` : ''}
              <tr>
                <td colspan="2" style="padding: 8px 12px; text-align: right; font-weight: 600;">Shipping:</td>
                <td style="padding: 8px 12px; text-align: right;">${order.pricing.shippingCharges === 0 ? 'FREE' : `₹${order.pricing.shippingCharges}`}</td>
              </tr>
              <tr style="font-size: 16px; background-color: #FAF8F5;">
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: 700; color: #1E1B18;">${isCod ? 'Payable upon Delivery (COD):' : 'Total Paid:'}</td>
                <td style="padding: 12px; text-align: right; font-weight: 700; color: #9A6B3A;">₹${order.pricing.total.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: #F9F8F6; padding: 16px; border-radius: 4px; font-size: 13px; color: #4B463E;">
            <strong>Shipping Address:</strong><br>
            ${order.customerDetails.name}<br>
            ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br>
            Phone: ${order.customerDetails.phone}
          </div>
        </div>
        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #A8A29E;">
          &copy; ${new Date().getFullYear()} Ergocraft Seating Pvt. Ltd. | Crafting comfort for elevated living.
        </div>
      </div>
    `;

    const textContent = isCod
      ? `Order Confirmation #${order.orderNumber}\nPayment Method: Cash on Delivery (Pay ₹${order.pricing.total.toLocaleString('en-IN')} upon delivery).\nShipping to: ${order.customerDetails.name}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}.`
      : `Order Confirmation #${order.orderNumber}\nThank you for your order! Total amount paid: ₹${order.pricing.total.toLocaleString('en-IN')}.\nShipping to: ${order.customerDetails.name}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}.`;

    return this.sendEmail({ to: order.customerDetails.email, subject, htmlContent, textContent });
  }

  async sendPaymentConfirmationEmail(order, paymentId) {
    const subject = `Payment Received for Order #${order.orderNumber} — Ergocraft Seating`;
    const textContent = `Payment Confirmed!\nWe have verified payment of ₹${order.pricing.total.toLocaleString('en-IN')} for order #${order.orderNumber}.\nTransaction Reference: ${paymentId}.`;
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #171717; background-color: #FAF8F5;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #9A6B3A; margin: 0; font-family: Georgia, serif; letter-spacing: 1px;">ERGOCRAFT</h1>
          <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 2px; color: #5C3D1E; text-transform: uppercase;">SEATING PVT. LTD.</p>
        </div>
        <div style="background-color: #FFFFFF; padding: 32px; border: 1px solid #E8E3DA; border-radius: 4px;">
          <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; color: #1E1B18;">Payment Successfully Processed</h2>
          <p style="font-size: 14px; color: #4B463E;">We have received your payment for order <strong>#${order.orderNumber}</strong>.</p>
          <div style="background-color: #FAF8F5; padding: 16px; border: 1px solid #E8E3DA; margin: 20px 0; border-radius: 4px; font-size: 14px;">
            <p style="margin: 0 0 6px 0;">Amount Paid: <strong style="color: #9A6B3A;">₹${order.pricing.total.toLocaleString('en-IN')}</strong></p>
            <p style="margin: 0 0 6px 0;">Payment Provider: <strong>Razorpay Test Mode</strong></p>
            <p style="margin: 0;">Transaction ID: <span style="font-family: monospace;">${paymentId}</span></p>
          </div>
          <p style="font-size: 13px; color: #78716C;">Your order is now being processed for dispatch.</p>
        </div>
        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #A8A29E;">
          &copy; ${new Date().getFullYear()} Ergocraft Seating Pvt. Ltd. All rights reserved.
        </div>
      </div>
    `;

    return this.sendEmail({ to: order.customerDetails.email, subject, htmlContent, textContent });
  }

  async sendShippingConfirmationEmail(order) {
    const subject = `Your Order #${order.orderNumber} Has Shipped! — Ergocraft Seating`;
    const textContent = `Your Ergocraft Order #${order.orderNumber} has shipped! ${order.tracking?.trackingNumber ? `Tracking #${order.tracking.trackingNumber} via ${order.tracking.courier}` : ''}`;
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #171717; background-color: #FAF8F5;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #9A6B3A; margin: 0; font-family: Georgia, serif; letter-spacing: 1px;">ERGOCRAFT</h1>
          <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 2px; color: #5C3D1E; text-transform: uppercase;">SEATING PVT. LTD.</p>
        </div>
        <div style="background-color: #FFFFFF; padding: 32px; border: 1px solid #E8E3DA; border-radius: 4px;">
          <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; color: #1E1B18;">Your Seating is on Its Way</h2>
          <p style="font-size: 14px; color: #4B463E;">Great news! Order <strong>#${order.orderNumber}</strong> has been handed over to our logistics partner.</p>
          ${
            order.tracking?.trackingNumber
              ? `
            <div style="background-color: #FAF8F5; padding: 16px; border: 1px solid #E8E3DA; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #78716C;">Courier: <strong>${order.tracking.courier || 'Express Delivery'}</strong></p>
              <p style="margin: 0; font-size: 14px; color: #1E1B18;">Tracking Number: <strong>${order.tracking.trackingNumber}</strong></p>
              ${order.tracking.trackingUrl ? `<a href="${order.tracking.trackingUrl}" style="display: inline-block; margin-top: 10px; color: #9A6B3A; font-weight: 500;">Track Shipment &rarr;</a>` : ''}
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;

    return this.sendEmail({ to: order.customerDetails.email, subject, htmlContent, textContent });
  }
}

export const emailService = new EmailService();

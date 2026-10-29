import { Order, EmailLog, BirthdayEntry } from '../src/types.ts';
import { loadDb, saveDb } from './db.ts';

export async function sendOrderPlacedEmail(order: Order): Promise<EmailLog> {
  const db = loadDb();
  const emailId = `eml-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const subject = 'Your PookieBox order is waiting! 🎀';

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #FCE4EC;">
      <td style="padding: 12px 8px; color: #59434D; font-weight: 600;">
        ${item.name} x ${item.quantity}
        ${
          item.customBoxSnapshot
            ? `<div style="font-size: 12px; color: #880e4f; margin-top: 4px;">
                Box: ${item.customBoxSnapshot.boxName} | Ribbon: ${item.customBoxSnapshot.ribbonStyle}<br/>
                For: ${item.customBoxSnapshot.recipientName}<br/>
                Note: "${item.customBoxSnapshot.personalizedMessage}"
               </div>`
            : ''
        }
      </td>
      <td style="padding: 12px 8px; text-align: right; color: #59434D; font-weight: bold;">
        ₹${item.total.toLocaleString('en-IN')}
      </td>
    </tr>
  `
    )
    .join('');

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF9F5; border: 1px solid #F8BBD0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #FFC0CB, #F8BBD0); padding: 32px 24px; text-align: center;">
        <h1 style="color: #C45A7A; margin: 0; font-size: 26px; font-family: Georgia, serif;">PookieBox 🎀</h1>
        <p style="color: #59434D; margin: 8px 0 0; font-size: 14px;">A Little Box, A Lot of Love</p>
      </div>
      <div style="padding: 32px 24px; color: #59434D;">
        <h2 style="color: #C45A7A; font-size: 20px; margin-top: 0;">Order #${order.orderNumber} Awaiting Payment</h2>
        <p>Hi ${order.customer.fullName || 'Sweetheart'},</p>
        <p>Thank you for creating something beautiful with PookieBox! Your custom surprise order has been created and is currently awaiting payment confirmation before our fairy packaging team begins wrapping.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background: #FFFFFF; border-radius: 12px; padding: 12px; border: 1px solid #F8BBD0;">
          <thead>
            <tr style="border-bottom: 2px solid #F8BBD0; color: #C45A7A; text-align: left;">
              <th style="padding: 10px 8px;">Gift Item</th>
              <th style="padding: 10px 8px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 8px; color: #888;">Subtotal</td>
              <td style="padding: 8px; text-align: right; font-weight: 600;">₹${order.subtotal.toLocaleString('en-IN')}</td>
            </tr>
            ${
              order.discount > 0
                ? `<tr>
              <td style="padding: 8px; color: #C45A7A;">Discount (${order.couponCode || 'Promo'})</td>
              <td style="padding: 8px; text-align: right; color: #C45A7A;">-₹${order.discount.toLocaleString('en-IN')}</td>
            </tr>`
                : ''
            }
            <tr>
              <td style="padding: 8px; color: #888;">Shipping</td>
              <td style="padding: 8px; text-align: right; font-weight: 600;">${order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</td>
            </tr>
            <tr style="border-top: 2px solid #F8BBD0;">
              <td style="padding: 12px 8px; font-size: 16px; font-weight: bold; color: #C45A7A;">Total Amount</td>
              <td style="padding: 12px 8px; text-align: right; font-size: 18px; font-weight: bold; color: #C45A7A;">₹${order.total.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background: #FFFFFF; border: 1px dashed #F8BBD0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px; color: #C45A7A;">Delivery Destination</h4>
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">
            ${order.customer.fullName}<br/>
            ${order.delivery.address}, ${order.delivery.city}, ${order.delivery.state} - ${order.delivery.pinCode}<br/>
            Phone: ${order.customer.phone}
          </p>
        </div>

        <p style="font-size: 13px; color: #888;">Note: This order is awaiting payment. Complete your payment securely to confirm your gift box slot.</p>
      </div>
      <div style="background: #FFF0F5; padding: 16px; text-align: center; font-size: 12px; color: #888;">
        Sent with love by PookieBox • Mumbai, India
      </div>
    </div>
  `;

  const log: EmailLog = {
    id: emailId,
    orderId: order.id,
    recipient: order.customer.email,
    subject,
    type: 'order_placed',
    sentAt: new Date().toISOString(),
    status: 'delivered',
    htmlPreview: htmlContent,
  };

  db.emailLogs.unshift(log);
  saveDb(db);
  return log;
}

export async function sendPaymentConfirmedEmail(order: Order): Promise<EmailLog> {
  const db = loadDb();
  const emailId = `eml-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const subject = 'Yay! Your PookieBox order is confirmed! 💗';

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF9F5; border: 1px solid #F8BBD0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #FFC0CB, #F8BBD0); padding: 32px 24px; text-align: center;">
        <h1 style="color: #C45A7A; margin: 0; font-size: 26px; font-family: Georgia, serif;">PookieBox 🎀</h1>
        <p style="color: #59434D; margin: 8px 0 0; font-size: 14px;">A Little Box, A Lot of Love</p>
      </div>
      <div style="padding: 32px 24px; color: #59434D;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #C45A7A; color: #FFF; padding: 8px 20px; border-radius: 999px; font-size: 14px; font-weight: 600;">
            ✓ Payment Verified • ₹${order.total.toLocaleString('en-IN')}
          </div>
        </div>
        <h2 style="color: #C45A7A; font-size: 20px; margin-top: 0; text-align: center;">Yay! Order #${order.orderNumber} is Confirmed! 💗</h2>
        <p>Dear ${order.customer.fullName || 'Sweetheart'},</p>
        <p>Hooray! Your payment has been successfully verified (Ref: ${order.payment.razorpayPaymentId || 'SANDBOX-' + Math.random().toString(36).substring(2, 8).toUpperCase()}).</p>
        <p>Our artisans are now hand-tying your ribbons, packing every dainty gift into your custom box with silk paper and rose petals, and placing your heartfelt handwritten card inside.</p>
        
        <div style="background: #FFFFFF; border: 1px solid #F8BBD0; border-radius: 12px; padding: 18px; margin: 24px 0;">
          <h4 style="margin: 0 0 10px; color: #C45A7A; font-size: 15px;">Order Summary</h4>
          <p style="margin: 0; font-size: 14px; line-height: 1.6;">
            <strong>Order ID:</strong> ${order.orderNumber}<br/>
            <strong>Recipient:</strong> ${order.giftInfo.recipientName || order.customer.fullName}<br/>
            <strong>Requested Delivery:</strong> ${order.delivery.requestedDate || 'Earliest Express (2-4 Days)'}<br/>
            <strong>Delivery Address:</strong> ${order.delivery.address}, ${order.delivery.city}, ${order.delivery.state} - ${order.delivery.pinCode}
          </p>
        </div>

        <p style="font-size: 14px; color: #59434D; font-style: italic; background: #FFF0F5; padding: 12px; border-radius: 8px;">
          Personal message enclosed: "${order.giftInfo.personalizedMessage || 'Sending so much love to you today!'}"
        </p>

        <p style="font-size: 14px;">You can track your parcel anytime from your PookieBox account.</p>
      </div>
      <div style="background: #FFF0F5; padding: 16px; text-align: center; font-size: 12px; color: #888;">
        Sent with love by PookieBox • Mumbai, India
      </div>
    </div>
  `;

  const log: EmailLog = {
    id: emailId,
    orderId: order.id,
    recipient: order.customer.email,
    subject,
    type: 'payment_confirmed',
    sentAt: new Date().toISOString(),
    status: 'delivered',
    htmlPreview: htmlContent,
  };

  db.emailLogs.unshift(log);
  saveDb(db);
  return log;
}

export async function sendOrderStatusEmail(order: Order, status: Order['status'], note?: string): Promise<EmailLog> {
  const db = loadDb();
  const emailId = `eml-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let subject = `Update on your PookieBox order #${order.orderNumber}`;

  if (status === 'shipped') {
    subject = `Your PookieBox has shipped with love! 🚚🎀`;
  } else if (status === 'delivered') {
    subject = `Surprise delivered! Your PookieBox has arrived 🌸💝`;
  } else if (status === 'cancelled') {
    subject = `Your PookieBox order #${order.orderNumber} has been cancelled`;
  }

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF9F5; border: 1px solid #F8BBD0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #FFC0CB, #F8BBD0); padding: 32px 24px; text-align: center;">
        <h1 style="color: #C45A7A; margin: 0; font-size: 26px; font-family: Georgia, serif;">PookieBox 🎀</h1>
        <p style="color: #59434D; margin: 8px 0 0; font-size: 14px;">A Little Box, A Lot of Love</p>
      </div>
      <div style="padding: 32px 24px; color: #59434D;">
        <h2 style="color: #C45A7A; font-size: 20px; margin-top: 0;">Status Update: ${status.toUpperCase()}</h2>
        <p>Hi ${order.customer.fullName || 'Sweetheart'},</p>
        <p>Your order #${order.orderNumber} is now <strong>${status.replace('_', ' ')}</strong>.</p>
        ${note ? `<p style="background: #FFF0F5; padding: 12px; border-radius: 8px;"><strong>Note:</strong> ${note}</p>` : ''}
        ${
          order.tracking?.trackingNumber
            ? `<div style="background: #FFFFFF; border: 1px solid #F8BBD0; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Courier:</strong> ${order.tracking.courier || 'Express'}</p>
            <p style="margin: 6px 0 0;"><strong>Tracking Number:</strong> ${order.tracking.trackingNumber}</p>
           </div>`
            : ''
        }
      </div>
      <div style="background: #FFF0F5; padding: 16px; text-align: center; font-size: 12px; color: #888;">
        Sent with love by PookieBox • Mumbai, India
      </div>
    </div>
  `;

  const log: EmailLog = {
    id: emailId,
    orderId: order.id,
    recipient: order.customer.email,
    subject,
    type: status === 'shipped' ? 'order_shipped' : status === 'delivered' ? 'order_delivered' : 'order_cancelled',
    sentAt: new Date().toISOString(),
    status: 'delivered',
    htmlPreview: htmlContent,
  };

  db.emailLogs.unshift(log);
  saveDb(db);
  return log;
}

export async function sendBirthdayReminderEmail(birthday: BirthdayEntry, userEmail: string): Promise<EmailLog> {
  const db = loadDb();
  const emailId = `eml-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const subject = `🎀 Reminder: ${birthday.recipientName}'s Birthday is coming up!`;

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFF9F5; border: 1px solid #F8BBD0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #FFC0CB, #F8BBD0); padding: 32px 24px; text-align: center;">
        <h1 style="color: #C45A7A; margin: 0; font-size: 26px; font-family: Georgia, serif;">PookieBox 🎀</h1>
        <p style="color: #59434D; margin: 8px 0 0; font-size: 14px;">Birthday Concierge Service</p>
      </div>
      <div style="padding: 32px 24px; color: #59434D;">
        <h2 style="color: #C45A7A; font-size: 20px; margin-top: 0;">Don't forget ${birthday.recipientName}'s Special Day!</h2>
        <p>Hi,</p>
        <p>This is your friendly reminder that <strong>${birthday.recipientName}</strong> (${birthday.relationship}) celebrates their birthday on <strong>${birthday.date}</strong>!</p>
        <div style="background: #FFFFFF; border: 1px solid #F8BBD0; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Favorite Categories:</strong> ${birthday.favoriteCategories.join(', ') || 'Surprise gifts'}</p>
          <p style="margin: 6px 0 0;"><strong>Budget:</strong> ₹${birthday.budget.toLocaleString('en-IN')}</p>
          ${birthday.notes ? `<p style="margin: 6px 0 0; color: #888;"><strong>Personal Note:</strong> "${birthday.notes}"</p>` : ''}
        </div>
        <p>You can create and customize their dream PookieBox right now so it arrives just in time!</p>
      </div>
      <div style="background: #FFF0F5; padding: 16px; text-align: center; font-size: 12px; color: #888;">
        Sent with love by PookieBox • Mumbai, India
      </div>
    </div>
  `;

  const log: EmailLog = {
    id: emailId,
    recipient: userEmail,
    subject,
    type: 'birthday_reminder',
    sentAt: new Date().toISOString(),
    status: 'delivered',
    htmlPreview: htmlContent,
  };

  db.emailLogs.unshift(log);
  saveDb(db);
  return log;
}

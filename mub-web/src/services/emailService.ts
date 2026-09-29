import { Order } from '../types';
import { formatPKR } from '../utils/format';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const isOrderEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

/**
 * Emails the shop owner about a new order via EmailJS.
 * The recipient address is set in the EmailJS template itself (not here),
 * so the public key can't be used to send mail to arbitrary people.
 * Never throws — an email failure must not fail the customer's order.
 */
export async function sendNewOrderEmail(order: Order, brandName: string): Promise<boolean> {
  if (!isOrderEmailConfigured) {
    console.info('Order email skipped: EmailJS is not configured (see SETUP.md).');
    return false;
  }

  const items = order.items
    .map(i => {
      const options = [i.metal, i.size].filter(Boolean).join(', ');
      return `${i.quantity} x ${i.productName}${options ? ` (${options})` : ''} — ${formatPKR(i.total)}`;
    })
    .join('\n');

  const fullAddress = [order.address, order.area, order.city, order.postalCode].filter(Boolean).join(', ');

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: {
          brand_name: brandName,
          order_id: order.id,
          order_date: new Date(order.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }),
          customer_name: order.customerName,
          customer_phone: order.phone,
          customer_email: order.email || 'Not provided',
          reply_to: order.email || '',
          address: fullAddress,
          city: order.city,
          notes: order.notes || '—',
          items,
          subtotal: formatPKR(order.subtotal),
          discount: order.discount > 0 ? `- ${formatPKR(order.discount)}${order.couponCode ? ` (${order.couponCode})` : ''}` : '—',
          delivery: order.deliveryCharge > 0 ? formatPKR(order.deliveryCharge) : 'Free',
          total: formatPKR(order.totalAmount),
          admin_url: `${window.location.origin}/?admin`,
        },
      }),
    });
    if (!res.ok) {
      console.warn('Order email failed:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Order email failed:', e);
    return false;
  }
}

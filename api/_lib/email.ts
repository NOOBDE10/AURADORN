import nodemailer from 'nodemailer';

const escape = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const rs = (n: number) => `Rs ${Math.round(n).toLocaleString('en-PK')}`;

interface OrderForEmail {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  area?: string;
  city: string;
  postalCode?: string;
  notes?: string;
  items: Array<{ productName: string; quantity: number; price: number; total: number; size?: string }>;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  createdAt: string;
}

/** Sends the new-order alert through Gmail SMTP (GMAIL_USER + GMAIL_APP_PASSWORD). */
export async function sendOrderAlert(to: string, brandName: string, order: OrderForEmail): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass || pass.startsWith('demo_')) {
    console.warn('Order email skipped: GMAIL_USER / GMAIL_APP_PASSWORD not set');
    return;
  }
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });

  const rows = order.items
    .map(i => `<tr><td style="padding:6px;border-bottom:1px solid #eee">${escape(i.productName)}${i.size ? ` <small>(${escape(i.size)})</small>` : ''}</td>
<td style="padding:6px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
<td style="padding:6px;border-bottom:1px solid #eee;text-align:right">${rs(i.total)}</td></tr>`)
    .join('');
  const address = [order.address, order.area, order.city, order.postalCode].filter(Boolean).map(escape).join(', ');
  const waNumber = order.phone.replace(/\D/g, '').replace(/^0/, '92');

  const html = `<div style="font-family:Arial,sans-serif;max-width:600px">
<h2 style="margin:0 0 8px">New order ${escape(order.id)}</h2>
<p style="margin:0 0 16px;color:#555">${new Date(order.createdAt).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })} · Cash on Delivery</p>
<h3 style="margin:16px 0 4px">Customer</h3>
<p style="margin:0">${escape(order.customerName)}<br>
Phone: <a href="tel:${escape(order.phone)}">${escape(order.phone)}</a> · <a href="https://wa.me/${waNumber}">WhatsApp</a><br>
${order.email ? `Email: ${escape(order.email)}<br>` : ''}Address: ${address}</p>
${order.notes ? `<p><b>Notes:</b> ${escape(order.notes)}</p>` : ''}
<table style="width:100%;border-collapse:collapse;margin-top:12px">
<tr><th style="text-align:left;padding:6px">Item</th><th style="padding:6px">Qty</th><th style="text-align:right;padding:6px">Total</th></tr>
${rows}
<tr><td colspan="2" style="padding:6px;text-align:right">Subtotal</td><td style="padding:6px;text-align:right">${rs(order.subtotal)}</td></tr>
<tr><td colspan="2" style="padding:6px;text-align:right">Delivery</td><td style="padding:6px;text-align:right">${rs(order.deliveryCharge)}</td></tr>
<tr><td colspan="2" style="padding:6px;text-align:right"><b>Cash to collect</b></td><td style="padding:6px;text-align:right"><b>${rs(order.totalAmount)}</b></td></tr>
</table></div>`;

  await transporter.sendMail({
    from: `"${brandName} Orders" <${user}>`,
    to,
    subject: `New order ${order.id} · ${rs(order.totalAmount)} · ${order.customerName} (${order.city})`,
    html,
  });
}

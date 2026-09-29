import { db, json, phoneKey } from '../lib/firebase';

/** Returns an order's status only when the order ID and the checkout phone number both match. */
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let body: { orderId?: unknown; phone?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const orderId = typeof body.orderId === 'string' ? body.orderId.trim().toUpperCase().slice(0, 40) : '';
  const phone = typeof body.phone === 'string' ? phoneKey(body.phone) : '';
  if (!/^[A-Z0-9-]{4,40}$/.test(orderId) || phone.length < 10) {
    return json({ error: 'Please enter your order number and the phone number used at checkout.' }, 400);
  }

  const snap = await db.doc(`orders/${orderId}`).get();
  const o = snap.exists ? snap.data()! : null;
  if (!o || o.phoneKey !== phone) return json({ order: null });

  return json({
    order: {
      id: o.id,
      customerName: String(o.customerName || '').split(' ')[0],
      city: o.city,
      items: o.items,
      subtotal: o.subtotal,
      deliveryCharge: o.deliveryCharge,
      totalAmount: o.totalAmount,
      status: o.status,
      trackingNumber: o.trackingNumber || '',
      courierName: o.courierName || '',
      trackingUpdates: o.trackingUpdates || [],
      createdAt: o.createdAt,
    },
  });
};

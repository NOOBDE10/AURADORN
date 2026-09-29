
import { db, json, phoneKey } from './_lib/firebase.js';
import { sendOrderAlert } from './_lib/email.js';

interface ItemRequest { productId: string; quantity: number; option?: string }

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function newOrderId(): string {
  const d = new Date(Date.now() + 5 * 3600 * 1000); // Pakistan time for the date part
  const date = d.toISOString().slice(2, 10).replace(/-/g, '');
  let rand = '';
  for (let i = 0; i < 5; i++) rand += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  return `AA-${date}-${rand}`;
}

class UserError extends Error {}

export async function POST(req: Request): Promise<Response> {

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Honeypot field: real customers never fill it.
  if (str(body.website, 100)) return json({ error: 'Invalid request.' }, 400);

  const customerName = str(body.customerName, 150);
  const phone = str(body.phone, 30);
  const email = str(body.email, 150).toLowerCase();
  const address = str(body.address, 500);
  const city = str(body.city, 100);
  const area = str(body.area, 150);
  const postalCode = str(body.postalCode, 20);
  const notes = str(body.notes, 1000);
  const items = Array.isArray(body.items) ? (body.items as ItemRequest[]) : [];

  if (customerName.length < 2) return json({ error: 'Please enter your full name.' }, 400);
  if (!/^3\d{9}$/.test(phoneKey(phone)) || phone.replace(/\D/g, '').length > 12) {
    return json({ error: 'Please enter a valid Pakistani mobile number, e.g. 0300 1234567.' }, 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Please enter a valid email address or leave it empty.' }, 400);
  if (address.length < 5) return json({ error: 'Please enter your complete delivery address.' }, 400);
  if (city.length < 2) return json({ error: 'Please enter your city.' }, 400);
  if (items.length === 0 || items.length > 50) return json({ error: 'Your bag is empty.' }, 400);
  for (const it of items) {
    if (typeof it?.productId !== 'string' || !Number.isInteger(it.quantity) || it.quantity < 1 || it.quantity > 20) {
      return json({ error: 'Invalid item in your bag. Please refresh and try again.' }, 400);
    }
  }

  const settingsSnap = await db.doc('settings/general').get();
  const settings = settingsSnap.exists ? settingsSnap.data()! : {};
  const deliveryChargeSetting = typeof settings.deliveryCharge === 'number' ? settings.deliveryCharge : 200;
  const freeOver = typeof settings.freeDeliveryThreshold === 'number' ? settings.freeDeliveryThreshold : 0;
  const brandName = settings.brandName || 'Aura Adorn';
  const alertTo = settings.orderAlertEmail || process.env.ORDER_ALERT_EMAIL || process.env.GMAIL_USER;

  let order: Record<string, any>;
  try {
    order = await db.runTransaction(async tx => {
      // Merge duplicate lines per product so stock is checked against the combined quantity.
      const productIds = [...new Set(items.map(i => i.productId))];
      const refs = productIds.map(id => db.doc(`products/${id}`));
      const snaps = await tx.getAll(...refs);
      const products = new Map(snaps.map(s => [s.id, s]));

      const qtyByProduct = new Map<string, number>();
      for (const it of items) qtyByProduct.set(it.productId, (qtyByProduct.get(it.productId) || 0) + it.quantity);

      const orderItems = items.map(it => {
        const snap = products.get(it.productId);
        const p = snap?.exists ? snap.data()! : null;
        if (!p || p.status === 'draft') throw new UserError('An item in your bag is no longer available. Please remove it and try again.');
        const options: string[] = Array.isArray(p.options) ? p.options : [];
        const option = str(it.option, 60);
        if (options.length > 0 && !options.includes(option)) {
          throw new UserError(`Please choose a ${p.optionLabel || 'size'} for "${p.name}".`);
        }
        return {
          productId: it.productId,
          productName: p.name,
          productImage: (Array.isArray(p.images) && p.images[0]) || '',
          price: p.price,
          quantity: it.quantity,
          total: p.price * it.quantity,
          ...(options.length > 0 ? { size: option } : {}),
        };
      });

      for (const [id, qty] of qtyByProduct) {
        const p = products.get(id)!.data()!;
        const stock = Number(p.stock) || 0;
        if (qty > stock) {
          throw new UserError(stock <= 0 ? `Sorry, "${p.name}" is out of stock.` : `Only ${stock} of "${p.name}" left. Please reduce the quantity.`);
        }
      }

      let orderId = newOrderId();
      if ((await tx.get(db.doc(`orders/${orderId}`))).exists) orderId = newOrderId();

      const subtotal = orderItems.reduce((s, i) => s + i.total, 0);
      const deliveryCharge = freeOver > 0 && subtotal >= freeOver ? 0 : deliveryChargeSetting;
      const now = new Date().toISOString();

      const newOrder = {
        id: orderId,
        customerName,
        phone,
        phoneKey: phoneKey(phone),
        email,
        address,
        city,
        area,
        postalCode,
        notes,
        items: orderItems,
        subtotal,
        discount: 0,
        deliveryCharge,
        totalAmount: subtotal + deliveryCharge,
        paymentMethod: 'Cash on Delivery',
        status: 'pending',
        trackingUpdates: [{ status: 'pending', title: 'Order Received', description: 'We have received your order.', timestamp: now, completed: true }],
        createdAt: now,
      };

      for (const [id, qty] of qtyByProduct) {
        const stock = Number(products.get(id)!.data()!.stock) || 0;
        tx.update(db.doc(`products/${id}`), {
          stock: stock - qty,
          ...(stock - qty <= 0 ? { status: 'out_of_stock' } : {}),
        });
      }
      tx.set(db.doc(`orders/${orderId}`), newOrder);
      return newOrder;
    });
  } catch (e) {
    if (e instanceof UserError) return json({ error: e.message }, 409);
    console.error('place-order failed', e);
    return json({ error: 'We could not place your order right now. Please try again, or order on WhatsApp.' }, 500);
  }

  if (alertTo) {
    try {
      await sendOrderAlert(alertTo, brandName, order as any);
    } catch (e) {
      // The order is saved; a failed email must not fail the checkout.
      console.error('Order email failed', e);
    }
  }

  const { phoneKey: _omit, ...publicOrder } = order;
  return json({ order: publicOrder });
}

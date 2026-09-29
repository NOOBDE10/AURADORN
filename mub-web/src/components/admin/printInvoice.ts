import { Order, StoreSettings } from '../../types';
import { formatPKR } from '../../utils/format';

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Opens a clean printable invoice / packing slip for one order. */
export function printInvoice(order: Order, settings: StoreSettings) {
  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) {
    alert('Please allow pop-ups for this site to print invoices.');
    return;
  }

  const rows = order.items
    .map(
      i => `<tr>
        <td>${esc(i.productName)}${i.metal || i.size ? `<br><small>${esc([i.metal, i.size].filter(Boolean).join(' · '))}</small>` : ''}</td>
        <td class="c">${esc(i.quantity)}</td>
        <td class="r">${esc(formatPKR(i.price))}</td>
        <td class="r">${esc(formatPKR(i.total))}</td>
      </tr>`
    )
    .join('');

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${esc(order.id)}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#1C1815;margin:32px;font-size:13px}
  h1{margin:0;font-size:22px;letter-spacing:2px} .muted{color:#777} .top{display:flex;justify-content:space-between;border-bottom:2px solid #1C1815;padding-bottom:12px;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;margin:16px 0} th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}
  th{background:#f5f1ea;font-size:11px;text-transform:uppercase} .r{text-align:right} .c{text-align:center}
  .totals{width:280px;margin-left:auto} .totals td{border:none;padding:4px 8px} .grand td{font-size:16px;font-weight:bold;border-top:2px solid #1C1815}
  .box{border:1px solid #ddd;border-radius:6px;padding:10px 12px;margin-top:8px}
  .cod{margin-top:18px;padding:10px;border:2px dashed #1C1815;text-align:center;font-weight:bold;font-size:15px}
  @media print{button{display:none}}
</style></head><body>
<div class="top">
  <div><h1>${esc(settings.brandName.toUpperCase())}</h1><div class="muted">${esc(settings.tagline)}</div>
  <div class="muted">${esc([settings.phone, settings.email].filter(Boolean).join(' · '))}</div></div>
  <div style="text-align:right"><strong>INVOICE</strong><br>${esc(order.id)}<br><span class="muted">${esc(new Date(order.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }))}</span></div>
</div>
<div class="box"><strong>Deliver to:</strong> ${esc(order.customerName)} · ${esc(order.phone)}<br>
${esc([order.address, order.area, order.city, order.postalCode].filter(Boolean).join(', '))}
${order.notes ? `<br><strong>Customer note:</strong> ${esc(order.notes)}` : ''}</div>
<table><thead><tr><th>Item</th><th class="c">Qty</th><th class="r">Price</th><th class="r">Total</th></tr></thead><tbody>${rows}</tbody></table>
<table class="totals">
  <tr><td>Subtotal</td><td class="r">${esc(formatPKR(order.subtotal))}</td></tr>
  ${order.discount > 0 ? `<tr><td>Discount${order.couponCode ? ` (${esc(order.couponCode)})` : ''}</td><td class="r">- ${esc(formatPKR(order.discount))}</td></tr>` : ''}
  <tr><td>Delivery</td><td class="r">${order.deliveryCharge > 0 ? esc(formatPKR(order.deliveryCharge)) : 'Free'}</td></tr>
  <tr class="grand"><td>Total</td><td class="r">${esc(formatPKR(order.totalAmount))}</td></tr>
</table>
<div class="cod">CASH ON DELIVERY — COLLECT ${esc(formatPKR(order.totalAmount))}</div>
<p class="muted" style="margin-top:24px;text-align:center">Thank you for shopping with ${esc(settings.brandName)}!</p>
<button onclick="window.print()" style="padding:10px 18px;margin-top:10px">Print</button>
<script>window.onload=function(){window.print()}</script>
</body></html>`);
  win.document.close();
}

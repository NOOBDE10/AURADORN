import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { StoreSettings } from '../types';
import { formatPrice } from '../lib/format';
import { POLICY_PAGES, PolicyKey, policyTitle } from './policyLinks';

type PageKey = PolicyKey;

function defaultPrivacy(s: StoreSettings): string {
  return `${s.brandName} respects your privacy.

What we collect: when you place an order we collect your name, mobile number, delivery address, city and (optionally) your email address and order notes. If you subscribe to our newsletter we store your email address.

Why we collect it: only to confirm, pack, deliver and support your order, to contact you about your order by phone, SMS or WhatsApp, and (if you subscribed) to tell you about new arrivals and offers.

Sharing: your name, phone number and address are shared with our courier partner only for delivery. We never sell your information.

Storage: your data is stored securely with our service providers (Google Firebase and our hosting provider). Payment is Cash on Delivery, so we never collect card or bank details on this website.

Your choices: you can ask us to correct or delete your information, or unsubscribe from emails at any time, by contacting us at ${s.email} or ${s.phone}.`;
}

function defaultTerms(s: StoreSettings): string {
  return `By placing an order on this website you agree to these terms.

Products: all our jewellery is artificial (imitation) jewellery. It is not real gold, silver or precious stones. Colours may look slightly different from photos because of screen and lighting differences.

Prices & payment: all prices are in Pakistani Rupees (PKR). Payment is Cash on Delivery: please pay the courier the total shown at checkout (including the delivery charge of ${formatPrice(s.deliveryCharge)}).

Order confirmation: we may call or message you to confirm your order before dispatch. We may cancel orders that cannot be confirmed, have incorrect details, or for items that are out of stock.

Delivery: see our Shipping & Delivery policy. Please make sure someone is available to receive and pay for the parcel.

Returns & exchange: see our Returns & Exchange policy.

Contact: ${s.email} · ${s.phone}.`;
}

function contentFor(key: PageKey, s: StoreSettings): string {
  switch (key) {
    case 'shipping':
      return s.shippingPolicy;
    case 'returns':
      return s.returnPolicy;
    case 'care':
      return s.warrantyPolicy;
    case 'privacy':
      return s.privacyPolicy?.trim() || defaultPrivacy(s);
    case 'terms':
      return s.termsPolicy?.trim() || defaultTerms(s);
    default:
      return '';
  }
}

export const PoliciesPage: React.FC = () => {
  const { page } = useParams();
  const { settings } = useStore();
  const key = (page || 'shipping') as PageKey;
  const valid = POLICY_PAGES.includes(key);

  useDocumentMeta(
    valid
      ? {
          title: `${policyTitle(key)} | ${settings.brandName}`,
          description: `${policyTitle(key)} for ${settings.brandName}: artificial jewellery with Cash on Delivery all over Pakistan.`,
        }
      : null
  );

  if (!valid) return <Navigate to="/policies/shipping" replace />;

  const whatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
      <nav className="md:col-span-1 flex md:flex-col gap-2 overflow-x-auto text-xs font-sans" aria-label="Policies">
        {POLICY_PAGES.map(k => (
          <Link
            key={k}
            to={`/policies/${k}`}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              k === key ? 'bg-[#1C1814] text-[#E5C378] font-semibold border border-[#C9A25D]/40' : 'text-[#A89F91] hover:text-[#FAF7F2]'
            }`}
          >
            {policyTitle(k)}
          </Link>
        ))}
      </nav>

      <article className="md:col-span-3 space-y-4">
        <h1 className="font-serif text-3xl text-[#FAF7F2]">{policyTitle(key)}</h1>
        {key === 'contact' ? (
          <div className="space-y-3 text-sm font-sans text-[#C5BDB2]">
            <p>We are happy to help with orders, sizes and delivery.</p>
            <p>
              <span className="text-[#8C8275]">WhatsApp: </span>
              <a className="text-[#E5C378] underline" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                {settings.whatsappNumber}
              </a>
            </p>
            <p>
              <span className="text-[#8C8275]">Phone: </span>
              <a className="text-[#E5C378] underline" href={`tel:${settings.phone.replace(/\s/g, '')}`}>{settings.phone}</a>
            </p>
            <p>
              <span className="text-[#8C8275]">Email: </span>
              <a className="text-[#E5C378] underline" href={`mailto:${settings.email}`}>{settings.email}</a>
            </p>
            <p>
              <span className="text-[#8C8275]">Address: </span>
              {settings.address}
            </p>
          </div>
        ) : (
          <div className="text-sm font-sans text-[#C5BDB2] leading-relaxed whitespace-pre-line">{contentFor(key, settings)}</div>
        )}
        <p className="pt-6 text-xs text-stone-500">
          Questions? <Link to="/policies/contact" className="text-[#E5C378] underline">Contact us</Link>.
        </p>
      </article>
    </div>
  );
};

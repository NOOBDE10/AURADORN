import React, { useEffect, useState } from 'react';
import { StoreSettings } from '../../types';
import { inputCls, labelCls, btnGold } from './styles';

interface Props {
  settings: StoreSettings;
  onSave: (s: StoreSettings) => Promise<void>;
}

export const SettingsTab: React.FC<Props> = ({ settings, onSave }) => {
  const [form, setForm] = useState<StoreSettings>(settings);
  const [saving, setSaving] = useState(false);

  // Re-sync when the saved settings load or change.
  useEffect(() => setForm(settings), [settings]);

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => setForm(prev => ({ ...prev, [key]: value }));
  const setHero = (key: keyof StoreSettings['heroBanner'], value: string) =>
    setForm(prev => ({ ...prev, heroBanner: { ...prev.heroBanner, [key]: value } }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, currency: 'PKR', currencySymbol: 'Rs' });
    } finally {
      setSaving(false);
    }
  };

  const text = (key: keyof StoreSettings, label: string, placeholder = '') => (
    <div>
      <label className={labelCls}>{label}</label>
      <input className={inputCls} value={(form[key] as string) || ''} placeholder={placeholder} onChange={e => set(key, e.target.value as any)} />
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-6 text-xs font-sans max-w-3xl">
      <section className="space-y-3">
        <h3 className="font-serif text-lg text-[#FAF7F2]">Store & contact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {text('brandName', 'Brand name')}
          {text('tagline', 'Tagline')}
          {text('phone', 'Phone (shown on site)', '+92 3xx xxxxxxx')}
          {text('whatsappNumber', 'WhatsApp number', '+923xxxxxxxxx')}
          {text('email', 'Contact email')}
          {text('orderAlertEmail', 'Send new-order emails to')}
          {text('address', 'Address')}
          {text('announcementText', 'Top announcement bar')}
          {text('instagramUrl', 'Instagram link', 'https://instagram.com/…')}
          {text('facebookUrl', 'Facebook link', 'https://facebook.com/…')}
          {text('tiktokUrl', 'TikTok link', 'https://tiktok.com/@…')}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-serif text-lg text-[#FAF7F2]">Delivery (Cash on Delivery)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Delivery charge (Rs)</label>
            <input type="number" min={0} className={inputCls} value={form.deliveryCharge} onChange={e => set('deliveryCharge', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelCls}>Free delivery above (Rs, 0 = never)</label>
            <input type="number" min={0} className={inputCls} value={form.freeDeliveryThreshold} onChange={e => set('freeDeliveryThreshold', Number(e.target.value))} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-serif text-lg text-[#FAF7F2]">Homepage banner</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Small tag</label>
            <input className={inputCls} value={form.heroBanner.tag} onChange={e => setHero('tag', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Button text</label>
            <input className={inputCls} value={form.heroBanner.ctaText} onChange={e => setHero('ctaText', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Headline</label>
            <input className={inputCls} value={form.heroBanner.title} onChange={e => setHero('title', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Sub-heading</label>
            <textarea rows={2} className={inputCls} value={form.heroBanner.subtitle} onChange={e => setHero('subtitle', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Banner image link</label>
            <input className={inputCls} value={form.heroBanner.image} onChange={e => setHero('image', e.target.value)} placeholder="https://…" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-serif text-lg text-[#FAF7F2]">Policies (shown on product pages and the Policies page)</h3>
        {([['shippingPolicy', 'Shipping / delivery policy'], ['returnPolicy', 'Return / exchange policy'], ['warrantyPolicy', 'Product care & disclaimer']] as const).map(([key, label]) => (
          <div key={key}>
            <label className={labelCls}>{label}</label>
            <textarea rows={3} className={inputCls} value={form[key]} onChange={e => set(key, e.target.value)} />
          </div>
        ))}
      </section>

      <button type="submit" disabled={saving} className={btnGold}>{saving ? 'Saving…' : 'Save Settings'}</button>
    </form>
  );
};

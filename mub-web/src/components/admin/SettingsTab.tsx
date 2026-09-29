import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';
import { saveStoreSettings } from '../../services/storeService';
import { isOrderEmailConfigured } from '../../services/emailService';
import { whatsappLink } from '../../utils/format';
import { cardCls, Field, inputCls, primaryBtn, runAction } from './adminUi';
import { ImageUploader } from './ImageUploader';

const Section: React.FC<{ title: string; desc?: string; children: React.ReactNode }> = ({ title, desc, children }) => (
  <section className={`${cardCls} p-5 sm:p-6 space-y-4`}>
    <div>
      <h3 className="font-serif text-lg text-[#1C1815]">{title}</h3>
      {desc && <p className="text-xs text-stone-500">{desc}</p>}
    </div>
    {children}
  </section>
);

export const SettingsTab: React.FC = () => {
  const { settings, showToast } = useStore();
  const [form, setForm] = useState<StoreSettings>(settings);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pick up live changes (e.g. first load) unless the owner is mid-edit.
  useEffect(() => {
    if (!dirty) setForm(settings);
  }, [settings, dirty]);

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };
  const setHero = (key: keyof StoreSettings['heroBanner'], value: string) => {
    setForm(prev => ({ ...prev, heroBanner: { ...prev.heroBanner, [key]: value } }));
    setDirty(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.whatsappNumber && !whatsappLink(form.whatsappNumber)) {
      showToast('WhatsApp number looks wrong. Use a format like 0300 1234567.', 'info');
      return;
    }
    setSaving(true);
    const ok = await runAction(
      () => saveStoreSettings({ ...form, highlights: form.highlights.map(h => h.trim()).filter(Boolean) }),
      showToast,
      'Settings saved — the website is updated'
    );
    setSaving(false);
    if (ok) setDirty(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 text-xs">
      <Section title="Shop details" desc="Shown in the header, footer and on invoices.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Shop name"><input className={inputCls} value={form.brandName} onChange={e => set('brandName', e.target.value)} /></Field>
          <Field label="Tagline"><input className={inputCls} value={form.tagline} onChange={e => set('tagline', e.target.value)} /></Field>
          <Field label="WhatsApp number" hint="Customers' WhatsApp buttons open a chat with this number, e.g. 0300 1234567">
            <input className={inputCls} value={form.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value)} placeholder="0300 1234567" />
          </Field>
          <Field label="Phone number (shown on site)"><input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} /></Field>
          <Field label="Contact email (shown on site)"><input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} /></Field>
          <Field label="Address / city (shown on site)"><input className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. Lahore, Pakistan" /></Field>
        </div>
        <Field label="About the shop (footer)">
          <textarea rows={2} className={inputCls} value={form.aboutText} onChange={e => set('aboutText', e.target.value)} />
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Instagram link"><input className={inputCls} value={form.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/…" /></Field>
          <Field label="Facebook link"><input className={inputCls} value={form.facebookUrl} onChange={e => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/…" /></Field>
          <Field label="TikTok link"><input className={inputCls} value={form.tiktokUrl} onChange={e => set('tiktokUrl', e.target.value)} placeholder="https://tiktok.com/@…" /></Field>
        </div>
      </Section>

      <Section title="Delivery charges" desc="All amounts in Pakistani Rupees.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Delivery charge (Rs.)">
            <input type="number" min={0} className={inputCls} value={form.deliveryCharge} onChange={e => set('deliveryCharge', Number(e.target.value))} />
          </Field>
          <Field label="Free delivery on orders above (Rs.)" hint="Set 0 to always charge delivery.">
            <input type="number" min={0} className={inputCls} value={form.freeDeliveryThreshold} onChange={e => set('freeDeliveryThreshold', Number(e.target.value))} />
          </Field>
        </div>
      </Section>

      <Section title="Home page" desc="The big banner at the top of the home page, and the strip above the menu.">
        <Field label="Announcement strip (top of every page)">
          <input className={inputCls} value={form.announcementText} onChange={e => set('announcementText', e.target.value)} placeholder="e.g. Eid Sale — use code EID20 for 20% off" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Banner small label"><input className={inputCls} value={form.heroBanner.tag} onChange={e => setHero('tag', e.target.value)} /></Field>
          <Field label="Banner button text"><input className={inputCls} value={form.heroBanner.ctaText} onChange={e => setHero('ctaText', e.target.value)} /></Field>
        </div>
        <Field label="Banner headline"><input className={inputCls} value={form.heroBanner.title} onChange={e => setHero('title', e.target.value)} /></Field>
        <Field label="Banner text"><textarea rows={2} className={inputCls} value={form.heroBanner.subtitle} onChange={e => setHero('subtitle', e.target.value)} /></Field>
        <Field label="Banner photo" hint="A wide landscape photo works best.">
          <ImageUploader multiple={false} images={form.heroBanner.image ? [form.heroBanner.image] : []} onChange={imgs => setHero('image', imgs[0] || '')} />
        </Field>
        <Field label="Three trust points" hint="Shown under the banner and in the footer. Only promise what you really offer.">
          <div className="grid sm:grid-cols-3 gap-3">
            {[0, 1, 2].map(i => (
              <input
                key={i}
                className={inputCls}
                value={form.highlights[i] || ''}
                onChange={e => {
                  const next = [...form.highlights];
                  next[i] = e.target.value;
                  set('highlights', next);
                }}
              />
            ))}
          </div>
        </Field>
      </Section>

      <Section title="Policies" desc="Shown on product pages and in the Policies page linked from the footer.">
        <Field label="Delivery policy"><textarea rows={3} className={inputCls} value={form.shippingPolicy} onChange={e => set('shippingPolicy', e.target.value)} /></Field>
        <Field label="Return & exchange policy"><textarea rows={3} className={inputCls} value={form.returnPolicy} onChange={e => set('returnPolicy', e.target.value)} /></Field>
        <Field label="Jewellery care / warranty"><textarea rows={3} className={inputCls} value={form.warrantyPolicy} onChange={e => set('warrantyPolicy', e.target.value)} /></Field>
        <Field label="Privacy policy"><textarea rows={3} className={inputCls} value={form.privacyPolicy} onChange={e => set('privacyPolicy', e.target.value)} /></Field>
      </Section>

      <Section title="Order notifications">
        <p className={isOrderEmailConfigured ? 'text-emerald-700' : 'text-amber-700'}>
          {isOrderEmailConfigured
            ? '✓ New-order emails are switched on. The receiving address is set in your EmailJS template.'
            : 'New-order emails are not set up yet — follow SETUP.md step 5. Orders still appear here instantly.'}
        </p>
      </Section>

      <div className="sticky bottom-0 bg-[#FAF8F5]/95 backdrop-blur py-3 flex items-center gap-3">
        <button type="submit" disabled={saving || !dirty} className={primaryBtn}>
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save settings'}
        </button>
        {dirty && <span className="text-amber-700">You have unsaved changes</span>}
      </div>
    </form>
  );
};

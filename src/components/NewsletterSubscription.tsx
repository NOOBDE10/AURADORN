import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { subscribeNewsletter } from '../services/storeService';
import { 
  Sparkles, 
  Crown, 
  Mail, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  Gift 
} from 'lucide-react';

interface NewsletterSubscriptionProps {
  variant?: 'footer' | 'standalone';
  className?: string;
}

export const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({
  variant = 'footer',
  className = ''
}) => {
  const { showToast } = useStore();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string>('');

  // Remember a previous subscription on this device.
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aura_adorn_newsletter_subscribed');
      if (stored) {
        setSavedEmail(stored);
        setAlreadySubscribed(true);
      }
    } catch {
      // storage unavailable
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setErrorMessage('Please enter your email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await subscribeNewsletter(email, 'footer_newsletter');

      if (!res.success) {
        setStatus('error');
        setErrorMessage(res.message);
        showToast(res.message, 'info');
      } else {
        setStatus('success');
        setSavedEmail(email.trim().toLowerCase());
        setAlreadySubscribed(true);
        try {
          localStorage.setItem('aura_adorn_newsletter_subscribed', email.trim().toLowerCase());
        } catch {
          // Ignore
        }
        showToast(res.message, 'gold');
      }
    } catch {
      setStatus('error');
      setErrorMessage('A momentary connection issue occurred. Please try again.');
    }
  };

  const handleReset = () => {
    setAlreadySubscribed(false);
    setStatus('idle');
    setEmail('');
    setErrorMessage('');
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-[#0E0D0B] border border-[#C9A25D]/40 text-[#FAF7F2] shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-6 sm:p-8 md:p-10 ${className}`}
    >
      {/* Decorative ambient gold radial glow */}
      <div className="absolute top-0 right-1/4 -mt-16 w-80 h-80 bg-[#C9A25D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 -mb-16 w-60 h-60 bg-[#E5C378]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {alreadySubscribed && status !== 'loading' ? (
          /* Subscribed state */
          <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#181613] border border-[#C9A25D]/60 text-[#E5C378] shadow-[0_0_20px_rgba(201,162,93,0.3)]">
              <Crown className="w-7 h-7 text-[#E5C378]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-[#E5C378] font-bold block">
                Privilege Roster Confirmed
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#FAF7F2]">
                You're subscribed!
              </h3>
              <p className="text-xs sm:text-sm font-sans text-[#A89F91] max-w-xl mx-auto leading-relaxed">
                Thank you for subscribing. New arrivals and offers will be sent to{' '}
                <span className="text-[#E5C378] font-medium underline underline-offset-4 decoration-[#C9A25D]/50">
                  {savedEmail}
                </span>.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-sans text-stone-400">
              <span className="flex items-center gap-1.5 text-[#E5C378]">
                <Sparkles className="w-3.5 h-3.5 text-[#E5C378]" />
                First Access to Numbered Drops
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-[#E5C378]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E5C378]" />
                Cash on Delivery all over Pakistan
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={handleReset}
                className="text-stone-400 hover:text-[#E5C378] underline transition-colors cursor-pointer text-xs"
              >
                Subscribe another email
              </button>
            </div>
          </div>
        ) : (
          /* Subscription Form State */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Copy & Value Proposition */}
            <div className="lg:col-span-6 space-y-3 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A25D]/15 border border-[#C9A25D]/40 text-[#E6D4AF] text-[10px] font-sans font-semibold tracking-[0.2em] uppercase">
                <Crown className="w-3 h-3 text-[#C9A25D]" />
                <span>Private Vernissage & Launch Previews</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white leading-tight font-medium">
                Get <span className="italic text-[#E6D4AF]">New Arrivals</span> First
              </h3>

              <p className="text-xs sm:text-sm font-sans text-stone-300 leading-relaxed">
                Subscribe to hear about new designs, restocks and special offers. No spam.
              </p>

              {/* Value proposition badges */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-sans text-stone-300">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#C9A25D]/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-2.5 h-2.5 text-[#C9A25D]" />
                  </div>
                  <span>48h Private Pre-Launch Window</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#C9A25D]/20 flex items-center justify-center shrink-0">
                    <Crown className="w-2.5 h-2.5 text-[#C9A25D]" />
                  </div>
                  <span>New arrivals first</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#C9A25D]/20 flex items-center justify-center shrink-0">
                    <Gift className="w-2.5 h-2.5 text-[#C9A25D]" />
                  </div>
                  <span>Exclusive offers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#C9A25D]/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-2.5 h-2.5 text-[#C9A25D]" />
                  </div>
                  <span>Strict Privacy & Zero Spam</span>
                </div>
              </div>
            </div>

            {/* Right Column: Form Input & Gold CTA */}
            <div className="lg:col-span-6 bg-black/30 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4 text-[#C9A25D]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter your confidential email address"
                    disabled={status === 'loading'}
                    required
                    className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-[#C9A25D]/50 focus:border-[#C9A25D] focus:ring-1 focus:ring-[#C9A25D] text-white text-xs sm:text-sm font-sans placeholder:text-stone-400 rounded-xl focus:outline-none transition-all"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-400 font-sans pl-1">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3.5 px-6 gold-foil-badge rounded-xl font-serif text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:shadow-[0_0_20px_rgba(201,162,93,0.4)] active:scale-[0.98] disabled:opacity-60"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#2B1B04]" />
                      <span>Securing Invitation...</span>
                    </>
                  ) : (
                    <>
                      <span>Request Launch Invitation</span>
                      <ArrowRight className="w-4 h-4 text-[#2B1B04]" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] font-sans text-stone-400 pt-1 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>We never share your email</span>
                </span>
                <span>Unsubscribe at any moment</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

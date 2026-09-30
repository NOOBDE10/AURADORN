import React, { useEffect, useState } from 'react';
import { X, User as UserIcon, Package, LogOut, Loader2, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/format';
import { OrderStatus } from '../types';

const inputCls =
  'w-full bg-[#14120F] border border-[#26211B] rounded-xl px-3.5 py-3 text-sm font-sans text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]';
const labelCls = 'block text-xs font-medium text-stone-300 mb-1';
const btnGold =
  'w-full py-3 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-xl hover:brightness-110 transition-all cursor-pointer disabled:opacity-60';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Received',
  confirmed: 'Confirmed',
  processing: 'Packed',
  shipped: 'With courier',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

type Mode = 'login' | 'signup' | 'reset';

export const CustomerAccountModal: React.FC = () => {
  const {
    isAccountOpen,
    closeAccount,
    user,
    customerProfile,
    myOrders,
    customerLogin,
    customerSignUp,
    customerLogout,
    sendPasswordReset,
    updateCustomerProfile,
    openTracking,
  } = useStore();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [tab, setTab] = useState<'orders' | 'details'>('orders');

  // Profile form
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pAddress, setPAddress] = useState('');
  const [pCity, setPCity] = useState('');
  const [pArea, setPArea] = useState('');

  useEffect(() => {
    setPName(customerProfile?.name || user?.displayName || '');
    setPPhone(customerProfile?.phone || customerProfile?.defaultAddress?.phone || '');
    setPAddress(customerProfile?.defaultAddress?.address || '');
    setPCity(customerProfile?.defaultAddress?.city || '');
    setPArea(customerProfile?.defaultAddress?.area || '');
  }, [customerProfile, user]);

  useEffect(() => {
    if (isAccountOpen) {
      setError('');
      setInfo('');
      setPassword('');
      setConfirm('');
    }
  }, [isAccountOpen]);

  if (!isAccountOpen) return null;

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setInfo('');
  };

  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (mode === 'signup') {
      if (name.trim().length < 2) return setError('Please enter your name.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
      if (password !== confirm) return setError('Passwords do not match.');
    }
    setBusy(true);
    try {
      if (mode === 'login') await customerLogin(email, password);
      else if (mode === 'signup') await customerSignUp(name, email, password);
      else {
        await sendPasswordReset(email);
        setInfo('If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder).');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (pName.trim().length < 2) return setError('Please enter your name.');
    setBusy(true);
    try {
      await updateCustomerProfile({
        name: pName.trim(),
        phone: pPhone.trim(),
        ...(pAddress.trim() && pCity.trim()
          ? { defaultAddress: { name: pName.trim(), phone: pPhone.trim(), address: pAddress.trim(), city: pCity.trim(), area: pArea.trim() } }
          : {}),
      });
    } catch {
      setError('Could not save your details. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeAccount}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="My account"
        className="bg-[#0E0D0B] border border-[#2E2822] rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col text-[#FAF7F2] shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#241F1A]">
          <h2 className="font-serif text-xl flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#E5C378]" />
            {user ? 'My Account' : mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Reset Password' : 'Log In'}
          </h2>
          <button onClick={closeAccount} className="p-2 rounded-full hover:bg-white/10 text-stone-400 cursor-pointer" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {!user ? (
            <form onSubmit={submitAuth} className="space-y-4">
              <p className="text-xs text-[#A89F91]">
                {mode === 'signup'
                  ? 'Create an account to see your orders, save your address and keep your wishlist on all your devices.'
                  : mode === 'reset'
                    ? 'Enter your account email and we will send you a link to set a new password.'
                    : 'Log in to see your orders and check out faster.'}
              </p>

              {mode === 'signup' && (
                <div>
                  <label className={labelCls} htmlFor="acc-name">Full name</label>
                  <input id="acc-name" className={inputCls} value={name} onChange={e => setName(e.target.value)} autoComplete="name" placeholder="e.g. Ayesha Khan" />
                </div>
              )}
              <div>
                <label className={labelCls} htmlFor="acc-email">Email</label>
                <input id="acc-email" type="email" required className={inputCls} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" />
              </div>
              {mode !== 'reset' && (
                <div>
                  <label className={labelCls} htmlFor="acc-password">Password</label>
                  <input
                    id="acc-password"
                    type="password"
                    required
                    minLength={6}
                    className={inputCls}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : ''}
                  />
                </div>
              )}
              {mode === 'signup' && (
                <div>
                  <label className={labelCls} htmlFor="acc-confirm">Confirm password</label>
                  <input id="acc-confirm" type="password" required className={inputCls} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
                </div>
              )}

              {error && <p className="text-xs text-rose-400" role="alert">{error}</p>}
              {info && <p className="text-xs text-emerald-400">{info}</p>}

              <button type="submit" disabled={busy} className={btnGold}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Send Reset Link' : 'Log In'}
              </button>

              <div className="flex flex-col items-center gap-2 text-xs text-[#A89F91] pt-1">
                {mode === 'login' && (
                  <>
                    <button type="button" onClick={() => switchMode('reset')} className="hover:text-[#E5C378] cursor-pointer">Forgot password?</button>
                    <p>
                      New here?{' '}
                      <button type="button" onClick={() => switchMode('signup')} className="text-[#E5C378] font-semibold hover:underline cursor-pointer">Create an account</button>
                    </p>
                  </>
                )}
                {mode !== 'login' && (
                  <button type="button" onClick={() => switchMode('login')} className="hover:text-[#E5C378] cursor-pointer">← Back to log in</button>
                )}
                <p className="text-stone-500">No account needed to order: you can always check out as a guest.</p>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-serif text-lg truncate">{customerProfile?.name || user.displayName || 'Welcome'}</p>
                  <p className="text-xs text-[#A89F91] truncate">{user.email}</p>
                </div>
                <button onClick={customerLogout} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#26211B] text-xs text-stone-300 hover:text-white hover:border-[#C9A25D] cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" /> Log out
                </button>
              </div>

              <div className="flex gap-6 border-b border-[#241F1A] text-xs font-sans">
                {(['orders', 'details'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`py-2.5 border-b-2 cursor-pointer ${tab === t ? 'border-[#E5C378] text-[#E5C378] font-semibold' : 'border-transparent text-stone-400'}`}
                  >
                    {t === 'orders' ? `My Orders (${myOrders.length})` : 'My Details'}
                  </button>
                ))}
              </div>

              {tab === 'orders' ? (
                myOrders.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Package className="w-8 h-8 text-stone-600 mx-auto" />
                    <p className="text-sm">No orders yet</p>
                    <p className="text-xs text-[#A89F91]">Orders you place while logged in will appear here.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {myOrders.map(o => (
                      <li key={o.id} className="p-4 rounded-2xl border border-[#26211B] bg-[#12100E] space-y-2 text-xs">
                        <div className="flex justify-between gap-2">
                          <div>
                            <p className="font-mono font-bold text-[#E5C378]">{o.id}</p>
                            <p className="text-[#A89F91]">{new Date(o.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(o.totalAmount)}</p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] uppercase ${o.status === 'cancelled' ? 'bg-rose-900/50 text-rose-300' : o.status === 'delivered' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-amber-900/40 text-amber-300'}`}>
                              {STATUS_LABEL[o.status] || o.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-[#C5BDB2]">
                          {o.items.map(i => `${i.quantity}× ${i.productName}${i.size ? ` (${i.size})` : ''}`).join(', ')}
                        </p>
                        {(o.courierName || o.trackingNumber) && (
                          <p className="text-[#A89F91]">Courier: {o.courierName || '—'}{o.trackingNumber ? ` · ${o.trackingNumber}` : ''}</p>
                        )}
                        <button
                          onClick={() => {
                            closeAccount();
                            openTracking(o.id, o.phone);
                          }}
                          className="inline-flex items-center gap-1.5 text-[#E5C378] hover:underline cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" /> Track order
                        </button>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <form onSubmit={saveDetails} className="space-y-3">
                  <div>
                    <label className={labelCls} htmlFor="p-name">Full name</label>
                    <input id="p-name" className={inputCls} value={pName} onChange={e => setPName(e.target.value)} autoComplete="name" />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="p-phone">Mobile number</label>
                    <input id="p-phone" type="tel" className={inputCls} value={pPhone} onChange={e => setPPhone(e.target.value)} autoComplete="tel" placeholder="0300 1234567" />
                  </div>
                  <p className="text-xs text-[#A89F91] pt-1">Saved delivery address (filled in automatically at checkout)</p>
                  <div>
                    <label className={labelCls} htmlFor="p-address">Address</label>
                    <input id="p-address" className={inputCls} value={pAddress} onChange={e => setPAddress(e.target.value)} autoComplete="street-address" placeholder="House, street, block" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls} htmlFor="p-city">City</label>
                      <input id="p-city" className={inputCls} value={pCity} onChange={e => setPCity(e.target.value)} autoComplete="address-level2" />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="p-area">Area</label>
                      <input id="p-area" className={inputCls} value={pArea} onChange={e => setPArea(e.target.value)} />
                    </div>
                  </div>
                  {error && <p className="text-xs text-rose-400" role="alert">{error}</p>}
                  <button type="submit" disabled={busy} className={btnGold}>{busy ? 'Saving…' : 'Save Details'}</button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

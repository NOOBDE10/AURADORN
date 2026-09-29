import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, CheckCircle2, LogOut, Package, ShieldCheck, User, X } from 'lucide-react';
import { formatPKR } from '../utils/format';

type Mode = 'login' | 'register' | 'reset';

const inputCls =
  'w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-sm font-sans focus:outline-none focus:border-[#C9A25D]';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Placed',
  confirmed: 'Confirmed',
  processing: 'Packing',
  shipped: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const CustomerAccountModal: React.FC = () => {
  const {
    isAccountOpen,
    closeAccount,
    user,
    isAdmin,
    myOrders,
    signIn,
    register,
    resetPassword,
    logout,
    openTracking,
    openAdmin,
  } = useStore();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isAccountOpen) return null;

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrorMsg('');
    setInfoMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'register') {
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        await register(name, email, password, phone);
      } else {
        await resetPassword(email);
        setInfoMsg(`We sent a password reset link to ${email}. Please check your inbox and spam folder.`);
      }
      setPassword('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const title = user ? 'My Account' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Reset Password';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-[#FAF8F5] w-full max-w-2xl rounded-3xl border border-[#EAE3D8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#EAE3D8] bg-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#C9A25D]" />
            <h2 className="font-serif text-xl font-medium text-[#1C1815]">{title}</h2>
          </div>
          <button
            onClick={closeAccount}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!user ? (
            <div className="max-w-md mx-auto space-y-5 py-2">
              <p className="text-xs font-sans text-[#8C7662] text-center">
                {mode === 'login' && 'Sign in to see your orders and check out faster.'}
                {mode === 'register' && 'Create an account to track all your orders in one place.'}
                {mode === 'reset' && 'Enter your email and we will send you a link to set a new password.'}
              </p>

              {errorMsg && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">{errorMsg}</div>}
              {infoMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">{infoMsg}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <>
                    <label className="block">
                      <span className="block text-xs font-medium text-stone-700 mb-1">Full name</span>
                      <input type="text" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-medium text-stone-700 mb-1">Mobile number (optional)</span>
                      <input type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0300 1234567" className={inputCls} />
                    </label>
                  </>
                )}

                <label className="block">
                  <span className="block text-xs font-medium text-stone-700 mb-1">Email</span>
                  <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
                </label>

                {mode !== 'reset' && (
                  <label className="block">
                    <span className="block text-xs font-medium text-stone-700 mb-1">Password</span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={inputCls}
                    />
                  </label>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                </button>
              </form>

              <div className="text-center space-y-2 text-xs font-sans text-[#8C7662]">
                {mode === 'login' && (
                  <>
                    <button onClick={() => switchMode('reset')} className="underline hover:text-[#1C1815] cursor-pointer block mx-auto">Forgot password?</button>
                    <button onClick={() => switchMode('register')} className="underline hover:text-[#1C1815] cursor-pointer block mx-auto">New here? Create an account</button>
                  </>
                )}
                {mode !== 'login' && (
                  <button onClick={() => switchMode('login')} className="underline hover:text-[#1C1815] cursor-pointer">Back to sign in</button>
                )}
              </div>

              <p className="text-[11px] text-stone-400 text-center">
                You don't need an account to order — guest checkout works too.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#EAE3D8] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FAF6ED] border border-[#C9A25D]/40 flex items-center justify-center font-serif text-lg font-bold text-[#C9A25D]">
                    {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#1C1815]">{user.displayName || 'Welcome'}</h3>
                    <p className="text-xs font-sans text-stone-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => {
                        closeAccount();
                        openAdmin();
                      }}
                      className="px-4 py-2 bg-[#1C1815] text-white rounded-xl text-xs font-sans font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C9A25D]" />
                      Admin panel
                    </button>
                  )}
                  <button
                    onClick={logout}
                    className="px-4 py-2 border border-stone-200 hover:border-stone-400 text-stone-600 rounded-xl text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#8C7662]">My orders ({myOrders.length})</h4>
                {myOrders.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE3D8] space-y-2">
                    <Package className="w-8 h-8 text-stone-300 mx-auto" />
                    <p className="font-serif text-base text-[#1C1815]">No orders yet</p>
                    <p className="text-xs font-sans text-stone-400">Orders you place while signed in will appear here.</p>
                  </div>
                ) : (
                  myOrders.map(order => (
                    <div key={order.id} className="p-5 bg-white rounded-2xl border border-[#EAE3D8] space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F3EFEA] pb-3">
                        <div>
                          <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Order</span>
                          <p className="font-mono text-xs font-bold text-[#1C1815]">{order.id}</p>
                          <p className="text-[10px] text-stone-400">{new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Total (COD)</span>
                          <p className="font-serif text-sm font-bold text-[#1C1815]">{formatPKR(order.totalAmount)}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[11px] font-sans font-semibold rounded-full uppercase border ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : order.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {order.status === 'delivered' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </div>

                      <div className="divide-y divide-[#F3EFEA]">
                        {order.items.map((item, i) => (
                          <div key={i} className="py-2 flex items-center justify-between text-xs font-sans">
                            <div className="flex items-center gap-3">
                              {item.productImage && <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded" />}
                              <div>
                                <p className="font-serif font-medium">{item.productName}</p>
                                <p className="text-[10px] text-stone-400">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-medium">{formatPKR(item.total)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            closeAccount();
                            openTracking(order.id);
                          }}
                          className="text-xs font-sans text-[#C9A25D] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          Track order <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

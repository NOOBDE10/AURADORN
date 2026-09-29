import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  User, 
  Package, 
  Heart, 
  LogOut, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Crown,
  Sparkles
} from 'lucide-react';
import { LoyaltyBadge } from './LoyaltyBadge';

export const CustomerAccountModal: React.FC = () => {
  const { 
    isAccountOpen, 
    closeAccount, 
    user, 
    orders, 
    loginUser, 
    registerUser, 
    logoutUser, 
    openWishlist,
    openTracking,
    showToast
  } = useStore();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'privileges'>('orders');

  if (!isAccountOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isLoginMode) {
        await loginUser(email, password);
      } else {
        await registerUser(email, password, displayName);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please verify credentials.');
    }
  };

  // Filter orders for logged-in user or guest matching user email
  const userOrders = user 
    ? orders.filter(o => o.customerId === user.uid || Boolean(user.email && o.email && o.email.toLowerCase() === user.email.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-[#0E0D0B] text-[#FAF7F2] w-full max-w-2xl rounded-3xl border border-[#2E2822] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#241F1A] bg-[#0A0908] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#C9A25D] bg-[#0E0D0B] shrink-0 p-0.5 shadow-sm">
              <img 
                src="/logo.png" 
                alt="AA JEWELLERS" 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <h2 className="font-serif text-lg font-medium text-[#FAF7F2]">
              {user ? 'Private Patron Lounge' : isLoginMode ? 'Patron Sign In' : 'Create Patron Account'}
            </h2>
          </div>
          <button
            onClick={closeAccount}
            className="p-2 rounded-full hover:bg-[#1E1B17] text-stone-400 hover:text-[#FAF7F2] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div data-lenis-prevent className="p-6 overflow-y-auto">
          {!user ? (
            /* Auth Form */
            <div className="max-w-md mx-auto space-y-6 py-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C9A25D] bg-[#0A0908] mx-auto p-0.5 shadow-[0_0_20px_rgba(201,162,93,0.3)]">
                <img 
                  src="/logo.png" 
                  alt="AA JEWELLERS" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.svg'; }} 
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-serif text-2xl text-[#FAF7F2]">
                  {isLoginMode ? 'Welcome Back to AA JEWELLERS' : 'Join Our Private Membership'}
                </h3>
                <p className="text-xs font-sans text-[#A89F91]">
                  {isLoginMode 
                    ? 'Access your commissions, saved solitaires, or sign in to the boutique.'
                    : 'Receive private previews, complimentary resizing, and order tracking.'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginMode && (
                  <div>
                    <label className="block text-xs font-sans font-medium text-stone-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Lady Vivienne"
                      className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-xs font-sans text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-sans font-medium text-stone-300 mb-1">
                    Email Address or ID
                  </label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Email or Admin ID (e.g. admin)"
                    className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-xs font-sans text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-stone-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#14120F] border border-[#26211B] rounded-xl p-3 text-xs font-sans text-[#FAF7F2] placeholder-stone-500 focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-[#C9A25D] to-[#E5C378] hover:brightness-110 text-[#0B0A08] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                >
                  {isLoginMode ? 'Sign In / Unlock' : 'Register Membership'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setErrorMsg('');
                  }}
                  className="text-xs font-sans text-[#E5C378] hover:brightness-125 underline cursor-pointer"
                >
                  {isLoginMode
                    ? "Don't have an account? Register as a patron"
                    : 'Already registered? Sign in here'}
                </button>
              </div>

              <div className="p-3 bg-[#14120F] rounded-xl border border-[#26211B] text-[11px] text-[#A89F91] text-center leading-relaxed">
                ✨ <span className="font-medium text-[#E5C378]">Atelier Staff / Owner:</span> Sign in with ID <span className="font-mono text-[#E5C378] font-semibold">admin</span> and your password to open the Vault Control Panel.
              </div>
            </div>
          ) : (
            /* Logged-in Customer Dashboard */
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-4 sm:p-6 bg-[#14120F] rounded-2xl border border-[#26211B] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#181613] border border-[#C9A25D]/40 flex items-center justify-center font-serif text-xl font-bold text-[#E5C378]">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'P')}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#FAF7F2]">
                      {user.displayName || 'Distinguished Patron'}
                    </h3>
                    <p className="text-xs font-sans text-stone-400">{user.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-sans font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified VIP Client
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={logoutUser}
                    className="px-4 py-2 border border-[#2E2822] hover:border-[#C9A25D] text-stone-300 hover:text-[#FAF7F2] rounded-xl text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#241F1A] space-x-6 text-xs font-sans uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3 border-b-2 font-medium cursor-pointer transition-colors ${
                    activeTab === 'orders' ? 'border-[#E5C378] text-[#E5C378] font-semibold' : 'border-transparent text-stone-400 hover:text-[#FAF7F2]'
                  }`}
                >
                  My Commissions & Orders ({userOrders.length})
                </button>
                <button
                  onClick={() => setActiveTab('privileges')}
                  className={`py-3 border-b-2 font-medium cursor-pointer flex items-center gap-1.5 transition-colors ${
                    activeTab === 'privileges' ? 'border-[#E5C378] text-[#E5C378] font-semibold' : 'border-transparent text-stone-400 hover:text-[#FAF7F2]'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-[#E5C378]" />
                  <span>Patron Loyalty Privileges</span>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {userOrders.length === 0 ? (
                    <div className="p-8 text-center bg-[#14120F] rounded-2xl border border-[#26211B] space-y-2">
                      <Package className="w-8 h-8 text-stone-600 mx-auto" />
                      <p className="font-serif text-base text-[#FAF7F2]">No commissions recorded yet</p>
                      <p className="text-xs font-sans text-stone-400">
                        When you place Cash on Delivery orders, they will appear here with live tracking.
                      </p>
                    </div>
                  ) : (
                    userOrders.map(order => (
                      <div key={order.id} className="p-5 bg-[#14120F] rounded-2xl border border-[#26211B] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#241F1A] pb-3">
                          <div>
                            <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Order Reference</span>
                            <p className="font-mono text-xs font-bold text-[#E5C378]">{order.id}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Total (COD)</span>
                            <p className="font-serif text-sm font-bold text-[#FAF7F2]">${order.totalAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="px-2.5 py-1 text-[11px] font-sans font-semibold rounded-full uppercase bg-amber-950/80 text-amber-300 border border-amber-500/30">
                              {order.status || order.orderStatus}
                            </span>
                          </div>
                        </div>

                        {/* Items in this order */}
                        <div className="divide-y divide-[#241F1A]">
                          {order.items.map((item, i) => (
                            <div key={i} className="py-2 flex items-center justify-between text-xs font-sans">
                              <div className="flex items-center gap-3">
                                <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded border border-[#26211B] bg-[#181613]" />
                                <div>
                                  <p className="font-serif font-medium text-[#FAF7F2]">{item.productName}</p>
                                  <p className="text-[10px] text-[#A89F91]">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="font-medium text-[#E5C378]">${item.total.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => {
                              closeAccount();
                              openTracking(order.id);
                            }}
                            className="text-xs font-sans text-[#E5C378] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <span>Track Live Vault Dispatch</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Patron Privileges & Loyalty Badges Guide */}
              {activeTab === 'privileges' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-[#14120F] text-[#FAF7F2] rounded-2xl border border-[#C9A25D]/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#E5C378]" />
                      <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#E5C378] font-bold">
                        Privilege Circle Tier: Gold Patron
                      </span>
                    </div>
                    <h4 className="font-serif text-base text-[#FAF7F2]">
                      Exclusive Vault & Limited Edition Allocation
                    </h4>
                    <p className="text-xs font-sans text-[#A89F91] leading-relaxed">
                      As a registered patron of AA JEWELERS, your account grants you private viewing rights to numbered limited edition pieces, bespoke heirloom casting, and complimentary courier insurance.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                    <div className="p-3.5 bg-[#14120F] rounded-xl border border-[#26211B] space-y-1">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-[#E5C378]" />
                        <span className="font-serif font-semibold text-[#FAF7F2]">Vault Exclusive Pieces</span>
                      </div>
                      <p className="text-[#A89F91] text-[11px] leading-relaxed">
                        Micro-batches of fewer than 5 creations worldwide with 3X Patron Points and complimentary white-glove delivery.
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#14120F] rounded-xl border border-[#26211B] space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#E5C378]" />
                        <span className="font-serif font-semibold text-[#FAF7F2]">Numbered Limited Editions</span>
                      </div>
                      <p className="text-[#A89F91] text-[11px] leading-relaxed">
                        Individually registered serial certificates, custom velvet trousseau boxes, and priority Cash on Delivery dispatch.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

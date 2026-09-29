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
  ShieldCheck
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-[#FAF8F5] w-full max-w-2xl rounded-3xl border border-[#EAE3D8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE3D8] bg-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#C9A25D]" />
            <h2 className="font-serif text-xl font-medium text-[#1C1815]">
              {user ? 'Private Patron Lounge' : isLoginMode ? 'Patron Sign In' : 'Create Patron Account'}
            </h2>
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
            /* Auth Form */
            <div className="max-w-md mx-auto space-y-6 py-4">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-2xl text-[#1C1815]">
                  {isLoginMode ? 'Welcome Back to Aura & Carat' : 'Join Our Private Membership'}
                </h3>
                <p className="text-xs font-sans text-[#8C7662]">
                  {isLoginMode 
                    ? 'Access your commissions, saved solitaires, and bespoke order logs.'
                    : 'Receive private previews, complimentary resizing, and order tracking.'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginMode && (
                  <div>
                    <label className="block text-xs font-sans font-medium text-stone-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Lady Vivienne"
                      className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-xs font-sans focus:outline-none focus:border-[#C9A25D]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-sans font-medium text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patron@auracarat.com"
                    className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-xs font-sans focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-medium text-stone-700 mb-1">
                    Secret Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#EAE3D8] rounded-xl p-3 text-xs font-sans focus:outline-none focus:border-[#C9A25D]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#1C1815] hover:bg-[#C9A25D] text-white hover:text-[#1C1815] font-sans text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                >
                  {isLoginMode ? 'Access Patron Portal' : 'Register Membership'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setErrorMsg('');
                  }}
                  className="text-xs font-sans text-[#8C7662] hover:text-[#1C1815] underline cursor-pointer"
                >
                  {isLoginMode
                    ? "Don't have an account? Register as a patron"
                    : 'Already registered? Sign in here'}
                </button>
              </div>
            </div>
          ) : (
            /* Logged-in Customer Dashboard */
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-4 sm:p-6 bg-white rounded-2xl border border-[#EAE3D8] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#FAF6ED] border border-[#C9A25D]/40 flex items-center justify-center font-serif text-xl font-bold text-[#C9A25D]">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'P')}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#1C1815]">
                      {user.displayName || 'Distinguished Patron'}
                    </h3>
                    <p className="text-xs font-sans text-stone-500">{user.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-sans font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified VIP Client
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={logoutUser}
                    className="px-4 py-2 border border-stone-200 hover:border-stone-400 text-stone-600 rounded-xl text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#EAE3D8] space-x-6 text-xs font-sans uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3 border-b-2 font-medium cursor-pointer ${
                    activeTab === 'orders' ? 'border-[#C9A25D] text-[#C9A25D] font-semibold' : 'border-transparent text-stone-500'
                  }`}
                >
                  My Commissions & Orders ({userOrders.length})
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {userOrders.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-[#EAE3D8] space-y-2">
                      <Package className="w-8 h-8 text-stone-300 mx-auto" />
                      <p className="font-serif text-base text-[#1C1815]">No commissions recorded yet</p>
                      <p className="text-xs font-sans text-stone-400">
                        When you place Cash on Delivery orders, they will appear here with live tracking.
                      </p>
                    </div>
                  ) : (
                    userOrders.map(order => (
                      <div key={order.id} className="p-5 bg-white rounded-2xl border border-[#EAE3D8] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#F3EFEA] pb-3">
                          <div>
                            <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Order Reference</span>
                            <p className="font-mono text-xs font-bold text-[#1C1815]">{order.id}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-sans text-stone-400 tracking-wider">Total (COD)</span>
                            <p className="font-serif text-sm font-bold text-[#1C1815]">${order.totalAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="px-2.5 py-1 text-[11px] font-sans font-semibold rounded-full uppercase bg-amber-50 text-amber-800 border border-amber-200">
                              {order.status || order.orderStatus}
                            </span>
                          </div>
                        </div>

                        {/* Items in this order */}
                        <div className="divide-y divide-[#F3EFEA]">
                          {order.items.map((item, i) => (
                            <div key={i} className="py-2 flex items-center justify-between text-xs font-sans">
                              <div className="flex items-center gap-3">
                                <img src={item.productImage} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                                <div>
                                  <p className="font-serif font-medium">{item.productName}</p>
                                  <p className="text-[10px] text-stone-400">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="font-medium">${item.total.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => {
                              closeAccount();
                              openTracking(order.id);
                            }}
                            className="text-xs font-sans text-[#C9A25D] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

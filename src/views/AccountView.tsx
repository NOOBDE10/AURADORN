import React from 'react';
import { useShop } from '../context/ShopContext';
import { User, Package, MapPin, Heart, LogOut, ArrowRight, Truck } from 'lucide-react';

export const AccountView: React.FC = () => {
  const { currentUser, orders, wishlist, logout, navigateTo } = useShop();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <p className="text-stone-300">You are not logged in.</p>
        <button
          onClick={() => navigateTo('home')}
          className="px-6 py-2.5 bg-[#D4AF37] text-black text-xs font-semibold uppercase tracking-wider rounded-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  const userOrders = orders.filter(
    (o) =>
      o.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      o.customerPhone === currentUser.phone
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#C5A059]/30 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium">
            Personal Concierge Portal
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-white tracking-wide">
            WELCOME, {currentUser.name.toUpperCase()}
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Account Email: <strong className="text-white">{currentUser.email}</strong> • Member since{' '}
            {new Date(currentUser.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-stone-900 border border-stone-700 hover:border-red-500 hover:text-red-400 text-stone-300 text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Account Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0C0C0C] border border-[#C5A059]/30 rounded-xs p-5 space-y-2">
          <Package className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Consignments</h3>
          <p className="text-2xl font-mono font-bold text-white">{userOrders.length} Orders</p>
        </div>

        <div className="bg-[#0C0C0C] border border-[#C5A059]/30 rounded-xs p-5 space-y-2">
          <Heart className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Private Wishlist</h3>
          <p className="text-2xl font-mono font-bold text-white">{wishlist.length} Items</p>
        </div>

        <div className="bg-[#0C0C0C] border border-[#C5A059]/30 rounded-xs p-5 space-y-2">
          <MapPin className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Default City</h3>
          <p className="text-xl font-bold text-white">{currentUser.city || 'Pakistan'}</p>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-[#0C0C0C] border border-[#C5A059]/30 rounded-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <h3 className="text-base font-serif-luxury font-bold text-white uppercase tracking-wider">
            Your Order History ({userOrders.length})
          </h3>
          <button
            onClick={() => navigateTo('shop')}
            className="text-xs text-[#D4AF37] hover:underline font-semibold"
          >
            Explore More Garments
          </button>
        </div>

        {userOrders.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm text-stone-400">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigateTo('shop')}
              className="px-6 py-2.5 bg-[#D4AF37] text-black text-xs font-semibold uppercase tracking-widest rounded-xs"
            >
              Shop Collection
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-[#121212] border border-stone-800 rounded-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#D4AF37]">{order.orderNumber}</span>
                    <span className="text-stone-500 text-xs ml-3">
                      {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 rounded-xs">
                      {order.status}
                    </span>
                    <span className="font-mono font-bold text-white text-xs">
                      PKR {order.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-stone-800/50">
                  {order.items.map((it) => (
                    <div key={it.id} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={it.product.images[0]}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-8 h-10 object-cover rounded-xs"
                        />
                        <span className="text-white">{it.product.name} ({it.size})</span>
                      </div>
                      <span className="text-stone-400">Qty: {it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => navigateTo('track-order')}
                    className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Live Delivery</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Order, Product, CustomGiftBox, User } from '../types.ts';
import { Package, Heart, Box, Clock, ChevronRight, Truck, CheckCircle2, RotateCcw } from 'lucide-react';

interface UserAccountProps {
  orders: Order[];
  wishlistProducts: Product[];
  savedBoxes: CustomGiftBox[];
  onAddToCart: (item: Product) => void;
  onAddBoxToCart: (box: CustomGiftBox) => void;
  onOpenBoxBuilderWithBox: (box: CustomGiftBox) => void;
  onRetryPayment: (order: Order) => void;
  currentUser?: User;
}

export const UserAccount: React.FC<UserAccountProps> = ({
  orders,
  wishlistProducts,
  savedBoxes,
  onAddToCart,
  onAddBoxToCart,
  onOpenBoxBuilderWithBox,
  onRetryPayment,
  currentUser = {
    id: 'user-demo-1',
    name: 'Ateeb Ahmad',
    email: 'ateebahmad298@gmail.com',
    role: 'user',
    phone: '+91 98765 43210',
    addresses: [
      {
        address: 'Flat 402, Rose Petal Court, Linking Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400050',
      },
    ],
    createdAt: new Date().toISOString(),
  },
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'saved_boxes' | 'profile'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#FFC0CB]/30 via-[#F8BBD0]/40 to-[#E6D6FF]/40 rounded-3xl p-6 sm:p-8 border border-[#F8BBD0]/50 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-xs flex items-center justify-center text-3xl shrink-0">
            🎀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#59434D]">
                {currentUser.name}
              </h1>
              <span className="text-[11px] font-medium text-[#C45A7A] bg-white px-2.5 py-0.5 rounded-full border border-[#F8BBD0]">
                Pookie VIP Member 💖
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{currentUser.email} • {currentUser.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="bg-white/80 backdrop-blur-xs px-4 py-2 rounded-2xl border border-[#F8BBD0]/50 text-center">
            <span className="block font-bold text-[#C45A7A] tabular-nums text-base">{orders.length}</span>
            <span className="text-gray-400 uppercase text-[10px]">Orders</span>
          </div>
          <div className="bg-white/80 backdrop-blur-xs px-4 py-2 rounded-2xl border border-[#F8BBD0]/50 text-center">
            <span className="block font-bold text-[#C45A7A] tabular-nums text-base">{wishlistProducts.length}</span>
            <span className="text-gray-400 uppercase text-[10px]">Saved</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#F8BBD0]/30 pb-2 overflow-x-auto">
        {[
          { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
          { id: 'wishlist', label: `My Wishlist (${wishlistProducts.length})`, icon: Heart },
          { id: 'saved_boxes', label: `Saved 3D Boxes (${savedBoxes.length})`, icon: Box },
          { id: 'profile', label: 'Account & Addresses', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#C45A7A] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:text-[#C45A7A] border border-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#F8BBD0] space-y-3">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-semibold text-[#59434D]">No orders placed yet</h3>
              <p className="text-xs text-gray-500">Your placed gift boxes will appear here.</p>
            </div>
          ) : (
            orders.map((ord) => {
              const isPending = ord.status === 'pending_payment';
              const isConfirmed = ord.status === 'confirmed';

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-5 border border-[#F8BBD0]/40 shadow-xs hover:border-[#C45A7A]/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-[#59434D] font-mono">{ord.orderNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'confirmed'
                            ? 'bg-pink-100 text-[#C45A7A]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-3">
                      <span>Placed: {new Date(ord.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Recipient: <strong>{ord.giftInfo.recipientName || ord.customer.fullName}</strong></span>
                      <span>•</span>
                      <span className="font-bold text-[#C45A7A] tabular-nums font-serif">
                        ₹{ord.total.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-400 pt-1 line-clamp-1">
                      Items: {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {isPending && (
                      <button
                        onClick={() => onRetryPayment(ord)}
                        className="py-1.5 px-3 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Complete Payment
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="py-1.5 px-3 rounded-xl text-xs font-semibold text-[#C45A7A] bg-[#FFF0F5] hover:bg-[#F8BBD0]/40 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Track & View Receipt <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-[#F8BBD0] space-y-2">
              <Heart className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-semibold text-[#59434D]">Your wishlist is empty</h4>
              <p className="text-xs text-gray-500">Tap the heart on any gift to save it here.</p>
            </div>
          ) : (
            wishlistProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-[#F8BBD0]/40 p-4 space-y-3 shadow-xs">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full aspect-4/3 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <h4 className="text-xs font-semibold text-[#59434D] truncate">{p.name}</h4>
                <div className="text-xs font-bold text-[#C45A7A] tabular-nums">₹{p.price}</div>
                <button
                  onClick={() => onAddToCart(p)}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] cursor-pointer"
                >
                  Add to Cart
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Saved 3D Boxes */}
      {activeTab === 'saved_boxes' && (
        <div className="space-y-4">
          {savedBoxes.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#F8BBD0] space-y-2">
              <Box className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-semibold text-[#59434D]">No custom 3D boxes saved</h4>
              <p className="text-xs text-gray-500">
                Create a box in our 3D builder and click "Save Box" to keep it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedBoxes.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-[#F8BBD0]/50 p-5 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[#59434D]">{b.name}</h4>
                    <span className="text-sm font-bold text-[#C45A7A] font-serif tabular-nums">
                      ₹{b.totalPrice}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    For: <strong>{b.recipientName || 'Special Someone'}</strong> • Ribbon: {b.ribbonStyle}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => onOpenBoxBuilderWithBox(b)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-[#C45A7A] bg-[#FFF0F5] hover:bg-[#F8BBD0]/30 border border-[#F8BBD0] cursor-pointer"
                    >
                      Inspect in 3D
                    </button>
                    <button
                      onClick={() => onAddBoxToCart(b)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Profile & Addresses */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-[#F8BBD0]/50 shadow-xs max-w-xl space-y-4">
          <h3 className="text-sm font-semibold text-[#59434D]">Saved Addresses</h3>
          <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#F8BBD0] text-xs space-y-1">
            <span className="font-semibold text-[#C45A7A] block uppercase text-[10px]">Default Home</span>
            <p className="font-medium text-[#59434D]">{currentUser.name}</p>
            <p className="text-gray-500">Flat 402, Rose Petal Court, Linking Road</p>
            <p className="text-gray-500">Mumbai, Maharashtra - 400050</p>
            <p className="text-gray-500">Phone: {currentUser.phone}</p>
          </div>
        </div>
      )}

      {/* Order Details & Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl border border-[#F8BBD0]">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[11px] text-gray-500 uppercase">Order Details</span>
                <h3 className="text-base font-bold text-[#59434D]">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tracking Status Timeline */}
            <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#F8BBD0]/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#C45A7A] flex items-center gap-1.5">
                  <Truck className="w-4 h-4" /> Live Tracking
                </span>
                <span className="text-xs font-bold uppercase text-[#59434D]">
                  {selectedOrder.status.replace('_', ' ')}
                </span>
              </div>

              {selectedOrder.tracking?.trackingNumber && (
                <div className="text-xs text-gray-600">
                  Courier: <strong>{selectedOrder.tracking.courier}</strong> • AWB:{' '}
                  <strong className="font-mono">{selectedOrder.tracking.trackingNumber}</strong>
                </div>
              )}

              {/* Status history milestones */}
              <div className="space-y-2 pt-2 border-t border-[#F8BBD0]/30 text-xs text-gray-500">
                {selectedOrder.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C45A7A] mt-1 shrink-0" />
                    <div>
                      <span className="font-semibold text-[#59434D] uppercase text-[10px]">{h.status}</span>
                      <p className="text-[11px] text-gray-600">{h.note}</p>
                      <span className="text-[9px] text-gray-400">{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#59434D]">Included Surprises</h4>
              {selectedOrder.items.map((it) => (
                <div key={it.id} className="p-3 rounded-xl border border-gray-100 flex justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#59434D]">{it.name} (x{it.quantity})</span>
                    {it.customBoxSnapshot && (
                      <div className="text-[10px] text-gray-400 mt-1">
                        Recipient: {it.customBoxSnapshot.recipientName} • Note: "{it.customBoxSnapshot.personalizedMessage}"
                      </div>
                    )}
                  </div>
                  <span className="font-bold tabular-nums text-[#C45A7A]">₹{it.total}</span>
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="border-t pt-3 flex justify-between items-baseline text-sm font-bold">
              <span>Total Paid:</span>
              <span className="text-lg text-[#C45A7A] font-serif tabular-nums">
                ₹{selectedOrder.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

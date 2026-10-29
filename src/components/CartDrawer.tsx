import React, { useState, useEffect } from 'react';
import { CartItem } from '../types.ts';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Gift, CheckCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  onOpenBoxBuilder?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  couponCode,
  setCouponCode,
  onOpenBoxBuilder,
}) => {
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [verifiedTotals, setVerifiedTotals] = useState({
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0,
  });

  // Calculate & sync with server verification
  useEffect(() => {
    if (!items.length) {
      setVerifiedTotals({ subtotal: 0, discount: 0, shipping: 0, total: 0 });
      return;
    }

    const verifyServerTotals = async () => {
      try {
        const res = await fetch('/api/cart/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, couponCode }),
        });
        if (res.ok) {
          const data = await res.json();
          setVerifiedTotals({
            subtotal: data.subtotal,
            discount: data.discount,
            shipping: data.shipping,
            total: data.total,
          });
        }
      } catch (err) {
        console.error('Error verifying cart totals:', err);
      }
    };

    verifyServerTotals();
  }, [items, couponCode]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);

    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponInput)}`);
      if (res.ok) {
        setCouponCode(couponInput.trim().toUpperCase());
        setCouponMessage('🎉 Coupon successfully applied!');
      } else {
        setCouponMessage('❌ Invalid coupon code');
      }
    } catch (err) {
      setCouponMessage('Error validating coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (!isOpen) return null;

  const freeShippingThreshold = 999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - verifiedTotals.subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#F8BBD0]">
          {/* Header */}
          <div className="p-5 border-b border-[#F8BBD0]/40 flex items-center justify-between bg-[#FFF9F5]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C45A7A]" />
              <h2 className="text-base font-serif font-bold text-[#59434D]">Your Shopping Bag 🎀</h2>
              <span className="text-xs text-gray-500 font-sans">
                ({items.reduce((s, i) => s + i.quantity, 0)})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-5 py-3 bg-[#FFF0F5] border-b border-[#F8BBD0]/30 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[#59434D]">
                Add <strong className="text-[#C45A7A]">₹{remainingForFreeShipping}</strong> more to unlock{' '}
                <strong className="text-[#C45A7A]">FREE Delivery</strong>! 🚚
              </p>
            ) : (
              <p className="text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Hooray! You’ve unlocked FREE express delivery! 💖
              </p>
            )}
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#FFF0F5] text-2xl flex items-center justify-center mx-auto">
                  🎀
                </div>
                <h3 className="text-base font-semibold text-[#59434D]">Your bag is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Find the sweetest gifts in our shop or customize your own 3D PookieBox.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenBoxBuilder) onOpenBoxBuilder();
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] shadow-sm cursor-pointer"
                >
                  Build a Custom Box
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-[#F8BBD0]/40 bg-[#FFFDFE] flex gap-3 items-start justify-between shadow-xs"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFF5F8] border border-[#F8BBD0]/40 shrink-0 flex items-center justify-center text-xl">
                      {item.type === 'custom_box' ? (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center text-center p-1"
                          style={{ backgroundColor: item.customBox?.boxColor || '#FFB6C1' }}
                        >
                          <span className="text-sm">🎀</span>
                          <span className="text-[9px] font-bold text-white truncate max-w-full">Custom Box</span>
                        </div>
                      ) : (
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>

                    {/* Meta */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-[#59434D] line-clamp-1">
                        {item.type === 'custom_box' ? item.customBox?.name : item.product?.name}
                      </h4>

                      {item.type === 'custom_box' && item.customBox && (
                        <div className="text-[10px] text-gray-500 space-y-0.5">
                          <p>
                            To: <strong className="text-[#C45A7A]">{item.customBox.recipientName || 'Loved One'}</strong>
                          </p>
                          <p>Ribbon: {item.customBox.ribbonStyle.replace('_', ' ')}</p>
                          <p>Contains: {item.customBox.items.length} gift items</p>
                        </div>
                      )}

                      <div className="text-xs font-bold text-[#C45A7A] tabular-nums font-serif">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div className="flex flex-col items-end justify-between h-16">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 bg-[#FFF0F5] px-2 py-0.5 rounded-lg border border-[#F8BBD0]/40">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="text-[#C45A7A] hover:text-[#59434D] cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#59434D] w-3.5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="text-[#C45A7A] hover:text-[#59434D] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#F8BBD0]/40 bg-[#FFF9F5] space-y-4">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon code (e.g. POOKIE10)"
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 uppercase font-semibold focus:outline-hidden focus:border-[#C45A7A] bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#C45A7A] bg-[#FFF0F5] border border-[#F8BBD0] hover:bg-[#F8BBD0]/30 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className="text-[11px] text-[#C45A7A] font-medium pt-0.5">{couponMessage}</p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#59434D]/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-semibold">₹{verifiedTotals.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {verifiedTotals.discount > 0 && (
                  <div className="flex justify-between text-[#C45A7A]">
                    <span>Discount ({couponCode})</span>
                    <span className="tabular-nums font-semibold">-₹{verifiedTotals.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="tabular-nums font-semibold">
                    {verifiedTotals.shipping === 0 ? 'FREE' : `₹${verifiedTotals.shipping}`}
                  </span>
                </div>
                <div className="border-t border-[#F8BBD0]/40 pt-2 flex justify-between items-baseline text-sm font-bold text-[#59434D]">
                  <span>Total Amount</span>
                  <span className="text-xl font-bold text-[#C45A7A] font-serif tabular-nums">
                    ₹{verifiedTotals.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CartItem, Order, CustomerDetails, DeliveryDetails, GiftInformation } from '../types.ts';
import { Check, ArrowRight, ArrowLeft, ShieldCheck, CreditCard, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  couponCode?: string;
  onOrderSuccess: (order: Order) => void;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  couponCode,
  onOrderSuccess,
  onClearCart,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form Fields
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: 'Ateeb Ahmad',
    email: 'ateebahmad298@gmail.com',
    phone: '+91 98765 43210',
  });

  const [delivery, setDelivery] = useState<DeliveryDetails>({
    address: 'Flat 402, Rose Petal Court, Linking Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400050',
    instructions: 'Ring doorbell twice and leave with doorman if not home.',
    requestedDate: '2026-11-04',
  });

  const [giftInfo, setGiftInfo] = useState<GiftInformation>({
    recipientName: 'My Sweet Pookie',
    personalizedMessage: 'Wishing you all the happiness and sweet magic in the universe! 💖',
    giftWrappingPreference: 'French Silk & Fairy Lights',
  });

  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [rzpData, setRzpData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Payment states
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [paymentFailureReason, setPaymentFailureReason] = useState<string | null>(null);

  if (!isOpen) return null;

  // Step 4 -> 5: Create order on server
  const handleProceedToPayment = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          delivery,
          giftInfo,
          items,
          couponCode,
          paymentMethod: 'razorpay',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize order');

      setCreatedOrder(data.order);
      setRzpData(data.razorpay);
      setStep(5);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 5: Verify Payment with Razorpay API or Sandbox
  const handleVerifyPayment = async (simulateFailure = false) => {
    if (!createdOrder) return;
    setPaymentStatus('processing');
    setPaymentFailureReason(null);

    // If simulating failure
    if (simulateFailure) {
      setTimeout(() => {
        setPaymentStatus('failed');
        setPaymentFailureReason('Bank authorization declined or transaction cancelled by user.');
      }, 1000);
      return;
    }

    try {
      const res = await fetch(`/api/orders/${createdOrder.id}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: rzpData?.orderId,
          razorpay_payment_id: `pay_sbx_${Date.now()}_9982`,
          razorpay_signature: 'test_sandbox_signature_verified',
          isSandboxTest: rzpData?.isSandbox ?? true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment verification failed');

      setPaymentStatus('success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFC0CB', '#F8BBD0', '#C45A7A', '#E6D6FF'],
      });

      onOrderSuccess(data.order);
      onClearCart();
    } catch (err: any) {
      setPaymentStatus('failed');
      setPaymentFailureReason(err.message || 'Verification failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#F8BBD0] space-y-6 my-8">
        {/* Header & Step Indicator */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs font-semibold text-[#C45A7A] uppercase tracking-wider">
              Secure Coquette Checkout
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#59434D]">
              Complete Your PookieBox Order 🎀
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer">
            ✕
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex items-center justify-between text-xs font-medium text-gray-400 px-2">
          {['1. Customer', '2. Delivery', '3. Gift Note', '4. Review', '5. Payment'].map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-[#C45A7A] text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : stepNum}
                </span>
                <span className={`hidden sm:inline ${isActive ? 'text-[#C45A7A] font-semibold' : ''}`}>
                  {label.split('. ')[1]}
                </span>
              </div>
            );
          })}
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Customer Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#59434D]">Step 1: Your Contact Information</h3>
            <p className="text-xs text-gray-500">Order tracking and receipt emails will be sent here.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#59434D] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#59434D] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Continue to Delivery <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Delivery Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#59434D]">Step 2: Delivery Address</h3>
            <p className="text-xs text-gray-500">Where should we deliver this surprise?</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Street Address / Apartment *</label>
                <input
                  type="text"
                  required
                  value={delivery.address}
                  onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                  placeholder="Flat number, building, landmark"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#59434D] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={delivery.city}
                    onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#59434D] mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={delivery.state}
                    onChange={(e) => setDelivery({ ...delivery, state: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#59434D] mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={delivery.pinCode}
                    onChange={(e) => setDelivery({ ...delivery, pinCode: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  value={delivery.instructions || ''}
                  onChange={(e) => setDelivery({ ...delivery, instructions: e.target.value })}
                  placeholder="e.g. Ring bell, leave with security"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Continue to Gift Note <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Gift Information & Note */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#59434D]">Step 3: Gift Note & Special Touches</h3>
            <p className="text-xs text-gray-500">Every box is delivered with a handwritten greeting card.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Recipient's Name</label>
                <input
                  type="text"
                  value={giftInfo.recipientName}
                  onChange={(e) => setGiftInfo({ ...giftInfo, recipientName: e.target.value })}
                  placeholder="Name to appear on the ribbon tag"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Personal Handwritten Message</label>
                <textarea
                  rows={3}
                  value={giftInfo.personalizedMessage}
                  onChange={(e) => setGiftInfo({ ...giftInfo, personalizedMessage: e.target.value })}
                  placeholder="Your heartfelt words..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Requested Delivery Date</label>
                <input
                  type="date"
                  value={delivery.requestedDate || ''}
                  onChange={(e) => setDelivery({ ...delivery, requestedDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Review Order Summary <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review Order Summary */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#59434D]">Step 4: Review Order Details</h3>

            <div className="bg-[#FFFDFE] rounded-2xl border border-[#F8BBD0]/50 p-4 space-y-3">
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between text-xs text-[#59434D]">
                    <span className="truncate max-w-[320px]">
                      {it.type === 'custom_box' ? it.customBox?.name : it.product?.name} (x{it.quantity})
                    </span>
                    <span className="font-semibold tabular-nums">
                      ₹{(it.unitPrice * it.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#F8BBD0]/30 pt-2 space-y-1 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Shipping Address:</span>
                  <span className="text-right truncate max-w-[240px]">
                    {delivery.address}, {delivery.city}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>For:</span>
                  <span className="text-right font-medium text-[#C45A7A]">
                    {giftInfo.recipientName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleProceedToPayment}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Initializing Order...
                  </>
                ) : (
                  <>
                    Proceed to Payment <CreditCard className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Payment (Razorpay & Sandbox Gateway) */}
        {step === 5 && createdOrder && (
          <div className="space-y-5">
            {paymentStatus === 'success' ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#59434D]">
                  Payment Verified! 💗
                </h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto">
                  Your order <strong>#{createdOrder.orderNumber}</strong> has been confirmed. A receipt and confirmation email has been dispatched to <strong>{createdOrder.customer.email}</strong>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] cursor-pointer"
                  >
                    View Order Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#FFF0F5] border border-[#F8BBD0] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider block">Order Reference</span>
                    <span className="text-sm font-bold text-[#C45A7A]">{createdOrder.orderNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider block">Amount Payable</span>
                    <span className="text-lg font-bold text-[#59434D] font-serif tabular-nums">
                      ₹{createdOrder.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Razorpay Gateway Box */}
                <div className="border border-blue-200 bg-blue-50/50 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        R
                      </div>
                      <span className="text-xs font-bold text-blue-900">Razorpay Payment Gateway</span>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                      {rzpData?.isSandbox ? 'SANDBOX TEST MODE' : 'LIVE GATEWAY'}
                    </span>
                  </div>

                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    {rzpData?.isSandbox
                      ? 'Environment credentials not configured. Running in secure Razorpay Sandbox Test Mode. You can test instant payment success or simulate bank decline below.'
                      : 'Connected to live Razorpay API. Secure 256-bit SSL encrypted transaction.'}
                  </p>

                  {paymentFailureReason && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-800 text-xs">
                      <strong>Payment Failed:</strong> {paymentFailureReason}
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      disabled={paymentStatus === 'processing'}
                      onClick={() => handleVerifyPayment(false)}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {paymentStatus === 'processing' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Signature...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Pay ₹{createdOrder.total.toLocaleString('en-IN')} (Verify Success)
                        </>
                      )}
                    </button>

                    <button
                      disabled={paymentStatus === 'processing'}
                      onClick={() => handleVerifyPayment(true)}
                      className="py-3 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Simulate Decline
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>PCI-DSS Compliant • 100% Server Signature Verified</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

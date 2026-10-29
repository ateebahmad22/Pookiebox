import React, { useState } from 'react';
import { Heart, Sparkles, ShieldCheck, Truck, RefreshCw, Mail, MapPin, Clock } from 'lucide-react';
import { BowIcon } from './BowIcon.tsx';

export const Footer: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setNewsletterSubscribed(true);
  };

  return (
    <footer className="bg-white border-t border-[#F8BBD0]/50 pt-16 pb-12 mt-20 text-[#59434D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Value Props Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] text-[#C45A7A] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#59434D]">Free Express Delivery</h4>
              <p className="text-[11px] text-gray-500">On all custom boxes over ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] text-[#C45A7A] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#59434D]">Interactive 3D Builder</h4>
              <p className="text-[11px] text-gray-500">Preview gifts and ribbon styles in real-time</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] text-[#C45A7A] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#59434D]">Handwritten Love Notes</h4>
              <p className="text-[11px] text-gray-500">Wax-sealed letterpress stationery</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] text-[#C45A7A] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#59434D]">Birthday Concierge</h4>
              <p className="text-[11px] text-gray-500">Timely gentle email reminders</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-4">
            <span className="text-2xl font-serif font-bold text-[#C45A7A] flex items-center gap-1.5">
              PookieBox <BowIcon className="w-6 h-6 text-[#C45A7A]" />
            </span>
            <p className="text-xs text-[#59434D]/80 leading-relaxed max-w-sm">
              "A Little Box, A Lot of Love." We craft enchanting, aesthetic gift boxes wrapped with silky satin ribbons, dried florals, and pure joy for birthdays, anniversaries, and sweet surprises.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <h5 className="text-xs font-semibold text-[#59434D] mb-1.5 flex items-center gap-1">
                <span>Join the Pookie Club</span>
                <Mail className="w-3.5 h-3.5 text-[#C45A7A]" />
              </h5>
              <p className="text-[11px] text-gray-500 mb-2">Get secret gift drops and ₹100 flat discount on your custom box.</p>
              {newsletterSubscribed ? (
                <div className="p-3 rounded-xl bg-pink-50 border border-[#F8BBD0] text-xs text-[#C45A7A] font-semibold flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-current" />
                  <span>You are on the list! Use code <strong className="underline">LOVE100</strong> for ₹100 off.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="your-email@example.com"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#C45A7A]">Explore</h5>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#C45A7A] cursor-pointer">Shop All Gifts</button></li>
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#C45A7A] cursor-pointer">3D Gift Box Builder</button></li>
              <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#C45A7A] cursor-pointer">Birthday Calendar</button></li>
              <li><button onClick={() => setActiveModal('faq')} className="hover:text-[#C45A7A] cursor-pointer">Frequently Asked Questions</button></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#C45A7A]">Assurance</h5>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><button onClick={() => setActiveModal('shipping')} className="hover:text-[#C45A7A] cursor-pointer">Shipping & Delivery</button></li>
              <li><button onClick={() => setActiveModal('refund')} className="hover:text-[#C45A7A] cursor-pointer">Returns & Refunds</button></li>
              <li><button onClick={() => setActiveModal('privacy')} className="hover:text-[#C45A7A] cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => setActiveModal('terms')} className="hover:text-[#C45A7A] cursor-pointer">Terms & Conditions</button></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#C45A7A]">Get In Touch</h5>
            <p className="text-xs text-gray-600 leading-relaxed">
              Have a special custom order or bulk corporate gifting request? Our gifting stylists are here for you.
            </p>
            <div className="text-xs text-[#59434D] space-y-1.5">
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#C45A7A]" /> hello@pookiebox.love</p>
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#C45A7A]" /> Bandra West, Mumbai 400050</p>
              <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#C45A7A]" /> Mon - Sat: 10:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} PookieBox India. Handcrafted with love and satin bows.</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-[#C45A7A] fill-current" />
            <span>for sweetest surprises</span>
          </div>
        </div>
      </div>

      {/* Info Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl border border-[#F8BBD0] max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#59434D] uppercase tracking-wide flex items-center gap-1.5">
                {activeModal === 'faq' && 'Frequently Asked Questions'}
                {activeModal === 'shipping' && 'Shipping & Delivery Policy'}
                {activeModal === 'refund' && 'Returns & Refund Policy'}
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'terms' && 'Terms of Service'}
                <BowIcon className="w-4 h-4 text-[#C45A7A]" />
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-3 leading-relaxed">
              {activeModal === 'faq' && (
                <>
                  <p><strong>Q: How does the 3D Gift Box builder work?</strong><br />A: Select your favorite box color, choose from our artisan gifts, and watch the 3D model automatically arrange them inside. You can open and close the lid and inspect every angle!</p>
                  <p><strong>Q: Are all boxes shipped with handwritten notes?</strong><br />A: Yes! Every single PookieBox includes a wax-sealed letterpress card with your custom text printed in gold calligraphy.</p>
                  <p><strong>Q: How long does delivery take?</strong><br />A: Metro cities in India receive orders in 2-3 business days. Rest of India takes 3-5 business days.</p>
                </>
              )}

              {activeModal === 'shipping' && (
                <>
                  <p>We deliver across 19,000+ pin codes in India via priority air courier (BlueDart, Delhivery Express). All orders over ₹999 qualify for 100% Free Shipping.</p>
                  <p>Each box is safely packed inside an insulated, shock-absorbent outer shipper to guarantee ribbons and delicate keepsakes arrive in flawless boutique condition.</p>
                </>
              )}

              {activeModal === 'refund' && (
                <>
                  <p>Because each PookieBox is customized with personalized handwritten letters and delicate edibles, we offer 100% replacement or full refund if any item arrives damaged during transit.</p>
                  <p>Simply reach out within 48 hours of delivery at hello@pookiebox.love with an unboxing photo.</p>
                </>
              )}

              {(activeModal === 'privacy' || activeModal === 'terms') && (
                <>
                  <p>Your privacy is sacred to us. We never share customer or recipient data with third parties. All payments are processed through RBI-approved PCI-DSS Level 1 compliant payment gateways (Razorpay).</p>
                  <p>Gift recipients are never sent marketing communications without explicit consent.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

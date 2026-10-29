import React from 'react';
import { ShoppingBag, Heart, Shield, Sparkles, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  activeView: 'home' | 'shop' | 'builder' | 'birthdays' | 'account' | 'admin';
  setActiveView: (view: 'home' | 'shop' | 'builder' | 'birthdays' | 'account' | 'admin') => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  cartCount,
  wishlistCount,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F5]/90 backdrop-blur-md border-b border-[#F8BBD0]/50">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#FFC0CB] via-[#F8BBD0] to-[#E6D6FF] py-1.5 px-4 text-center text-[11px] font-medium text-[#59434D] tracking-wide">
        <span>🎀 Free luxury ribbon wrapping & handwritten letterpress note on all orders over ₹999! Use code <strong>POOKIE10</strong> for 10% off 💗</span>
      </div>

      {/* Main Top Bar Contract: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0"
        >
          <span className="text-xl sm:text-2xl font-serif font-bold text-[#C45A7A] tracking-tight">
            PookieBox 🎀
          </span>
        </div>

        {/* Zone 2: Navigation Links (Single-line, clean text with subtle underlines) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold tracking-wide uppercase text-[#59434D]">
          <button
            onClick={() => setActiveView('home')}
            className={`whitespace-nowrap transition-colors cursor-pointer pb-1 border-b-2 ${
              activeView === 'home' ? 'text-[#C45A7A] border-[#C45A7A]' : 'border-transparent hover:text-[#C45A7A]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveView('shop')}
            className={`whitespace-nowrap transition-colors cursor-pointer pb-1 border-b-2 ${
              activeView === 'shop' ? 'text-[#C45A7A] border-[#C45A7A]' : 'border-transparent hover:text-[#C45A7A]'
            }`}
          >
            Shop Gifts
          </button>
          <button
            onClick={() => setActiveView('builder')}
            className={`whitespace-nowrap transition-colors cursor-pointer pb-1 border-b-2 flex items-center gap-1 ${
              activeView === 'builder' ? 'text-[#C45A7A] border-[#C45A7A]' : 'border-transparent hover:text-[#C45A7A]'
            }`}
          >
            <span>Build Your Box</span>
            <span className="text-[9px] bg-[#FFF0F5] text-[#C45A7A] px-1.5 py-0.2 rounded-full border border-[#F8BBD0]">3D</span>
          </button>
          <button
            onClick={() => setActiveView('birthdays')}
            className={`whitespace-nowrap transition-colors cursor-pointer pb-1 border-b-2 ${
              activeView === 'birthdays' ? 'text-[#C45A7A] border-[#C45A7A]' : 'border-transparent hover:text-[#C45A7A]'
            }`}
          >
            Birthday Scheduler
          </button>
          <button
            onClick={() => setActiveView('account')}
            className={`whitespace-nowrap transition-colors cursor-pointer pb-1 border-b-2 ${
              activeView === 'account' ? 'text-[#C45A7A] border-[#C45A7A]' : 'border-transparent hover:text-[#C45A7A]'
            }`}
          >
            My Orders
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Wishlist, Admin Switch, Shopping Bag) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Admin Switch */}
          <button
            onClick={() => setActiveView(activeView === 'admin' ? 'home' : 'admin')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'admin'
                ? 'bg-[#59434D] text-white shadow-xs'
                : 'bg-white text-gray-500 hover:text-[#C45A7A] border border-gray-200'
            }`}
            title="Toggle Admin Atelier Dashboard"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => setActiveView('account')}
            className="relative p-2 rounded-full text-gray-600 hover:text-[#C45A7A] transition-colors cursor-pointer"
            title="My Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#C45A7A] text-white text-[10px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Bag */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#C45A7A] text-white hover:bg-[#b04867] transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-bold tabular-nums">{cartCount}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around py-2 px-3 border-t border-[#F8BBD0]/40 bg-[#FFF9F5] text-[11px] font-semibold text-[#59434D]">
        <button onClick={() => setActiveView('home')} className={activeView === 'home' ? 'text-[#C45A7A]' : ''}>
          Home
        </button>
        <button onClick={() => setActiveView('shop')} className={activeView === 'shop' ? 'text-[#C45A7A]' : ''}>
          Shop
        </button>
        <button onClick={() => setActiveView('builder')} className={activeView === 'builder' ? 'text-[#C45A7A]' : ''}>
          3D Box
        </button>
        <button onClick={() => setActiveView('birthdays')} className={activeView === 'birthdays' ? 'text-[#C45A7A]' : ''}>
          Birthdays
        </button>
        <button onClick={() => setActiveView('account')} className={activeView === 'account' ? 'text-[#C45A7A]' : ''}>
          Orders
        </button>
      </div>
    </header>
  );
};

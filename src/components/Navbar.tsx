import React from 'react';
import { ShoppingBag, Heart, Shield, Sparkles, User as UserIcon, HelpCircle, Gift } from 'lucide-react';
import { BowIcon } from './BowIcon.tsx';
import { User } from '../types.ts';

interface NavbarProps {
  activeView: 'home' | 'shop' | 'builder' | 'birthdays' | 'couple' | 'account' | 'admin';
  setActiveView: (view: 'home' | 'shop' | 'builder' | 'birthdays' | 'couple' | 'account' | 'admin') => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenQuiz?: () => void;
  onOpenSurpriseMe?: () => void;
  onOpenReferral?: () => void;
  onOpenAiAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  cartCount,
  wishlistCount,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onOpenQuiz,
  onOpenSurpriseMe,
  onOpenReferral,
  onOpenAiAssistant,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F5]/90 backdrop-blur-md border-b border-[#F8BBD0]/50">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#FFC0CB] via-[#F8BBD0] to-[#E6D6FF] py-1.5 px-4 text-center text-[11px] font-medium text-[#59434D] tracking-wide flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-1.5 mx-auto">
          <BowIcon className="w-3.5 h-3.5 text-[#C45A7A]" />
          <span>Free luxury ribbon wrapping on orders over ₹999. Use code <strong>POOKIE10</strong> for 10% off</span>
          <Sparkles className="w-3 h-3 text-[#C45A7A]" />
        </div>
        {onOpenReferral && (
          <button
            onClick={onOpenReferral}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#C45A7A] hover:underline cursor-pointer ml-2 shrink-0"
          >
            <Gift className="w-3 h-3" />
            <span>Refer & Earn ₹150</span>
          </button>
        )}
      </div>

      {/* Main Top Bar Contract: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0 group"
        >
          <span className="text-xl sm:text-2xl font-serif font-bold text-[#C45A7A] tracking-tight flex items-center gap-1.5">
            PookieBox
            <BowIcon className="w-5 h-5 text-[#C45A7A] group-hover:rotate-12 transition-transform duration-300" />
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs font-semibold tracking-wide uppercase text-[#59434D]">
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
            Birthdays
          </button>
          <button
            onClick={() => setActiveView('couple')}
            className={`whitespace-nowrap transition-colors cursor-pointer pb-1 border-b-2 flex items-center gap-1 ${
              activeView === 'couple' ? 'text-[#C45A7A] border-[#C45A7A]' : 'border-transparent hover:text-[#C45A7A]'
            }`}
          >
            <Heart className="w-3 h-3 text-[#C45A7A]" />
            <span>Couple Mode</span>
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

        {/* Zone 3: Quick Action Buttons & Secondary Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Stylist */}
          {onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-[#C45A7A] border border-[#F8BBD0] hover:bg-[#FFF0F5] shadow-2xs transition-all cursor-pointer"
              title="Chat with Pookie AI Stylist"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C45A7A]" />
              <span>AI Stylist</span>
            </button>
          )}

          {/* Surprise Me Button */}
          {onOpenSurpriseMe && (
            <button
              onClick={onOpenSurpriseMe}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FFC0CB]/60 to-[#F8BBD0]/60 text-[#59434D] hover:opacity-90 border border-[#F8BBD0] transition-all cursor-pointer"
              title="Curate an instant surprise gift box"
            >
              <BowIcon className="w-3.5 h-3.5 text-[#C45A7A]" />
              <span>Surprise Me</span>
            </button>
          )}

          {/* Gift Quiz */}
          {onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:text-[#C45A7A] transition-colors cursor-pointer"
              title="Take the Gift Finder Quiz"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#C45A7A]" />
              <span>Quiz</span>
            </button>
          )}

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

          {/* User Account / Phone Login */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-700 hover:text-[#C45A7A] border border-gray-200 hover:border-[#F8BBD0] transition-colors cursor-pointer"
            title="Login with Phone OTP"
          >
            <UserIcon className="w-3.5 h-3.5 text-[#C45A7A]" />
            <span className="hidden sm:inline max-w-[85px] truncate">
              {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
            </span>
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
      <div className="lg:hidden flex items-center justify-around py-2 px-3 border-t border-[#F8BBD0]/40 bg-[#FFF9F5] text-[11px] font-semibold text-[#59434D]">
        <button onClick={() => setActiveView('home')} className={activeView === 'home' ? 'text-[#C45A7A]' : ''}>
          Home
        </button>
        <button onClick={() => setActiveView('shop')} className={activeView === 'shop' ? 'text-[#C45A7A]' : ''}>
          Shop
        </button>
        <button onClick={() => setActiveView('builder')} className={activeView === 'builder' ? 'text-[#C45A7A]' : ''}>
          3D Box
        </button>
        <button onClick={() => setActiveView('couple')} className={activeView === 'couple' ? 'text-[#C45A7A]' : ''}>
          Couple
        </button>
        <button onClick={onOpenSurpriseMe} className="text-[#C45A7A]">
          Surprise
        </button>
        <button onClick={onOpenAuth} className="text-[#C45A7A] font-bold">
          {currentUser ? 'Profile' : 'Login'}
        </button>
      </div>
    </header>
  );
};

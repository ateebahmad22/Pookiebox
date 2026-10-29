import React, { useState } from 'react';
import { Hero3DBox } from './Hero3DBox.tsx';
import { Product } from '../types.ts';
import { CATEGORIES } from '../data/catalog.ts';
import { BowIcon } from './BowIcon.tsx';
import {
  Sparkles,
  Gift,
  Calendar,
  ArrowRight,
  Heart,
  Star,
  ShoppingBag,
  ChevronRight,
  Box,
  ScrollText,
  Gem,
  Cookie,
  Flower2,
  Cake,
  Mail,
} from 'lucide-react';

interface HomePageProps {
  products: Product[];
  onOpenBuilder: () => void;
  onOpenScheduler: () => void;
  onOpenShopCategory: (categorySlug: string) => void;
  onAddToCart: (product: Product) => void;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onOpenQuiz?: () => void;
  onOpenSurpriseMe?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onOpenBuilder,
  onOpenScheduler,
  onOpenShopCategory,
  onAddToCart,
  wishlistIds,
  onToggleWishlist,
  onOpenQuiz,
  onOpenSurpriseMe,
}) => {
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({ occasion: '', relation: '', vibe: '' });

  const bestsellers = products.filter((p) => p.bestseller || p.featured).slice(0, 4);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'plushies':
        return <Heart className="w-5 h-5" />;
      case 'chocolates':
        return <Cookie className="w-5 h-5" />;
      case 'jewellery':
        return <Gem className="w-5 h-5" />;
      case 'flowers':
        return <Flower2 className="w-5 h-5" />;
      case 'personalised':
        return <Sparkles className="w-5 h-5" />;
      case 'stationery':
        return <ScrollText className="w-5 h-5" />;
      case 'birthday':
        return <Cake className="w-5 h-5" />;
      case 'digital':
        return <Mail className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-20 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20">
        {/* Soft Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#FFC0CB]/25 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#E6D6FF]/25 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold text-[#C45A7A] bg-[#FFF0F5] border border-[#F8BBD0]">
                <BowIcon className="w-3.5 h-3.5 text-[#C45A7A]" />
                <span>The Coquette Gifting Atelier</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#59434D] leading-[1.15] text-balance">
                A Little Box, A Lot of Love <Heart className="w-9 h-9 inline-block text-[#C45A7A] fill-current" />
              </h1>

              <p className="text-base sm:text-lg text-[#59434D]/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                Create the sweetest surprises for the people who make your world special. Build your custom gift box in real-time 3D with satin bows, plushies, and wax-sealed love letters.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={onOpenBuilder}
                  className="py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  Build Your Gift Box (3D)
                </button>

                {onOpenSurpriseMe && (
                  <button
                    onClick={onOpenSurpriseMe}
                    className="py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-semibold text-[#59434D] bg-gradient-to-r from-[#FFC0CB]/50 to-[#F8BBD0]/50 hover:bg-[#F8BBD0]/80 border border-[#F8BBD0] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <BowIcon className="w-4 h-4 text-[#C45A7A]" />
                    Surprise Me
                  </button>
                )}

                {onOpenQuiz && (
                  <button
                    onClick={onOpenQuiz}
                    className="py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-semibold text-[#C45A7A] bg-white hover:bg-[#FFF0F5] border border-[#F8BBD0] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    Gift Finder Quiz
                  </button>
                )}

                <button
                  onClick={onOpenScheduler}
                  className="py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-semibold text-gray-600 bg-white hover:bg-[#FFF0F5] border border-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Birthday Scheduler
                </button>
              </div>

              {/* Quiet Social Proof */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-3 text-xs text-gray-500">
                <div className="flex -space-x-1.5">
                  {[
                    <Heart key="1" className="w-3.5 h-3.5 text-[#C45A7A] fill-current" />,
                    <BowIcon key="2" className="w-3.5 h-3.5 text-[#C45A7A]" />,
                    <Sparkles key="3" className="w-3.5 h-3.5 text-[#C45A7A]" />,
                    <Gift key="4" className="w-3.5 h-3.5 text-[#C45A7A]" />,
                  ].map((icon, i) => (
                    <span
                      key={i}
                      className="w-7 h-7 rounded-full bg-white border border-[#F8BBD0] flex items-center justify-center shadow-xs"
                    >
                      {icon}
                    </span>
                  ))}
                </div>
                <span>
                  Over <strong className="text-[#C45A7A] font-semibold">14,200+</strong> sweet surprises delivered across India
                </span>
              </div>
            </div>

            {/* Right: Interactive 3D Hero Gift Box */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-3xl p-4 border border-[#F8BBD0]/60 shadow-xl shadow-[#C45A7A]/5">
                <Hero3DBox onBuildClick={onOpenBuilder} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED GIFT CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider text-[#C45A7A] uppercase">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#59434D] mt-1 flex items-center gap-2">
              Explore Gift Categories
              <BowIcon className="w-5 h-5 text-[#C45A7A]" />
            </h2>
          </div>

          <button
            onClick={() => onOpenShopCategory('all')}
            className="text-xs font-semibold text-[#C45A7A] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            View All Categories <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.slice(1).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onOpenShopCategory(cat.id)}
              className="p-4 rounded-2xl bg-white border border-[#F8BBD0]/40 hover:border-[#C45A7A] hover:shadow-sm text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F5] text-[#C45A7A] group-hover:scale-110 group-hover:bg-[#C45A7A] group-hover:text-white transition-all flex items-center justify-center shadow-xs">
                {getCategoryIcon(cat.id)}
              </div>
              <span className="text-xs font-semibold text-[#59434D] line-clamp-1 group-hover:text-[#C45A7A]">
                {cat.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BESTSELLING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider text-[#C45A7A] uppercase">
              Treasures of the Atelier
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#59434D] mt-1 flex items-center gap-2">
              Bestselling Pookie Favourites
              <Heart className="w-5 h-5 text-[#C45A7A] fill-current" />
            </h2>
          </div>

          <button
            onClick={() => onOpenShopCategory('all')}
            className="text-xs font-semibold text-[#C45A7A] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            Explore Full Shop <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((prod) => {
            const isWishlisted = wishlistIds.includes(prod.id);

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-[#F8BBD0]/40 overflow-hidden shadow-xs hover:shadow-md hover:border-[#C45A7A]/40 transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-4/3 w-full bg-[#FFF9F5] overflow-hidden">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {prod.badge && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-[#C45A7A] border border-[#F8BBD0]">
                      {prod.badge}
                    </span>
                  )}
                  <button
                    onClick={() => onToggleWishlist(prod.id)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-400 hover:text-[#C45A7A] shadow-xs cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'text-[#C45A7A] fill-current' : ''}`} />
                  </button>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>{prod.category}</span>
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-current" /> {prod.rating}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#59434D] line-clamp-1 mt-1">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#59434D] font-serif tabular-nums">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => onAddToCart(prod)}
                      className="py-1.5 px-3 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-gradient-to-b from-[#FFF5F8] to-[#FFF9F5] py-16 border-y border-[#F8BBD0]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold tracking-wider text-[#C45A7A] uppercase">
              The Art of Gifting
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#59434D] mt-1 flex items-center justify-center gap-2">
              How PookieBox Works
              <BowIcon className="w-6 h-6 text-[#C45A7A]" />
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              From our digital 3D atelier to their doorstep in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'Select Box & Ribbons',
                desc: 'Pick your keepsake chest color and choose from satin butterfly bows, French knots, and rosette ties.',
                icon: <Box className="w-6 h-6 text-[#C45A7A]" />,
              },
              {
                num: '02',
                title: 'Fill With Treasures',
                desc: 'Add soft plushies, artisan French ruby chocolates, rose gold jewelry, and dried floral vials.',
                icon: <Gift className="w-6 h-6 text-[#C45A7A]" />,
              },
              {
                num: '03',
                title: 'Personalize with Love',
                desc: 'Compose a heartfelt letterpress note sealed with golden wax and addressed to your recipient.',
                icon: <ScrollText className="w-6 h-6 text-[#C45A7A]" />,
              },
              {
                num: '04',
                title: 'Delivered with Magic',
                desc: 'Hand-packed with fairy lights and rose petals, delivered directly with live express tracking.',
                icon: <Sparkles className="w-6 h-6 text-[#C45A7A]" />,
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white rounded-3xl p-6 border border-[#F8BBD0]/50 shadow-xs space-y-3 relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-xs font-mono font-bold text-[#C45A7A]">{step.num}.</span>
                <h3 className="text-sm font-semibold text-[#59434D]">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onOpenBuilder}
              className="py-3 px-8 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              Start Creating in 3D <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. CUSTOMER LOVE NOTES & REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold tracking-wider text-[#C45A7A] uppercase">
            Love Notes From Recipients
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#59434D] mt-1 flex items-center justify-center gap-2">
            Cherished Unboxings
            <Mail className="w-5 h-5 text-[#C45A7A]" />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                'The 3D builder made it so fun to assemble my bestie’s 21st birthday gift! The satin ribbon and dried roses were exquisite, and the wax seal looked straight out of a royal letter.',
              name: 'Rhea K.',
              city: 'Mumbai',
              box: 'Pink Heart Whisper Box',
            },
            {
              quote:
                'My girlfriend literally cried when she opened the box! The fairy lights turned on as she lifted the lid, and the plush teddy bear was so soft. 10/10 best gifting experience.',
              name: 'Advait S.',
              city: 'Bangalore',
              box: 'Luxury Fairy Lights Box',
            },
            {
              quote:
                'Unbelievable quality. The personalized wax seal and ruby chocolates felt straight out of a Parisian boutique. Birthday reminder also saved me so I ordered right on time!',
              name: 'Shanaya M.',
              city: 'New Delhi',
              box: 'Lavender Cloud Keepsake',
            },
          ].map((rev, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-[#F8BBD0]/50 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#59434D]/85 italic leading-relaxed">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#59434D] block">{rev.name}</span>
                  <span className="text-gray-400 text-[11px]">{rev.city}</span>
                </div>
                <span className="text-[10px] text-[#C45A7A] bg-[#FFF0F5] px-2 py-0.5 rounded-full font-medium">
                  {rev.box}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. GIFT FINDER QUIZ CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#FFC0CB]/40 via-[#F8BBD0]/50 to-[#E6D6FF]/40 rounded-3xl p-8 sm:p-12 border border-[#F8BBD0] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-semibold text-[#C45A7A] uppercase tracking-wider">
              Need inspiration?
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#59434D] flex items-center justify-center md:justify-start gap-2">
              Take the 30-Second Gift Finder Quiz
              <BowIcon className="w-6 h-6 text-[#C45A7A]" />
            </h3>
            <p className="text-xs text-gray-600 max-w-md">
              Answer 3 quick questions about their personality and budget, and we’ll curate their dream box in our 3D builder!
            </p>
          </div>

          <button
            onClick={() => {
              setQuizStep(1);
              setShowQuizModal(true);
            }}
            className="py-3 px-6 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            Start Gift Quiz
          </button>
        </div>
      </section>

      {/* Gift Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-[#F8BBD0]">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Question {quizStep} of 3</span>
                <h3 className="text-base font-bold text-[#59434D] flex items-center gap-1.5">
                  Pookie Gift Stylist <BowIcon className="w-4 h-4 text-[#C45A7A]" />
                </h3>
              </div>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {quizStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-[#59434D]">Who are you celebrating?</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Soulmate / Partner', 'Best Friend', 'Sister', 'Mom'].map((rel) => (
                    <button
                      key={rel}
                      onClick={() => {
                        setQuizAnswers({ ...quizAnswers, relation: rel });
                        setQuizStep(2);
                      }}
                      className="p-3 rounded-xl border border-gray-200 hover:border-[#C45A7A] hover:bg-[#FFF0F5] text-xs font-medium text-gray-700 text-left transition-colors cursor-pointer"
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 2 && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-[#59434D]">What’s the occasion?</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Birthday Celebration', 'Anniversary', 'Just Because / Love You', 'Cheer Up / Hug Box'].map((occ) => (
                    <button
                      key={occ}
                      onClick={() => {
                        setQuizAnswers({ ...quizAnswers, occasion: occ });
                        setQuizStep(3);
                      }}
                      className="p-3 rounded-xl border border-gray-200 hover:border-[#C45A7A] hover:bg-[#FFF0F5] text-xs font-medium text-gray-700 text-left transition-colors cursor-pointer"
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {quizStep === 3 && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-[#59434D]">What aesthetic do they adore?</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Soft Pink Coquette & Bows',
                    'Artisanal Chocolates & Gourmet',
                    'Dainty Keepsake Jewellery',
                    'Pastel Stationery & Journals',
                  ].map((vibe) => (
                    <button
                      key={vibe}
                      onClick={() => {
                        setShowQuizModal(false);
                        onOpenBuilder();
                      }}
                      className="p-3 rounded-xl border border-gray-200 hover:border-[#C45A7A] hover:bg-[#FFF0F5] text-xs font-medium text-gray-700 text-left transition-colors cursor-pointer"
                    >
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

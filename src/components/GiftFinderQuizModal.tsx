import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, ArrowLeft, Heart, ShoppingBag, Box } from 'lucide-react';
import { BowIcon } from './BowIcon.tsx';
import { Product } from '../types.ts';

interface GiftFinderQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBuildBoxWithProducts: (selectedProducts: Product[]) => void;
}

interface QuizState {
  recipient: string;
  occasion: string;
  budgetMax: number;
  interests: string[];
  vibe: string;
}

export const GiftFinderQuizModal: React.FC<GiftFinderQuizModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onBuildBoxWithProducts,
}) => {
  const [step, setStep] = useState(1);
  const [quiz, setQuiz] = useState<QuizState>({
    recipient: '',
    occasion: '',
    budgetMax: 2500,
    interests: [],
    vibe: '',
  });

  if (!isOpen) return null;

  const totalSteps = 5;

  const handleInterestToggle = (slug: string) => {
    setQuiz((prev) => {
      const exists = prev.interests.includes(slug);
      return {
        ...prev,
        interests: exists ? prev.interests.filter((i) => i !== slug) : [...prev.interests, slug],
      };
    });
  };

  const getRecommendations = (): Product[] => {
    return products.filter((p) => {
      if (!p.inStock) return false;
      if (p.price > quiz.budgetMax) return false;

      // Filter by interests if selected
      if (quiz.interests.length > 0) {
        const matchesCategory = quiz.interests.includes(p.categorySlug);
        const matchesTag = p.tags.some((t) =>
          quiz.interests.some((i) => t.toLowerCase().includes(i.toLowerCase()))
        );
        return matchesCategory || matchesTag;
      }
      return true;
    }).slice(0, 4);
  };

  const recommendedProducts = getRecommendations();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#59434D]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FFF9F5] border border-[#F8BBD0] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-r from-[#FFC0CB]/30 via-[#FFF9F5] to-[#E6D6FF]/30 border-b border-[#F8BBD0]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] border border-[#F8BBD0] flex items-center justify-center text-[#C45A7A] shadow-xs">
              <BowIcon className="w-5 h-5 text-[#C45A7A]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#59434D] flex items-center gap-1.5">
                Gift Finder Quiz
              </h3>
              <p className="text-xs text-[#59434D]/70">Let us find the sweetest surprise tailored just for them</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#F8BBD0]/50 flex items-center justify-center text-[#59434D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-xs font-medium text-[#C45A7A] mb-1.5">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-[#F8BBD0]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FFC0CB] to-[#C45A7A] transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg font-semibold text-[#59434D]">Who is this special gift for?</h4>
              <p className="text-xs text-[#59434D]/70">Choose who you are surprising today</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { label: 'Girlfriend / Partner', desc: 'Romantic, heartfelt & sweet' },
                  { label: 'Boyfriend / Partner', desc: 'Thoughtful keepsakes & treats' },
                  { label: 'Best Friend / Soul Sister', desc: 'Cute plushies, journals & memories' },
                  { label: 'Sister / Brother', desc: 'Celebration treats & lovely surprises' },
                  { label: 'Mom / Family Member', desc: 'Everlasting flowers & elegant items' },
                  { label: 'Self Love Treat', desc: 'Because you deserve all the softness' },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setQuiz({ ...quiz, recipient: opt.label })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      quiz.recipient === opt.label
                        ? 'border-[#C45A7A] bg-[#FFF0F5] shadow-xs ring-1 ring-[#C45A7A]'
                        : 'border-[#F8BBD0]/60 bg-white hover:border-[#C45A7A]/50'
                    }`}
                  >
                    <div className="font-semibold text-sm text-[#59434D] flex items-center justify-between">
                      {opt.label}
                      {quiz.recipient === opt.label && <Check className="w-4 h-4 text-[#C45A7A]" />}
                    </div>
                    <div className="text-xs text-[#59434D]/60 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg font-semibold text-[#59434D]">What is the celebration?</h4>
              <p className="text-xs text-[#59434D]/70">Select the occasion so we can tailor the sentiment</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'birthday', label: 'Birthday Celebration', sub: 'Crowning moments & sweet wishes' },
                  { id: 'anniversary', label: 'Anniversary or Milestone', sub: 'Romantic tokens of love' },
                  { id: 'just_because', label: 'Just Because / Cheer Up', sub: 'A spontaneous dose of happiness' },
                  { id: 'apology', label: 'I Miss You / Forgive Me', sub: 'Heartfelt gestures that melt hearts' },
                  { id: 'congrats', label: 'Congratulations / New Job', sub: 'Proud cheers & luxury treats' },
                  { id: 'proposal', label: 'Love Confession', sub: 'Unforgettable bows & velvet' },
                ].map((occ) => (
                  <button
                    key={occ.id}
                    onClick={() => setQuiz({ ...quiz, occasion: occ.label })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      quiz.occasion === occ.label
                        ? 'border-[#C45A7A] bg-[#FFF0F5] shadow-xs ring-1 ring-[#C45A7A]'
                        : 'border-[#F8BBD0]/60 bg-white hover:border-[#C45A7A]/50'
                    }`}
                  >
                    <div className="font-semibold text-sm text-[#59434D] flex items-center justify-between">
                      {occ.label}
                      {quiz.occasion === occ.label && <Check className="w-4 h-4 text-[#C45A7A]" />}
                    </div>
                    <div className="text-xs text-[#59434D]/60 mt-1">{occ.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h4 className="font-serif text-lg font-semibold text-[#59434D]">What is your ideal budget?</h4>
              <p className="text-xs text-[#59434D]/70">We will only recommend available items that fit comfortably</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { max: 1000, label: 'Under ₹1,000', note: 'Sweet little gesture' },
                  { max: 2500, label: '₹1,000 - ₹2,500', note: 'Curated 2-3 item box' },
                  { max: 4000, label: '₹2,500 - ₹4,000', note: 'Luxury aesthetic chest' },
                  { max: 7000, label: '₹4,000+', note: 'The Grand Pookie Suite' },
                ].map((b) => (
                  <button
                    key={b.max}
                    onClick={() => setQuiz({ ...quiz, budgetMax: b.max })}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      quiz.budgetMax === b.max
                        ? 'border-[#C45A7A] bg-[#FFF0F5] shadow-xs ring-1 ring-[#C45A7A]'
                        : 'border-[#F8BBD0]/60 bg-white hover:border-[#C45A7A]/50'
                    }`}
                  >
                    <div className="font-bold text-sm text-[#C45A7A]">{b.label}</div>
                    <div className="text-[11px] text-[#59434D]/60 mt-1">{b.note}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg font-semibold text-[#59434D]">What does the recipient love?</h4>
              <p className="text-xs text-[#59434D]/70">Select any categories they gravitate toward</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { slug: 'plushies', label: 'Teddy & Soft Plushies' },
                  { slug: 'chocolates', label: 'Belgian & Ruby Treats' },
                  { slug: 'jewellery', label: 'Bow & Pearl Jewellery' },
                  { slug: 'flowers', label: 'Preserved Wild Roses' },
                  { slug: 'stationery', label: 'Pastel Journals & Seals' },
                  { slug: 'digital', label: 'Instant Digital Cards' },
                ].map((item) => {
                  const isSelected = quiz.interests.includes(item.slug);
                  return (
                    <button
                      key={item.slug}
                      onClick={() => handleInterestToggle(item.slug)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#C45A7A] bg-[#FFF0F5] shadow-xs text-[#C45A7A]'
                          : 'border-[#F8BBD0]/60 bg-white text-[#59434D] hover:border-[#C45A7A]/40'
                      }`}
                    >
                      <span className="text-xs font-semibold">{item.label}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[#C45A7A]" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg font-semibold text-[#59434D]">Which vibe should the gift radiate?</h4>
              <p className="text-xs text-[#59434D]/70">This helps us curate the unboxing feel and wrapping</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'cute', label: 'Super Cute & Soft', desc: 'Bows, pastel fluff & pink sprinkles' },
                  { id: 'romantic', label: 'Deeply Romantic', desc: 'Candles, rose gold & heartfelt words' },
                  { id: 'chic', label: 'Chic & Aesthetic', desc: 'Minimalist clean elegance & French silk' },
                  { id: 'playful', label: 'Playful & Joyous', desc: 'Confetti poppers & cheerful moments' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setQuiz({ ...quiz, vibe: v.label })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      quiz.vibe === v.label
                        ? 'border-[#C45A7A] bg-[#FFF0F5] shadow-xs ring-1 ring-[#C45A7A]'
                        : 'border-[#F8BBD0]/60 bg-white hover:border-[#C45A7A]/50'
                    }`}
                  >
                    <div className="font-semibold text-sm text-[#59434D] flex items-center justify-between">
                      {v.label}
                      {quiz.vibe === v.label && <Check className="w-4 h-4 text-[#C45A7A]" />}
                    </div>
                    <div className="text-xs text-[#59434D]/60 mt-1">{v.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Step */}
          {step > 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F5] text-xs font-semibold text-[#C45A7A] border border-[#F8BBD0] mb-2">
                  <BowIcon className="w-3.5 h-3.5 text-[#C45A7A]" /> Curated Match for {quiz.recipient || 'Your Loved One'}
                </span>
                <h4 className="font-serif text-xl font-bold text-[#59434D]">Handpicked Recommendations</h4>
                <p className="text-xs text-[#59434D]/70 mt-1 max-w-md mx-auto">
                  Based on your preferences for {quiz.occasion || 'the celebration'} under ₹{quiz.budgetMax}, here are the perfect treasures currently in stock!
                </p>
              </div>

              {recommendedProducts.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-2xl border border-[#F8BBD0]/50 p-6">
                  <p className="text-sm text-[#59434D]/80">No exact items matched that combination under ₹{quiz.budgetMax}.</p>
                  <button
                    onClick={() => setStep(3)}
                    className="mt-3 px-4 py-2 bg-[#FFF0F5] text-[#C45A7A] border border-[#F8BBD0] rounded-full text-xs font-bold hover:bg-[#F8BBD0]/30 cursor-pointer"
                  >
                    Adjust Budget
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-4 rounded-2xl bg-white border border-[#F8BBD0]/60 shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-16 h-16 rounded-xl object-cover border border-[#F8BBD0]/40 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C45A7A]">
                            {prod.category}
                          </span>
                          <h5 className="font-serif font-bold text-sm text-[#59434D] truncate">{prod.name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-sm text-[#C45A7A]">₹{prod.price}</span>
                            {prod.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">₹{prod.originalPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#F8BBD0]/30 flex items-center gap-2">
                        <button
                          onClick={() => {
                            onAddToCart(prod);
                            onClose();
                          }}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-[#FFF0F5] text-[#C45A7A] hover:bg-[#F8BBD0]/30 border border-[#F8BBD0] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recommendedProducts.length > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFC0CB]/20 via-[#FFF9F5] to-[#E6D6FF]/20 border border-[#F8BBD0] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h5 className="font-serif font-bold text-sm text-[#59434D]">Want to pack these into a 3D Gift Box?</h5>
                    <p className="text-xs text-[#59434D]/70">We will load them into the 3D builder so you can pick satin ribbons & write a note.</p>
                  </div>
                  <button
                    onClick={() => {
                      onBuildBoxWithProducts(recommendedProducts.slice(0, 3));
                      onClose();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#FFC0CB] to-[#C45A7A] hover:opacity-95 text-white text-xs font-bold rounded-full shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
                  >
                    <Box className="w-4 h-4" />
                    <span>Open in 3D Box Builder</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 px-6 bg-white border-t border-[#F8BBD0]/40 flex items-center justify-between">
          {step > 1 && step <= 5 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-[#59434D] hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : step > 5 ? (
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-[#C45A7A] hover:underline cursor-pointer"
            >
              Start Over
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 rounded-full bg-[#C45A7A] hover:bg-[#b04f6c] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : step === 5 ? (
            <button
              onClick={() => setStep(6)}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FFC0CB] to-[#C45A7A] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-95 transition-opacity"
            >
              <Sparkles className="w-4 h-4" /> Show My Recommendations
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-[#F8BBD0] bg-[#FFF0F5] text-[#C45A7A] text-xs font-bold hover:bg-[#F8BBD0]/30 cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Box, ShoppingBag, ArrowRight } from 'lucide-react';
import { BowIcon } from './BowIcon.tsx';
import { CustomGiftBox } from '../types.ts';

interface SurpriseMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBuilderWithBox: (box: CustomGiftBox) => void;
  onAddBoxToCart: (box: CustomGiftBox) => void;
}

export const SurpriseMeModal: React.FC<SurpriseMeModalProps> = ({
  isOpen,
  onClose,
  onOpenBuilderWithBox,
  onAddBoxToCart,
}) => {
  const [recipientName, setRecipientName] = useState('My Sweet Pookie');
  const [occasion, setOccasion] = useState('Birthday Celebration');
  const [budget, setBudget] = useState(2500);
  const [loading, setLoading] = useState(false);
  const [generatedBox, setGeneratedBox] = useState<CustomGiftBox | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gifts/surprise-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          occasion,
          budget,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedBox(data.box);
      }
    } catch (err) {
      console.error('Surprise Me error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#59434D]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#FFF9F5] border border-[#F8BBD0] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-r from-[#FFC0CB]/30 via-[#FFF9F5] to-[#E6D6FF]/30 border-b border-[#F8BBD0]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] border border-[#F8BBD0] flex items-center justify-center text-[#C45A7A] shadow-xs">
              <BowIcon className="w-5 h-5 text-[#C45A7A]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#59434D] flex items-center gap-1.5">
                Surprise Me Curation
              </h3>
              <p className="text-xs text-[#59434D]/70">Let our fairy stylists curate an aesthetic gift box in seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#F8BBD0]/50 flex items-center justify-center text-[#59434D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!generatedBox ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#59434D] uppercase tracking-wider mb-1.5">
                  Who is the recipient?
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Ananya, My Girlfriend, Bestie"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#F8BBD0]/70 text-sm text-[#59434D] focus:outline-none focus:ring-2 focus:ring-[#C45A7A]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#59434D] uppercase tracking-wider mb-1.5">
                  Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#F8BBD0]/70 text-sm text-[#59434D] focus:outline-none focus:ring-2 focus:ring-[#C45A7A]/30"
                >
                  <option value="Birthday Celebration">Birthday Celebration</option>
                  <option value="Anniversary Special">Anniversary Special</option>
                  <option value="Cheer Up & Love">Cheer Up & Love</option>
                  <option value="Romantic Date Night">Romantic Date Night</option>
                  <option value="Just Because">Just Because</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#59434D] uppercase tracking-wider">
                    Target Budget
                  </label>
                  <span className="text-sm font-bold text-[#C45A7A]">₹{budget}</span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="6000"
                  step="200"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-[#C45A7A] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#59434D]/60 mt-1">
                  <span>Sweet (₹1,200)</span>
                  <span>Curated (₹2,500)</span>
                  <span>Ultra Luxury (₹6,000)</span>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-[#FFC0CB] to-[#C45A7A] hover:opacity-95 text-white font-bold rounded-2xl shadow-sm text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Curating with Love...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Curate Surprise Box</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-[#F8BBD0]/70 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#F8BBD0]/30">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#C45A7A]">
                      Curated 3D Gift Box
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#59434D]">{generatedBox.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#59434D]/60 block">Total</span>
                    <span className="font-bold text-base text-[#C45A7A]">₹{generatedBox.totalPrice}</span>
                  </div>
                </div>

                <div className="py-3 space-y-2">
                  <div className="text-xs font-semibold text-[#59434D]/80">Items included:</div>
                  <div className="space-y-2">
                    {generatedBox.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-[#FFF9F5] p-2.5 rounded-xl border border-[#F8BBD0]/40">
                        <span className="font-medium text-[#59434D] truncate pr-2">{it.product.name}</span>
                        <span className="font-bold text-[#C45A7A] shrink-0">₹{it.product.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-[#FFF0F5] rounded-xl border border-[#F8BBD0]/50 text-xs text-[#59434D]/80 italic">
                  "{generatedBox.personalizedMessage}"
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={() => {
                    onOpenBuilderWithBox(generatedBox);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#FFC0CB] to-[#C45A7A] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:opacity-95"
                >
                  <Box className="w-4 h-4" />
                  <span>Customize in 3D Builder</span>
                </button>
                <button
                  onClick={() => {
                    onAddBoxToCart(generatedBox);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-white border border-[#C45A7A] text-[#C45A7A] hover:bg-[#FFF0F5] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Directly to Cart</span>
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={handleGenerate}
                  className="text-xs text-[#C45A7A] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-shuffle another combination
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

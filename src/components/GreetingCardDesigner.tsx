import React, { useState } from 'react';
import { X, Sparkles, Heart, Check, Image as ImageIcon, Type, Palette, Stamp } from 'lucide-react';
import { BowIcon } from './BowIcon.tsx';
import { GreetingCardDesign } from '../types.ts';

interface GreetingCardDesignerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCard: (card: GreetingCardDesign) => void;
  initialCard?: GreetingCardDesign;
}

const BACKGROUND_OPTIONS = [
  { id: 'pink-ribbon', name: 'Blush Ribbons', bgClass: 'bg-gradient-to-br from-[#FFC0CB]/40 via-[#FFF0F5] to-[#F8BBD0]/40' },
  { id: 'lavender-clouds', name: 'Lavender Clouds', bgClass: 'bg-gradient-to-br from-[#E6D6FF]/40 via-[#FFF9F5] to-[#D8BFD8]/40' },
  { id: 'vintage-cream', name: 'Vintage Cream', bgClass: 'bg-[#FFF9F5] border-double' },
  { id: 'sparkle-stars', name: 'Sparkle Shimmer', bgClass: 'bg-gradient-to-br from-[#FFF0F5] via-[#FFE4E1] to-[#FFF9F5]' },
  { id: 'rose-petals', name: 'Rose Petals', bgClass: 'bg-gradient-to-br from-[#FFE4E1] via-[#FFF5F7] to-[#FAD2E1]' },
];

const STICKER_OPTIONS = [
  { id: 'bow', label: 'Satin Bow' },
  { id: 'heart', label: 'Heart' },
  { id: 'sparkles', label: 'Sparkles' },
  { id: 'cake', label: 'Cake' },
  { id: 'envelope', label: 'Love Letter' },
  { id: 'rose', label: 'Rose' },
];

export const GreetingCardDesigner: React.FC<GreetingCardDesignerProps> = ({
  isOpen,
  onClose,
  onSaveCard,
  initialCard,
}) => {
  const [occasion, setOccasion] = useState<GreetingCardDesign['occasion']>(
    initialCard?.occasion || 'birthday'
  );
  const [title, setTitle] = useState(initialCard?.title || 'Happy Birthday, My Angel!');
  const [backgroundStyle, setBackgroundStyle] = useState<GreetingCardDesign['backgroundStyle']>(
    initialCard?.backgroundStyle || 'pink-ribbon'
  );
  const [fontFamily, setFontFamily] = useState<GreetingCardDesign['fontFamily']>(
    initialCard?.fontFamily || 'serif'
  );
  const [primaryMessage, setPrimaryMessage] = useState(
    initialCard?.primaryMessage ||
      'May your day be wrapped in soft moments, sweet treats, and all the love your heart can hold. You deserve all the magic in this world! 💗'
  );
  const [signOff, setSignOff] = useState(initialCard?.signOff || 'With endless love, Ateeb 🎀');
  const [stickers, setStickers] = useState<string[]>(initialCard?.stickers || ['bow', 'sparkles', 'heart']);
  const [previewTab, setPreviewTab] = useState<'card' | 'envelope'>('card');

  if (!isOpen) return null;

  const handleTemplateSelect = (occ: GreetingCardDesign['occasion']) => {
    setOccasion(occ);
    if (occ === 'birthday') {
      setTitle('Happy Birthday, My Sweet Angel!');
      setPrimaryMessage(
        'Wishing the sweetest soul a year filled with gentle laughter, wrapped surprises, and endless love. You make life feel like pure magic!'
      );
    } else if (occ === 'anniversary') {
      setTitle('Happy Anniversary, My Favorite Person');
      setPrimaryMessage(
        'Every single day with you is my favorite adventure. Thank you for filling my world with sweetness and softness. Forever yours.'
      );
    } else if (occ === 'love') {
      setTitle('A Little Note Just Because');
      setPrimaryMessage(
        'Just dropping a little reminder into your day: you are cherished beyond measure and adored in every single way.'
      );
    } else if (occ === 'friendship') {
      setTitle('To My Soul Bestie 🎀');
      setPrimaryMessage(
        'Life is infinitely more fun, sparkly, and memorable with you by my side. Thank you for always being my ride-or-die!'
      );
    } else if (occ === 'congrats') {
      setTitle('So Proud of You, Superstar!');
      setPrimaryMessage(
        'You worked so hard and achieved something truly extraordinary! Celebrating you today and cheering you on always.'
      );
    }
  };

  const toggleSticker = (id: string) => {
    setStickers((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const card: GreetingCardDesign = {
      id: initialCard?.id || `card-${Date.now()}`,
      occasion,
      title,
      backgroundStyle,
      fontFamily,
      primaryMessage,
      signOff,
      stickers,
      createdAt: new Date().toISOString(),
    };
    onSaveCard(card);
    onClose();
  };

  const activeBg = BACKGROUND_OPTIONS.find((b) => b.id === backgroundStyle)?.bgClass || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#59434D]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FFF9F5] border border-[#F8BBD0] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#FFC0CB]/30 via-[#FFF9F5] to-[#E6D6FF]/30 border-b border-[#F8BBD0]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FFF0F5] border border-[#F8BBD0] flex items-center justify-center text-[#C45A7A] shadow-xs">
              <BowIcon className="w-5 h-5 text-[#C45A7A]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#59434D]">
                Custom Greeting Card Designer
              </h3>
              <p className="text-[11px] text-[#59434D]/70">
                Design a personalized letterpress card to nestle inside your gift box
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#F8BBD0]/50 flex items-center justify-center text-[#59434D] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: 2 Columns (Editor vs Live Card Preview) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Controls */}
          <div className="space-y-4">
            {/* Occasion templates */}
            <div>
              <label className="block text-xs font-semibold text-[#59434D] uppercase tracking-wider mb-2">
                Occasion Template
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'birthday', label: 'Birthday' },
                  { id: 'anniversary', label: 'Anniversary' },
                  { id: 'love', label: 'Love Note' },
                  { id: 'friendship', label: 'Bestie' },
                  { id: 'congrats', label: 'Congrats' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t.id as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      occasion === t.id
                        ? 'bg-[#C45A7A] text-white shadow-xs'
                        : 'bg-white border border-[#F8BBD0]/70 text-[#59434D] hover:bg-[#FFF0F5]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Message */}
            <div>
              <label className="block text-xs font-semibold text-[#59434D] uppercase tracking-wider mb-1">
                Card Title / Greeting
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#F8BBD0]/70 text-xs text-[#59434D] focus:outline-none focus:ring-2 focus:ring-[#C45A7A]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#59434D] uppercase tracking-wider mb-1">
                Heartfelt Message
              </label>
              <textarea
                rows={4}
                value={primaryMessage}
                onChange={(e) => setPrimaryMessage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#F8BBD0]/70 text-xs text-[#59434D] focus:outline-none focus:ring-2 focus:ring-[#C45A7A]/30 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#59434D] uppercase tracking-wider mb-1">
                Sign-off / From
              </label>
              <input
                type="text"
                value={signOff}
                onChange={(e) => setSignOff(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#F8BBD0]/70 text-xs text-[#59434D] focus:outline-none focus:ring-2 focus:ring-[#C45A7A]/30"
              />
            </div>

            {/* Typography Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#59434D] uppercase tracking-wider mb-1.5">
                Font Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'serif', label: 'Classic Serif', font: 'font-serif' },
                  { id: 'script', label: 'Cursive Romance', font: 'italic font-serif' },
                  { id: 'modern', label: 'Clean Modern', font: 'font-sans' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      fontFamily === f.id
                        ? 'border-[#C45A7A] bg-[#FFF0F5] text-[#C45A7A] font-bold ring-1 ring-[#C45A7A]'
                        : 'border-[#F8BBD0]/60 bg-white text-[#59434D]'
                    }`}
                  >
                    <span className={`text-xs block ${f.font}`}>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Texture */}
            <div>
              <label className="block text-xs font-semibold text-[#59434D] uppercase tracking-wider mb-1.5">
                Background Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BACKGROUND_OPTIONS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setBackgroundStyle(bg.id as any)}
                    className={`p-2 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      backgroundStyle === bg.id
                        ? 'border-[#C45A7A] bg-[#FFF0F5] text-[#C45A7A] ring-1 ring-[#C45A7A]'
                        : 'border-[#F8BBD0]/60 bg-white text-[#59434D]'
                    }`}
                  >
                    <span>{bg.name}</span>
                    {backgroundStyle === bg.id && <Check className="w-3.5 h-3.5 text-[#C45A7A]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Cute Stickers */}
            <div>
              <label className="block text-xs font-semibold text-[#59434D] uppercase tracking-wider mb-1.5">
                Coquette Accents & Stickers
              </label>
              <div className="flex flex-wrap gap-2">
                {STICKER_OPTIONS.map((st) => {
                  const active = stickers.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      onClick={() => toggleSticker(st.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? 'bg-[#FFF0F5] border border-[#C45A7A] text-[#C45A7A]'
                          : 'bg-white border border-gray-200 text-gray-600'
                      }`}
                    >
                      <span>{st.label}</span>
                      {active ? <Check className="w-3 h-3 text-[#C45A7A]" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Live Greeting Card Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full text-center mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C45A7A] bg-white px-3 py-1 rounded-full border border-[#F8BBD0]">
                Live Printed Card Preview
              </span>
            </div>

            {/* The Physical Card Canvas */}
            <div
              className={`w-full max-w-sm aspect-[4/5] rounded-3xl border-2 border-[#F8BBD0] p-7 shadow-xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${activeBg}`}
            >
              {/* Embossed Corner Bows */}
              <div className="absolute top-3 left-3 opacity-60">
                <BowIcon className="w-4 h-4 text-[#C45A7A]" />
              </div>
              <div className="absolute top-3 right-3 opacity-60">
                <BowIcon className="w-4 h-4 text-[#C45A7A]" />
              </div>

              {/* Card Header & Title */}
              <div className="text-center pt-2">
                <div className="w-8 h-8 mx-auto rounded-full bg-white/80 border border-[#F8BBD0] flex items-center justify-center text-[#C45A7A] mb-2 shadow-xs">
                  <BowIcon className="w-4 h-4 text-[#C45A7A]" />
                </div>
                <h4
                  className={`font-bold text-lg text-[#59434D] tracking-tight leading-snug ${
                    fontFamily === 'serif'
                      ? 'font-serif'
                      : fontFamily === 'script'
                      ? 'italic font-serif'
                      : 'font-sans'
                  }`}
                >
                  {title}
                </h4>
              </div>

              {/* Card Message */}
              <div className="my-auto py-4 text-center px-2">
                <p
                  className={`text-xs text-[#59434D] leading-relaxed whitespace-pre-wrap ${
                    fontFamily === 'serif'
                      ? 'font-serif'
                      : fontFamily === 'script'
                      ? 'italic font-serif text-sm'
                      : 'font-sans'
                  }`}
                >
                  "{primaryMessage}"
                </p>
              </div>

              {/* Stickers / Accents Bar */}
              <div className="flex items-center justify-center gap-2 py-1">
                {stickers.map((s) => (
                  <span
                    key={s}
                    className="w-6 h-6 rounded-full bg-white/90 border border-[#F8BBD0]/80 flex items-center justify-center text-[#C45A7A] shadow-xs"
                  >
                    {s === 'bow' && <BowIcon className="w-3.5 h-3.5 text-[#C45A7A]" />}
                    {s === 'heart' && <Heart className="w-3.5 h-3.5 fill-[#C45A7A] text-[#C45A7A]" />}
                    {s === 'sparkles' && <Sparkles className="w-3.5 h-3.5 text-[#C45A7A]" />}
                    {s !== 'bow' && s !== 'heart' && s !== 'sparkles' && (
                      <Sparkles className="w-3 h-3 text-[#C45A7A]" />
                    )}
                  </span>
                ))}
              </div>

              {/* Card Footer / Sign-off */}
              <div className="text-right border-t border-[#F8BBD0]/40 pt-3">
                <span
                  className={`font-semibold text-xs text-[#C45A7A] block ${
                    fontFamily === 'script' ? 'italic font-serif text-sm' : ''
                  }`}
                >
                  {signOff}
                </span>
                <span className="text-[9px] text-[#59434D]/50 uppercase tracking-widest block mt-0.5">
                  PookieBox Fine Letterpress
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-white border-t border-[#F8BBD0]/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-[#59434D] hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FFC0CB] to-[#C45A7A] text-white text-xs font-bold shadow-sm hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Attach to Gift Box</span>
          </button>
        </div>
      </div>
    </div>
  );
};

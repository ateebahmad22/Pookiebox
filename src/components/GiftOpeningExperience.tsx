import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Share2, Shield, EyeOff, RotateCcw, Volume2, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BowIcon } from './BowIcon.tsx';
import { GiftLink } from '../types.ts';

interface GiftOpeningExperienceProps {
  token: string;
  onClose?: () => void;
  isSenderView?: boolean;
}

export const GiftOpeningExperience: React.FC<GiftOpeningExperienceProps> = ({
  token,
  onClose,
  isSenderView = false,
}) => {
  const [giftData, setGiftData] = useState<GiftLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRevoked, setIsRevoked] = useState(false);
  const [stage, setStage] = useState<'wrapped' | 'untying' | 'opened' | 'reading_card'>('wrapped');
  const [thankYouSent, setThankYouSent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchGift = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/gift-links/${token}`);
        if (!res.ok) {
          const errData = await res.json();
          if (errData.isRevoked) {
            setIsRevoked(true);
          } else {
            setError(errData.error || 'Gift not found');
          }
          return;
        }
        const data = await res.json();
        setGiftData(data.giftLink);
      } catch (err: any) {
        setError('Failed to load this gift experience.');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchGift();
  }, [token]);

  const handleUntieRibbon = () => {
    if (stage !== 'wrapped') return;
    setStage('untying');

    // Untie sound / timer
    setTimeout(() => {
      setStage('opened');
      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFC0CB', '#F8BBD0', '#E6D6FF', '#C45A7A', '#FFF9F5'],
      });
    }, 1200);
  };

  const handleRevoke = async () => {
    if (!giftData) return;
    try {
      const res = await fetch(`/api/gift-links/${giftData.id}/revoke`, { method: 'POST' });
      if (res.ok) {
        setIsRevoked(true);
      }
    } catch (e) {
      console.error('Error revoking gift link:', e);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?giftToken=${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFF9F5]/95 backdrop-blur-md">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-[#FFF0F5] border border-[#F8BBD0] flex items-center justify-center animate-bounce">
            <BowIcon className="w-7 h-7 text-[#C45A7A]" />
          </div>
          <p className="font-serif font-bold text-lg text-[#59434D]">Preparing your sweet surprise...</p>
        </div>
      </div>
    );
  }

  if (isRevoked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FFF9F5]">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-[#F8BBD0] text-center shadow-lg space-y-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#59434D]">Gift Link Expired or Revoked</h3>
          <p className="text-xs text-[#59434D]/70 leading-relaxed">
            This private gift link is no longer accessible. The sender has revoked access or the viewing window has closed.
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#C45A7A] text-white text-xs font-bold hover:bg-[#b04f6c] cursor-pointer"
            >
              Return to PookieBox
            </button>
          )}
        </div>
      </div>
    );
  }

  if (error || !giftData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FFF9F5]">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-[#F8BBD0] text-center shadow-lg space-y-4">
          <BowIcon className="w-8 h-8 text-[#C45A7A] mx-auto" />
          <h3 className="font-serif font-bold text-xl text-[#59434D]">Gift Not Found</h3>
          <p className="text-xs text-[#59434D]/70">
            Please check the link or ask the sender to share the link again.
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#C45A7A] text-white text-xs font-bold hover:bg-[#b04f6c] cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#FFF0F5] via-[#FFF9F5] to-[#E6D6FF]/20 overflow-y-auto">
      {/* Top Banner */}
      <div className="p-4 sm:px-8 border-b border-[#F8BBD0]/40 flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <BowIcon className="w-5 h-5 text-[#C45A7A]" />
          <span className="font-serif font-bold text-sm text-[#C45A7A] tracking-tight">PookieBox Special Reveal</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-full bg-white border border-[#F8BBD0] text-xs font-semibold text-[#59434D] hover:text-[#C45A7A] flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
          </button>
          {isSenderView && !giftData.isRevoked && (
            <button
              onClick={handleRevoke}
              className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Revoke Access</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-full bg-[#FFF0F5] text-[#C45A7A] text-xs font-bold hover:bg-[#F8BBD0]/30 cursor-pointer"
            >
              Back to Store
            </button>
          )}
        </div>
      </div>

      {/* Main Experience Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
        {/* Recipient Greetings */}
        <div className="text-center space-y-1.5 mb-6">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#C45A7A] bg-white/80 px-3 py-1 rounded-full border border-[#F8BBD0]">
            <Sparkles className="w-3 h-3 text-[#C45A7A]" /> A Gift For {giftData.recipientName}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#59434D]">
            {stage === 'wrapped' || stage === 'untying'
              ? 'A delicate box has arrived for you'
              : `From ${giftData.senderName || 'Someone who adores you'}`}
          </h2>
        </div>

        {/* 3D Box / Unwrapping Canvas Container */}
        <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-b from-[#FFF5F7] to-[#FCE7F0] border border-[#F8BBD0]/80 shadow-2xl flex items-center justify-center overflow-hidden p-6 group">
          {/* Subtle Ambient Sparkles */}
          <div className="absolute top-4 left-4 text-[#C45A7A]/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="absolute bottom-4 right-4 text-[#C45A7A]/30">
            <Sparkles className="w-6 h-6 animate-pulse delay-100" />
          </div>

          {/* Interactive 3D CSS Box Representation */}
          {stage === 'wrapped' || stage === 'untying' ? (
            <div className="relative flex flex-col items-center justify-center">
              {/* Box Lid */}
              <div
                className={`relative w-44 h-12 rounded-t-xl bg-gradient-to-r from-[#FFB6C1] to-[#F8BBD0] border-2 border-[#C45A7A]/40 shadow-md transition-all duration-700 ${
                  stage === 'untying' ? '-translate-y-12 rotate-[-8deg] opacity-70' : ''
                }`}
              >
                {/* Horizontal ribbon bar on lid */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-[#C45A7A]" />
              </div>

              {/* Big Satin Bow on top */}
              <div
                className={`absolute -top-7 transition-all duration-500 z-10 cursor-pointer ${
                  stage === 'untying' ? 'scale-125 rotate-45 opacity-0' : 'hover:scale-105'
                }`}
                onClick={handleUntieRibbon}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#FFF0F5] border-2 border-[#C45A7A] flex items-center justify-center shadow-lg">
                  <BowIcon className="w-10 h-10 text-[#C45A7A]" />
                </div>
              </div>

              {/* Box Body */}
              <div className="relative w-40 h-36 rounded-b-xl bg-gradient-to-r from-[#FFAEC0] to-[#F48FB1] border-2 border-t-0 border-[#C45A7A]/40 shadow-xl flex items-center justify-center overflow-hidden">
                {/* Vertical Ribbon */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-[#C45A7A]" />
                {/* Horizontal Ribbon */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 bg-[#C45A7A]" />
              </div>

              {/* Action Button */}
              <button
                onClick={handleUntieRibbon}
                disabled={stage === 'untying'}
                className="mt-8 px-6 py-3 rounded-full bg-gradient-to-r from-[#FFC0CB] to-[#C45A7A] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <BowIcon className="w-4 h-4" />
                <span>{stage === 'untying' ? 'Untying Satin Ribbon...' : 'Click to Untie Ribbon 🎀'}</span>
              </button>
            </div>
          ) : (
            /* Opened Box with Revealed Contents */
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center animate-in zoom-in-95 duration-500 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F5] border-2 border-[#F8BBD0] flex items-center justify-center text-[#C45A7A] shadow-md">
                <Heart className="w-8 h-8 fill-[#C45A7A] text-[#C45A7A] animate-pulse" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C45A7A]">Surprise Unboxed!</span>
                <h3 className="font-serif font-bold text-lg text-[#59434D]">
                  {giftData.boxSnapshot?.boxName || 'Pookie Luxury Keepsake'}
                </h3>
              </div>

              {/* Snapshot of items */}
              {giftData.boxSnapshot?.items && (
                <div className="w-full max-h-36 overflow-y-auto space-y-1.5 p-2 bg-white/80 rounded-2xl border border-[#F8BBD0]/50 text-left">
                  {giftData.boxSnapshot.items.map((it: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs px-2 py-1">
                      <span className="text-[#59434D] font-medium truncate">• {it.name}</span>
                      <span className="text-[#C45A7A] font-bold shrink-0">₹{it.price}</span>
                    </div>
                  ))}
                </div>
              )}

              {giftData.digitalGiftCode && (
                <div className="p-3 bg-[#FFF0F5] border border-[#F8BBD0] rounded-2xl w-full">
                  <span className="text-[10px] uppercase font-bold text-[#C45A7A] block">Claim Voucher Code</span>
                  <span className="font-mono font-bold text-base text-[#59434D] tracking-widest">{giftData.digitalGiftCode}</span>
                </div>
              )}

              <button
                onClick={() => setStage('reading_card')}
                className="px-5 py-2.5 rounded-full bg-[#C45A7A] hover:bg-[#b04f6c] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Read Personalized Love Letter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Revealed Letter & Greeting Card Section */}
        {stage === 'reading_card' && (
          <div className="mt-8 w-full max-w-xl bg-white rounded-3xl border border-[#F8BBD0] p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
            {/* Letter Header */}
            <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-4">
              <div className="flex items-center gap-2">
                <BowIcon className="w-4 h-4 text-[#C45A7A]" />
                <span className="font-serif italic text-sm text-[#C45A7A]">A personal note for you</span>
              </div>
              <span className="text-[11px] text-[#59434D]/60">
                From: <strong>{giftData.senderName}</strong>
              </span>
            </div>

            {/* Note Body */}
            <div className="font-serif text-base sm:text-lg text-[#59434D] leading-relaxed p-4 bg-[#FFF9F5] rounded-2xl border border-[#F8BBD0]/30 italic">
              "{giftData.message}"
            </div>

            {/* Attached Greeting Card if created */}
            {giftData.greetingCard && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#FFC0CB]/20 via-[#FFF0F5] to-[#E6D6FF]/20 border border-[#F8BBD0] text-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C45A7A]">
                  Custom Greeting Card
                </span>
                <h4 className="font-serif text-lg font-bold text-[#59434D]">
                  {giftData.greetingCard.title}
                </h4>
                <p className="text-xs text-[#59434D]/80 leading-relaxed font-serif">
                  {giftData.greetingCard.primaryMessage}
                </p>
                <div className="text-xs font-bold text-[#C45A7A] pt-2">
                  {giftData.greetingCard.signOff}
                </div>
              </div>
            )}

            {/* Photo Slideshow if attached */}
            {giftData.photos && giftData.photos.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#59434D] uppercase tracking-wider block">
                  Sweet Memories
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {giftData.photos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Attached Memory"
                      className="w-full h-32 object-cover rounded-2xl border border-[#F8BBD0]/60 shadow-xs"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recipient Reaction Action */}
            <div className="pt-4 border-t border-[#F8BBD0]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#59434D]/70">Let {giftData.senderName} know how much you loved it:</span>
              <button
                onClick={() => {
                  setThankYouSent(true);
                  confetti({ particleCount: 50, spread: 60 });
                }}
                disabled={thankYouSent}
                className="px-5 py-2 rounded-full bg-[#FFF0F5] text-[#C45A7A] hover:bg-[#F8BBD0]/30 border border-[#F8BBD0] text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
              >
                <Heart className={`w-3.5 h-3.5 fill-[#C45A7A] ${thankYouSent ? '' : 'animate-pulse'}`} />
                <span>{thankYouSent ? 'Thank You Sent! 💗' : 'Send a Heart Reaction'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

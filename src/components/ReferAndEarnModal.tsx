import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Gift, Users, Award, Sparkles, ArrowRight } from 'lucide-react';
import { BowIcon } from './BowIcon.tsx';
import { ReferralProfile } from '../types.ts';

interface ReferAndEarnModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onApplyDiscountCode?: (code: string) => void;
}

export const ReferAndEarnModal: React.FC<ReferAndEarnModalProps> = ({
  isOpen,
  onClose,
  userId,
  onApplyDiscountCode,
}) => {
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchReferral = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/referrals?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data.referral);
        }
      } catch (err) {
        console.error('Error fetching referral profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferral();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const referralCode = profile?.code || 'POOKIE-LOVE';
  const shareLink = `${window.location.origin}?ref=${referralCode}`;

  const copyToClipboard = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#59434D]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#FFF9F5] border border-[#F8BBD0] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-r from-[#FFC0CB]/30 via-[#FFF9F5] to-[#E6D6FF]/30 border-b border-[#F8BBD0]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] border border-[#F8BBD0] flex items-center justify-center text-[#C45A7A] shadow-xs">
              <BowIcon className="w-5 h-5 text-[#C45A7A]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#59434D] flex items-center gap-1.5">
                Refer Friends, Share the Love
              </h3>
              <p className="text-xs text-[#59434D]/70">Give ₹150, Get ₹150 for every friend who orders</p>
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Rewards Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#F8BBD0]/70 text-center shadow-xs">
              <span className="text-[11px] uppercase font-bold text-[#59434D]/60 tracking-wider block">
                Available Credits
              </span>
              <span className="font-serif text-2xl font-bold text-[#C45A7A] mt-1 block">
                ₹{profile?.creditsAvailable || 0}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                Ready to apply at checkout
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#F8BBD0]/70 text-center shadow-xs">
              <span className="text-[11px] uppercase font-bold text-[#59434D]/60 tracking-wider block">
                Friends Invited
              </span>
              <span className="font-serif text-2xl font-bold text-[#59434D] mt-1 block">
                {profile?.totalInvited || 0}
              </span>
              <span className="text-[10px] text-[#59434D]/60 block mt-0.5">
                Total ₹{profile?.creditsEarned || 0} earned
              </span>
            </div>
          </div>

          {/* Referral Code Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FFC0CB]/20 via-[#FFF0F5] to-[#E6D6FF]/20 border border-[#F8BBD0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C45A7A]">
                Your Exclusive Referral Code
              </span>
              <span className="text-xs text-[#59434D]/70 font-medium">Valid on all 3D Gift Boxes</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-[#F8BBD0] font-mono font-bold text-base text-[#59434D] tracking-widest text-center shadow-xs">
                {referralCode}
              </div>
              <button
                onClick={() => copyToClipboard(referralCode, false)}
                className="px-4 py-2.5 rounded-2xl bg-[#C45A7A] hover:bg-[#b04f6c] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#59434D]/70">Or share direct referral link:</span>
              <button
                onClick={() => copyToClipboard(shareLink, true)}
                className="text-xs font-semibold text-[#C45A7A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
              </button>
            </div>
          </div>

          {/* How It Works Steps */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#59434D]">How the Pookie Referral Works</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: '1', title: 'Share Your Code', desc: 'Send your code to besties, partners, or family.' },
                { step: '2', title: 'They Save ₹150', desc: 'They get ₹150 flat off on their first custom gift box.' },
                { step: '3', title: 'You Get ₹150', desc: 'As soon as their order is placed, ₹150 credit is yours!' },
              ].map((s) => (
                <div key={s.step} className="p-3.5 rounded-2xl bg-white border border-[#F8BBD0]/50 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-[#FFF0F5] border border-[#F8BBD0] flex items-center justify-center text-xs font-bold text-[#C45A7A]">
                    {s.step}
                  </div>
                  <h5 className="font-serif font-bold text-xs text-[#59434D]">{s.title}</h5>
                  <p className="text-[11px] text-[#59434D]/70 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Ledger / History */}
          {profile?.history && profile.history.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-sm text-[#59434D]">Your Referral Activity</h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {profile.history.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-2xl bg-white border border-[#F8BBD0]/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-[#59434D] block">{h.referredName}</span>
                      <span className="text-[10px] text-[#59434D]/50">{h.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 block">+₹{h.reward}</span>
                      <span className="text-[10px] text-gray-400 capitalize">{h.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-white border-t border-[#F8BBD0]/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-gray-200 text-xs font-semibold text-[#59434D] hover:bg-gray-50 cursor-pointer"
          >
            Close
          </button>
          {profile?.creditsAvailable && profile.creditsAvailable > 0 && onApplyDiscountCode && (
            <button
              onClick={() => {
                onApplyDiscountCode(referralCode);
                onClose();
              }}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-[#FFC0CB] to-[#C45A7A] text-white text-xs font-bold shadow-sm hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use ₹{profile.creditsAvailable} Off at Checkout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

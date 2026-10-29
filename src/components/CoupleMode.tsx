import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Plus, Sparkles, Gift, Trash2, Clock, Check, Edit2 } from 'lucide-react';
import { BowIcon } from './BowIcon.tsx';
import { CoupleSpace, CoupleMilestone, CoupleWishlistItem, CoupleLoveNote, Product } from '../types.ts';

interface CoupleModeProps {
  userId: string;
  products: Product[];
  onOpenBuilderWithWishlistItem: (product: Product) => void;
}

export const CoupleMode: React.FC<CoupleModeProps> = ({
  userId,
  products,
  onOpenBuilderWithWishlistItem,
}) => {
  const [space, setSpace] = useState<CoupleSpace | null>(null);
  const [loading, setLoading] = useState(true);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Modal forms
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isEditPartnerOpen, setIsEditPartnerOpen] = useState(false);

  // New item states
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newAnniversary, setNewAnniversary] = useState('');
  const [newRelationship, setNewRelationship] = useState('Soulmate');

  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [milestoneNote, setMilestoneNote] = useState('');

  const [wishlistTitle, setWishlistTitle] = useState('');
  const [wishlistBudget, setWishlistBudget] = useState(1500);
  const [wishlistSelectedProd, setWishlistSelectedProd] = useState('');
  const [wishlistNotes, setWishlistNotes] = useState('');

  const [noteMessage, setNoteMessage] = useState('');

  // Fetch Couple Space
  const fetchSpace = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/couple-space?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSpace(data.space);
        setNewPartnerName(data.space.partnerName);
        setNewAnniversary(data.space.anniversaryDate);
        setNewRelationship(data.space.relationshipType);
      }
    } catch (err) {
      console.error('Error fetching couple space:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpace();
  }, [userId]);

  // Live Anniversary Countdown Calculator
  useEffect(() => {
    if (!space?.anniversaryDate) return;

    const calculateTime = () => {
      const now = new Date();
      let targetYear = now.getFullYear();
      let target = new Date(`${targetYear}-${space.anniversaryDate.slice(5)}T00:00:00`);

      if (target.getTime() < now.getTime()) {
        target = new Date(`${targetYear + 1}-${space.anniversaryDate.slice(5)}T00:00:00`);
      }

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [space?.anniversaryDate]);

  const handleUpdatePartner = async () => {
    try {
      const res = await fetch('/api/couple-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          partnerName: newPartnerName,
          anniversaryDate: newAnniversary,
          relationshipType: newRelationship,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSpace(data.space);
        setIsEditPartnerOpen(false);
      }
    } catch (e) {
      console.error('Error updating couple space:', e);
    }
  };

  const handleAddMilestone = async () => {
    if (!milestoneTitle || !milestoneDate) return;
    try {
      const res = await fetch('/api/couple-space/milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: milestoneTitle,
          date: milestoneDate,
          note: milestoneNote,
        }),
      });
      if (res.ok) {
        setMilestoneTitle('');
        setMilestoneDate('');
        setMilestoneNote('');
        setIsMilestoneModalOpen(false);
        fetchSpace();
      }
    } catch (e) {
      console.error('Error adding milestone:', e);
    }
  };

  const handleAddWishlistItem = async () => {
    if (!wishlistTitle) return;
    try {
      const res = await fetch('/api/couple-space/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: wishlistTitle,
          budget: wishlistBudget,
          notes: wishlistNotes,
          productId: wishlistSelectedProd || undefined,
        }),
      });
      if (res.ok) {
        setWishlistTitle('');
        setWishlistNotes('');
        setIsWishlistModalOpen(false);
        fetchSpace();
      }
    } catch (e) {
      console.error('Error adding wishlist item:', e);
    }
  };

  const handleAddNote = async () => {
    if (!noteMessage) return;
    try {
      const res = await fetch('/api/couple-space/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: noteMessage,
          from: 'Me',
        }),
      });
      if (res.ok) {
        setNoteMessage('');
        setIsNoteModalOpen(false);
        fetchSpace();
      }
    } catch (e) {
      console.error('Error adding love note:', e);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#FFF0F5] border border-[#F8BBD0] flex items-center justify-center animate-bounce text-[#C45A7A]">
          <BowIcon className="w-6 h-6 text-[#C45A7A]" />
        </div>
        <p className="mt-3 text-sm text-[#59434D]">Opening your private sanctuary...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#FFC0CB]/40 via-[#FFF0F5] to-[#E6D6FF]/40 border border-[#F8BBD0] p-6 sm:p-8 shadow-sm overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#F8BBD0] text-xs font-bold text-[#C45A7A]">
            <Heart className="w-3.5 h-3.5 fill-[#C45A7A] text-[#C45A7A]" />
            <span>Private Couple Sanctuary</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#59434D]">
            You & {space?.partnerName}
          </h2>
          <p className="text-xs sm:text-sm text-[#59434D]/75 leading-relaxed">
            Your private corner for shared memories, anniversary countdowns, dropped gift hints, and little love notes.
          </p>
        </div>

        <button
          onClick={() => setIsEditPartnerOpen(true)}
          className="px-4 py-2 rounded-full bg-white border border-[#F8BBD0] text-xs font-semibold text-[#59434D] hover:text-[#C45A7A] flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Details</span>
        </button>
      </div>

      {/* Live Anniversary Countdown Card */}
      <div className="rounded-3xl bg-white border border-[#F8BBD0] p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
        <span className="text-xs uppercase font-bold tracking-widest text-[#C45A7A] mb-1 block">
          Next Anniversary Countdown
        </span>
        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#59434D] mb-6">
          Celebrating Our Next Chapter ({space?.anniversaryDate})
        </h3>

        <div className="grid grid-cols-4 max-w-md mx-auto gap-3 sm:gap-4">
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hours' },
            { value: timeLeft.minutes, label: 'Mins' },
            { value: timeLeft.seconds, label: 'Secs' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#FFF5F7] to-[#FFF0F5] border border-[#F8BBD0]/60 shadow-xs flex flex-col items-center justify-center"
            >
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#C45A7A]">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#59434D]/70 mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Grid: Milestones & Shared Gift Wishlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column 1: Relationship Milestones */}
        <div className="rounded-3xl bg-white border border-[#F8BBD0] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C45A7A]" />
              <h4 className="font-serif font-bold text-base text-[#59434D]">Sweet Milestones</h4>
            </div>
            <button
              onClick={() => setIsMilestoneModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-[#FFF0F5] text-[#C45A7A] hover:bg-[#F8BBD0]/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="space-y-3">
            {space?.milestones.length === 0 ? (
              <p className="text-xs text-[#59434D]/60 py-4 text-center">No milestones added yet. Click Add to log your first date or memory!</p>
            ) : (
              space?.milestones.map((m) => (
                <div key={m.id} className="p-3.5 rounded-2xl bg-[#FFF9F5] border border-[#F8BBD0]/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[#59434D]">{m.title}</span>
                    <span className="text-[11px] font-medium text-[#C45A7A] bg-white px-2 py-0.5 rounded-full border border-[#F8BBD0]/50">
                      {m.date}
                    </span>
                  </div>
                  {m.note && <p className="text-xs text-[#59434D]/75 leading-relaxed">{m.note}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Secret Gift Wishlist ("Hints Dropped") */}
        <div className="rounded-3xl bg-white border border-[#F8BBD0] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#C45A7A]" />
              <h4 className="font-serif font-bold text-base text-[#59434D]">Gift Wishlist & Hints</h4>
            </div>
            <button
              onClick={() => setIsWishlistModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-[#FFF0F5] text-[#C45A7A] hover:bg-[#F8BBD0]/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Hint
            </button>
          </div>

          <div className="space-y-3">
            {space?.wishlist.length === 0 ? (
              <p className="text-xs text-[#59434D]/60 py-4 text-center">No gift hints yet. Save gifts they casually mention so you are always prepared!</p>
            ) : (
              space?.wishlist.map((w) => {
                const linkedProduct = products.find((p) => p.id === w.productId);
                return (
                  <div key={w.id} className="p-3.5 rounded-2xl bg-[#FFF9F5] border border-[#F8BBD0]/50 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-serif font-bold text-sm text-[#59434D] block truncate">{w.title}</span>
                      <div className="flex items-center gap-2 text-[11px] text-[#59434D]/60 mt-0.5">
                        {w.budget ? <span className="font-semibold text-[#C45A7A]">Est. ₹{w.budget}</span> : null}
                        {w.notes && <span>• {w.notes}</span>}
                      </div>
                    </div>
                    {linkedProduct && (
                      <button
                        onClick={() => onOpenBuilderWithWishlistItem(linkedProduct)}
                        className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FFC0CB] to-[#C45A7A] text-white text-[11px] font-bold shrink-0 hover:opacity-95 cursor-pointer shadow-xs"
                      >
                        Pack in Box
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Love Notes Wall */}
      <div className="rounded-3xl bg-white border border-[#F8BBD0] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#F8BBD0]/40 pb-3">
          <div className="flex items-center gap-2">
            <BowIcon className="w-4 h-4 text-[#C45A7A]" />
            <h4 className="font-serif font-bold text-base text-[#59434D]">Secret Love Notes Wall</h4>
          </div>
          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-[#FFF0F5] text-[#C45A7A] hover:bg-[#F8BBD0]/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Leave a Note
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {space?.loveNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#FFF5F7] to-[#FFF0F5] border border-[#F8BBD0]/60 shadow-xs flex flex-col justify-between"
            >
              <p className="font-serif italic text-xs sm:text-sm text-[#59434D] leading-relaxed">
                "{note.message}"
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#C45A7A] font-semibold mt-3 pt-2 border-t border-[#F8BBD0]/30">
                <span>{note.from}</span>
                <span>{note.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Partner Modal */}
      {isEditPartnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#59434D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#F8BBD0] p-6 max-w-md w-full space-y-4 shadow-xl">
            <h4 className="font-serif font-bold text-lg text-[#59434D]">Update Couple Details</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#59434D] block mb-1">Partner's Name</label>
                <input
                  type="text"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#59434D] block mb-1">Anniversary Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={newAnniversary}
                  onChange={(e) => setNewAnniversary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#59434D] block mb-1">Relationship</label>
                <input
                  type="text"
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditPartnerOpen(false)}
                className="px-4 py-2 rounded-full border text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePartner}
                className="px-5 py-2 rounded-full bg-[#C45A7A] text-white text-xs font-bold cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#59434D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#F8BBD0] p-6 max-w-md w-full space-y-4 shadow-xl">
            <h4 className="font-serif font-bold text-lg text-[#59434D]">Add Relationship Milestone</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#59434D] block mb-1">Milestone Title</label>
                <input
                  type="text"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="e.g. First Trip to Paris, Moving In Together"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#59434D] block mb-1">Date</label>
                <input
                  type="date"
                  value={milestoneDate}
                  onChange={(e) => setMilestoneDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#59434D] block mb-1">Memory Note</label>
                <textarea
                  rows={2}
                  value={milestoneNote}
                  onChange={(e) => setMilestoneNote(e.target.value)}
                  placeholder="What made this moment unforgettable?"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsMilestoneModalOpen(false)}
                className="px-4 py-2 rounded-full border text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMilestone}
                className="px-5 py-2 rounded-full bg-[#C45A7A] text-white text-xs font-bold cursor-pointer"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Wishlist Hint Modal */}
      {isWishlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#59434D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#F8BBD0] p-6 max-w-md w-full space-y-4 shadow-xl">
            <h4 className="font-serif font-bold text-lg text-[#59434D]">Save a Gift Hint</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#59434D] block mb-1">Gift Item Name</label>
                <input
                  type="text"
                  value={wishlistTitle}
                  onChange={(e) => setWishlistTitle(e.target.value)}
                  placeholder="e.g. Everlasting Pink Peonies"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#59434D] block mb-1">Link to Catalog Product (optional)</label>
                <select
                  value={wishlistSelectedProd}
                  onChange={(e) => setWishlistSelectedProd(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="">None / Custom Gift</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#59434D] block mb-1">Estimated Budget (₹)</label>
                <input
                  type="number"
                  value={wishlistBudget}
                  onChange={(e) => setWishlistBudget(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#59434D] block mb-1">Hint Context</label>
                <input
                  type="text"
                  value={wishlistNotes}
                  onChange={(e) => setWishlistNotes(e.target.value)}
                  placeholder="e.g. Said she liked the pink ribbon on Instagram"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsWishlistModalOpen(false)}
                className="px-4 py-2 rounded-full border text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWishlistItem}
                className="px-5 py-2 rounded-full bg-[#C45A7A] text-white text-xs font-bold cursor-pointer"
              >
                Save Hint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Love Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#59434D]/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#F8BBD0] p-6 max-w-md w-full space-y-4 shadow-xl">
            <h4 className="font-serif font-bold text-lg text-[#59434D]">Leave a Secret Love Note</h4>
            <div>
              <label className="text-xs font-semibold text-[#59434D] block mb-1">Your Message</label>
              <textarea
                rows={3}
                value={noteMessage}
                onChange={(e) => setNoteMessage(e.target.value)}
                placeholder="Write something sweet to brighten their day..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="px-4 py-2 rounded-full border text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-5 py-2 rounded-full bg-[#C45A7A] text-white text-xs font-bold cursor-pointer"
              >
                Post Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

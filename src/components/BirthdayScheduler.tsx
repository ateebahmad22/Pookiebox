import React, { useState, useEffect } from 'react';
import { BirthdayEntry, Product } from '../types.ts';
import { Calendar, Cake, Bell, Sparkles, Plus, Trash2, Edit2, Gift, Send, Clock, Heart, CheckCircle2 } from 'lucide-react';
import { BowIcon } from './BowIcon.tsx';

interface BirthdaySchedulerProps {
  products: Product[];
  onBuildBoxForBirthday: (birthday: BirthdayEntry) => void;
  userId?: string;
}

export const BirthdayScheduler: React.FC<BirthdaySchedulerProps> = ({
  products,
  onBuildBoxForBirthday,
  userId = 'user-demo-1',
}) => {
  const [birthdays, setBirthdays] = useState<BirthdayEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [date, setDate] = useState('');
  const [relationship, setRelationship] = useState('Best Friend');
  const [email, setEmail] = useState('');
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>(['plushies', 'chocolates']);
  const [budget, setBudget] = useState(2000);
  const [reminderDays, setReminderDays] = useState<number[]>([7, 3, 1, 0]);
  const [notes, setNotes] = useState('');
  const [emailConsent, setEmailConsent] = useState(true);

  // Suggestion Modal State
  const [suggestModalBday, setSuggestModalBday] = useState<BirthdayEntry | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const fetchBirthdays = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/birthdays?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBirthdays(data.birthdays || []);
      }
    } catch (err) {
      console.error('Error fetching birthdays:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthdays();
  }, [userId]);

  const resetForm = () => {
    setRecipientName('');
    setDate('');
    setRelationship('Best Friend');
    setEmail('');
    setFavoriteCategories(['plushies', 'chocolates']);
    setBudget(2000);
    setReminderDays([7, 3, 1, 0]);
    setNotes('');
    setIsEditing(false);
    setActiveEntryId(null);
  };

  const handleSaveBirthday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !date) return;

    const payload = {
      userId,
      recipientName,
      date,
      relationship,
      email,
      favoriteCategories,
      budget: Number(budget),
      reminderDays,
      notes,
    };

    try {
      if (isEditing && activeEntryId) {
        const res = await fetch(`/api/birthdays/${activeEntryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchBirthdays();
          resetForm();
        }
      } else {
        const res = await fetch('/api/birthdays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          fetchBirthdays();
          resetForm();
        }
      }
    } catch (err) {
      console.error('Error saving birthday:', err);
    }
  };

  const handleEditClick = (bday: BirthdayEntry) => {
    setIsEditing(true);
    setActiveEntryId(bday.id);
    setRecipientName(bday.recipientName);
    setDate(bday.date);
    setRelationship(bday.relationship);
    setEmail(bday.email || '');
    setFavoriteCategories(bday.favoriteCategories || []);
    setBudget(bday.budget || 1500);
    setReminderDays(bday.reminderDays || [7, 1]);
    setNotes(bday.notes || '');
  };

  const handleDeleteClick = async (id: string) => {
    try {
      const res = await fetch(`/api/birthdays/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBirthdays((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Error deleting birthday:', err);
    }
  };

  const handleTestReminder = async (bday: BirthdayEntry) => {
    try {
      const res = await fetch(`/api/birthdays/${bday.id}/send-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ateebahmad298@gmail.com' }),
      });
      if (res.ok) {
        setNotificationStatus(`✨ Reminder dispatched for ${bday.recipientName}! Check Email Logs in Admin.`);
        setTimeout(() => setNotificationStatus(null), 4000);
      }
    } catch (err) {
      console.error('Error triggering reminder:', err);
    }
  };

  // Days until birthday calculation
  const getDaysUntil = (bdayDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = bdayDateStr.split('-').map(Number);
    let nextBday = new Date(today.getFullYear(), month - 1, day);
    if (nextBday < today) {
      nextBday = new Date(today.getFullYear() + 1, month - 1, day);
    }
    const diffTime = nextBday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Sorted upcoming list
  const sortedBirthdays = [...birthdays].sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
  const nextBirthday = sortedBirthdays[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold tracking-wider text-[#C45A7A] uppercase flex items-center justify-center gap-1.5">
          <Cake className="w-3.5 h-3.5" />
          <span>Never Miss a Cherished Moment</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#59434D] mt-1 font-bold flex items-center justify-center gap-2">
          <span>Birthday & Surprise Scheduler</span>
          <BowIcon className="w-6 h-6 text-[#C45A7A]" />
        </h1>
        <p className="text-sm text-[#59434D]/80 mt-2">
          Save birthdays for your loved ones, receive gentle email reminders, and generate tailored PookieBox gift combinations.
        </p>
      </div>

      {notificationStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notificationStatus}</span>
        </div>
      )}

      {/* Countdown Hero Banner for Next Birthday */}
      {nextBirthday && (
        <div className="bg-gradient-to-r from-[#FFC0CB]/30 via-[#F8BBD0]/40 to-[#E6D6FF]/40 rounded-3xl p-6 sm:p-8 border border-[#F8BBD0]/50 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-[#F8BBD0]">
              <Cake className="w-8 h-8 text-[#C45A7A]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#C45A7A] uppercase tracking-wider">
                Upcoming Celebration
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#59434D]">
                {nextBirthday.recipientName} ({nextBirthday.relationship})
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Date: <strong>{nextBirthday.date}</strong> • Budget: ₹{nextBirthday.budget}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-2 bg-white/90 backdrop-blur-xs rounded-2xl border border-[#F8BBD0]/60 shadow-xs">
              <span className="text-3xl font-bold font-serif text-[#C45A7A] tabular-nums">
                {getDaysUntil(nextBirthday.date)}
              </span>
              <span className="block text-[11px] font-medium text-gray-500 uppercase">Days Left</span>
            </div>

            <button
              onClick={() => onBuildBoxForBirthday(nextBirthday)}
              className="py-3 px-5 rounded-2xl bg-[#C45A7A] text-white text-xs sm:text-sm font-semibold hover:bg-[#b04867] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              Build Gift Box Now
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Form (Left) vs Upcoming List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#F8BBD0]/50 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
            <h3 className="text-base font-semibold text-[#59434D] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C45A7A]" />
              {isEditing ? 'Edit Birthday Entry' : 'Add Loved One’s Birthday'}
            </h3>
            {isEditing && (
              <button
                onClick={resetForm}
                className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSaveBirthday} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#59434D] mb-1">Recipient Name *</label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Maya, Sister Ayla, Bestie"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Birthday Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A] bg-white"
                >
                  {['Best Friend', 'Partner / Soulmate', 'Sister', 'Mom', 'Brother', 'Daughter', 'Colleague'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#59434D] mb-1">
                Recipient Email (Optional for direct greeting)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="their-email@example.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Gift Budget (INR)</label>
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-1">Reminder Timing</label>
                <div className="flex items-center gap-1.5 pt-1 text-xs">
                  {[7, 3, 1, 0].map((d) => {
                    const isChecked = reminderDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setReminderDays(reminderDays.filter((x) => x !== d));
                          } else {
                            setReminderDays([...reminderDays, d]);
                          }
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                          isChecked ? 'bg-[#FFF0F5] text-[#C45A7A] border-[#C45A7A]' : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        {d === 0 ? 'Day-of' : `${d}d`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#59434D] mb-1">Personal Gifting Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Loves baby pink plushies, dark chocolates, and rose gold jewelry..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A]"
              />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="consentCheck"
                checked={emailConsent}
                onChange={(e) => setEmailConsent(e.target.checked)}
                className="mt-0.5 rounded text-[#C45A7A] focus:ring-[#C45A7A]"
              />
              <label htmlFor="consentCheck" className="text-[11px] text-gray-500 leading-tight">
                Send me email reminders before this date. (Reminders only alert you and never automatically charge or place an order without your consent).
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Add to Birthday Calendar'}
            </button>
          </form>
        </div>

        {/* Saved Birthdays List Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#59434D]">
              Scheduled Celebrations ({birthdays.length})
            </h3>
            <span className="text-xs text-gray-500">Sorted by upcoming date</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading your birthday calendar...</div>
          ) : birthdays.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-[#F8BBD0]">
              <Cake className="w-10 h-10 text-[#F8BBD0] mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-[#59434D]">No birthdays saved yet</h4>
              <p className="text-xs text-gray-500 mt-1">Add your best friends and loved ones on the left!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedBirthdays.map((bday) => {
                const daysLeft = getDaysUntil(bday.date);

                return (
                  <div
                    key={bday.id}
                    className="bg-white rounded-2xl p-5 border border-[#F8BBD0]/50 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#C45A7A]/40 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-[#59434D]">{bday.recipientName}</h4>
                        <span className="text-[11px] text-[#C45A7A] bg-[#FFF0F5] px-2 py-0.5 rounded-full font-medium">
                          {bday.relationship}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-3">
                        <span>📅 {bday.date}</span>
                        <span>💰 ₹{bday.budget}</span>
                        <span>🔔 {bday.reminderDays.join(', ')}d</span>
                      </div>
                      {bday.notes && (
                        <p className="text-[11px] text-gray-400 italic line-clamp-1">"{bday.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="text-right mr-2 hidden sm:block">
                        <span className="text-base font-bold text-[#C45A7A] tabular-nums">{daysLeft}</span>
                        <span className="block text-[10px] text-gray-400 uppercase">days left</span>
                      </div>

                      <button
                        onClick={() => setSuggestModalBday(bday)}
                        title="View Curated Gifts"
                        className="p-2 rounded-xl text-gray-600 hover:text-[#C45A7A] hover:bg-[#FFF0F5] transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </button>

                      <button
                        onClick={() => handleTestReminder(bday)}
                        title="Send Test Reminder Email"
                        className="p-2 rounded-xl text-gray-600 hover:text-[#C45A7A] hover:bg-[#FFF0F5] transition-colors cursor-pointer"
                      >
                        <Bell className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onBuildBoxForBirthday(bday)}
                        className="py-1.5 px-3 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        Build Box
                      </button>

                      <button
                        onClick={() => handleEditClick(bday)}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(bday.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Gift Suggestions Modal */}
      {suggestModalBday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-[#F8BBD0]">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-semibold text-[#59434D]">
                  Curated Gifts for {suggestModalBday.recipientName}
                </h3>
                <p className="text-xs text-gray-500">
                  Target budget: ₹{suggestModalBday.budget} • {suggestModalBday.relationship}
                </p>
              </div>
              <button
                onClick={() => setSuggestModalBday(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {products
                .filter((p) => p.price <= suggestModalBday.budget)
                .slice(0, 4)
                .map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:border-[#F8BBD0]">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded-xl border"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-[#59434D]">{prod.name}</h4>
                        <span className="text-[11px] text-gray-500">{prod.category}</span>
                        <div className="text-xs font-bold text-[#C45A7A]">₹{prod.price}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSuggestModalBday(null);
                        onBuildBoxForBirthday(suggestModalBday);
                      }}
                      className="py-1 px-3 rounded-xl text-xs font-medium text-[#C45A7A] bg-[#FFF0F5] hover:bg-[#F8BBD0]/40 transition-colors cursor-pointer"
                    >
                      Pick for Box
                    </button>
                  </div>
                ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => {
                  setSuggestModalBday(null);
                  onBuildBoxForBirthday(suggestModalBday);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] cursor-pointer"
              >
                Open 3D Box Builder for {suggestModalBday.recipientName}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

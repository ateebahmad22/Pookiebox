import React, { useState } from 'react';
import { X, Send, Sparkles, ShoppingBag, Box, RefreshCw, MessageSquare } from 'lucide-react';
import { BowIcon } from './BowIcon.tsx';
import { Product } from '../types.ts';

interface AiGiftingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onOpenBuilderWithProduct: (product: Product) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedProducts?: Product[];
}

export const AiGiftingAssistant: React.FC<AiGiftingAssistantProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  onOpenBuilderWithProduct,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "Hello darling! I'm your Pookie AI Stylist. Tell me who you are surprising, the occasion, or your budget, and I will handpick the sweetest treasures from our collection for you! 🎀",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputValue.trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/gift-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'Here are some charming gifts I selected just for you!',
          recommendedProducts: data.recommendedProducts || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const fallbackMsg: ChatMessage = {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: "I'd love to help you style a gift box! Feel free to ask about our plushies, chocolates, or necklaces under any budget.",
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch (err) {
      console.error('AI chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#59434D]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FFF9F5] border border-[#F8BBD0] rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#FFC0CB]/30 via-[#FFF9F5] to-[#E6D6FF]/30 border-b border-[#F8BBD0]/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] border border-[#F8BBD0] flex items-center justify-center text-[#C45A7A] shadow-xs">
              <BowIcon className="w-5 h-5 text-[#C45A7A]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#59434D] flex items-center gap-1.5">
                Pookie AI Stylist
                <span className="text-[10px] bg-white text-[#C45A7A] px-2 py-0.5 rounded-full border border-[#F8BBD0]">
                  Grounded in Live Inventory
                </span>
              </h3>
              <p className="text-[11px] text-[#59434D]/70">
                Personalized gift recommendations powered by Gemini
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

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2.5 bg-white/60 border-b border-[#F8BBD0]/30 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar shrink-0">
          {[
            'Romantic gift under ₹2,000',
            'Birthday surprise for my sister',
            'Cheer up bestie with plushie',
            'Aesthetic desk stationery gifts',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="px-3 py-1 rounded-full bg-white border border-[#F8BBD0]/70 text-[#59434D] hover:text-[#C45A7A] hover:bg-[#FFF0F5] whitespace-nowrap text-[11px] font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#C45A7A] text-white rounded-tr-xs shadow-xs'
                    : 'bg-white text-[#59434D] border border-[#F8BBD0]/60 rounded-tl-xs shadow-xs'
                }`}
              >
                {msg.text}
              </div>

              {/* Recommended Catalog Product Cards */}
              {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                  {msg.recommendedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3.5 rounded-2xl bg-white border border-[#F8BBD0]/70 shadow-xs flex flex-col justify-between space-y-2.5"
                    >
                      <div className="flex gap-2.5 items-center">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-14 h-14 rounded-xl object-cover border border-[#F8BBD0]/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-bold text-[#C45A7A] tracking-wider block">
                            {prod.category}
                          </span>
                          <h5 className="font-serif font-bold text-xs text-[#59434D] truncate">{prod.name}</h5>
                          <span className="font-bold text-xs text-[#C45A7A] block mt-0.5">₹{prod.price}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 border-t border-[#F8BBD0]/30">
                        <button
                          onClick={() => {
                            onAddToCart(prod);
                            onClose();
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-[#FFF0F5] hover:bg-[#F8BBD0]/30 border border-[#F8BBD0] text-[11px] font-semibold text-[#C45A7A] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add to Cart</span>
                        </button>
                        <button
                          onClick={() => {
                            onOpenBuilderWithProduct(prod);
                            onClose();
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-[#FFC0CB] to-[#C45A7A] text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs hover:opacity-95"
                        >
                          <Box className="w-3 h-3" />
                          <span>3D Box</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-[#F8BBD0]/50 max-w-xs text-xs text-[#C45A7A]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Pookie AI is styling your recommendations...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#F8BBD0]/40 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything: 'Find a cute anniversary gift under ₹3000'..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FFF9F5] border border-[#F8BBD0]/70 text-xs sm:text-sm text-[#59434D] focus:outline-none focus:ring-2 focus:ring-[#C45A7A]/30"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="px-5 py-2.5 rounded-2xl bg-[#C45A7A] hover:bg-[#b04f6c] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

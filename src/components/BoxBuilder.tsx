import React, { useState } from 'react';
import { ThreeGiftBox } from './ThreeGiftBox.tsx';
import { Product, CustomGiftBox, CustomGiftBoxItem, RibbonStyle } from '../types.ts';
import { BOX_STYLES, RIBBON_COLORS, RIBBON_STYLES, WRAPPING_STYLES } from '../data/catalog.ts';
import { Check, Plus, Minus, Heart, Sparkles, ShoppingBag, Eye, Bookmark, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BoxBuilderProps {
  products: Product[];
  onAddToCart: (box: CustomGiftBox) => void;
  onSaveBox?: (box: CustomGiftBox) => void;
  onProceedToCheckout?: (box: CustomGiftBox) => void;
  initialBox?: CustomGiftBox | null;
}

export const BoxBuilder: React.FC<BoxBuilderProps> = ({
  products,
  onAddToCart,
  onSaveBox,
  onProceedToCheckout,
  initialBox,
}) => {
  const [selectedBoxStyle, setSelectedBoxStyle] = useState(
    initialBox ? BOX_STYLES.find(b => b.id === initialBox.boxStyleId) || BOX_STYLES[0] : BOX_STYLES[0]
  );
  const [boxColor, setBoxColor] = useState(initialBox?.boxColor || selectedBoxStyle.boxColor);
  const [ribbonColor, setRibbonColor] = useState(initialBox?.ribbonColor || selectedBoxStyle.ribbonDefaultColor);
  const [ribbonStyle, setRibbonStyle] = useState<RibbonStyle['style']>(initialBox?.ribbonStyle || 'satin_bow');
  const [wrappingStyleId, setWrappingStyleId] = useState(initialBox?.wrappingStyleId || WRAPPING_STYLES[0].id);

  const [boxItems, setBoxItems] = useState<CustomGiftBoxItem[]>(initialBox?.items || []);
  const [recipientName, setRecipientName] = useState(initialBox?.recipientName || '');
  const [personalizedMessage, setPersonalizedMessage] = useState(
    initialBox?.personalizedMessage || 'You are so cherished and loved! Happy Birthday my favorite pookie 💖'
  );

  const [isLidOpen, setIsLidOpen] = useState(true);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Pricing calculations
  const selectedRibbon = RIBBON_STYLES.find((r) => r.style === ribbonStyle);
  const selectedWrap = WRAPPING_STYLES.find((w) => w.id === wrappingStyleId) || WRAPPING_STYLES[0];

  const boxBasePrice = selectedBoxStyle.price + (selectedRibbon?.extraPrice || 0);
  const itemsPrice = boxItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const wrappingPrice = selectedWrap.price;
  const totalPrice = boxBasePrice + itemsPrice + wrappingPrice;

  const handleAddItem = (product: Product) => {
    setBoxItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setBoxItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === productId);
      if (idx === -1) return prev;
      if (prev[idx].quantity > 1) {
        const copy = [...prev];
        copy[idx].quantity -= 1;
        return copy;
      }
      return prev.filter((i) => i.product.id !== productId);
    });
  };

  const getCustomBoxObject = (): CustomGiftBox => ({
    id: `custom-box-${Date.now()}`,
    name: `${selectedBoxStyle.name} (${boxItems.length} Gifts)`,
    boxStyleId: selectedBoxStyle.id,
    boxColor,
    ribbonColor,
    ribbonStyle,
    wrappingStyleId,
    items: boxItems,
    recipientName,
    personalizedMessage,
    boxPrice: boxBasePrice,
    itemsPrice,
    wrappingPrice,
    totalPrice,
    createdAt: new Date().toISOString(),
  });

  const handleAddBoxToCart = () => {
    const box = getCustomBoxObject();
    onAddToCart(box);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FFC0CB', '#F8BBD0', '#C45A7A', '#E6D6FF'],
    });
  };

  const handleSaveBoxAction = () => {
    const box = getCustomBoxObject();
    if (onSaveBox) onSaveBox(box);
    setShowSaveModal(true);
    setTimeout(() => setShowSaveModal(false), 2400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-semibold tracking-wider text-[#C45A7A] uppercase">
          Coquette Atelier & Studio
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#59434D] mt-1.5 font-bold">
          Build Your Custom 3D PookieBox 🎀
        </h1>
        <p className="text-sm text-[#59434D]/80 mt-2">
          Design your keepsake box in real-time 3D, pick adorable treasures, and add your handwritten love note.
        </p>
      </div>

      {/* Main Grid: 3D Preview (Sticky on Desktop) vs Step Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Box Preview & Live Itemized Breakdown */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
          <ThreeGiftBox
            boxColor={boxColor}
            ribbonColor={ribbonColor}
            ribbonStyle={ribbonStyle}
            items={boxItems}
            isOpen={isLidOpen}
            onToggleOpen={() => setIsLidOpen(!isLidOpen)}
            recipientName={recipientName}
          />

          {/* Quick 3D View Toggles */}
          <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-[#F8BBD0]/50 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#59434D]">Lid State:</span>
              <button
                onClick={() => setIsLidOpen(!isLidOpen)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[#FFF0F5] text-[#C45A7A] hover:bg-[#F8BBD0]/30 transition-colors cursor-pointer"
              >
                {isLidOpen ? 'Open (Viewing Gifts)' : 'Closed (Gift Box Wrapped)'}
              </button>
            </div>
            <div className="text-xs text-[#59434D]/70">
              Gifts inside: <strong className="text-[#C45A7A] font-semibold">{boxItems.reduce((s, i) => s + i.quantity, 0)}</strong>
            </div>
          </div>

          {/* Itemized Live Pricing Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#F8BBD0]/50 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#F8BBD0]/30 pb-2">
              <h3 className="text-sm font-semibold text-[#59434D]">Live Price Breakdown</h3>
              <span className="text-xs text-gray-500 font-sans">Automatic Recalculation</span>
            </div>

            <div className="space-y-1.5 text-xs text-[#59434D]/90">
              <div className="flex justify-between">
                <span>{selectedBoxStyle.name} + {selectedRibbon?.name}</span>
                <span className="font-semibold tabular-nums">₹{boxBasePrice}</span>
              </div>
              <div className="flex justify-between">
                <span>{selectedWrap.name}</span>
                <span className="font-semibold tabular-nums">₹{wrappingPrice}</span>
              </div>

              {boxItems.length > 0 ? (
                boxItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between pl-2 border-l-2 border-[#F8BBD0]/60 text-gray-600">
                    <span className="truncate max-w-[240px]">
                      {item.product.name} (x{item.quantity})
                    </span>
                    <span className="tabular-nums">₹{item.product.price * item.quantity}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 italic py-1 text-center">
                  Box is currently empty. Choose gifts from Step 2!
                </div>
              )}
            </div>

            <div className="border-t border-[#F8BBD0]/40 pt-2 flex items-baseline justify-between">
              <div>
                <span className="text-sm font-bold text-[#59434D]">Custom Box Total:</span>
                {totalPrice >= 999 && (
                  <span className="block text-[11px] text-emerald-600 font-medium">✓ Eligible for FREE delivery</span>
                )}
              </div>
              <span className="text-xl font-bold text-[#C45A7A] font-serif tabular-nums">
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAddBoxToCart}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-xs sm:text-sm text-white bg-[#C45A7A] hover:bg-[#b04867] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Add Gift Box to Cart
              </button>

              <button
                onClick={handleSaveBoxAction}
                className="py-3 px-4 rounded-xl font-medium text-xs sm:text-sm text-[#C45A7A] bg-[#FFF0F5] hover:bg-[#F8BBD0]/30 border border-[#F8BBD0] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Bookmark className="w-4 h-4" />
                Save Box
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Step by Step Customization */}
        <div className="lg:col-span-6 space-y-6">
          {/* Step Selector Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-[#FFF0F5] rounded-2xl border border-[#F8BBD0]/50 overflow-x-auto">
            {[
              { num: 1, label: '1. Box & Color' },
              { num: 2, label: '2. Select Gifts' },
              { num: 3, label: '3. Ribbons & Wrap' },
              { num: 4, label: '4. Note & Card' },
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num as any)}
                className={`flex-1 min-w-[105px] py-2 px-3 text-xs font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  activeStep === s.num
                    ? 'bg-white text-[#C45A7A] shadow-xs font-semibold'
                    : 'text-[#59434D]/70 hover:text-[#59434D]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Step 1: Select Box Style & Base Color */}
          {activeStep === 1 && (
            <div className="bg-white rounded-3xl p-6 border border-[#F8BBD0]/40 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[#59434D]">Step 1: Choose Your Keepsake Box Style</h3>
                <p className="text-xs text-gray-500 mt-1">Select from our signature handcrafted keepsake chests.</p>
              </div>

              <div className="space-y-3">
                {BOX_STYLES.map((box) => {
                  const isSelected = selectedBoxStyle.id === box.id;
                  return (
                    <div
                      key={box.id}
                      onClick={() => {
                        setSelectedBoxStyle(box);
                        setBoxColor(box.boxColor);
                        setRibbonColor(box.ribbonDefaultColor);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#C45A7A] bg-[#FFF5F8] shadow-xs ring-1 ring-[#C45A7A]'
                          : 'border-gray-200 hover:border-[#F8BBD0] bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl border border-black/10 shadow-inner flex items-center justify-center text-lg"
                          style={{ backgroundColor: box.boxColor }}
                        >
                          🎀
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#59434D]">{box.name}</h4>
                          <p className="text-xs text-gray-500 line-clamp-1">{box.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#C45A7A] tabular-nums">₹{box.price}</span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] text-[#C45A7A] font-medium justify-end">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Box Color Palette */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-semibold text-[#59434D] mb-2">
                  Fine-tune Box Exterior Color
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { name: 'Blush Pink', hex: '#FFB6C1' },
                    { name: 'Lavender Cloud', hex: '#E6D6FF' },
                    { name: 'Cream Silk', hex: '#FFF5EE' },
                    { name: 'Velvet Rose', hex: '#D4738C' },
                    { name: 'Mint Pastelle', hex: '#D8F3DC' },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setBoxColor(c.hex)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                        boxColor === c.hex ? 'scale-110 border-[#C45A7A] shadow-xs' : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                  <input
                    type="color"
                    value={boxColor}
                    onChange={(e) => setBoxColor(e.target.value)}
                    className="w-8 h-8 rounded-full cursor-pointer border border-gray-200 p-0 overflow-hidden"
                    title="Custom Color Picker"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Next: Select Gifts Inside <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Products to Fill Box */}
          {activeStep === 2 && (
            <div className="bg-white rounded-3xl p-6 border border-[#F8BBD0]/40 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#59434D]">Step 2: Fill Your Box with Sweet Treasures</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Select gifts to arrange inside. Items render instantly in the 3D model!
                  </p>
                </div>
                <span className="text-xs font-medium text-[#C45A7A] bg-[#FFF0F5] px-2.5 py-1 rounded-full">
                  {boxItems.reduce((s, i) => s + i.quantity, 0)} Items Added
                </span>
              </div>

              {/* Product List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                {products.map((prod) => {
                  const existing = boxItems.find((i) => i.product.id === prod.id);
                  const qty = existing ? existing.quantity : 0;

                  return (
                    <div
                      key={prod.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                        qty > 0 ? 'border-[#C45A7A] bg-[#FFF9FA]' : 'border-gray-200 bg-white hover:border-[#F8BBD0]'
                      }`}
                    >
                      <div className="flex gap-3 items-center">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-14 h-14 object-cover rounded-xl border border-[#F8BBD0]/40 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-[#59434D] truncate">{prod.name}</h4>
                          <span className="text-[11px] text-gray-500">{prod.category}</span>
                          <div className="text-xs font-bold text-[#C45A7A] mt-0.5 tabular-nums">
                            ₹{prod.price}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                        {qty === 0 ? (
                          <button
                            onClick={() => handleAddItem(prod)}
                            className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-[#C45A7A] bg-[#FFF0F5] hover:bg-[#F8BBD0]/40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add to Box
                          </button>
                        ) : (
                          <div className="w-full flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">Inside Box:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRemoveItem(prod.id)}
                                className="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-[#C45A7A] w-4 text-center">{qty}</span>
                              <button
                                onClick={() => handleAddItem(prod)}
                                className="w-6 h-6 rounded-lg bg-[#C45A7A] text-white flex items-center justify-center hover:bg-[#b04867] transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  ← Back to Box
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Next: Ribbons & Wrap <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Ribbon Style, Ribbon Color & Gift Wrapping */}
          {activeStep === 3 && (
            <div className="bg-white rounded-3xl p-6 border border-[#F8BBD0]/40 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[#59434D]">Step 3: Ribbon & Luxurious Wrapping</h3>
                <p className="text-xs text-gray-500 mt-1">Select your ribbon tying style, color, and bed filling.</p>
              </div>

              {/* Ribbon Colors */}
              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-2">Select Satin Ribbon Color</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {RIBBON_COLORS.map((rc) => {
                    const isSelected = ribbonColor.toLowerCase() === rc.hex.toLowerCase();
                    return (
                      <button
                        key={rc.hex}
                        onClick={() => setRibbonColor(rc.hex)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          isSelected ? 'border-[#C45A7A] bg-[#FFF5F8] shadow-xs' : 'border-gray-200 hover:border-[#F8BBD0]'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: rc.hex }}
                        />
                        <span className="text-[10px] font-medium text-[#59434D] truncate w-full">{rc.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ribbon Style */}
              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-2">Ribbon Tying Style</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {RIBBON_STYLES.map((r) => {
                    const isSelected = ribbonStyle === r.style;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setRibbonStyle(r.style)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected ? 'border-[#C45A7A] bg-[#FFF5F8] shadow-xs' : 'border-gray-200 bg-white hover:border-[#F8BBD0]'
                        }`}
                      >
                        <div>
                          <h5 className="text-xs font-semibold text-[#59434D]">{r.name}</h5>
                          <span className="text-[11px] text-gray-500">+₹{r.extraPrice}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#C45A7A]" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Wrapping Nest */}
              <div>
                <label className="block text-xs font-semibold text-[#59434D] mb-2">Interior Gift Wrapping & Bedding</label>
                <div className="space-y-2">
                  {WRAPPING_STYLES.map((w) => {
                    const isSelected = wrappingStyleId === w.id;
                    return (
                      <div
                        key={w.id}
                        onClick={() => setWrappingStyleId(w.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected ? 'border-[#C45A7A] bg-[#FFF5F8] shadow-xs' : 'border-gray-200 bg-white hover:border-[#F8BBD0]'
                        }`}
                      >
                        <div>
                          <h5 className="text-xs font-semibold text-[#59434D]">{w.name}</h5>
                          <p className="text-[11px] text-gray-500">{w.description}</p>
                        </div>
                        <span className="text-xs font-bold text-[#C45A7A] tabular-nums">+₹{w.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  ← Back to Gifts
                </button>
                <button
                  onClick={() => setActiveStep(4)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Next: Recipient & Note <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Recipient Name & Handwritten Love Note */}
          {activeStep === 4 && (
            <div className="bg-white rounded-3xl p-6 border border-[#F8BBD0]/40 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-semibold text-[#59434D]">Step 4: Personalize with Love</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Add the recipient’s name and a heartfelt message printed on a wax-sealed card.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#59434D] mb-1">
                    Recipient’s Name (Shown on 3D Box & Tag)
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. My Dearest Mia, Bestie Chloe, Mom"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A] focus:ring-1 focus:ring-[#C45A7A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#59434D] mb-1">
                    Personalized Message / Love Note
                  </label>
                  <textarea
                    rows={4}
                    value={personalizedMessage}
                    onChange={(e) => setPersonalizedMessage(e.target.value)}
                    placeholder="Write your sweet words here..."
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A] focus:ring-1 focus:ring-[#C45A7A]"
                  />
                  <div className="text-[11px] text-gray-400 text-right mt-1">
                    {personalizedMessage.length} characters (Printed in gold calligraphy font)
                  </div>
                </div>

                {/* Wax Seal Card Preview */}
                <div className="p-4 rounded-2xl bg-[#FFF9F5] border border-[#F8BBD0] text-center font-serif">
                  <div className="text-[11px] text-[#C45A7A] tracking-widest uppercase">PookieBox Letterpress Card</div>
                  <div className="text-sm font-semibold text-[#59434D] mt-2 italic">
                    "{personalizedMessage || 'Your sweet message will appear here...'}"
                  </div>
                  <div className="text-xs text-[#C45A7A] mt-2 font-sans font-medium">
                    With endless love 💗
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddBoxToCart}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-[#C45A7A] hover:bg-[#b04867] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add Custom Box to Cart (₹{totalPrice.toLocaleString('en-IN')})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Toast */}
      {showSaveModal && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#59434D] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <Heart className="w-4 h-4 text-[#F8BBD0] fill-current" />
          <span>Gift box configuration saved to your account!</span>
        </div>
      )}
    </div>
  );
};

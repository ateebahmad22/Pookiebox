import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HomePage } from './components/HomePage.tsx';
import { ProductCatalog } from './components/ProductCatalog.tsx';
import { BoxBuilder } from './components/BoxBuilder.tsx';
import { BirthdayScheduler } from './components/BirthdayScheduler.tsx';
import { CoupleMode } from './components/CoupleMode.tsx';
import { UserAccount } from './components/UserAccount.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { PhoneAuthModal } from './components/PhoneAuthModal.tsx';
import { GiftFinderQuizModal } from './components/GiftFinderQuizModal.tsx';
import { SurpriseMeModal } from './components/SurpriseMeModal.tsx';
import { GiftOpeningExperience } from './components/GiftOpeningExperience.tsx';
import { ReferAndEarnModal } from './components/ReferAndEarnModal.tsx';
import { AiGiftingAssistant } from './components/AiGiftingAssistant.tsx';
import { Footer } from './components/Footer.tsx';
import { BowIcon } from './components/BowIcon.tsx';
import { Sparkles, Heart } from 'lucide-react';
import { Product, CartItem, CustomGiftBox, Order, BirthdayEntry, User } from './types.ts';
import { INITIAL_PRODUCTS } from './data/catalog.ts';
import { auth, db } from './firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'shop' | 'builder' | 'birthdays' | 'couple' | 'account' | 'admin'>('home');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['prod-teddy-1', 'prod-jewel-1']);
  const [savedBoxes, setSavedBoxes] = useState<CustomGiftBox[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [couponCode, setCouponCode] = useState<string>('POOKIE10');

  // User state (defaults to Demo User or Firebase authenticated user)
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'user-demo-1',
    name: 'Ateeb Ahmad',
    email: 'ateebahmad298@gmail.com',
    phone: '+91 98765 43210',
    role: 'user',
    addresses: [
      {
        address: 'Flat 402, Rose Petal Court, Linking Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400050',
      },
    ],
    createdAt: new Date().toISOString(),
  });

  // Modals & Advanced Feature States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSurpriseMeOpen, setIsSurpriseMeOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [giftExperienceToken, setGiftExperienceToken] = useState<string | null>(null);
  const [builderInitialBox, setBuilderInitialBox] = useState<CustomGiftBox | null>(null);

  // Check URL params on initial load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('giftToken');
      if (token) {
        setGiftExperienceToken(token);
      }
      const ref = params.get('ref');
      if (ref) {
        setCouponCode(ref.toUpperCase());
      }
    } catch (e) {
      console.warn('URL param parse error:', e);
    }
  }, []);

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCurrentUser({
              id: fbUser.uid,
              name: data.displayName || 'Pookie VIP',
              email: data.email || `${fbUser.phoneNumber}@pookiebox.love`,
              phone: fbUser.phoneNumber || '',
              role: data.role || 'user',
              addresses: data.addresses || [],
              createdAt: data.createdAt || new Date().toISOString(),
            });
          } else {
            setCurrentUser({
              id: fbUser.uid,
              name: 'Pookie Lover',
              email: `${fbUser.phoneNumber}@pookiebox.love`,
              phone: fbUser.phoneNumber || '',
              role: 'user',
              addresses: [],
              createdAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error('Error fetching user profile from Firestore:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch initial products and orders from server API
  useEffect(() => {
    const initAppData = async () => {
      try {
        const [prodRes, ordRes, boxRes] = await Promise.all([
          fetch('/api/products'),
          fetch(`/api/orders?userId=${currentUser?.id || 'user-demo-1'}`),
          fetch('/api/saved-boxes'),
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          if (data.products?.length) setProducts(data.products);
        }
        if (ordRes.ok) {
          const data = await ordRes.json();
          if (data.orders?.length) setOrders(data.orders);
        }
        if (boxRes.ok) {
          const data = await boxRes.json();
          if (data.boxes?.length) setSavedBoxes(data.boxes);
        }
      } catch (err) {
        console.error('Error fetching initial app data:', err);
      }
    };

    initAppData();
  }, [currentUser?.id]);

  // Cart operations
  const handleAddProductToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.type === 'product' && i.product?.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      const newItem: CartItem = {
        id: `cart-prod-${product.id}-${Date.now()}`,
        type: 'product',
        product,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
      };
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const handleAddCustomBoxToCart = (box: CustomGiftBox) => {
    const newItem: CartItem = {
      id: `cart-box-${box.id}`,
      type: 'custom_box',
      customBox: box,
      quantity: 1,
      unitPrice: box.totalPrice,
      totalPrice: box.totalPrice,
    };
    setCartItems((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((i) => {
          if (i.id !== id) return i;
          const newQty = i.quantity + delta;
          if (newQty <= 0) return null;
          return { ...i, quantity: newQty, totalPrice: newQty * i.unitPrice };
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Wishlist toggle
  const handleToggleWishlist = async (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
    try {
      await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id || 'user-demo-1', productId }),
      });
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  // Save box
  const handleSaveBox = async (box: CustomGiftBox) => {
    setSavedBoxes((prev) => [box, ...prev]);
    try {
      await fetch('/api/saved-boxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(box),
      });
    } catch (err) {
      console.error('Error saving box:', err);
    }
  };

  // Birthday -> 3D Builder pre-load
  const handleBuildBoxForBirthday = (birthday: BirthdayEntry) => {
    const matchedProducts = products
      .filter((p) => birthday.favoriteCategories.includes(p.categorySlug))
      .slice(0, 2);

    const initialBox: CustomGiftBox = {
      id: `box-bday-${birthday.id}`,
      name: `Birthday Surprise for ${birthday.recipientName}`,
      boxStyleId: 'box-pink-heart',
      boxColor: '#FFB6C1',
      ribbonColor: '#C45A7A',
      ribbonStyle: 'butterfly_bow',
      wrappingStyleId: 'wrap-luxury',
      items: matchedProducts.map((p) => ({ product: p, quantity: 1 })),
      recipientName: birthday.recipientName,
      personalizedMessage: `Happiest Birthday to my favorite ${birthday.relationship}! Hope your day is filled with pure bliss.`,
      boxPrice: 278,
      itemsPrice: matchedProducts.reduce((sum, p) => sum + p.price, 0),
      wrappingPrice: 149,
      totalPrice: 278 + matchedProducts.reduce((sum, p) => sum + p.price, 0) + 149,
      createdAt: new Date().toISOString(),
    };

    setBuilderInitialBox(initialBox);
    setActiveView('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBoxBuilderWithBox = (box: CustomGiftBox) => {
    setBuilderInitialBox(box);
    setActiveView('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setIsCheckoutOpen(false);
    setActiveView('account');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalCartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F5] text-[#59434D]">
      {/* Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenSurpriseMe={() => setIsSurpriseMeOpen(true)}
        onOpenReferral={() => setIsReferralOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <HomePage
            products={products}
            onOpenBuilder={() => {
              setBuilderInitialBox(null);
              setActiveView('builder');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenScheduler={() => {
              setActiveView('birthdays');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenShopCategory={(categorySlug) => {
              setActiveView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddToCart={handleAddProductToCart}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onOpenQuiz={() => setIsQuizOpen(true)}
            onOpenSurpriseMe={() => setIsSurpriseMeOpen(true)}
          />
        )}

        {activeView === 'shop' && (
          <ProductCatalog
            products={products}
            onAddToCart={handleAddProductToCart}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onOpenBoxBuilder={() => {
              setActiveView('builder');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView === 'builder' && (
          <BoxBuilder
            products={products}
            onAddToCart={handleAddCustomBoxToCart}
            onSaveBox={handleSaveBox}
            initialBox={builderInitialBox}
          />
        )}

        {activeView === 'birthdays' && (
          <BirthdayScheduler
            products={products}
            onBuildBoxForBirthday={handleBuildBoxForBirthday}
            userId={currentUser?.id || 'user-demo-1'}
          />
        )}

        {activeView === 'couple' && (
          <CoupleMode
            userId={currentUser?.id || 'user-demo-1'}
            products={products}
            onOpenBuilderWithWishlistItem={(prod) => {
              const box: CustomGiftBox = {
                id: `box-couple-${Date.now()}`,
                name: `Surprise for My Partner`,
                boxStyleId: 'box-pink-heart',
                boxColor: '#FFB6C1',
                ribbonColor: '#C45A7A',
                ribbonStyle: 'butterfly_bow',
                wrappingStyleId: 'wrap-luxury',
                items: [{ product: prod, quantity: 1 }],
                recipientName: 'My Soulmate',
                personalizedMessage: 'Saw this and thought of you immediately! 💗',
                boxPrice: 278,
                itemsPrice: prod.price,
                wrappingPrice: 149,
                totalPrice: 278 + prod.price + 149,
                createdAt: new Date().toISOString(),
              };
              setBuilderInitialBox(box);
              setActiveView('builder');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeView === 'account' && (
          <UserAccount
            orders={orders}
            wishlistProducts={wishlistProducts}
            savedBoxes={savedBoxes}
            onAddToCart={handleAddProductToCart}
            onAddBoxToCart={handleAddCustomBoxToCart}
            onOpenBoxBuilderWithBox={handleOpenBoxBuilderWithBox}
            onRetryPayment={(ord) => setIsCheckoutOpen(true)}
            onOpenGiftLink={(token) => setGiftExperienceToken(token)}
            currentUser={currentUser || undefined}
          />
        )}

        {activeView === 'admin' && <AdminDashboard />}
      </main>

      {/* Floating AI Stylist Concierge Widget */}
      <button
        onClick={() => setIsAiAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#FFC0CB] to-[#C45A7A] hover:opacity-95 text-white text-xs font-bold shadow-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 group"
        title="Chat with Pookie AI Stylist"
      >
        <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
        <span>Ask AI Stylist</span>
        <BowIcon className="w-3.5 h-3.5 text-white" />
      </button>

      {/* Slide-over Shopping Cart */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        onOpenBoxBuilder={() => {
          setActiveView('builder');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        couponCode={couponCode}
        onOrderSuccess={handleOrderSuccess}
        onClearCart={() => setCartItems([])}
      />

      {/* Firebase Phone OTP Authentication Modal */}
      <PhoneAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
      />

      {/* 1. Gift Finder Quiz Modal */}
      <GiftFinderQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        products={products}
        onAddToCart={handleAddProductToCart}
        onBuildBoxWithProducts={(selectedProds) => {
          const box: CustomGiftBox = {
            id: `box-quiz-${Date.now()}`,
            name: `Curated Quiz Selection (${selectedProds.length} Gifts)`,
            boxStyleId: 'box-pink-heart',
            boxColor: '#FFB6C1',
            ribbonColor: '#C45A7A',
            ribbonStyle: 'butterfly_bow',
            wrappingStyleId: 'wrap-luxury',
            items: selectedProds.map((p) => ({ product: p, quantity: 1 })),
            recipientName: 'My Loved One',
            personalizedMessage: 'Specially handpicked for you based on your favorite things! 💗',
            boxPrice: 278,
            itemsPrice: selectedProds.reduce((s, p) => s + p.price, 0),
            wrappingPrice: 149,
            totalPrice: 278 + selectedProds.reduce((s, p) => s + p.price, 0) + 149,
            createdAt: new Date().toISOString(),
          };
          setBuilderInitialBox(box);
          setActiveView('builder');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 2. Surprise Me Modal */}
      <SurpriseMeModal
        isOpen={isSurpriseMeOpen}
        onClose={() => setIsSurpriseMeOpen(false)}
        onOpenBuilderWithBox={(box) => {
          setBuilderInitialBox(box);
          setActiveView('builder');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAddBoxToCart={handleAddCustomBoxToCart}
      />

      {/* 3. Refer and Earn Modal */}
      <ReferAndEarnModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        userId={currentUser?.id || 'user-demo-1'}
        onApplyDiscountCode={(code) => setCouponCode(code)}
      />

      {/* 4. AI Gifting Assistant Chat Drawer */}
      <AiGiftingAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onAddToCart={handleAddProductToCart}
        onOpenBuilderWithProduct={(prod) => {
          const box: CustomGiftBox = {
            id: `box-ai-${Date.now()}`,
            name: `AI Stylist Box: ${prod.name}`,
            boxStyleId: 'box-pink-heart',
            boxColor: '#FFB6C1',
            ribbonColor: '#C45A7A',
            ribbonStyle: 'satin_bow',
            wrappingStyleId: 'wrap-standard',
            items: [{ product: prod, quantity: 1 }],
            recipientName: 'My Special Someone',
            personalizedMessage: 'Thoughtfully curated by Pookie AI Stylist just for you.',
            boxPrice: 248,
            itemsPrice: prod.price,
            wrappingPrice: 49,
            totalPrice: 248 + prod.price + 49,
            createdAt: new Date().toISOString(),
          };
          setBuilderInitialBox(box);
          setActiveView('builder');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 5. Digital Gift Opening Experience (Full Screen Overlay) */}
      {giftExperienceToken && (
        <GiftOpeningExperience
          token={giftExperienceToken}
          onClose={() => {
            setGiftExperienceToken(null);
            // Clear URL param without refreshing
            const url = new URL(window.location.href);
            url.searchParams.delete('giftToken');
            window.history.replaceState({}, '', url.toString());
          }}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

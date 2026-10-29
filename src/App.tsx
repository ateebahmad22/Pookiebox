import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HomePage } from './components/HomePage.tsx';
import { ProductCatalog } from './components/ProductCatalog.tsx';
import { BoxBuilder } from './components/BoxBuilder.tsx';
import { BirthdayScheduler } from './components/BirthdayScheduler.tsx';
import { UserAccount } from './components/UserAccount.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { Footer } from './components/Footer.tsx';
import { Product, CartItem, CustomGiftBox, Order, BirthdayEntry } from './types.ts';
import { INITIAL_PRODUCTS } from './data/catalog.ts';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'shop' | 'builder' | 'birthdays' | 'account' | 'admin'>('home');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['prod-teddy-1', 'prod-jewel-1']);
  const [savedBoxes, setSavedBoxes] = useState<CustomGiftBox[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [couponCode, setCouponCode] = useState<string>('POOKIE10');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [builderInitialBox, setBuilderInitialBox] = useState<CustomGiftBox | null>(null);

  // Fetch initial products and orders from server API
  useEffect(() => {
    const initAppData = async () => {
      try {
        const [prodRes, ordRes, boxRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders?userId=user-demo-1'),
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
  }, []);

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
        body: JSON.stringify({ userId: 'user-demo-1', productId }),
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
    // Find sample matching products based on budget and favorites
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
      personalizedMessage: `Happiest Birthday to my favorite ${birthday.relationship}! Hope your day is filled with pure bliss 💗`,
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
          />
        )}

        {activeView === 'admin' && <AdminDashboard />}
      </main>

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

      {/* Footer */}
      <Footer />
    </div>
  );
}

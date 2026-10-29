import React, { useState } from 'react';
import { Product } from '../types.ts';
import { CATEGORIES } from '../data/catalog.ts';
import { Search, Heart, ShoppingBag, Sparkles, Filter, Check, Star } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onAddToBox?: (product: Product) => void;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onOpenBoxBuilder?: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onAddToBox,
  wishlistIds,
  onToggleWishlist,
  onOpenBoxBuilder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Filter & Sort
  let filtered = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.categorySlug === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (sortBy === 'price_low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  const handleQuickAdd = (product: Product) => {
    onAddToCart(product);
    setAddedNotice(`Added "${product.name}" to cart 🎀`);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Catalog Title */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-semibold tracking-wider text-[#C45A7A] uppercase">
          Curated Gift Boutique
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#59434D] mt-1 font-bold">
          Shop Sweet Gifts & Surprises 🎀
        </h1>
        <p className="text-sm text-[#59434D]/80 mt-2">
          Every piece is chosen with care, wrapped with satin bows, and ready to be delivered directly or placed into your 3D custom PookieBox.
        </p>
      </div>

      {/* Floating Notice */}
      {addedNotice && (
        <div className="fixed top-20 right-6 z-50 bg-[#C45A7A] text-white px-4 py-2.5 rounded-2xl shadow-lg text-xs font-medium flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#F8BBD0]/50 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teddy, chocolates, necklaces, stationery..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A] focus:ring-1 focus:ring-[#C45A7A]"
            />
          </div>

          {/* Sort Selector & Count */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3">
            <span className="text-xs text-gray-500 font-sans">
              Showing <strong className="text-[#59434D] font-semibold">{filtered.length}</strong> gifts
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#C45A7A] bg-white text-[#59434D]"
            >
              <option value="featured">Featured Picks</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Category Pills/Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C45A7A] text-white shadow-xs font-semibold'
                    : 'bg-[#FFF0F5] text-[#59434D] hover:bg-[#F8BBD0]/30'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-[#F8BBD0]">
          <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-[#59434D]">No gifts found</h3>
          <p className="text-xs text-gray-500 mt-1">Try another category or clear your search.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-[#C45A7A] bg-[#FFF0F5] hover:bg-[#F8BBD0]/40 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((prod) => {
            const isWishlisted = wishlistIds.includes(prod.id);

            return (
              <div
                key={prod.id}
                className="group bg-white rounded-2xl border border-[#F8BBD0]/40 overflow-hidden shadow-xs hover:shadow-md hover:border-[#C45A7A]/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-4/3 w-full bg-[#FFF9F5] overflow-hidden">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onClick={() => setSelectedProductForModal(prod)}
                  />

                  {/* Badge */}
                  {prod.badge && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-white/90 text-[#C45A7A] border border-[#F8BBD0] shadow-xs backdrop-blur-xs">
                      {prod.badge}
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={() => onToggleWishlist(prod.id)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-400 hover:text-[#C45A7A] shadow-xs transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${isWishlisted ? 'text-[#C45A7A] fill-current' : ''}`}
                    />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                      <span>{prod.category}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="tabular-nums">{prod.rating}</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => setSelectedProductForModal(prod)}
                      className="text-sm font-semibold text-[#59434D] line-clamp-1 hover:text-[#C45A7A] transition-colors cursor-pointer"
                    >
                      {prod.name}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {prod.description}
                    </p>
                  </div>

                  {/* Price & Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-[#59434D] tabular-nums font-serif">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </div>
                      {prod.originalPrice && (
                        <div className="text-[11px] text-gray-400 line-through tabular-nums">
                          ₹{prod.originalPrice.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQuickAdd(prod)}
                        className="py-1.5 px-3 rounded-xl text-xs font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-[#F8BBD0]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-[#C45A7A] uppercase tracking-wider">
                  {selectedProductForModal.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#59434D] mt-1">
                  {selectedProductForModal.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="rounded-2xl overflow-hidden border border-[#F8BBD0]/50 aspect-4/3 bg-[#FFF9F5]">
                <img
                  src={selectedProductForModal.image}
                  alt={selectedProductForModal.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-[#C45A7A] font-serif tabular-nums">
                    ₹{selectedProductForModal.price.toLocaleString('en-IN')}
                  </span>
                  {selectedProductForModal.originalPrice && (
                    <span className="text-sm text-gray-400 line-through tabular-nums">
                      ₹{selectedProductForModal.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedProductForModal.description}
                </p>

                {selectedProductForModal.dimensions && (
                  <div className="text-xs text-gray-500">
                    <strong>Dimensions:</strong> {selectedProductForModal.dimensions}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleQuickAdd(selectedProductForModal);
                      setSelectedProductForModal(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#C45A7A] hover:bg-[#b04867] shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add Directly to Cart
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProductForModal(null);
                      if (onOpenBoxBuilder) onOpenBoxBuilder();
                    }}
                    className="py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#C45A7A] bg-[#FFF0F5] hover:bg-[#F8BBD0]/30 border border-[#F8BBD0] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Put in 3D Box
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

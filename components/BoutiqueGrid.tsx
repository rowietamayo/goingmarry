
import React from 'react';
import { CATEGORIES } from '../constants';
import { Category, Product, Seller, SortOption } from '../types';
import ProductCard from './ProductCard';
import SortDropdown from './SortDropdown';

interface BoutiqueGridProps {
    selectedCategory: Category;
    setSelectedCategory: (c: Category) => void;
    sortOption: SortOption;
    setSortOption: (s: SortOption) => void;
    filteredItems: Product[];
    authenticatedSeller: Seller | null;
    cart: Product[];
    setCart: (c: Product[]) => void;
    handleEdit: (p: Product) => void;
    handleDelete: (id: string) => void;
    setIsListingModalOpen: (isOpen: boolean) => void;
    setEditingProduct: (p: Product | undefined) => void;
    onPreview: (p: Product) => void;
}

const BoutiqueGrid: React.FC<BoutiqueGridProps> = ({
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
    filteredItems,
    authenticatedSeller,
    cart,
    setCart,
    handleEdit,
    handleDelete,
    setIsListingModalOpen,
    setEditingProduct,
    onPreview
}) => {
  return (
    <section id="boutique" className="max-w-6xl mx-auto px-6 py-24 border-t border-wedding-gold/10">
        {/* Filter & Sort Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 border-b border-wedding-gold/10 pb-6">
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as Category)}
                className={`text-[10px] uppercase tracking-[0.3em] font-bold transition-all py-2 relative ${
                  selectedCategory === cat ? 'text-wedding-gold' : 'text-wedding-charcoal/40 hover:text-wedding-gold'
                }`}
              >
                {cat}
                {selectedCategory === cat && <span className="absolute bottom-0 left-0 w-full h-px bg-wedding-gold animate-in fade-in zoom-in"></span>}
              </button>
            ))}
          </div>

          {/* Sort */}
          <SortDropdown currentSort={sortOption} onSortChange={setSortOption} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredItems.map(item => (
            <ProductCard
              key={item.id}
              product={item}
              onAddToCart={() => setCart([...cart, item])}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
              onMessage={() => {}}
              onPreview={onPreview}
              currentUser={authenticatedSeller}
              cart={cart}
            />
          ))}
        </div>

        {authenticatedSeller && (
           <div className="mt-20 text-center">
             <button
              onClick={() => { setEditingProduct(undefined); setIsListingModalOpen(true); }}
              className="bg-white border border-wedding-gold text-wedding-gold px-12 py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-wedding-gold hover:text-white transition-all shadow-sm"
             >
               List a New Treasure
             </button>
           </div>
        )}
    </section>
  );
};

export default BoutiqueGrid;

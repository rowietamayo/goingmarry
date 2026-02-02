
import React, { useEffect, useState } from 'react';
import { Icons } from '../constants';
import { Product, Seller } from '../types';

interface ProductPreviewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  cart?: Product[];
  currentUser: Seller | null;
}

const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  cart,
  currentUser
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAdding(false);
      setIsAdded(false);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const cartCount = cart ? cart.filter(p => p.id === product.id).length : 0;
  const isCartFull = cartCount >= (product.quantity || 1);

  const handleAddToCart = () => {
    setIsAdding(true);
    // Simulate loading/securing
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      onAddToCart(product);
      // Close modal after showing success message briefly
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-wedding-charcoal/80 backdrop-blur-md animate-in fade-in duration-500">
      <div
        className="bg-wedding-ivory w-full max-w-3xl max-h-[85vh] shadow-2xl border border-wedding-gold/20 overflow-hidden relative flex flex-col md:flex-row animate-in zoom-in duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-wedding-charcoal/40 hover:text-wedding-gold transition-colors text-4xl leading-none font-light z-20"
          aria-label="Close preview"
        >
          &times;
        </button>

        {/* Image Section */}
        <div className="md:w-1/2 h-96 md:h-auto md:min-h-[500px] bg-wedding-ivory relative border-b md:border-b-0 md:border-r border-wedding-gold/10 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000"
            onContextMenu={(e) => e.preventDefault()}
          />
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-wedding-gold border border-wedding-gold/20">
            {product.condition}
          </div>
          {product.isSold && (
            <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 text-[10px] uppercase tracking-[0.3em] font-bold shadow-lg">
              SOLD
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="md:w-1/2 p-10 md:p-16 flex flex-col overflow-y-auto">
          <div className="mb-8">
            <span className="text-wedding-gold text-[10px] uppercase tracking-[0.4em] font-bold block mb-4">
              {product.category}
            </span>
            <h2 className="serif text-3xl md:text-4xl text-wedding-charcoal italic leading-tight">
              {product.name}
            </h2>
          </div>

          {!product.isSold && (
            <div className="flex items-baseline space-x-2 mb-10 pb-10 border-b border-wedding-gold/10">
              <span className="text-lg text-wedding-gold font-bold">₱</span>
              <span className="serif text-5xl text-wedding-gold italic font-bold">
                {product.price.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex-grow space-y-8 mb-12">
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-4">
                Item Details
              </h3>
              <p className="serif text-lg text-wedding-charcoal/70 leading-relaxed">
                {product.description || "No description provided for this treasure."}
              </p>
            </div>

            {product.notes && (
              <div className="bg-wedding-gold/5 p-6 border border-wedding-gold/10">
                 <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-wedding-gold mb-2 flex items-center gap-2">
                   <Icons.User className="w-3 h-3" />
                   Seller's Note
                 </h3>
                 <p className="serif text-sm text-wedding-charcoal/80 italic leading-relaxed whitespace-pre-wrap">
                   {product.notes.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={i} className="font-bold not-italic">{part.slice(2, -2)}</strong>
                        : part
                   )}
                 </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-2">
                  Listed By
                </h3>
                <p className="text-xs font-semibold text-wedding-charcoal">{product.seller || "Private Collection"}</p>
              </div>
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-2">
                  Registry Date
                </h3>
                <p className="text-xs font-semibold text-wedding-charcoal">
                  {new Date(product.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {product.isSold ? (
            <div className="w-full bg-red-50 text-red-600 py-6 text-center text-[10px] uppercase tracking-[0.4em] font-bold border border-red-200">
              This Item Has Been Sold
            </div>
          ) : (
            isCartFull ? (
              <button disabled className="w-full bg-red-100 text-red-500 py-6 text-[10px] uppercase tracking-[0.4em] font-bold cursor-not-allowed">
                Max Quantity Reached
              </button>
            ) : currentUser ? (
               <button disabled className="w-full bg-gray-100 text-gray-400 py-6 text-[10px] uppercase tracking-[0.4em] font-bold cursor-not-allowed border border-gray-200">
                 Already Onboard
               </button>
            ) : isAdded ? (
               <button disabled className="w-full bg-green-50 text-green-600 py-6 text-[10px] uppercase tracking-[0.4em] font-bold border border-green-200 transition-all">
                 Treasure Secured!
               </button>
            ) : (
            <button
              disabled={isAdding}
              onClick={handleAddToCart}
              className="w-full bg-wedding-charcoal text-white py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-wedding-gold transition-all shadow-xl shadow-wedding-gold/10 group disabled:opacity-80 disabled:cursor-wait"
            >
              {isAdding ? (
                <span className="flex items-center justify-center gap-3">
                  <Icons.ShipWheel className="w-5 h-5 animate-spin text-wedding-gold" />
                  Securing...
                </span>
              ) : (
                <span className="inline-block transform group-hover:translate-x-1 transition-transform">
                  Make It Yours &rarr;
                </span>
              )}
            </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewModal;

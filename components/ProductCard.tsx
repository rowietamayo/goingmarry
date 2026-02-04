
import React, { useState } from 'react';
import { Icons } from '../constants';
import { Product, Seller } from '../types';

interface ProductCardProps {
  product: Product;
  // role: 'guest' | 'seller'; // Deprecated in favor of currentUser check
  onAddToCart: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onMessage: (seller: string) => void;
  onPreview?: (p: Product) => void;
  currentUser: Seller | null;
  cart: Product[];
}


const ProductCard: React.FC<ProductCardProps> = ({
  product,
  role,
  onAddToCart,
  onEdit,
  onDelete,
  onPreview,
  currentUser,
  cart
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const titleId = `product-title-${product.id}`;

  const isOwnItem = currentUser && (currentUser.id === product.sellerId || currentUser.isAdmin);
  const cartCount = cart ? cart.filter(p => p.id === product.id).length : 0;
  const isCartFull = cartCount >= (product.quantity || 1);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      onAddToCart(product);
      setTimeout(() => setIsAdded(false), 2000);
    }, 1500);
  };

  const handleCardClick = () => {
    if (!currentUser && onPreview) {
      onPreview(product);
    }
  };

  const getOptimizedUrl = (url: string) => {
    if (url.includes('res.cloudinary.com')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    return url;
  };

  return (
    <article
      className={`group bg-white overflow-hidden transition-all duration-700 flex flex-col border border-wedding-gold/10 hover:border-wedding-gold/30 shadow-sm hover:shadow-2xl ${role === 'guest' ? 'cursor-pointer' : ''}`}
      aria-labelledby={titleId}
      onClick={handleCardClick}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-wedding-ivory">
        <img
          src={getOptimizedUrl(product.imageUrl)}
          alt={product.name}
          onContextMenu={handleContextMenu}
          onDragStart={(e) => e.preventDefault()}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 select-none pointer-events-auto"
        />

        {/* Status Tag */}
        <div
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[8px] uppercase tracking-[0.2em] font-bold text-wedding-gold border border-wedding-gold/20"
          aria-label={`Condition: ${product.condition}`}
        >
          {product.condition}
        </div>

        {/* SOLD Tag */}
        {product.isSold && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 text-[10px] uppercase tracking-[0.3em] font-bold shadow-lg">
            SOLD
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-wedding-charcoal/5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 space-y-3">
          {currentUser && !isOwnItem ? (
             <button
               className="w-full bg-gray-100 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold py-4 cursor-not-allowed border border-gray-200 translate-y-4 group-hover:translate-y-0 focus-within:translate-y-0 duration-500"
               disabled
             >
               Already Onboard
             </button>
          ) : isOwnItem ? (
            <div className="w-full space-y-2 translate-y-4 group-hover:translate-y-0 focus-within:translate-y-0 duration-500">
               <button
                onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                aria-label={`Edit details for ${product.name}`}
                className="w-full bg-wedding-ivory text-wedding-charcoal text-[10px] uppercase tracking-[0.2em] font-bold py-3 hover:bg-wedding-gold hover:text-white focus:bg-wedding-gold focus:text-white outline-none transition-all shadow-md"
              >
                Edit Details
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                aria-label={`Remove ${product.name} from registry`}
                className="w-full bg-red-50 text-red-600 text-[10px] uppercase tracking-[0.2em] font-bold py-3 hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white outline-none transition-all"
              >
                Remove
              </button>
            </div>
          ) : (
            product.isSold ? (
               <button disabled className="w-full bg-white text-wedding-charcoal text-[10px] uppercase tracking-[0.2em] font-bold py-4 cursor-not-allowed opacity-50 translate-y-4 group-hover:translate-y-0 focus-within:translate-y-0 duration-500">
                 Item Sold
               </button>
            ) : isCartFull ? (
               <button disabled className="w-full bg-red-100 text-red-500 text-[10px] uppercase tracking-[0.2em] font-bold py-4 cursor-not-allowed translate-y-4 group-hover:translate-y-0 focus-within:translate-y-0 duration-500">
                 Max Qty Reached
               </button>
            ) : (
            <button
              onClick={handleAddToCart}
              aria-label={`Select ${product.name} to your selection`}
              className={`w-full text-[10px] uppercase tracking-[0.2em] font-bold py-4 outline-none transition-all shadow-xl translate-y-4 group-hover:translate-y-0 focus-within:translate-y-0 duration-500 disabled:opacity-50 disabled:cursor-wait ${
                isAdded
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-white text-wedding-charcoal hover:bg-wedding-gold hover:text-white focus:bg-wedding-gold focus:text-white'
              }`}
              disabled={isAdding}
            >
              {isAdding ? (
                 <span className="flex items-center justify-center gap-2">
                   <Icons.ShipWheel className="w-4 h-4 animate-spin" />
                   Securing...
                 </span>
              ) : isAdded ? (
                 'Treasure Secured!'
              ) : (
                 'Make It Yours'
              )}
            </button>
            )
          )}
        </div>
      </div>

      <div className="p-10 flex flex-col items-center text-center flex-grow">
        <span className="text-wedding-gold text-[9px] uppercase tracking-[0.4em] font-bold mb-4">{product.category}</span>
        <h3 id={titleId} className="serif text-2xl text-wedding-charcoal mb-4 leading-tight">
          {product.name}
        </h3>
        <p className="text-[9px] text-wedding-gold/60 uppercase tracking-[0.2em] font-bold mb-6">
          Listed by {product.seller || 'The Couple'}
        </p>
        <p className="text-[11px] text-wedding-charcoal/50 font-light line-clamp-3 mb-8 max-w-[90%] leading-relaxed">
          {product.description}
        </p>

        {!product.isSold && (
          <div className="mt-auto pt-8 border-t border-wedding-gold/10 w-full flex justify-center items-baseline space-x-1" aria-label={`Price: ${product.price} pesos`}>
            <span className="text-[12px] text-wedding-gold font-bold" aria-hidden="true">₱</span>
            <span className="serif text-3xl text-wedding-gold italic font-bold">
              {product.price.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </article>
  );
};

export default ProductCard;

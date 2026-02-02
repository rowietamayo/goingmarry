
import React from 'react';
import { Icons } from '../constants';
import { Product, Seller } from '../types';

interface NavbarProps {
  authenticatedSeller: Seller | null;
  cart: Product[];
  setIsAuthModalOpen: (isOpen: boolean) => void;
  setIsSellersModalOpen: (isOpen: boolean) => void;
  setIsProfileModalOpen: (isOpen: boolean) => void;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsListingModalOpen: (open: boolean) => void; // Added prop
  setCheckoutStep: (step: 'cart' | 'review' | 'dispatch') => void;
  handleLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  authenticatedSeller,
  cart,
  setIsAuthModalOpen,
  setIsSellersModalOpen,
  setIsProfileModalOpen,
  setIsChangePasswordModalOpen,
  setIsCartOpen,
  setIsListingModalOpen, // Destructure
  setCheckoutStep,
  handleLogout
}) => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-wedding-ivory/90 backdrop-blur-md border-b border-wedding-gold/10">
      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex flex-col items-center cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <Icons.PirateShip className="text-wedding-gold mb-1 transform group-hover:scale-110 transition-transform duration-500" />
          <h1 className="serif text-xs font-bold tracking-[0.3em] text-wedding-charcoal">GOINGMARRY</h1>
        </div>



        <div className="flex items-center space-x-6 text-[10px] uppercase tracking-[0.2em] font-semibold">
          {!authenticatedSeller ? (
            <button onClick={() => setIsAuthModalOpen(true)} className="text-wedding-charcoal hover:text-wedding-gold transition-colors">
              Seller Access
            </button>
          ) : (
            <>
                {/* Add Product Button */}
                <button
                   onClick={() => setIsListingModalOpen(true)}
                   className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal hover:text-wedding-gold transition-colors"
                   aria-label="Add New Item"
                >
                   <Icons.Plus className="text-wedding-charcoal hover:text-wedding-gold w-5 h-5 transition-colors" />
                   <span className="hidden md:inline">Add Item</span>
                </button>

                {/* Profile Button */}
                <button
                   onClick={() => setIsProfileModalOpen(true)}
                   className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal hover:text-wedding-gold transition-colors"
                >
                   <Icons.User className="w-4 h-4" />
                   <span className="hidden md:inline">{authenticatedSeller.boutiqueName}</span>
                </button>

                {/* Logout Button */}
                <button onClick={handleLogout} className="text-wedding-charcoal/40 hover:text-red-400 transition-colors flex items-center gap-1">
                  <Icons.LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
            </>
          )}
          {!authenticatedSeller && (
            <button
              className="relative p-2 text-wedding-charcoal hover:text-wedding-gold transition-colors group"
              onClick={() => {
                 setCheckoutStep('cart');
                 setIsCartOpen(true);
              }}
            >
              <Icons.ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


import React, { useEffect, useMemo, useState } from 'react';
import AuthModal from './components/AuthModal';
import BoutiqueGrid from './components/BoutiqueGrid';
import ChangePasswordModal from './components/ChangePasswordModal';
import Hero from './components/Hero';
import ListingModal from './components/ListingModal';
import LoadingOverlay from './components/LoadingOverlay';
import Navbar from './components/Navbar';
import ProductPreviewModal from './components/ProductPreviewModal';
import ProfileModal from './components/ProfileModal';
import SellersModal from './components/SellersModal';
import { Icons } from './constants';
import { api } from './services/api';
import { Category, Product, Seller, SortOption } from './types';

const App: React.FC = () => {
  // Persistence Initialization (The "Backend" Sync)
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const products = await api.getProducts();
      setItems(products);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const [authenticatedSeller, setAuthenticatedSeller] = useState<Seller | null>(() => {
    const saved = localStorage.getItem('goingmarry_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSellersModalOpen, setIsSellersModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'review' | 'dispatch'>('cart');
  const [customMessage, setCustomMessage] = useState('');
  const [globalLoading, setGlobalLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  useEffect(() => {
    if (authenticatedSeller) {
      localStorage.setItem('goingmarry_session', JSON.stringify(authenticatedSeller));
    } else {
      localStorage.removeItem('goingmarry_session');
    }
  }, [authenticatedSeller]);

  const filteredItems = useMemo(() => {
    let result = items.filter(p => selectedCategory === 'All' || p.category === selectedCategory);

    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
    }
    return result;
  }, [items, selectedCategory, sortOption]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.isSold ? 0 : item.price), 0);

  useEffect(() => {
    if (cart.length > 0) {
      const treasureDescription = cart.map(item => `- ${item.name} (₱${item.price.toLocaleString()})`).join('\n');
      setCustomMessage(`Hi Rowie and Larry,\n\nI am interested in the following items from your boutique:\n\n${treasureDescription}\n\nTotal Selection: ₱${cartTotal.toLocaleString()}\n\nPlease let me know if these are still available!`);
    }
  }, [cart, cartTotal]);

  const handleSaveProduct = async (product: Product, isNew: boolean = false) => {
    setGlobalLoading(true);
    try {
      await Promise.all([
        api.saveProduct(product, isNew),
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);
      await loadProducts();
      setEditingProduct(undefined);
    } catch (err) {
      alert('Failed to save product');
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsListingModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this piece from the boutique?')) {
      setGlobalLoading(true);
      try {
        await Promise.all([
          api.deleteProduct(id),
          new Promise(resolve => setTimeout(resolve, 3000))
        ]);
        await loadProducts();
      } catch (err) {
        alert('Failed to delete product');
      } finally {
        setGlobalLoading(false);
      }
    }
  };

  const handleLogout = () => {
    setAuthenticatedSeller(null);
    localStorage.removeItem('token');
  };

  const initiateCheckout = async () => {
    setGlobalLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setGlobalLoading(false);
    setCheckoutStep('review');
  };

  const goToDispatch = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCheckoutStep('dispatch');
      setTimeout(() => {
        window.open('https://m.me/rowy.tamayo', '_blank');
      }, 1500);
    } catch (err) {
      setCheckoutStep('dispatch');
    }
  };

  return (
    <div className="min-h-screen bg-wedding-ivory selection:bg-wedding-gold selection:text-white">
      <Navbar
         authenticatedSeller={authenticatedSeller}
         cart={cart}
         setIsAuthModalOpen={setIsAuthModalOpen}
         setIsSellersModalOpen={setIsSellersModalOpen}
         setIsProfileModalOpen={setIsProfileModalOpen}
         setIsListingModalOpen={setIsListingModalOpen}
         setIsChangePasswordModalOpen={setIsChangePasswordModalOpen}
         setIsCartOpen={setIsCartOpen}
         setCheckoutStep={setCheckoutStep}
         handleLogout={handleLogout}
      />

      <Hero />

      <BoutiqueGrid
         selectedCategory={selectedCategory}
         setSelectedCategory={setSelectedCategory}
         sortOption={sortOption}
         setSortOption={setSortOption}
         filteredItems={filteredItems}
         authenticatedSeller={authenticatedSeller}
         cart={cart}
         setCart={setCart}
         handleEdit={handleEdit}
         handleDelete={handleDelete}
         setIsListingModalOpen={setIsListingModalOpen}
         setEditingProduct={setEditingProduct}
         onPreview={(product) => setPreviewProduct(product)}
      />

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-wedding-charcoal/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-wedding-ivory h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b flex justify-between items-center bg-wedding-charcoal text-white">
              <h2 className="serif text-xl italic">
                {checkoutStep === 'cart' ? 'Your Selection' : checkoutStep === 'review' ? 'Review Note' : 'Ready to Send'}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-3xl font-light hover:text-wedding-gold transition-colors">&times;</button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-6">
              {checkoutStep === 'cart' ? (
                <>
                  {cart.length === 0 ? (
                    <div className="text-center py-32 text-wedding-charcoal/30 serif italic text-xl">You haven't selected anything yet.</div>
                  ) : (
                    cart.map((item, idx) => (
                      <div key={idx} className="flex space-x-6 pb-6 border-b border-wedding-gold/10">
                        <img
                          src={item.imageUrl}
                          className="w-24 h-24 object-cover select-none"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                        <div className="flex-grow flex flex-col justify-center">
                          <p className="serif text-xl leading-tight mb-2">{item.name}</p>
                          {!item.isSold && (
                            <p className="text-wedding-gold font-bold text-base">₱{item.price.toLocaleString()}</p>
                          )}
                        </div>
                        <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-wedding-charcoal/30 hover:text-red-400 self-center">
                           <div className="rotate-45"><Icons.Plus /></div>
                        </button>
                      </div>
                    ))
                  )}
                </>
              ) : checkoutStep === 'review' ? (
                <div className="animate-in fade-in duration-500">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-wedding-gold mb-4">Edit your message for Rowie & Larry:</p>
                  <div className="relative p-8 bg-[#fdfaf5] border border-wedding-gold/20 shadow-inner">
                    <textarea
                      className="w-full bg-transparent serif text-lg text-wedding-charcoal leading-relaxed outline-none min-h-[300px] resize-none"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                    />
                    <div className="absolute top-0 left-4 w-px h-full bg-red-100 opacity-50"></div>
                  </div>
                  <button
                    onClick={() => setCheckoutStep('cart')}
                    className="mt-6 text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 hover:text-wedding-gold transition-colors flex items-center gap-2"
                  >
                    ← Back to Selection
                  </button>
                </div>
              ) : (
                <div className="animate-in zoom-in duration-500 text-center py-10">
                  <div className="mb-8 flex justify-center">
                    <div className="bg-wedding-gold/10 p-6 rounded-full">
                       <Icons.PirateShip className="text-wedding-gold w-16 h-16" />
                    </div>
                  </div>
                  <h3 className="serif text-2xl italic mb-4">Message Copied!</h3>
                  <p className="text-wedding-charcoal/60 text-sm mb-10 leading-relaxed">
                    Your note for Rowie and Larry is on your clipboard. Choose a button below to open the chat and <strong>PASTE</strong> your message.
                  </p>

                  <div className="space-y-4">
                    <a
                      href="https://m.me/rowy.tamayo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-wedding-gold text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-wedding-gold transition-all shadow-lg"
                    >
                      Try Messenger App
                    </a>
                    <a
                      href="https://www.facebook.com/messages/t/rowy.tamayo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full border border-wedding-gold text-wedding-gold py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-wedding-gold hover:text-white transition-all"
                    >
                      Try Facebook Web
                    </a>
                  </div>

                  <button
                    onClick={() => setCheckoutStep('review')}
                    className="mt-12 text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/30 hover:text-wedding-gold transition-colors underline decoration-wedding-gold/20"
                  >
                    Edit Message Again
                  </button>
                </div>
              )}
            </div>

            <div className="p-10 border-t bg-wedding-ivory">
              {checkoutStep !== 'dispatch' && (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-wedding-charcoal/50 uppercase tracking-[0.2em] text-[10px] font-bold">Total Selection:</span>
                    <span className="serif text-4xl text-wedding-gold">₱{cartTotal.toLocaleString()}</span>
                  </div>

                  {checkoutStep === 'cart' ? (
                    <button
                      className="w-full bg-wedding-gold text-white py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-wedding-charcoal transition-all shadow-xl shadow-wedding-gold/20 disabled:opacity-50"
                      disabled={cart.length === 0}
                      onClick={initiateCheckout}
                    >
                      Secure This Collection
                    </button>
                  ) : (
                    <button
                      className="w-full bg-wedding-charcoal text-white py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-wedding-gold transition-all shadow-xl"
                      onClick={goToDispatch}
                    >
                      Copy & Continue
                    </button>
                  )}
                </>
              )}
              {checkoutStep === 'dispatch' && (
                <p className="text-center text-[8px] uppercase tracking-[0.2em] text-wedding-charcoal/30 font-bold">
                  Curated with love by Rowie and Larry
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="bg-wedding-charcoal text-white py-32 px-6 text-center">
        <Icons.PirateShip className="text-wedding-gold mx-auto mb-6 opacity-50" />
        <h2 className="serif text-5xl mb-12 italic">GoingMarry</h2>

        <p className="text-[10px] text-white/20 tracking-[0.5em] uppercase mb-8">&copy; 2026 | Curated with love by Rowie and Larry</p>
        {!authenticatedSeller && (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-[9px] text-white/30 hover:text-wedding-gold transition-all underline underline-offset-8 decoration-wedding-gold/30"
          >
            Join as a Seller
          </button>
        )}
      </footer>

      <ListingModal
        isOpen={isListingModalOpen}
        onClose={() => { setIsListingModalOpen(false); setEditingProduct(undefined); }}
        onAddProduct={handleSaveProduct}
        initialData={editingProduct}
        currentUser={authenticatedSeller}
      />

      <SellersModal
        isOpen={isSellersModalOpen}
        onClose={() => setIsSellersModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(seller) => setAuthenticatedSeller(seller)}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        authenticatedSeller={authenticatedSeller}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        authenticatedSeller={authenticatedSeller}
        onUpdate={(updated) => setAuthenticatedSeller(updated)}
        onLogout={handleLogout}
        onOpenChangePassword={() => {
          setIsProfileModalOpen(false);
          setIsChangePasswordModalOpen(true);
        }}
        setGlobalLoading={setGlobalLoading}
      />

      <ProductPreviewModal
        product={previewProduct}
        isOpen={!!previewProduct}
        onClose={() => setPreviewProduct(null)}
        onAddToCart={(product) => {
          setCart([...cart, product]);
          setPreviewProduct(null);
        }}
        cart={cart}
        currentUser={authenticatedSeller}
      />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-40 bg-wedding-charcoal text-wedding-gold p-4 rounded-full shadow-xl transition-all duration-500 hover:bg-wedding-gold hover:text-white border border-wedding-gold/20 group ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <div className="group-hover:-translate-y-1 transition-transform duration-300">
          <Icons.ChevronUp />
        </div>
      </button>

      {globalLoading && <LoadingOverlay />}
    </div>
  );
};

export default App;


import React, { useEffect, useRef, useState } from 'react';
import { CATEGORIES, Icons } from '../constants';
import { analyzeProductImage } from '../services/goingmarryService';
import { Product, Seller } from '../types';

const CONDITIONS: Product['condition'][] = [
  'Brand New',
  'Like New (Worn Once)',
  'Excellent Condition',
  'Very Good Condition',
  'Good Condition',
  'Professionally Cleaned',
  'As Is'
];

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (p: any) => void;
  initialData?: Product;
  currentUser: Seller | null;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800';

const ListingModal: React.FC<ListingModalProps> = ({ isOpen, onClose, onAddProduct, initialData, currentUser }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [useAI, setUseAI] = useState(true); // Default to using AI
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Home',
    condition: 'Brand New' as Product['condition'],
    isSold: false,
    quantity: '1',
    notes: ''
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price.toString(),
        category: initialData.category,
        condition: initialData.condition,
        isSold: initialData.isSold || false,
        quantity: (initialData.quantity || 1).toString(),
        notes: initialData.notes || ''
      });
      setImage(initialData.imageUrl);
      setUseAI(false); // Don't auto-analyze when editing
    } else if (isOpen) {
      setFormData({ name: '', description: '', price: '', category: 'Home', condition: 'Brand New', isSold: false, quantity: '1', notes: '' });
      setImage(null);
      setUseAI(true); // Reset to default
    }

    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    const files = 'target' in e ? (e.target as HTMLInputElement).files : (e as React.DragEvent).dataTransfer.files;
    const file = files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);

        if (!useAI) return; // Skip AI if disabled

        setAnalyzing(true);
        try {
          const data = await analyzeProductImage(base64.split(',')[1]);
          if (data) {
            setFormData({
              ...formData,
              name: data.title || '',
              description: data.description || '',
              price: data.suggestedPrice?.toString() || '',
              category: data.category || 'Home'
            });
          }
        } catch (error) {
          console.error("AI Analysis failed:", error);
          alert(`Analysis Failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFileInput();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-wedding-charcoal/70 backdrop-blur-md animate-in fade-in duration-500"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-wedding-ivory w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 border border-wedding-gold/10 relative">
        {/* Close Button - Upper Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-wedding-charcoal/40 hover:text-wedding-gold focus:text-wedding-gold outline-none transition-colors text-3xl leading-none font-light z-10 bg-wedding-ivory/60 backdrop-blur-md w-10 h-10 flex items-center justify-center rounded-full border border-wedding-gold/10 shadow-sm hover:shadow-md"
          aria-label="Close modal"
        >
          <span className="mb-1">&times;</span>
        </button>

        <div className="p-12 flex justify-between items-center border-b border-wedding-gold/10">
          <div className="flex flex-col">
            <h2 id="modal-title" className="serif text-3xl italic text-wedding-charcoal">
              {initialData ? 'Refine Registry Item' : 'New Wedding Selection'}
            </h2>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-wedding-gold mt-2">Curating the boutique</p>
          </div>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onAddProduct({
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            ...formData,
            price: parseFloat(formData.price),
            imageUrl: image || DEFAULT_IMAGE,
            seller: currentUser?.boutiqueName || 'The Couple',
            sellerId: currentUser?.id,
            createdAt: initialData?.createdAt || Date.now(),
            quantity: parseInt(formData.quantity) || 1,
            notes: formData.notes
          }, !initialData);
          onClose();
        }} className="p-12 space-y-8 max-h-[75vh] overflow-y-auto">

          <div className="flex flex-col sm:flex-row gap-8">
            <div className="flex flex-col gap-2 w-full sm:w-1/3">
              <div
                role="button"
                tabIndex={0}
                onKeyDown={handleKeyPress}
                onClick={triggerFileInput}
                aria-label="Upload item image"
                className="w-full aspect-square border-2 border-dashed border-wedding-gold/20 flex items-center justify-center relative cursor-pointer hover:bg-wedding-gold/5 focus:bg-wedding-gold/5 outline-none transition-all overflow-hidden group"
              >
                <div aria-live="polite" className="sr-only">
                  {analyzing ? "GoingMarry is analyzing the image" : image ? "Image uploaded successfully" : ""}
                </div>
                {analyzing && (
                  <div className="absolute inset-0 bg-wedding-ivory/80 flex items-center justify-center z-10">
                    <span className="text-[9px] uppercase tracking-[0.3em] animate-pulse text-wedding-gold font-bold">Scanning...</span>
                  </div>
                )}
                {image ? (
                  <>
                      <img src={image} alt="Uploaded preview" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                       {image !== DEFAULT_IMAGE && (
                         <button
                            type="button"
                             className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all z-20 shadow-sm"
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this image? This cannot be undone.')) {
                                    if (initialData?.id) {
                                        try {
                                            await import('../services/api').then(m => m.api.deleteProductImage(initialData.id));
                                            // Update local state to default image
                                            setImage(DEFAULT_IMAGE);
                                        } catch (error) {
                                            console.error("Failed to delete image", error);
                                            alert("Failed to delete image");
                                        }
                                    } else {
                                        // Just clear state if it's a new product not saved yet
                                        setImage(null);
                                    }
                                }
                            }}
                            title="Delete Image"
                         >
                             <Icons.Trash className="w-4 h-4" />
                         </button>
                       )}
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="flex justify-center text-wedding-gold mb-2"><Icons.Camera /></div>
                    <p className="text-[9px] uppercase tracking-widest font-bold text-wedding-gold">Upload Visual</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="sr-only"
                  accept="image/*"
                />
              </div>

              <div className="flex items-center gap-2 mt-2 px-1">
                <input
                  type="checkbox"
                  id="use-ai"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="w-3 h-3 text-wedding-gold border-wedding-gold/30 rounded focus:ring-wedding-gold"
                />
                <label htmlFor="use-ai" className="text-[8px] uppercase tracking-widest font-bold text-wedding-charcoal/60 cursor-pointer select-none">
                  Auto-fill with Gemini AI
                </label>
              </div>
            </div>

            <div className="flex-grow space-y-6">
              <div className="relative">
                <label htmlFor="item-name" className="text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-1 block">Item Nomenclature</label>
                <input
                  id="item-name"
                  className="w-full bg-transparent border-b border-wedding-gold/20 py-2 text-xl serif outline-none focus:border-wedding-gold transition-colors"
                  placeholder="Ex: Venetian Glass Chandelier"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label htmlFor="item-desc" className="text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-1 block">Item Details</label>
                <textarea
                  id="item-desc"
                  className="w-full bg-transparent border-b border-wedding-gold/20 py-2 text-sm outline-none focus:border-wedding-gold transition-colors h-24 font-light leading-relaxed"
                  placeholder="Describe its significance..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div>
                <label htmlFor="item-notes" className="text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-1 block">Private Notes (Optional)</label>
                <textarea
                  id="item-notes"
                  className="w-full bg-transparent border-b border-wedding-gold/20 py-2 text-sm outline-none focus:border-wedding-gold transition-colors h-16 font-light leading-relaxed"
                  placeholder="Additional details, location, or SKU..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                      e.preventDefault();
                      const textarea = e.currentTarget;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = formData.notes;
                      const before = text.substring(0, start);
                      const selected = text.substring(start, end);
                      const after = text.substring(end);

                      const newText = `${before}**${selected}**${after}`;
                      setFormData({ ...formData, notes: newText });

                      // Hack to restore cursor position after React rerender
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 2, end + 2);
                      }, 0);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div>
              <label htmlFor="item-price" className="text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-2 block">Value Contribution (₱)</label>
              <input
                id="item-price"
                type="number"
                step="1"
                className="w-full bg-transparent border-b border-wedding-gold/20 py-2 text-base font-bold outline-none focus:border-wedding-gold transition-colors"
                placeholder="0"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div>
              <label htmlFor="item-qty" className="text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-2 block">Quantity</label>
              <input
                id="item-qty"
                type="number"
                min="1"
                className="w-full bg-transparent border-b border-wedding-gold/20 py-2 text-base font-bold outline-none focus:border-wedding-gold transition-colors"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>
            <div>
              <label htmlFor="item-cat" className="text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-2 block">Registry Category</label>
              <select
                id="item-cat"
                className="w-full bg-transparent border-b border-wedding-gold/20 py-2 text-[10px] uppercase tracking-widest font-bold outline-none focus:border-wedding-gold transition-colors cursor-pointer"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c} className="text-wedding-charcoal">{c}</option>)}
              </select>
            </div>
          </div>

          <div>
             <label htmlFor="item-cond" className="text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-2 block">Item Condition</label>
             <select
               id="item-cond"
               className="w-full bg-transparent border-b border-wedding-gold/20 py-2 text-[10px] uppercase tracking-widest font-bold outline-none focus:border-wedding-gold transition-colors cursor-pointer"
               value={formData.condition}
               onChange={e => setFormData({...formData, condition: e.target.value as Product['condition']})}
             >
               {CONDITIONS.map(c => <option key={c} value={c} className="text-wedding-charcoal">{c}</option>)}
             </select>
          </div>

          <div className="flex items-center gap-3 p-4 bg-wedding-gold/5 border border-wedding-gold/10">
            <input
              type="checkbox"
              id="item-sold"
              checked={formData.isSold}
              onChange={e => setFormData({...formData, isSold: e.target.checked})}
              className="w-4 h-4 text-wedding-gold border-wedding-gold/30 rounded focus:ring-wedding-gold focus:ring-2"
            />
            <label htmlFor="item-sold" className="text-[10px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/60 cursor-pointer">
              Mark as Sold
            </label>
          </div>

          <button type="submit" className="w-full bg-wedding-charcoal text-white py-6 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-wedding-gold focus:bg-wedding-gold outline-none transition-all shadow-xl shadow-wedding-gold/10">
            {initialData ? 'Update Registry Piece' : 'Add to Guest Selection'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ListingModal;

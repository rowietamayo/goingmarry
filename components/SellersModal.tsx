
import React, { useEffect, useState } from 'react';
import { Seller } from '../types';

interface SellersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SellersModal: React.FC<SellersModalProps> = ({ isOpen, onClose }) => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSellers();
    }
  }, [isOpen]);

  const loadSellers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/sellers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSellers(data);
      } else {
        alert('Failed to load sellers');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
      if (!confirm(`Are you sure you want to permanently delete "${name}"? This will remove the seller AND ALL their listed products. This cannot be undone.`)) {
          return;
      }

      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/admin/sellers/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
              setSellers(sellers.filter(s => s.id !== id));
          } else {
              const err = await res.json();
              alert(err.error || 'Failed to delete seller');
          }
      } catch (error) {
          alert('Error deleting seller');
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-wedding-charcoal/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-wedding-gold/10 animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-wedding-charcoal/40 hover:text-wedding-gold transition-colors text-3xl leading-none font-light z-20 bg-wedding-ivory/60 backdrop-blur-md w-10 h-10 flex items-center justify-center rounded-full border border-wedding-gold/10 shadow-sm hover:shadow-md"
          aria-label="Close modal"
        >
          <span className="mb-1">&times;</span>
        </button>

        <div className="p-8 border-b border-wedding-gold/20 flex justify-between items-center bg-wedding-ivory">
          <h2 className="serif text-3xl italic text-wedding-charcoal">Registered Sellers</h2>
        </div>

        <div className="p-8 overflow-y-auto">
          {loading ? (
            <div className="text-center py-10 text-wedding-gold animate-pulse">Loading Registry...</div>
          ) : (
            <div className="grid gap-4">
              {sellers.map(seller => (
                <div key={seller.id} className="flex justify-between items-center p-4 border border-wedding-gold/10 hover:border-wedding-gold/30 bg-wedding-ivory/50 transition-all">
                  <div>
                    <h3 className="font-bold text-wedding-charcoal flex items-center gap-2">
                       {seller.boutiqueName}
                       {seller.isAdmin && <span className="text-[8px] bg-wedding-gold text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>}
                    </h3>
                    <p className="text-sm text-wedding-charcoal/60">{seller.name}</p>
                    <p className="text-xs text-wedding-charcoal/40 font-mono">{seller.email}</p>
                  </div>
                  <div className="text-wedding-charcoal/30 text-xs uppercase tracking-widest">
                    ID: {seller.id.substring(0,6)}...
                  </div>

                  {!seller.isAdmin && (
                    <button
                        onClick={() => handleDelete(seller.id, seller.boutiqueName)}
                        className="ml-4 text-xs text-red-400 hover:text-red-600 font-bold uppercase tracking-wider border border-red-200 hover:border-red-600 px-3 py-1 rounded transition-colors"
                    >
                        Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellersModal;

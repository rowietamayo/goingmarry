
import React, { useEffect, useState } from 'react';
import { Icons } from '../constants';
import { Seller } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  authenticatedSeller: Seller | null;
  onUpdate: (updatedSeller: Seller) => void;
  onLogout: () => void;
  onOpenChangePassword: () => void;
  setGlobalLoading: (loading: boolean) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  authenticatedSeller,
  onUpdate,
  onLogout,
  onOpenChangePassword,
  setGlobalLoading
}) => {
  const [name, setName] = useState(authenticatedSeller?.name || '');
  const [boutiqueName, setBoutiqueName] = useState(authenticatedSeller?.boutiqueName || '');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (authenticatedSeller) {
      setName(authenticatedSeller.name);
      setBoutiqueName(authenticatedSeller.boutiqueName);
      if (authenticatedSeller.isAdmin) {
        fetchSellers();
      }
    }
  }, [authenticatedSeller, isOpen]);

  const fetchSellers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/sellers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSellers(data);
      }
    } catch (err) {
      console.error('Failed to fetch sellers');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name === authenticatedSeller.name && boutiqueName === authenticatedSeller.boutiqueName) {
      setError("No changes detected to save.");
      return;
    }

    setLoading(true);
    setGlobalLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const [response] = await Promise.all([
        fetch('/api/auth/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name, boutiqueName })
        }),
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);

      const data = await response.json();
      if (response.ok) {
        setSuccess('Profile updated successfully');
        onUpdate(data.seller);
        // Automatically close modal on success as requested
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setGlobalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [response] = await Promise.all([
        fetch('/api/auth/profile', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);

      if (response.ok) {
        onLogout();
        onClose();
      } else {
        setError('Failed to delete account');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleDeleteSeller = async (id: string) => {
    if (!confirm('Are you sure you want to delete this seller?')) return;
    setGlobalLoading(true);

    try {
      const token = localStorage.getItem('token');
      const [response] = await Promise.all([
        fetch(`/api/admin/sellers/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        new Promise(resolve => setTimeout(resolve, 4000))
      ]);

      if (response.ok) {
        setSellers(sellers.filter(s => s.id !== id));
      }
    } catch (err) {
      setError('Failed to delete seller');
    } finally {
      setGlobalLoading(false);
    }
  };

  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBoutiqueName, setEditBoutiqueName] = useState('');

  const startEditing = (seller: Seller) => {
    setEditingSellerId(seller.id);
    setEditName(seller.name);
    setEditBoutiqueName(seller.boutiqueName);
  };

  const handleUpdateSeller = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/sellers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName, boutiqueName: editBoutiqueName })
      });

      if (response.ok) {
        setSellers(sellers.map(s => s.id === id ? { ...s, name: editName, boutiqueName: editBoutiqueName } : s));
        setEditingSellerId(null);
        setSuccess('Seller updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update seller');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !authenticatedSeller) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-wedding-charcoal/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl border border-wedding-gold/20 flex flex-col md:flex-row gap-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-wedding-charcoal/40 hover:text-wedding-gold transition-colors"
        >
          <Icons.Close />
        </button>

        {/* Sidebar / Profile Stats */}
        <div className="md:w-1/3 border-r border-wedding-gold/10 pr-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-wedding-gold/10 rounded-full flex items-center justify-center text-wedding-gold mb-4 border-2 border-wedding-gold/20">
              <span className="serif text-3xl font-bold">{authenticatedSeller.name.charAt(0)}</span>
            </div>
            <h2 className="serif text-xl text-wedding-charcoal text-center">{authenticatedSeller.boutiqueName}</h2>
            <p className="text-[10px] uppercase tracking-widest text-wedding-gold font-bold mt-1">
              {authenticatedSeller.isAdmin ? 'Administrator' : 'Verified Seller'}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={onOpenChangePassword}
              className="w-full text-left p-3 text-[10px] uppercase tracking-widest text-wedding-charcoal hover:bg-wedding-gold/5 transition-colors border-b border-wedding-gold/10 flex items-center gap-3 group"
            >
              <Icons.ShieldCheck className="w-4 h-4 text-wedding-gold/40 group-hover:text-wedding-gold transition-colors" />
              <span>Update Credentials</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full text-left p-3 text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-b border-red-100 flex items-center gap-3 group"
            >
              <Icons.LogOut className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
              <span>Logout Account</span>
            </button>
          </div>

          {!authenticatedSeller.isAdmin && (
            <div className="mt-12 pt-8 border-t border-wedding-gold/10">
              <h3 className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-4">Danger Zone</h3>
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="w-full bg-red-50 text-red-600 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all"
              >
                Delete My Boutique
              </button>
              {showDeleteConfirm && (
                <div className="mt-4 p-4 border border-red-200 bg-red-50/50">
                  <p className="text-[9px] text-red-600 uppercase tracking-tighter leading-relaxed mb-4">
                    Wait! This action is irreversible. All your listings will be removed forever.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full bg-red-600 text-white py-2 text-[9px] uppercase tracking-[0.2em] font-bold"
                  >
                    Yes, Delete Everything
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="md:w-2/3">
          <div className="mb-8">
            <h3 className="serif text-2xl text-wedding-charcoal border-b border-wedding-gold/20 pb-2 mb-6">Profile Settings</h3>

            {error && <p className="mb-4 text-xs text-red-500 uppercase tracking-widest">{error}</p>}
            {success && <p className="mb-4 text-xs text-green-600 uppercase tracking-widest">{success}</p>}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-wedding-charcoal/60 font-semibold">Boutique Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border-b border-wedding-gold/30 focus:border-wedding-gold outline-none bg-transparent transition-colors text-wedding-charcoal font-light"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-wedding-charcoal/60 font-semibold">Boutique Label</label>
                  <input
                    type="text"
                    className="w-full p-2 border-b border-wedding-gold/30 focus:border-wedding-gold outline-none bg-transparent transition-colors text-wedding-charcoal font-light"
                    value={boutiqueName}
                    onChange={(e) => setBoutiqueName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-wedding-charcoal/60 font-semibold opacity-50">Email Address (Read Only)</label>
                <input
                  type="email"
                  className="w-full p-2 border-b border-wedding-gold/10 outline-none bg-transparent text-wedding-charcoal/40 font-light cursor-not-allowed"
                  value={authenticatedSeller.email}
                  disabled
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-wedding-charcoal text-white px-8 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-wedding-gold transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {authenticatedSeller.isAdmin && (
            <div className="mt-12 pt-8 border-t border-wedding-gold/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="serif text-2xl text-wedding-charcoal">Boutique Directory</h3>
                <span className="text-[10px] text-wedding-gold uppercase tracking-[0.2em] font-bold">
                  {sellers.length} Total Registered
                </span>
              </div>
              <div className="space-y-3">
                {sellers.filter(s => s.id !== authenticatedSeller.id).map(seller => (
                  <div key={seller.id} className="flex flex-col p-3 border border-wedding-gold/10 hover:border-wedding-gold/30 transition-all bg-wedding-ivory/30">
                    {editingSellerId === seller.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full p-2 text-[10px] bg-white border border-wedding-gold/30 outline-none"
                          placeholder="Seller Name"
                        />
                        <input
                          type="text"
                          value={editBoutiqueName}
                          onChange={(e) => setEditBoutiqueName(e.target.value)}
                          className="w-full p-2 text-[10px] bg-white border border-wedding-gold/30 outline-none"
                          placeholder="Boutique Name"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                           <button
                             onClick={() => setEditingSellerId(null)}
                             className="text-[9px] uppercase tracking-widest font-bold text-wedding-charcoal/40 hover:text-wedding-charcoal"
                           >
                             Cancel
                           </button>
                           <button
                             onClick={() => handleUpdateSeller(seller.id)}
                             disabled={loading}
                             className="text-[9px] uppercase tracking-widest font-bold text-wedding-gold hover:text-wedding-charcoal"
                           >
                             Save
                           </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest font-bold text-wedding-charcoal">{seller.boutiqueName}</h4>
                          <p className="text-[9px] text-wedding-charcoal/60 tracking-wider capitalize">{seller.name} • {seller.email}</p>
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => startEditing(seller)}
                            className="text-[9px] uppercase tracking-widest font-bold text-wedding-gold hover:text-wedding-charcoal transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSeller(seller.id)}
                            className="text-[9px] uppercase tracking-widest font-bold text-red-400 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;

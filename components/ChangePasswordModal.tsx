
import React, { useState } from 'react';
import { Icons } from '../constants';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  authenticatedSeller: any;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, authenticatedSeller }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 2000);
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-wedding-charcoal/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md p-8 relative shadow-2xl border border-wedding-gold/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-wedding-charcoal/40 hover:text-wedding-gold transition-colors"
        >
          <Icons.Close />
        </button>

        <h2 className="serif text-2xl text-wedding-charcoal mb-6 text-center">Change Password</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs tracking-wider uppercase border border-red-100 flex items-center gap-2">
            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 text-xs tracking-wider uppercase border border-green-100 flex items-center gap-2">
            <span className="w-1 h-1 bg-green-600 rounded-full"></span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-wedding-charcoal/60 font-semibold">Current Password</label>
            <input
              type="password"
              className="w-full p-2 border-b border-wedding-gold/30 focus:border-wedding-gold outline-none bg-transparent transition-colors text-wedding-charcoal font-light"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-wedding-charcoal/60 font-semibold">New Password</label>
            <input
              type="password"
              className="w-full p-2 border-b border-wedding-gold/30 focus:border-wedding-gold outline-none bg-transparent transition-colors text-wedding-charcoal font-light"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-wedding-charcoal/60 font-semibold">Confirm New Password</label>
            <input
              type="password"
              className="w-full p-2 border-b border-wedding-gold/30 focus:border-wedding-gold outline-none bg-transparent transition-colors text-wedding-charcoal font-light"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wedding-charcoal text-white py-3 mt-6 text-[10px] uppercase tracking-[0.2em] hover:bg-wedding-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

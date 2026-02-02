
import React, { useState } from 'react';
import { api } from '../services/api';
import { Seller } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (seller: Seller) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    boutiqueName: '',
    membershipCode: ''
  });


  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await api.login({ email: formData.email, password: formData.password });
      } else {

        result = await api.register(formData);
      }

      // Save token
      localStorage.setItem('token', result.token);
      onLogin(result.seller);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-wedding-charcoal/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-wedding-ivory w-full max-w-md shadow-2xl border border-wedding-gold/20 overflow-hidden relative">
        {/* Close Button - Upper Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-wedding-charcoal/40 hover:text-wedding-gold transition-colors text-3xl leading-none font-light z-10 bg-wedding-ivory/60 backdrop-blur-md w-10 h-10 flex items-center justify-center rounded-full border border-wedding-gold/10 shadow-sm hover:shadow-md"
          aria-label="Close modal"
        >
          <span className="mb-1">&times;</span>
        </button>

        <div className="p-10 text-center border-b border-wedding-gold/10">
          <h2 className="serif text-3xl italic text-wedding-charcoal mb-2">
            {isLogin ? 'Seller Login' : 'Join the Collective'}
          </h2>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-wedding-gold">
            {isLogin ? 'Access your dashboard' : 'Invitation Required to Join'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-[10px] uppercase tracking-widest font-bold p-4 text-center border border-red-100 animate-in shake duration-300">
              {error}
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-1 block">Boutique Name</label>
                <input
                  className="w-full bg-transparent border-b border-wedding-gold/20 py-2 text-sm outline-none focus:border-wedding-gold transition-colors"
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-1 block">Boutique Label</label>
                <input
                  className="w-full bg-transparent border-b border-wedding-gold/20 py-2 text-sm outline-none focus:border-wedding-gold transition-colors"
                  type="text"
                  required
                  value={formData.boutiqueName}
                  onChange={e => setFormData({...formData, boutiqueName: e.target.value})}
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-1 block">Email Address</label>
            <input
              className="w-full bg-transparent border-b border-wedding-gold/20 py-2 text-sm outline-none focus:border-wedding-gold transition-colors"
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-charcoal/40 mb-1 block">Password</label>
            <input
              className="w-full bg-transparent border-b border-wedding-gold/20 py-2 text-sm outline-none focus:border-wedding-gold transition-colors"
              type="password"
              required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div className="bg-wedding-gold/5 p-4 border border-wedding-gold/10">
              <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-wedding-gold mb-1 block">Membership Access Code</label>
              <input
                className="w-full bg-transparent border-b border-wedding-gold/40 py-2 text-sm font-bold tracking-widest outline-none focus:border-wedding-gold transition-colors uppercase"
                type="text"
                placeholder="INVITE CODE"
                required
                value={formData.membershipCode}
                onChange={e => setFormData({...formData, membershipCode: e.target.value})}
              />
              <p className="text-[8px] text-wedding-charcoal/30 mt-2 italic">A code is required to curate on GoingMarry.</p>
            </div>
          )}

          <button type="submit" className="w-full bg-wedding-charcoal text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-wedding-gold transition-all shadow-xl">
            {isLogin ? 'Enter Dashboard' : 'Validate & Create Boutique'}
          </button>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={toggleMode}
              className="text-[9px] uppercase tracking-widest text-wedding-gold hover:text-wedding-charcoal transition-colors font-bold"
            >
              {isLogin ? "Don't have an account? Request Access" : "Already a member? Log In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;

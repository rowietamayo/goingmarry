
import React, { useEffect, useRef, useState } from 'react';
import { Icons } from '../constants';
import { SortOption } from '../types';

interface SortDropdownProps {
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ currentSort, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const getLabel = (option: SortOption) => {
    switch (option) {
      case 'newest': return 'Recently Added';
      case 'price-low': return 'Price: Low to High';
      case 'price-high': return 'Price: High to Low';
      default: return 'Sort';
    }
  };

  const handleSelect = (option: SortOption) => {
    onSortChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative z-10" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-wedding-gold border border-wedding-gold/20 px-6 py-3 hover:bg-wedding-gold/5 transition-all bg-white shadow-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        Sort By: {getLabel(currentSort)}
        <Icons.ChevronDown />
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-56 bg-white border border-wedding-gold/10 shadow-xl flex flex-col py-2 animate-in fade-in zoom-in duration-200"
          role="menu"
        >
          {(['newest', 'price-low', 'price-high'] as SortOption[]).map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`text-left px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-wedding-gold/5 transition-colors ${currentSort === option ? 'text-wedding-gold' : 'text-wedding-charcoal/60'}`}
              role="menuitem"
            >
              {getLabel(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;

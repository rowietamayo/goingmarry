import React from 'react';

const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white overflow-hidden border border-wedding-gold/10 shadow-sm flex flex-col animate-pulse">
      {/* Image Area Skeleton */}
      <div className="relative aspect-[4/5] bg-wedding-ivory/50">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
      </div>

      <div className="p-10 flex flex-col items-center text-center flex-grow">
        {/* Category Tag Skeleton */}
        <div className="w-20 h-2 bg-wedding-gold/10 mb-4 rounded"></div>

        {/* Title Skeleton */}
        <div className="w-3/4 h-6 bg-wedding-charcoal/5 mb-4 rounded"></div>
        <div className="w-1/2 h-6 bg-wedding-charcoal/5 mb-4 rounded"></div>

        {/* Seller Skeleton */}
        <div className="w-32 h-2 bg-wedding-gold/5 mb-6 rounded"></div>

        {/* Description Skeleton */}
        <div className="space-y-2 w-full mb-8">
          <div className="w-full h-2 bg-wedding-charcoal/5 rounded"></div>
          <div className="w-full h-2 bg-wedding-charcoal/5 rounded"></div>
          <div className="w-2/3 h-2 bg-wedding-charcoal/5 rounded mx-auto"></div>
        </div>

        {/* Price Skeleton */}
        <div className="mt-auto pt-8 border-t border-wedding-gold/10 w-full flex justify-center">
            <div className="w-24 h-8 bg-wedding-gold/10 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;

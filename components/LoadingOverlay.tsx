import React, { useEffect, useState } from 'react';
import { Icons } from '../constants';

const LoadingOverlay: React.FC = () => {
  const [textIndex, setTextIndex] = useState(0);

  const storyPairs = [
    ["Rowie is securing the treasure chest...", "Larry is checking the Log Pose..."],
    ["Rowie is untangling the fairy lights...", "Larry is fluffing the tulle..."],
    ["Rowie is steaming the veils...", "Larry is hunting for the ring box..."],
    ["Rowie is color-coding the ribbons...", "Larry is checking the lace for perfection..."],
    ["Rowie is wrapping the fragile items...", "Larry is dusting off the vintage finds..."],
    ["Rowie is looking for the scotch tape...", "Larry is trying to fit everything in the box..."],
  ];

  const [activePair] = useState(() => storyPairs[Math.floor(Math.random() * storyPairs.length)]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-wedding-ivory/95 backdrop-blur-md animate-in fade-in duration-700 overflow-hidden">

      {/* Background Animated Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => {
          const size = Math.random() * 20 + 10;
          return (
            <div
              key={i}
              className="absolute animate-float-bubble"
              style={{
                bottom: '-50px',
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${Math.random() * 5 + 5}s`
              }}
            >
              <div
                className="rounded-full border border-wedding-gold/30 bg-wedding-gold/10 backdrop-blur-[1px] relative"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  boxShadow: 'inset -2px -2px 6px rgba(180, 150, 80, 0.1), inset 2px 2px 6px rgba(255, 255, 255, 0.5)'
                }}
              >
                {/* Bubble Sheen */}
                <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] bg-white/60 rounded-full blur-[1px]"></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative flex flex-col items-center">

        {/* Spinning Ship's Wheel */}
        <div className="relative mb-12">
            <div className="absolute inset-0 bg-wedding-gold/20 rounded-full blur-3xl animate-pulse scale-150"></div>

            <div className="relative animate-spin-slow">
                <Icons.ShipWheel className="w-32 h-32 text-wedding-gold stroke-[0.8]" />
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-wedding-gold rounded-full border-4 border-wedding-ivory shadow-lg"></div>
        </div>

        {/* Rotating Storytelling Text */}
        <div className="text-center h-8 flex items-center justify-center overflow-hidden">
          <p key={`${activePair[0]}-${textIndex}`} className="serif text-xl md:text-2xl text-wedding-gold italic animate-in slide-in-from-bottom-4 fade-in duration-700">
            {activePair[textIndex % 2]}
          </p>
        </div>

        {/* Brand Subtle */}
        <div className="mt-16 flex items-center gap-3 opacity-30">
           <div className="w-8 h-px bg-wedding-gold"></div>
           <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-wedding-charcoal">GoingMarry</span>
           <div className="w-8 h-px bg-wedding-gold"></div>
        </div>

        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes float-bubble {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 0.6; }
            50% { transform: translateY(-50vh) translateX(20px); }
            90% { opacity: 0.6; }
            100% { transform: translateY(-110vh) translateX(-10px); opacity: 0; }
          }
          .animate-spin-slow {
            animation: spin-slow 12s linear infinite;
          }
          .animate-float-bubble {
            animation: float-bubble linear infinite;
          }
          .serif {
            font-family: 'Playfair Display', serif;
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoadingOverlay;

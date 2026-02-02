
import React from 'react';

const Hero: React.FC = () => {

  const handleGalleryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const boutiqueSection = document.getElementById('boutique');
    if (boutiqueSection) {
      boutiqueSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/docs/hero_bg.jpg"
          alt="Boutique Atmosphere"
          className="w-full h-full object-cover"
        />
        {/* Soft elegant overlay */}
        <div className="absolute inset-0 bg-wedding-charcoal/30 backdrop-blur-[2px]"></div>
      </div>

      <header className="relative z-10 px-6 text-center max-w-4xl mx-auto">
        <span className="text-white text-[10px] uppercase tracking-[0.4em] font-bold mb-4 block drop-shadow-md">Curated Preloved by:</span>
        <h2 className="serif text-6xl md:text-8xl mb-8 italic text-white drop-shadow-lg">Rowie and Larry's Collection</h2>
        <p className="serif text-lg md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
         From our celebration to your big day. We’re sharing the pieces that made our wedding magical, so they can create new memories with you.
        </p>
        <div className="flex justify-center">
           <a
             href="#boutique"
             onClick={handleGalleryClick}
             className="bg-wedding-gold text-wedding-charcoal px-12 py-5 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white transition-all shadow-2xl hover:scale-105"
           >
             Find your Perfect Piece
           </a>
        </div>
      </header>
    </section>
  );
};

export default Hero;

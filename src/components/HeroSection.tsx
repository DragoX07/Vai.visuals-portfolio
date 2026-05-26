import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { floatingHeroPhotos } from '../data';
import { StillPhoto } from '../types';

interface HeroSectionProps {
  onPlayShowreel: (videoUrl: string) => void;
  photos?: StillPhoto[];
  showcaseVideoUrl?: string;
  showcaseThumbnailUrl?: string;
  onOpenAdminPanel?: () => void;
}

export default function HeroSection({ onPlayShowreel, photos, showcaseVideoUrl, showcaseThumbnailUrl, onOpenAdminPanel }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const showcaseVideoRef = useRef<HTMLVideoElement>(null);
  
  // Physics refs for LERP tracking
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  
  // Capture current scroll offset for mobile scroll drift
  const scrollYRef = useRef(0);
  
  // Trigger re-renders at 60fps for layout positioning
  const [coords, setCoords] = useState({ x: 0, y: 0, scrollY: 0 });

  useEffect(() => {
    // 1. Mouse moving listener (Desktop parallax)
    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Normalize values from -0.5 to 0.5
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX.current = x;
      targetY.current = y;
    };

    // 2. Scroll listener (Mobile parallax)
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    // Run animation frame loops
    let animationFrameId: number;
    const updatePhysics = () => {
      // Linear Interpolation (LERP) formula: current = current + (target - current) * easeRate
      currentX.current += (targetX.current - currentX.current) * 0.08;
      currentY.current += (targetY.current - currentY.current) * 0.08;

      setCoords({
        x: currentX.current,
        y: currentY.current,
        scrollY: scrollYRef.current,
      });

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('pointermove', handlePointerMove, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      if (container) {
        container.removeEventListener('pointermove', handlePointerMove);
      }
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Intersection observer for showcase video
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            showcaseVideoRef.current?.play().catch(e => console.log('Auto-play blocked:', e));
          } else {
            showcaseVideoRef.current?.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (showcaseVideoRef.current) {
      observer.observe(showcaseVideoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const sampleShowreelUrl = "";
  const activeShowcaseUrl = showcaseVideoUrl || sampleShowreelUrl;

  // Map synced Google Drive photos into the scattered background collage if they exist
  const displayPhotos = floatingHeroPhotos.map((photo, index) => {
    if (photos && photos.length > index) {
      return {
        ...photo,
        url: photos[index].coverUrl,
        alt: photos[index].title || photo.alt,
        category: photos[index].category || photo.category,
      };
    }
    return photo;
  }).filter(photo => photo.id !== 'hero-7');

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center bg-cream overflow-hidden pt-20 px-6"
    >
      {/* Editorial Grid Backing (Subtle aesthetic guides) */}
      <div className="absolute inset-x-0 top-0 h-full w-full pointer-events-none opacity-[0.03] select-none flex justify-between px-12 md:px-24">
        <div className="w-[1px] h-full bg-[#2C1A0E]"></div>
        <div className="w-[1px] h-full bg-[#2C1A0E] hidden md:block"></div>
        <div className="w-[1px] h-full bg-[#2C1A0E] hidden md:block"></div>
        <div className="w-[1px] h-full bg-[#2C1A0E]"></div>
      </div>

      {/* Earthy Vignette Overlays */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-cream/10 pointer-events-none"></div>

      {/* FLOATING COLLAGE FRAMEWORKS */}
      {displayPhotos.map((photo) => {
        if (!photo.url) return null;
        // Calculate physics translation
        // Desk values move opposite of mouse movement (* speedFactor * viewportWidth/Height)
        const desktopX = -coords.x * photo.speedFactor * 450;
        const desktopY = -coords.y * photo.speedFactor * 450;
        
        // Mobile scroll displacement moves upwards at different rates
        const mobileY = -coords.scrollY * photo.speedFactor * 0.8;

        const style = {
          top: photo.top,
          left: photo.left,
          right: photo.right,
          transform: `translate3d(${desktopX}px, ${desktopY + mobileY}px, 0) rotate(${photo.rotation}deg)`,
        };

        return (
          <div
            key={photo.id}
            className={`hidden md:block absolute pointer-events-auto z-10 ${photo.size} transition-shadow duration-500 ease-out`}
            style={style}
          >
            <div className="relative group overflow-hidden rounded-md shadow-[4px_12px_24px_rgba(44,26,14,0.08)] hover:shadow-[4px_16px_36px_rgba(44,26,14,0.18)] transition-all duration-700">
              <img
                src={photo.url}
                alt={photo.alt}
                className="w-full aspect-[4/5] object-cover rounded-md group-hover:scale-105 transition-transform duration-700 ease-out selection:bg-none"
                referrerPolicy="no-referrer"
              />
              {/* Soft warm gold matte overlay on hover */}
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500 rounded-md"></div>
              
              {/* Dynamic decorative film-strip layout coordinates */}
              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-cream font-mono text-[9px] tracking-widest bg-charcoal/45 px-2 py-0.5 rounded-full select-none">
                vai_std // {photo.category.toUpperCase()}
              </div>
            </div>
          </div>
        );
      })}

      {/* HERO DIORAMA (Central anchored showcase) */}
      <div className="relative z-20 w-full max-w-xl md:max-w-3xl flex flex-col items-center text-center px-4">
        {/* Editorial Badge */}
        <div 
          onClick={onOpenAdminPanel}
          className="mb-4 inline-flex items-center gap-2 bg-[#FAF5EE]/90 backdrop-blur-sm border border-[#F2E9D8] px-4 py-1.5 rounded-full shadow-sm cursor-pointer hover:bg-white transition-colors"
        >
          <span className="w-1.5 h-1.5 bg-terracotta rounded-full"></span>
          <span className="text-[#2C1A0E] text-[10px] tracking-[0.25em] font-sans font-semibold uppercase">
            Production Studio
          </span>
        </div>

        {/* Cinematic Title Group */}
        <h1 className="text-[#2C1A0E] font-serif font-light text-6xl sm:text-8xl md:text-9xl tracking-tight leading-none mb-2 select-none">
          Portfolio
        </h1>
        <p className="text-peach text-xs sm:text-sm md:text-base font-serif italic tracking-wider mb-8 max-w-lg">
          Capturing transient light and silent gestures into cinematic eternity
        </p>

        {/* Central Anchored Showreel Box */}
        <div 
          onClick={() => activeShowcaseUrl ? onPlayShowreel(activeShowcaseUrl) : undefined}
          className="w-full aspect-video rounded-lg overflow-hidden bg-[#2C1A0E] shadow-[0_32px_64px_rgba(44,26,14,0.25)] border-[5px] border-[#FAF5EE] group cursor-pointer relative transition-transform duration-500 hover:scale-[1.01]"
        >
          {/* Real atmospheric background muted loop video */}
          {activeShowcaseUrl && (
            <video
              ref={showcaseVideoRef}
              muted
              loop
              playsInline
              poster={showcaseThumbnailUrl}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700"
              src={activeShowcaseUrl}
              /* Comment indicating where to swap real showreel media */
              // SWAP MEDIA: Replace the 'src' link with your high-end cinematic showreel file or Vimeo/YouTube direct stream.
            />
          )}

          {/* Central Play Trigger Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-cream/30 bg-[#2C1A0E]/30 backdrop-blur-sm flex items-center justify-center transition-all duration-500 scale-100 group-hover:scale-110 group-hover:bg-terracotta/90 group-hover:border-terracotta">
              <Play className="w-6 h-6 md:w-8 md:h-8 text-cream fill-cream transform translate-x-0.5" />
            </div>
          </div>

          {/* Subtle Frame Labels */}
          <div className="absolute top-4 left-4 font-mono text-[9px] tracking-wider text-cream/70 select-none">
            [REC] // SHOWREEL_2026.MP4
          </div>
          <div className="absolute bottom-4 right-4 font-mono text-[9px] tracking-wider text-cream/70 select-none">
            PLAY PREVIEW
          </div>
        </div>

        {/* Scroll Indicator Footer */}
        <div className="mt-12 flex flex-col items-center gap-2 text-[#2C1A0E]/60 pointer-events-none">
          <span className="text-[10px] tracking-[0.3em] font-sans font-light uppercase">
            Explore Portfolio
          </span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-[#2C1A0E]/60 to-transparent animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}

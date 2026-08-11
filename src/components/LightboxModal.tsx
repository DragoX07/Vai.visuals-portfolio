import { useEffect } from 'react';
import { X } from 'lucide-react';

interface LightboxModalProps {
  videoUrl: string | null;
  imageUrl: string | null;
  imageTitle?: string;
  imageLocation?: string;
  originalUrl?: string;
  onClose: () => void;
}

export default function LightboxModal({
  videoUrl,
  imageUrl,
  imageTitle,
  imageLocation,
  originalUrl,
  onClose,
}: LightboxModalProps) {
  
  // Back key escaping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    // Lock scrolling behind overlay
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!videoUrl && !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-charcoal/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Dynamic Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-cream-dark/10 hover:bg-[#FAF5EE] hover:text-[#2C1A0E] text-[#FAF5EE] flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta z-[100] cursor-pointer"
        aria-label="Close Lightbox"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Lightbox Media Container */}
      <div
        onClick={(e) => e.stopPropagation()} // Stop bubbling
        className="w-full max-w-5xl rounded-lg overflow-hidden bg-black/40 border border-[#FAF5EE]/5 shadow-2xl relative"
      >
        
        {/* CASE 1: Video Player Lightbox */}
        {videoUrl && (
          <div className="aspect-video relative bg-black flex items-center justify-center">
            {videoUrl.includes('drive.google.com') ? (
              <iframe
                src={videoUrl}
                title="Cinematic Video Player"
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            ) : (
              <>
                <video
                  src={videoUrl}
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
                {/* Swapping metadata note */}
                <div className="absolute top-4 left-4 pointer-events-none bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-cream font-mono text-[9px] tracking-widest uppercase">
                  STUDIO ARCHIVE // CINEMATIC SOURCE // HI-RES STREAM
                </div>
              </>
            )}
          </div>
        )}

        {/* CASE 2: Image Stills Zoom Frame */}
        {imageUrl && (
          <div className="relative flex flex-col items-center">
            <div className="max-h-[75vh] w-full overflow-hidden flex items-center justify-center bg-[#1C0E05]/10">
              <img
                src={imageUrl}
                alt={imageTitle || 'Portfolio image'}
                className="w-full max-h-[70vh] object-contain select-none"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Descriptive title block inside lightbox */}
            {(imageTitle || imageLocation || originalUrl) && (
              <div className="w-full bg-[#FAF5EE] text-[#2C1A0E] p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-serif text-[#2C1A0E] text-xl tracking-wide">
                    vai.visuals
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {imageLocation && (
                    <div className="bg-[#FAF5EE] border border-[#2C1A0E]/15 px-4 py-2 rounded-md flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-terracotta rounded-full"></span>
                      <span className="font-mono text-xs text-[#2C1A0E]/75 uppercase tracking-widest font-semibold">
                        {imageLocation}
                      </span>
                    </div>
                  )}
                  {originalUrl && (
                    <a
                      href={originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#C1440E] hover:bg-[#C1440E]/90 text-cream text-xs uppercase font-sans font-semibold tracking-widest px-4 py-2 rounded-md flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <span className="font-semibold text-xs tracking-wider">Original Quality</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
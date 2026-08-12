import { useState } from 'react';
import { Camera, MapPin, Maximize2 } from 'lucide-react';
import { stillsPhotos as defaultStillsPhotos } from '../data';
import { StillPhoto } from '../types';

interface PhotoSectionProps {
  onZoomPhoto: (imageUrl: string, title?: string, photographer?: string, originalUrl?: string) => void;
  photos?: StillPhoto[];
}

export default function PhotoSection({ onZoomPhoto, photos }: PhotoSectionProps) {
  const [filter, setFilter] = useState<'all' | 'portrait' | 'editorial' | 'commercial'>('all');

  const categories: Array<{ id: typeof filter; label: string }> = [
    { id: 'all', label: 'All Stills' },
    { id: 'portrait', label: 'Portrait' },
    { id: 'editorial', label: 'Editorial' },
    { id: 'commercial', label: 'Commercial' },
  ];

  const activePhotos = photos || defaultStillsPhotos;

  // Filter based on selected filter option
  const filteredPhotos = activePhotos.filter((photo: StillPhoto) => {
    if (filter === 'all') return true;
    return photo.category === filter;
  });

  return (
    <section
      id="photos"
      className="py-24 md:py-32 bg-[#FAF5EE] text-[#2C1A0E] px-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Bento Heading & Filter Cell */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_4px_24px_rgba(44,26,14,0.02)] border border-[#EBE3D3] mb-8 flex flex-col lg:flex-row justify-between lg:items-center gap-8">
          <div className="max-w-3xl">
            <h2 className="text-5xl sm:text-7xl md:text-[9rem] lg:text-[10.5rem] font-serif font-semibold tracking-tighter text-charcoal leading-none select-none">
              Captured Stills
            </h2>
          </div>

          {/* Minimal Filter Row */}
          <div className="flex flex-wrap items-center gap-2 border-t border-[#F2E9D8] pt-6 lg:pt-0 lg:border-t-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`text-[11px] uppercase tracking-[0.2em] font-sans font-semibold px-5 py-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                  filter === cat.id
                    ? 'bg-[#C1440E] text-[#FAF5EE] shadow-sm'
                    : 'text-[#2C1A0E]/60 hover:text-[#C1440E] bg-cream-dark/40 hover:bg-cream-dark/80'
                }`}
                aria-label={`filter by ${cat.label}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FIXED: Changed from columns to responsive grid with aspect-ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-max w-full">
          {filteredPhotos.map((photo: StillPhoto, index: number) => {
            return (
              <div
                key={photo.id}
                onClick={() => onZoomPhoto(photo.coverUrl, photo.title, photo.location, photo.originalUrl)}
                className="break-inside-avoid mb-6 group cursor-pointer bg-white rounded-3xl p-5 border border-[#EBE3D3] hover:border-peach/35 transition-all duration-700 flex flex-col justify-start shadow-[0_4px_24px_rgba(44,26,14,0.015)] hover:shadow-[0_16px_40px_rgba(44,26,14,0.08)] hover:-translate-y-1 hover:scale-[1.01] select-none animate-fadeIn"
                style={{
                  animationDelay: `${index * 80}ms`
                }}
              >
                <div>
                  {/* Item Index Label */}
                  <div className="flex justify-between items-center mb-4 text-[#2C1A0E]/45 font-mono text-[9px] tracking-wider uppercase">
                    <span>VAI_STILLS // N°0{index + 1}</span>
                    <span className="bg-[#FAF5EE] border border-[#F2E9D8] px-2 py-0.5 rounded-full text-[#C1440E] font-semibold">
                      {photo.category}
                    </span>
                  </div>

                  {/* Image Wrap - FIXED: Added aspect-[4/5] */}
                  <div className="relative w-full overflow-hidden rounded-2xl bg-[#FAF5EE] border border-[#F2E9D8] aspect-[4/5]">
                    <img
                      src={photo.coverUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-[900ms] ease-out hover:brightness-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Shading Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Lens Zoom icon */}
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-cream-dark/70 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 hover:bg-terracotta hover:text-cream">
                      <Maximize2 className="w-3.5 h-3.5 text-charcoal group-hover:text-cream" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state callback guard if filtered lists are empty */}
        {filteredPhotos.length === 0 && (
          <div className="py-20 text-center text-[#2C1A0E]/50 font-serif italic text-lg border border-dashed border-[#F2E9D8] rounded-3xl bg-white shadow-inner">
            No stills found in the archive matching this selection.
          </div>
        )}

      </div>
    </section>
  );
}
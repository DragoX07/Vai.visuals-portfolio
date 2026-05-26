import { Play } from 'lucide-react';
import { filmProjects } from '../data';
import { FilmProject } from '../types';
import { useEffect, useRef } from 'react';

interface VideoSectionProps {
  onPlayVideo: (videoUrl: string) => void;
  videos?: FilmProject[];
}

export default function VideoSection({ onPlayVideo, videos }: VideoSectionProps) {
  const activeVideos = videos || filmProjects;
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            videoElement.play().catch(e => console.log('Auto-play blocked:', e));
          } else {
            videoElement.pause();
          }
        });
      },
      { threshold: 0.1 } // Play when at least 10% visible
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [activeVideos]);

  return (
    <section
      id="video"
      className="relative py-24 md:py-32 bg-[#FAF5EE] text-[#2C1A0E] overflow-hidden px-4 md:px-8"
    >
      {/* Soft atmospheric gradient highlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#C1440E]/5 blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-12 right-1/4 w-[400px] h-[400px] rounded-full bg-gold/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Bento Heading Cell */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#EBE3D3] mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_4px_24px_rgba(44,26,14,0.02)]">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-serif font-light text-[#2C1A0E] tracking-tight">
              Work &amp; Films
            </h2>
          </div>
          <div className="hidden lg:block border-l border-[#F2E9D8] pl-10 py-2">
            <div className="text-[10px] font-mono tracking-widest text-terracotta text-right uppercase mb-2">
              STATUS // ACTIVE COMMISSION
            </div>
            <div className="font-serif italic text-[#2C1A0E]/60 text-sm max-w-xs text-right">
              &ldquo;The camera is an instrument that teaches people how to see without a camera.&rdquo;
            </div>
          </div>
        </div>

        {/* Bento Grid Pattern */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {activeVideos.map((project: FilmProject, idx: number) => {
            // Re-order weights to build an exquisite asymmetrical bento pattern
            // First and fourth items are larger (span 7 columns), others are span 5
            const isWide = idx === 0 || idx === 3;
            const gridColSpan = isWide ? 'md:col-span-7' : 'md:col-span-5';

            return (
              <div
                key={project.id}
                onClick={() => onPlayVideo(project.videoUrl)}
                className={`group cursor-pointer bg-white hover:bg-white rounded-3xl p-6 border border-[#EBE3D3] hover:border-peach/35 transition-all duration-500 flex flex-col justify-between ${gridColSpan} shadow-[0_4px_24px_rgba(44,26,14,0.015)] hover:shadow-[0_16px_40px_rgba(44,26,14,0.08)] hover:-translate-y-1 hover:scale-[1.01] overflow-hidden`}
              >
                <div>
                  {/* Subtle inner grid marker */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] font-mono text-[#2C1A0E]/40 ml-auto">
                      VAI // N°0{idx + 1}
                    </span>
                  </div>

                  {/* High Quality Thumbnail Card & AutoPlay Video */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
                    {/* Video that plays when visible */}
                    <video
                      ref={(el) => (videoRefs.current[idx] = el)}
                      src={project.videoUrl}
                      poster={project.coverUrl}
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-[800ms] ease-out opacity-80 group-hover:opacity-100 group-hover:brightness-105"
                    />
                    
                    {/* Dark gradient shadow inside thumbnail */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-transparent to-transparent opacity-60"></div>

                    {/* Centered glass play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-terracotta group-hover:border-terracotta">
                        <svg className="w-5 h-5 text-cream fill-cream transform translate-x-0.5" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-4 font-mono text-[9px] text-[#FAF5EE]/75 uppercase tracking-widest select-none">
                      STREAM // HI_RES_DIGITAL
                    </div>
                  </div>
                </div>

                {/* Footer labels inside bento card */}
                <div className="flex justify-end items-center mt-6">
                  <div className="w-9 h-9 rounded-full bg-cream flex items-center justify-center group-hover:bg-[#FAF5EE] transition-colors">
                    <svg className="w-4 h-4 text-[#2C1A0E]/40 group-hover:text-terracotta transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* Quote Block structured neatly in a full-span Bento panel */}
        <div className="mt-12 bg-white rounded-3xl p-8 md:p-10 border border-[#EBE3D3] shadow-[0_4px_24px_rgba(44,26,14,0.015)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="max-w-xl">
            <p className="font-serif italic text-[#2C1A0E]/80 text-lg md:text-xl leading-relaxed">
              &ldquo;The eye should learn to listen before it looks.&rdquo;
            </p>
            <span className="text-[#C1440E] font-sans text-xs tracking-widest uppercase mt-2 inline-block">
              — Robert Bresson // filmmaker
            </span>
          </div>
          <div className="text-[#2C1A0E]/30 font-mono text-[9px] tracking-[0.25em] uppercase leading-relaxed text-left sm:text-right">
            vai.visuals studio // video division // © archives 2026
          </div>
        </div>

      </div>
    </section>
  );
}

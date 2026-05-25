import { useEffect, useState } from 'react';

interface HeaderProps {
  activeSection: string;
  scrollToSection: (id: string) => void;
}

export default function Header({ activeSection, scrollToSection }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'video', label: 'Video' },
    { id: 'photos', label: 'Photos' },
    { id: 'enquiry', label: 'Enquiry' },
  ];

  return (
    <nav
      id="header-nav"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-cream/85 backdrop-blur-md py-4 shadow-sm border-b border-cream-dark/40'
          : 'bg-transparent py-7'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-12 flex justify-between items-center">
        {/* Brand Wordmark */}
        <button
          onClick={() => scrollToSection('home')}
          className="text-[#2C1A0E] tracking-[0.12em] sm:tracking-[0.25em] font-serif font-light text-base sm:text-xl md:text-2xl hover:text-terracotta transition-colors duration-500 focus:outline-none cursor-pointer flex items-center gap-1.5 sm:gap-2 group"
          aria-label="vai.visuals home"
        >
          <span className="relative">
            vai.visuals
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-terracotta transition-all duration-500 group-hover:w-full"></span>
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
        </button>

        {/* Navigation Menu */}
        <div className="flex items-center gap-3.5 sm:gap-6 md:gap-12">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="group relative text-[#2C1A0E]/80 hover:text-terracotta font-sans text-xs tracking-[0.2em] font-medium uppercase transition-colors duration-300 focus:outline-none cursor-pointer py-1"
            >
              <span className="relative z-10">{item.label}</span>
              {/* Sliding Bottom Active Track */}
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-terracotta transition-all duration-500 ${
                  activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-1/2'
                }`}
              ></span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

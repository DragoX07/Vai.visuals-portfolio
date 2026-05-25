export default function Footer() {
  return (
    <footer className="bg-charcoal text-[#FAF5EE]/40 py-12 border-t border-cream-dark/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left Side */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <span className="font-serif tracking-[0.2em] text-[#FAF5EE] text-sm font-light">
            vai.visuals
          </span>
          <span className="hidden md:inline text-white/20 select-none">|</span>
          <p className="text-xs font-mono font-light uppercase tracking-wider">
            © 2026 Creative Agency Co. All Rights Reserved.
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-8 text-xs font-mono font-light uppercase tracking-widest text-[#FAF5EE]/40">
          <div>
            UTC_STAMP // {new Date().toISOString().substring(0, 10)}
          </div>
          <span className="hidden md:inline text-white/10 select-none">//</span>
          <a
            href="#home"
            className="hover:text-peach transition-colors duration-300"
          >
            Back to Top ↑
          </a>
        </div>

      </div>
    </footer>
  );
}

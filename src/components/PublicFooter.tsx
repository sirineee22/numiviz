import { useNavigate } from 'react-router-dom';

export default function PublicFooter() {
  const navigate = useNavigate();
  const y = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/70 bg-[#FAF9F6] relative overflow-hidden">
      {/* Delicate dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Decorative side technical grid frames from mockup */}
      {/* Left Frame */}
      <div className="hidden lg:block absolute left-4 xl:left-8 top-6 w-24 sm:w-28 h-36 rounded-2xl border-2 border-amber-300/60 bg-amber-50/15 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 112 144" className="w-full h-full opacity-45">
          <defs>
            <pattern id="footerGridLeft" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="112" height="144" fill="url(#footerGridLeft)" />
        </svg>
      </div>

      {/* Right Frame */}
      <div className="hidden lg:block absolute right-4 xl:right-8 top-6 w-24 sm:w-28 h-36 rounded-2xl border-2 border-amber-300/60 bg-amber-50/15 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 112 144" className="w-full h-full opacity-45">
          <defs>
            <pattern id="footerGridRight" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="112" height="144" fill="url(#footerGridRight)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-10">
          {/* Brand Column (Span 4) */}
          <div className="col-span-2 md:col-span-4 space-y-3 relative">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 group text-left">
              <div className="h-7 w-7 relative flex items-center justify-center">
                <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
                  <path d="M6 23L12 9" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
                  <path d="M12 9L19 23" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M19 9V23" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
                  <rect x="22.5" y="10.5" width="2.5" height="2.5" rx="0.8" fill="#3B82F6" />
                  <rect x="22.5" y="15" width="2.5" height="2.5" rx="0.8" fill="#3B82F6" />
                  <rect x="22.5" y="19.5" width="2.5" height="2.5" rx="0.8" fill="#3B82F6" />
                </svg>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Numi<span className="text-[#F97316]">Viz</span>
              </span>
            </button>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[210px]">
              Interactive numerical analysis platform for students and educators.
            </p>

            {/* Hand-drawn sketches around brand */}
            <div className="hidden sm:flex items-center gap-3 pt-2 opacity-60 pointer-events-none">
              {/* Cute pencil doodle */}
              <svg viewBox="0 0 40 20" className="w-8 h-4 text-slate-500">
                <path d="M2 10 L10 4 L34 16 L28 19 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2 10 L8 7 L6 13 Z" fill="currentColor" />
              </svg>
              {/* Curly spring doodle */}
              <svg viewBox="0 0 60 20" className="w-12 h-4 text-slate-400">
                <path d="M2 14 C10 4, 15 4, 18 12 C21 4, 26 4, 29 12 C32 4, 37 4, 40 12 C43 4, 48 4, 55 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              {/* Math symbol doodle */}
              <span className="text-[11px] font-mono text-slate-400 select-none">~ (x/y)</span>
            </div>
          </div>

          {/* METHODS Column (Span 3) */}
          <div className="col-span-1 md:col-span-3">
            <div className="flex items-center gap-1.5 mb-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800">METHODS</span>
              <svg viewBox="0 0 20 18" className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor">
                <path d="M3 2h2v14H3M17 2h-2v14h2" strokeWidth="1.5" />
                <circle cx="7" cy="5" r="0.75" fill="currentColor" />
                <circle cx="13" cy="5" r="0.75" fill="currentColor" />
                <circle cx="7" cy="13" r="0.75" fill="currentColor" />
                <circle cx="13" cy="13" r="0.75" fill="currentColor" />
              </svg>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <button onClick={() => navigate('/tools?tool=jacobi')} className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Linear Systems</span>
                <span className="text-emerald-500 font-bold text-[10px]">✓</span>
              </button>
              <button onClick={() => navigate('/tools?tool=newton')} className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Nonlinear Eq.</span>
                <span className="text-amber-500 font-bold text-[10px]">✓</span>
              </button>
              <button onClick={() => navigate('/tools?tool=trapezoidal')} className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Integration</span>
              </button>
              <button onClick={() => navigate('/tools?tool=euler')} className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>ODEs</span>
              </button>
            </div>
          </div>

          {/* PLATFORM Column (Span 3) */}
          <div className="col-span-1 md:col-span-3">
            <div className="flex items-center gap-1.5 mb-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800">PLATFORM</span>
              <span className="text-[11px] font-serif font-bold text-slate-400">Σ Σ</span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <button onClick={() => navigate('/tools')} className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Numerical Lab</span>
                <span className="text-emerald-500 font-bold text-[10px]">✓</span>
              </button>
              <button onClick={() => navigate('/practice')} className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Practice</span>
                <svg viewBox="0 0 20 12" className="w-3.5 h-2 text-amber-500">
                  <path d="M1,10 Q6,3 11,8 T19,2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </button>
              <button onClick={() => navigate('/tools?tool=trapezoidal')} className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>Integration</span>
                <svg viewBox="0 0 16 12" className="w-3 h-2 text-amber-600">
                  <path d="M2,10 L2,6 Q8,2 14,7 L14,10 Z" fill="#FDE68A" stroke="currentColor" strokeWidth="1" />
                </svg>
              </button>
              <button onClick={() => navigate('/tools')} className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Numerical Lab</span>
                <svg viewBox="0 0 20 12" className="w-3.5 h-2 text-emerald-500">
                  <path d="M1,9 Q6,2 11,7 T19,1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </button>
            </div>
          </div>

          {/* ACCOUNT Column (Span 2) */}
          <div className="col-span-1 md:col-span-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-3.5">ACCOUNT</span>
            <div className="space-y-2 text-xs text-slate-600">
              <button onClick={() => navigate('/auth')} className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <span>Sign Up</span>
                <span className="text-emerald-500 font-bold text-[10px]">✓</span>
              </button>
              <button onClick={() => navigate('/auth')} className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <span>Login</span>
                <span className="text-rose-400 font-bold text-[10px]">~</span>
              </button>
              <button onClick={() => navigate('/contact')} className="block hover:text-slate-900 transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200/70 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {y} NumiViz — Sirine Dahmane. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={() => navigate('/about')} className="hover:text-slate-900 transition-colors">About</button>
            <button onClick={() => navigate('/contact')} className="hover:text-slate-900 transition-colors">Contact</button>
            <button onClick={() => navigate('/guide')} className="hover:text-slate-900 transition-colors">Guide</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

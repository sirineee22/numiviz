import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, User, BookOpen, Check, Play, Pause, FastForward,
  Grid3X3, Activity, Sigma, Waves, Spline, Cpu, Diff, Compass
} from 'lucide-react';
import HomeNavbar from '@/components/HomeNavbar';
import PublicFooter from '@/components/PublicFooter';

// --- Interactive Hero Newton-Raphson Simulation Window ---
function NewtonRaphsonMockup() {
  const [step, setStep] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStep((s) => (s >= 2 ? 0 : s + 1));
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const stepData = [
    { n: '0.0000', x_n: '2.0000', x_gma: '2.0000' },
    { n: '1.0000', x_n: '1.3478', x_gma: '1.4500' },
    { n: '2.0000', x_n: '1.3478', x_gma: '1.3252' },
  ];

  const current = stepData[step];

  return (
    <div className="relative w-full max-w-[550px] mx-auto bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-300 hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)]">
      {/* Window Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/90 border-b border-slate-200/80">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <span className="w-3 h-3 rounded-full bg-[#10B981]" />
        </div>
        <span className="text-xs font-mono font-medium text-slate-500">
          newton_raphson.nv
        </span>
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>done</span>
        </div>
      </div>

      {/* Function Pill Header */}
      <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-xs font-mono text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">f(x) = x² - x - 1</span>
          <span className="text-slate-400">→</span>
          <span className="text-blue-600 font-semibold">find x: f(x) = 0</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-12 gap-0 divide-x divide-slate-100">
        {/* Left Column: Interactive Function Graph */}
        <div className="col-span-7 p-4 flex flex-col justify-between bg-white">
          <div className="relative w-full aspect-[4/3] bg-slate-50/40 rounded-lg overflow-hidden border border-slate-100/80">
            <svg viewBox="0 0 300 210" className="w-full h-full">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
                </pattern>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              <rect width="300" height="210" fill="url(#grid)" />

              {/* Axes */}
              <line x1="30" y1="150" x2="280" y2="150" stroke="#94A3B8" strokeWidth="1.2" />
              <line x1="80" y1="20" x2="80" y2="190" stroke="#94A3B8" strokeWidth="1.2" />

              <text x="75" y="45" fill="#94A3B8" fontSize="9" textAnchor="end">5</text>
              <text x="75" y="153" fill="#94A3B8" fontSize="9" textAnchor="end">0</text>
              <text x="75" y="185" fill="#94A3B8" fontSize="9" textAnchor="end">-5</text>

              {/* Shaded Area */}
              <path
                d="M 120 150 L 120 115 Q 160 110 220 50 L 220 150 Z"
                fill="url(#areaGradient)"
              />

              {/* Curve f(x) */}
              <path
                d="M 50 175 Q 100 160 140 120 T 235 45"
                fill="none"
                stroke="#6366F1"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Tangents */}
              <line x1="170" y1="185" x2="235" y2="40" stroke="#F59E0B" strokeWidth="1.6" strokeDasharray="3 2" />
              <line x1="130" y1="150" x2="190" y2="60" stroke="#EA580C" strokeWidth="1.6" />

              {/* Projections */}
              <line x1="220" y1="50" x2="220" y2="150" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="170" y1="85" x2="170" y2="150" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="140" y1="120" x2="140" y2="150" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />

              {/* Markers */}
              <g className="cursor-pointer">
                <circle cx="220" cy="50" r="8" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                <text x="220" y="53" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>
              </g>

              <g className="cursor-pointer">
                <circle cx="170" cy="85" r="8" fill="#0D9488" stroke="#FFFFFF" strokeWidth="2" />
                <text x="170" y="88" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
              </g>

              <g className="cursor-pointer">
                <circle cx="140" cy="120" r="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                <text x="140" y="123" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right Column: Parameters */}
        <div className="col-span-5 p-4 flex flex-col justify-between bg-white text-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                algorithm
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                converged
              </span>
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">n =</span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] font-bold">
                  {current.n}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">x_n =</span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309] font-bold">
                  {current.x_n}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-semibold">x_gma =</span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#EDE9FE] text-[#6D28D9] font-bold">
                  {current.x_gma}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-4">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">
                Active
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800">
                Processing
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3">
            <p className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Converged - x* = 1.3247
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Playback Toolbar */}
      <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200/80 flex items-center gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        <button
          onClick={() => setIsPlaying(false)}
          className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
          title="Pause"
        >
          <Pause className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setStep((s) => (s >= 2 ? 0 : s + 1))}
          className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          title="Step forward"
        >
          <FastForward className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 relative flex items-center ml-2">
          <input
            type="range"
            min="0"
            max="2"
            value={step}
            onChange={(e) => {
              setIsPlaying(false);
              setStep(Number(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function Index() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden relative"
      style={{ backgroundColor: '#FAF9F6' }}
    >
      {/* Delicate, subtle dot grid pattern across entire page */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Ambient Gradient Glows (rich, soft, seamless) */}
      {/* Hero Top-Left Peach Glow */}
      <div className="absolute -top-12 -left-12 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-orange-300/35 via-amber-200/20 to-transparent blur-3xl pointer-events-none z-0" />
      {/* Hero Top-Right Amber Glow */}
      <div className="absolute -top-10 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-amber-300/40 via-orange-200/25 to-transparent blur-3xl pointer-events-none z-0" />
      {/* Hero Center-Right Indigo Glow */}
      <div className="absolute top-[380px] -right-16 w-[480px] h-[480px] rounded-full bg-gradient-to-tl from-indigo-300/35 via-purple-200/20 to-transparent blur-3xl pointer-events-none z-0" />
      {/* Mid-Page & Hero Left Glows */}
      <div className="absolute top-[420px] left-[15%] w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-amber-200/30 via-orange-100/20 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[900px] -left-20 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-amber-200/25 via-emerald-100/20 to-transparent blur-3xl pointer-events-none z-0" />
      {/* Bottom Ambient Glowing Orbs matching design mockup */}
      <div className="absolute bottom-64 -left-16 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-orange-300/30 via-amber-200/20 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-80 -right-16 w-[520px] h-[520px] rounded-full bg-gradient-to-bl from-amber-400/35 via-orange-300/25 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-20 -right-20 w-[480px] h-[480px] rounded-full bg-gradient-to-tl from-indigo-400/30 via-purple-300/20 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Navigation Bar with Airy Spacing */}
      <HomeNavbar scrolled={scrolled} />

      {/* --- 1. HERO SECTION (Centered with Mathematical Notebook Doodles) --- */}
      <section className="relative pt-36 pb-20 lg:pt-44 lg:pb-28 z-10 overflow-hidden">
        {/* Background Mathematical Notebook Doodles across the Hero */}
        {/* --- Left Side Doodles --- */}
        {/* Orange checkmark top-left */}
        <div className="hidden md:block absolute left-[8%] top-[24%] pointer-events-none select-none">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-500 opacity-80">
            <path d="M4 13 L9 18 L20 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Technical Coordinate Grid Box */}
        <div className="hidden md:block absolute left-[4.5%] top-[38%] pointer-events-none select-none">
          <svg viewBox="0 0 70 70" className="w-16 h-16 text-amber-500/70">
            <rect x="5" y="5" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <line x1="20" y1="5" x2="20" y2="65" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="35" y1="5" x2="35" y2="65" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="50" y1="5" x2="50" y2="65" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="5" y1="20" x2="65" y2="20" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="5" y1="35" x2="65" y2="35" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="5" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
            <path d="M 12 58 L 58 12" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>

        {/* Upward Curving Graph Plot */}
        <div className="hidden md:block absolute left-[7.5%] top-[54%] pointer-events-none select-none">
          <svg viewBox="0 0 60 55" className="w-15 h-14 text-sky-600/70">
            <path d="M 6 4 L 6 48 L 54 48" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M 8 46 Q 24 46, 34 26 T 50 8" stroke="#0284C7" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Matrix / Values Table Sketch */}
        <div className="hidden lg:block absolute left-[4.5%] top-[68%] pointer-events-none select-none">
          <svg viewBox="0 0 70 50" className="w-16 h-12 text-slate-400">
            <line x1="10" y1="5" x2="60" y2="5" stroke="currentColor" strokeWidth="1" />
            <line x1="10" y1="20" x2="60" y2="20" stroke="currentColor" strokeWidth="1" />
            <line x1="35" y1="5" x2="35" y2="45" stroke="currentColor" strokeWidth="1" />
            <text x="18" y="16" fontSize="10" fontFamily="monospace" fill="currentColor">x</text>
            <text x="44" y="16" fontSize="10" fontFamily="monospace" fill="currentColor">y</text>
            <text x="14" y="32" fontSize="9" fontFamily="monospace" fill="currentColor">-1</text>
            <text x="44" y="32" fontSize="9" fontFamily="monospace" fill="currentColor">3</text>
            <text x="14" y="44" fontSize="9" fontFamily="monospace" fill="currentColor">1/4</text>
            <text x="40" y="44" fontSize="9" fontFamily="monospace" fill="currentColor">-2</text>
          </svg>
        </div>

        {/* Secant Projection Graph Sketch */}
        <div className="hidden lg:block absolute left-[15%] top-[66%] pointer-events-none select-none">
          <svg viewBox="0 0 65 60" className="w-16 h-14 text-slate-400">
            <path d="M 8 4 L 8 52 L 58 52" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
            <path d="M 8 44 L 50 12" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <line x1="28" y1="28" x2="28" y2="52" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="28" y1="28" x2="8" y2="28" stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Checkmark near bottom-left */}
        <div className="hidden lg:block absolute left-[24%] top-[72%] pointer-events-none select-none">
          <span className="text-slate-300 font-bold text-sm">✓</span>
        </div>

        {/* --- Right Side Doodles --- */}
        {/* Table of Values Sketch at Top-Right */}
        <div className="hidden md:block absolute right-[13%] top-[12%] pointer-events-none select-none">
          <svg viewBox="0 0 75 55" className="w-18 h-14 text-slate-400">
            <rect x="5" y="5" width="65" height="45" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="5" y1="18" x2="70" y2="18" stroke="currentColor" strokeWidth="1" />
            <line x1="26" y1="5" x2="26" y2="50" stroke="currentColor" strokeWidth="1" />
            <line x1="48" y1="5" x2="48" y2="50" stroke="currentColor" strokeWidth="1" />
            <text x="12" y="15" fontSize="9" fontFamily="monospace" fill="currentColor">x</text>
            <text x="34" y="15" fontSize="9" fontFamily="monospace" fill="currentColor">y</text>
            <text x="52" y="15" fontSize="8" fontFamily="monospace" fill="currentColor">-2x</text>
            <text x="10" y="30" fontSize="9" fontFamily="monospace" fill="currentColor">-1</text>
            <text x="34" y="30" fontSize="9" fontFamily="monospace" fill="currentColor">3</text>
            <text x="54" y="30" fontSize="9" fontFamily="monospace" fill="currentColor">+5</text>
            <text x="8" y="44" fontSize="8" fontFamily="monospace" fill="currentColor">1/4</text>
            <text x="32" y="44" fontSize="9" fontFamily="monospace" fill="currentColor">-2</text>
            <text x="52" y="44" fontSize="8" fontFamily="monospace" fill="currentColor">-4.5</text>
          </svg>
        </div>

        {/* Parabolic Curve Graph */}
        <div className="hidden md:block absolute right-[5.5%] top-[15%] pointer-events-none select-none">
          <svg viewBox="0 0 60 55" className="w-16 h-14 text-slate-500">
            <path d="M 6 6 L 6 46 L 54 46" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M 8 42 Q 28 42, 38 24 T 50 6" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Scribble Wave & Checkmark */}
        <div className="hidden md:block absolute right-[6.5%] top-[30%] pointer-events-none select-none">
          <svg viewBox="0 0 45 40" className="w-12 h-10 text-slate-400">
            <path d="M 4 20 C 14 10, 20 28, 38 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M 22 28 L 28 34 L 38 22" stroke="#818CF8" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Colorful Checkmarks in purple/blue */}
        <div className="hidden lg:flex absolute right-[7.5%] top-[56%] flex-col items-center gap-1 pointer-events-none select-none">
          <span className="text-purple-400 font-bold text-base -rotate-6">✓</span>
          <span className="text-indigo-500 font-bold text-lg rotate-3">✓</span>
        </div>

        {/* Riemann Integral Area Under Curve Sketch */}
        <div className="hidden lg:block absolute right-[11%] top-[62%] pointer-events-none select-none">
          <svg viewBox="0 0 90 70" className="w-24 h-18 text-slate-600">
            <path d="M 6 6 L 6 60 L 82 60" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M 16 60 L 16 45 C 25 35, 45 52, 60 25 L 60 60 Z" fill="#FDE68A" fillOpacity="0.4" stroke="#F59E0B" strokeWidth="1.5" />
            <line x1="22" y1="60" x2="22" y2="40" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="32" y1="60" x2="32" y2="43" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="42" y1="60" x2="42" y2="48" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="52" y1="60" x2="52" y2="35" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* --- Centered Main Hero Content --- */}
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl lg:text-[4.2rem] font-extrabold text-slate-900 tracking-tight leading-[1.14] mb-6">
            Learn Numerical Analysis<br />
            by{' '}
            <span className="relative inline-block text-blue-600 font-extrabold px-3 py-1">
              seeing it in action.
              {/* Hand-Drawn Sketch Loop from Mockup */}
              <svg
                className="absolute -inset-x-6 sm:-inset-x-9 -inset-y-3.5 sm:-inset-y-5 w-[calc(100%+48px)] sm:w-[calc(100%+72px)] h-[calc(100%+28px)] sm:h-[calc(100%+40px)] pointer-events-none -rotate-1 overflow-visible"
                viewBox="0 0 360 90"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M 35,20 C 80,6 180,6 280,10 C 335,14 355,30 350,48 C 345,68 260,84 180,85 C 90,86 10,72 8,48 C 6,26 40,12 100,8 C 160,5 260,8 330,22"
                  stroke="#F59E0B"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-9 font-normal">
            Explore numerical methods, run algorithms step by step,<br className="hidden sm:inline" /> and visualize their results in real time.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/tools')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <User className="w-4 h-4" />
              <span>Try Numerical Lab</span>
            </button>

            <button
              onClick={() => navigate('/modules')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/90 text-slate-800 font-semibold text-sm sm:text-base shadow-xs hover:shadow transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 text-slate-700" />
              <span>Start Learning</span>
            </button>
          </div>
        </div>
      </section>

      {/* --- 2. EXPLORE NUMERICAL METHODS SECTION --- */}
      <section className="relative py-20 lg:py-28 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Explore Numerical Methods
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Discover how numerical algorithms work through interactive visualizations and step-by-step explanations.
            </p>
          </div>

          {/* Row 1: The 4 Core Featured Method Cards (Exact Match to Mockup) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1: Linear Systems (Lavender / Purple) */}
            <div
              onClick={() => navigate('/tools?tool=jacobi')}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1"
            >
              <div className="bg-[#EBE9FE] p-4 h-28 relative flex items-center justify-between overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-[#DDD6FE] flex items-center justify-center text-indigo-700 shadow-sm">
                  <Grid3X3 className="w-5 h-5" />
                </div>

                <svg viewBox="0 0 100 60" className="w-24 h-14 select-none">
                  <path d="M15,6 L6,6 L6,54 L15,54" stroke="#818CF8" strokeWidth="2" fill="none" />
                  <text x="18" y="22" fill="#6366F1" fontSize="10" fontWeight="bold">1</text>
                  <text x="32" y="22" fill="#94A3B8" fontSize="10">0</text>
                  <text x="46" y="22" fill="#94A3B8" fontSize="10">0</text>
                  <text x="18" y="36" fill="#94A3B8" fontSize="10">0</text>
                  <text x="32" y="36" fill="#6366F1" fontSize="10" fontWeight="bold">1</text>
                  <text x="46" y="36" fill="#94A3B8" fontSize="10">0</text>
                  <text x="18" y="50" fill="#94A3B8" fontSize="10">0</text>
                  <text x="32" y="50" fill="#94A3B8" fontSize="10">0</text>
                  <text x="46" y="50" fill="#6366F1" fontSize="10" fontWeight="bold">1</text>
                  <line x1="58" y1="8" x2="58" y2="52" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="66" y="22" fill="#818CF8" fontSize="9">b₁</text>
                  <text x="66" y="36" fill="#818CF8" fontSize="9">b₂</text>
                  <text x="66" y="50" fill="#818CF8" fontSize="9">b₃</text>
                  <path d="M80,6 L89,6 L89,54 L80,54" stroke="#818CF8" strokeWidth="2" fill="none" />
                </svg>

                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#818CF8] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-2.5 group-hover:text-indigo-600 transition-colors">
                    Linear Systems
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      Gaussian Elimination
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      Jacobi
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      Gauss-Seidel
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 2: Nonlinear Equations (Emerald / Mint) */}
            <div
              onClick={() => navigate('/tools?tool=newton')}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1"
            >
              <div className="bg-[#D1FAE5] p-4 h-28 relative flex items-center justify-between overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-[#A7F3D0] flex items-center justify-center text-emerald-700 shadow-sm">
                  <Activity className="w-5 h-5" />
                </div>

                <svg viewBox="0 0 100 60" className="w-24 h-14 select-none">
                  <line x1="8" y1="50" x2="92" y2="50" stroke="#94A3B8" strokeWidth="1.2" />
                  <line x1="15" y1="55" x2="15" y2="8" stroke="#94A3B8" strokeWidth="1.2" />
                  <path d="M15,48 Q40,46 60,30 T85,12" stroke="#10B981" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                  <polygon points="85,10 88,16 81,14" fill="#10B981" />
                </svg>

                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#34D399] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-2.5 group-hover:text-emerald-600 transition-colors">
                    Nonlinear Equations
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      Newton-Raphson
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      Bisection
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      Secant
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 3: Integration (Warm Amber / Gold) */}
            <div
              onClick={() => navigate('/tools?tool=trapezoidal')}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1"
            >
              <div className="bg-[#FEF3C7] p-4 h-28 relative flex items-center justify-between overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-[#FDE68A] flex items-center justify-center text-amber-800 shadow-sm">
                  <Sigma className="w-5 h-5" />
                </div>

                <svg viewBox="0 0 100 60" className="w-24 h-14 select-none">
                  <defs>
                    <pattern id="cardHatch" width="5" height="5" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="5" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
                    </pattern>
                  </defs>
                  <line x1="8" y1="50" x2="92" y2="50" stroke="#94A3B8" strokeWidth="1.2" />
                  <path d="M20,50 L20,38 Q50,15 80,35 L80,50 Z" fill="url(#cardHatch)" />
                  <path d="M15,42 Q50,15 85,38" stroke="#D97706" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                  <line x1="20" y1="38" x2="20" y2="50" stroke="#D97706" strokeWidth="1.2" strokeDasharray="2 2" />
                  <line x1="80" y1="35" x2="80" y2="50" stroke="#D97706" strokeWidth="1.2" strokeDasharray="2 2" />
                </svg>

                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#FBBF24] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-2.5 group-hover:text-amber-600 transition-colors">
                    Integration
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      Trapezoidal
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      Simpson's 1/3 & 3/8
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      Romberg
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 4: Differential Eqs. (Coral / Salmon / Red) */}
            <div
              onClick={() => navigate('/tools?tool=euler')}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1"
            >
              <div className="bg-[#FFE4E6] p-4 h-28 relative flex items-center justify-between overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-[#FECDD3] flex items-center justify-center text-rose-700 shadow-sm">
                  <Waves className="w-5 h-5" />
                </div>

                <svg viewBox="0 0 100 60" className="w-24 h-14 select-none">
                  <line x1="10" y1="30" x2="90" y2="30" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
                  <line x1="50" y1="5" x2="50" y2="55" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
                  <path d="M25,25 Q40,15 50,30 T75,35" stroke="#F43F5E" strokeWidth="1.8" fill="none" opacity="0.7" />
                  <path d="M30,40 Q45,45 55,30 T70,20" stroke="#F43F5E" strokeWidth="2.2" fill="none" />
                  <path d="M35,15 Q55,20 50,45 T65,48" stroke="#FB7185" strokeWidth="1.5" fill="none" opacity="0.8" />
                </svg>

                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#FB7185] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-2.5 group-hover:text-rose-600 transition-colors">
                    Differential Eqs.
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      Euler Method
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      Heun (Improved)
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      Runge-Kutta (RK4)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Secondary categories when user chooses to expand, styled identically */}
          {showAllCategories && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Card 5: Interpolation (Sky Blue) */}
              <div
                onClick={() => navigate('/tools?tool=lagrange')}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1"
              >
                <div className="bg-[#E0F2FE] p-4 h-28 relative flex items-center justify-between overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#BAE6FD] flex items-center justify-center text-sky-700 shadow-sm">
                    <Spline className="w-5 h-5" />
                  </div>
                  <svg viewBox="0 0 100 60" className="w-24 h-14 select-none">
                    <line x1="8" y1="50" x2="92" y2="50" stroke="#94A3B8" strokeWidth="1" />
                    <path d="M15,45 Q35,15 55,35 T85,15" stroke="#0284C7" strokeWidth="2.2" fill="none" />
                    <circle cx="15" cy="45" r="3" fill="#0284C7" />
                    <circle cx="38" cy="20" r="3" fill="#0284C7" />
                    <circle cx="62" cy="38" r="3" fill="#0284C7" />
                    <circle cx="85" cy="15" r="3" fill="#0284C7" />
                  </svg>
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#38BDF8] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-slate-900 text-base mb-2.5 group-hover:text-sky-600 transition-colors">
                    Interpolation
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-400" />Lagrange Polynomials</li>
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-400" />Newton Divided Diff.</li>
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-400" />Cubic Splines</li>
                  </ul>
                </div>
              </div>

              {/* Card 6: Eigenvalues (Purple / Violet) */}
              <div
                onClick={() => navigate('/tools?tool=power')}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1"
              >
                <div className="bg-[#F3E8FF] p-4 h-28 relative flex items-center justify-between overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#E9D5FF] flex items-center justify-center text-purple-700 shadow-sm">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <svg viewBox="0 0 100 60" className="w-24 h-14 select-none">
                    <line x1="20" y1="45" x2="75" y2="15" stroke="#9333EA" strokeWidth="2.5" markerEnd="url(#arrow)" />
                    <line x1="20" y1="45" x2="50" y2="45" stroke="#C084FC" strokeWidth="1.5" strokeDasharray="2 2" />
                    <line x1="50" y1="45" x2="75" y2="15" stroke="#C084FC" strokeWidth="1.5" strokeDasharray="2 2" />
                    <text x="50" y="25" fill="#9333EA" fontSize="10" fontWeight="bold">λv</text>
                  </svg>
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#C084FC] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-slate-900 text-base mb-2.5 group-hover:text-purple-600 transition-colors">
                    Eigenvalues
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-400" />Power Method</li>
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-400" />Inverse Power Method</li>
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-400" />Rayleigh Quotient</li>
                  </ul>
                </div>
              </div>

              {/* Card 7: Differentiation (Teal) */}
              <div
                onClick={() => navigate('/tools?tool=diff')}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1"
              >
                <div className="bg-[#CCFBF1] p-4 h-28 relative flex items-center justify-between overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#99F6E4] flex items-center justify-center text-teal-700 shadow-sm">
                    <Diff className="w-5 h-5" />
                  </div>
                  <svg viewBox="0 0 100 60" className="w-24 h-14 select-none">
                    <path d="M15,48 Q45,45 65,25 T85,10" stroke="#0D9488" strokeWidth="2.2" fill="none" />
                    <line x1="30" y1="50" x2="80" y2="12" stroke="#F59E0B" strokeWidth="1.6" strokeDasharray="3 2" />
                    <text x="40" y="20" fill="#0D9488" fontSize="9" fontWeight="bold">f'(x)</text>
                  </svg>
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#2DD4BF] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-slate-900 text-base mb-2.5 group-hover:text-teal-600 transition-colors">
                    Differentiation
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-400" />Finite Differences</li>
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-400" />Richardson Extrapolation</li>
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-400" />Higher Derivatives</li>
                  </ul>
                </div>
              </div>

              {/* Card 8: Interactive Grapher (Rose) */}
              <div
                onClick={() => navigate('/tools?tool=desmos')}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-pink-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1"
              >
                <div className="bg-[#FCE7F3] p-4 h-28 relative flex items-center justify-between overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-[#FBCFE8] flex items-center justify-center text-pink-700 shadow-sm">
                    <Compass className="w-5 h-5" />
                  </div>
                  <svg viewBox="0 0 100 60" className="w-24 h-14 select-none">
                    <circle cx="50" cy="30" r="22" stroke="#EC4899" strokeWidth="1.5" fill="none" opacity="0.6" />
                    <line x1="20" y1="30" x2="80" y2="30" stroke="#94A3B8" strokeWidth="1" />
                    <line x1="50" y1="5" x2="50" y2="55" stroke="#94A3B8" strokeWidth="1" />
                    <path d="M30,30 Q50,5 70,30" stroke="#DB2777" strokeWidth="2" fill="none" />
                  </svg>
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#F472B6] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-slate-900 text-base mb-2.5 group-hover:text-pink-600 transition-colors">
                    Interactive Grapher
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-400" />Desmos Graphing Engine</li>
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-400" />Real-time Function Plotting</li>
                    <li className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-400" />Interactive Geometry</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Clean Action: Toggle & Explore */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {showAllCategories ? 'Show Core Methods' : 'View All 8 Categories'}
            </button>

            <button
              onClick={() => navigate('/tools')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Explore All Methods in Lab
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* --- 3. ACCOUNT BANNER CTA --- */}
      <section className="relative pt-16 pb-24 lg:pt-20 lg:pb-32 z-10">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="relative">
            {/* The Deep Midnight Navy Card */}
            <div className="relative bg-[#0B132B] rounded-[36px] overflow-hidden px-6 py-14 sm:px-16 sm:py-16 text-center border border-slate-800/80 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.6)]">
              {/* Subtle Coordinate Grid Background */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Faint ordinate mark '5' */}
              <span className="absolute top-7 right-[36%] text-xs font-mono text-slate-400/40 select-none pointer-events-none">
                5
              </span>

              {/* Flowing harmonic sine curves on left/center */}
              <svg
                className="absolute inset-y-0 left-0 w-3/4 h-full pointer-events-none opacity-35"
                viewBox="0 0 600 300"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M -40 180 C 100 120, 200 240, 350 160 C 450 110, 520 200, 650 140"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeOpacity="0.55"
                />
                <path
                  d="M -40 195 C 90 140, 210 250, 360 175 C 460 125, 530 215, 650 155"
                  stroke="#F59E0B"
                  strokeWidth="1"
                  strokeOpacity="0.35"
                />
                <path
                  d="M -40 160 C 120 220, 240 100, 380 200 C 480 270, 560 130, 650 210"
                  stroke="#818CF8"
                  strokeWidth="1.2"
                  strokeOpacity="0.45"
                />
                <path
                  d="M -40 140 C 140 200, 260 80, 400 180 C 500 250, 580 110, 650 190"
                  stroke="#60A5FA"
                  strokeWidth="0.8"
                  strokeOpacity="0.3"
                />
              </svg>

              {/* Matrix sketch on the right */}
              <svg
                className="hidden sm:block absolute right-14 lg:right-20 top-1/2 -translate-y-1/2 w-28 h-28 pointer-events-none opacity-40"
                viewBox="0 0 100 100"
                fill="none"
              >
                {/* Left bracket */}
                <path d="M 22 15 L 14 15 L 14 85 L 22 85" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                {/* Right bracket */}
                <path d="M 78 15 L 86 15 L 86 85 L 78 85" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                {/* Matrix entries */}
                <text x="28" y="36" fill="#94A3B8" fontSize="12" fontFamily="monospace">1</text>
                <text x="48" y="36" fill="#94A3B8" fontSize="12" fontFamily="monospace">0</text>
                <text x="68" y="36" fill="#94A3B8" fontSize="12" fontFamily="monospace">0</text>
                <text x="28" y="56" fill="#94A3B8" fontSize="12" fontFamily="monospace">0</text>
                <text x="48" y="56" fill="#94A3B8" fontSize="12" fontFamily="monospace">1</text>
                <text x="68" y="56" fill="#94A3B8" fontSize="12" fontFamily="monospace">0</text>
                <text x="28" y="76" fill="#94A3B8" fontSize="12" fontFamily="monospace">0</text>
                <text x="48" y="76" fill="#94A3B8" fontSize="12" fontFamily="monospace">0</text>
                <text x="68" y="76" fill="#94A3B8" fontSize="12" fontFamily="monospace">1</text>
              </svg>

              {/* Coordinate Chart sketch on the far right */}
              <svg
                className="hidden sm:block absolute right-4 lg:right-8 bottom-8 w-16 h-14 pointer-events-none opacity-40"
                viewBox="0 0 60 50"
                fill="none"
              >
                <path d="M 6 6 L 6 44 L 54 44" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M 6 36 Q 20 40, 28 20 T 50 12" stroke="#F59E0B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <circle cx="28" cy="20" r="1.8" fill="#F59E0B" />
                <circle cx="50" cy="12" r="1.8" fill="#F59E0B" />
              </svg>

              {/* Central Content */}
              <div className="relative z-10 max-w-xl mx-auto">
                <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-white mb-3.5 tracking-tight leading-tight">
                  Want to continue{' '}
                  <span className="relative inline-block text-amber-200">
                    learning?
                    <svg
                      className="absolute -bottom-2.5 left-0 w-full h-4 overflow-visible pointer-events-none"
                      viewBox="0 0 160 20"
                      fill="none"
                    >
                      <path
                        d="M 4 12 C 40 4, 110 5, 156 11 C 120 18, 50 17, 18 13"
                        stroke="#F59E0B"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h2>
                <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed font-normal max-w-lg mx-auto">
                  Create an account to save your progress, track your practice sessions, and access personalized interactive exercises.
                </p>

                {/* Radiant Glowing Button */}
                <div className="relative inline-block group">
                  <div className="absolute -inset-2.5 rounded-2xl bg-gradient-to-r from-amber-500/70 via-orange-500/60 to-blue-500/70 blur-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  <button
                    onClick={() => navigate('/auth')}
                    className="relative z-10 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm sm:text-base shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Three 3D Sticker Badges Overlapping the Bottom Border */}
            <div className="absolute -bottom-7 left-0 right-0 flex items-center justify-center gap-10 sm:gap-20 z-20 pointer-events-none">
              {/* Left Badge: Star ⭐ in Cream Rounded Square */}
              <div
                className="w-13 h-13 sm:w-15 sm:h-15 p-2.5 rounded-2xl bg-[#FFFBEB] border-2 border-white shadow-[0_12px_28px_rgba(0,0,0,0.18)] -rotate-6 hover:-rotate-3 transition-transform duration-200 pointer-events-auto cursor-pointer flex items-center justify-center"
                title="Earn Stars"
              >
                <svg viewBox="0 0 36 36" className="w-8 h-8 sm:w-9 sm:h-9" fill="none">
                  <path
                    d="M18 4L21.5 12.5L30.5 13.5L23.8 19.5L25.8 28.5L18 24L10.2 28.5L12.2 19.5L5.5 13.5L14.5 12.5L18 4Z"
                    fill="#FDE68A"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="8" r="1" fill="#F59E0B" />
                  <circle cx="29" cy="8" r="1.2" fill="#F59E0B" />
                </svg>
              </div>

              {/* Center Badge: Speedometer / Gauge ⏱️ in Circular Scallop */}
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 p-2 rounded-full bg-[#EFF6FF] border-2 border-indigo-200 shadow-[0_12px_28px_rgba(0,0,0,0.18)] rotate-3 hover:rotate-6 transition-transform duration-200 pointer-events-auto cursor-pointer flex items-center justify-center"
                title="Fast Convergence"
              >
                <svg viewBox="0 0 40 40" className="w-9 h-9 sm:w-10 sm:h-10" fill="none">
                  <path d="M10 26 A 13 13 0 1 1 30 26" stroke="#CBD5E1" strokeWidth="2.8" strokeLinecap="round" />
                  <path d="M10 26 A 13 13 0 0 1 23 11" stroke="#3B82F6" strokeWidth="2.8" strokeLinecap="round" />
                  <circle cx="12" cy="20" r="1" fill="#94A3B8" />
                  <circle cx="20" cy="12" r="1" fill="#94A3B8" />
                  <circle cx="28" cy="20" r="1" fill="#94A3B8" />
                  <line x1="20" y1="24" x2="26" y2="15" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="20" cy="24" r="2.5" fill="#1E293B" />
                </svg>
              </div>

              {/* Right Badge: Ascending Chart 📈 in White Rounded Square */}
              <div
                className="w-13 h-13 sm:w-15 sm:h-15 p-2.5 rounded-2xl bg-white border-2 border-white shadow-[0_12px_28px_rgba(0,0,0,0.18)] rotate-6 hover:rotate-3 transition-transform duration-200 pointer-events-auto cursor-pointer flex items-center justify-center"
                title="Progress Analytics"
              >
                <svg viewBox="0 0 36 36" className="w-8 h-8 sm:w-9 sm:h-9" fill="none">
                  <line x1="8" y1="12" x2="28" y2="12" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="8" y1="18" x2="28" y2="18" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="8" y1="24" x2="28" y2="24" stroke="#F1F5F9" strokeWidth="1" />
                  <path d="M8 8V28H28" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                  <path
                    d="M10 24 C14 22, 17 26, 21 16 C23 12, 25 14, 27 10"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="21" cy="16" r="1.5" fill="#10B981" />
                  <circle cx="27" cy="10" r="2" fill="#3B82F6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

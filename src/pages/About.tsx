import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, BookOpen, Target, ArrowRight
} from 'lucide-react';
import HomeNavbar from '@/components/HomeNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function About() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

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
      {/* Delicate Dot Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Ambient Gradient Glows matching design mockup */}
      <div className="absolute -top-12 -left-12 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-orange-300/35 via-amber-200/20 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute -top-10 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-amber-400/35 via-orange-300/25 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-40 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-indigo-400/35 via-purple-300/20 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Decorative Technical Grid Frames on Outer Margins */}
      <div className="hidden xl:block absolute left-4 top-36 w-24 h-48 rounded-2xl border-2 border-amber-300/50 bg-amber-50/15 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 96 192" className="w-full h-full opacity-40">
          <defs>
            <pattern id="aboutGridLeft" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="96" height="192" fill="url(#aboutGridLeft)" />
        </svg>
      </div>

      <div className="hidden xl:block absolute right-4 top-36 w-24 h-48 rounded-2xl border-2 border-amber-300/50 bg-amber-50/15 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 96 192" className="w-full h-full opacity-40">
          <defs>
            <pattern id="aboutGridRight" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="96" height="192" fill="url(#aboutGridRight)" />
        </svg>
      </div>

      {/* Hand-Drawn Margin Notebook Doodles */}
      {/* Left Margin Doodles */}
      <div className="hidden lg:block absolute left-4 xl:left-8 top-[360px] pointer-events-none select-none z-0 text-slate-400 space-y-24">
        <svg viewBox="0 0 50 70" className="w-9 h-14 text-slate-500">
          <path d="M38 4 C 18 15, 12 40, 16 60" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M10 52 L 16 62 L 24 54" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <svg viewBox="0 0 30 90" className="w-6 h-20 text-slate-500">
          <path d="M15 4 C 4 10, 4 20, 20 25 C 4 30, 4 40, 20 45 C 4 50, 4 60, 20 65 C 4 70, 4 80, 20 85" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Right Margin Doodles */}
      <div className="hidden lg:block absolute right-4 xl:right-8 top-[360px] pointer-events-none select-none z-0 text-slate-400 space-y-24">
        <svg viewBox="0 0 50 60" className="w-9 h-12 text-slate-500">
          <path d="M10 8 C 30 12, 40 28, 32 50" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M24 44 L 32 52 L 38 42" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <svg viewBox="0 0 60 60" className="w-12 h-12 text-slate-500">
          <circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="14" y1="18" x2="44" y2="40" stroke="currentColor" strokeWidth="1.2" />
          <line x1="18" y1="12" x2="48" y2="34" stroke="currentColor" strokeWidth="1.2" />
          <line x1="12" y1="26" x2="40" y2="46" stroke="currentColor" strokeWidth="1.2" />
          <line x1="22" y1="46" x2="46" y2="16" stroke="currentColor" strokeWidth="1.2" />
          <line x1="14" y1="38" x2="38" y2="12" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>

      <HomeNavbar scrolled={scrolled} />

      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-24 relative z-10 space-y-10">
        {/* --- Header Section --- */}
        <div className="space-y-3">
          <div className="relative inline-block">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Making Numerical Analysis easier<br />
              to see, understand, and explore.
            </h1>
            {/* Hand-drawn amber brush wavy underline matching Guide */}
            <svg
              className="w-64 sm:w-80 h-3.5 text-amber-500 overflow-visible mt-1"
              viewBox="0 0 260 12"
              fill="none"
            >
              <path
                d="M 3 6 C 60 2, 140 10, 210 4 C 230 2.5, 245 5, 256 7"
                stroke="#F59E0B"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-slate-600 text-sm sm:text-base font-normal max-w-2xl leading-relaxed">
            NumiViz is an interactive learning platform created by Sirine Dahmane, a Software Engineering student, to make Numerical Analysis more intuitive through visualization and hands-on experimentation.
          </p>
        </div>

        {/* --- Middle Row: Two Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Why NumiViz? (Span 5) */}
          <div className="md:col-span-5 bg-white/95 rounded-[28px] border border-slate-200/90 p-7 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 relative overflow-hidden">
            <div className="space-y-2 max-w-xs">
              <h2 className="font-bold text-slate-900 text-lg">Why NumiViz?</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Instead of learning numerical methods only through static formulas, NumiViz lets you see algorithms in action, explore, and understand how they reach their results in real time.
              </p>
            </div>

            {/* Hand-Drawn Coordinate & Checkmark Sketch */}
            <div className="hidden sm:flex flex-col items-center shrink-0 pointer-events-none select-none">
              <svg viewBox="0 0 90 65" className="w-22 h-16 text-slate-500">
                <path d="M 8 6 L 8 56 L 82 56" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <text x="3" y="10" fontSize="9" fontFamily="monospace" fill="currentColor">y</text>
                <text x="80" y="64" fontSize="9" fontFamily="monospace" fill="currentColor">x</text>
                <path d="M 8 46 Q 30 12, 50 28 T 80 18" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <circle cx="50" cy="28" r="2" fill="#F59E0B" />
              </svg>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-emerald-500 font-bold text-sm">✓</span>
                <span className="text-emerald-500 font-bold text-sm">✓</span>
                <svg viewBox="0 0 40 12" className="w-8 h-2.5 text-slate-400">
                  <path d="M 2 8 C 8 2, 14 12, 20 6 C 26 2, 32 10, 38 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Created by Sirine Dahmane (Span 7) */}
          <div className="md:col-span-7 bg-white/95 rounded-[28px] border border-slate-200/90 p-7 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            {/* Top title & Gear doodles */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-base">Created by</h2>

              {/* Hand-drawn gear sketches */}
              <div className="flex items-center gap-1 text-slate-400 opacity-60">
                <svg viewBox="0 0 32 32" className="w-6 h-6 animate-spin-slow">
                  <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M16 4v4m0 16v4m-12-12h4m16 0h4m-17-8.5l2.8 2.8m11.4 11.4l2.8 2.8m-17 0l2.8-2.8m11.4-11.4l2.8-2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M12 3v3m0 12v3m-9-9h3m12 0h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Content: Avatar + Bio */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Illustrated Student Avatar */}
              <div className="relative shrink-0">
                {/* Twinkle sparkle stars around avatar */}
                <span className="absolute -top-1.5 -left-1.5 text-amber-400 text-xs font-bold select-none">✧</span>
                <span className="absolute -bottom-1 -right-1 text-purple-400 text-xs font-bold select-none">✦</span>

                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 via-orange-100 to-purple-100 border-2 border-white shadow-md overflow-hidden flex items-center justify-center">
                  {/* Detailed SVG Student Portrait */}
                  <svg viewBox="0 0 80 80" className="w-full h-full">
                    {/* Background Circle */}
                    <circle cx="40" cy="40" r="40" fill="#FEF3C7" />
                    {/* Hair Back */}
                    <path d="M 22 45 C 20 20, 60 20, 58 45 C 62 60, 60 70, 58 80 L 22 80 C 20 70, 18 60, 22 45 Z" fill="#78350F" />
                    {/* Body / Shirt */}
                    <path d="M 18 80 C 22 65, 34 58, 40 58 C 46 58, 58 65, 62 80 Z" fill="#818CF8" />
                    {/* Neck */}
                    <rect x="36" y="48" width="8" height="10" rx="4" fill="#FED7AA" />
                    {/* Face */}
                    <circle cx="40" cy="40" r="14" fill="#FDE68A" />
                    {/* Hair Front / Bangs */}
                    <path d="M 26 36 C 26 25, 54 25, 54 36 C 50 32, 46 34, 40 32 C 34 34, 30 32, 26 36 Z" fill="#78350F" />
                    {/* Eyes */}
                    <circle cx="35" cy="40" r="1.5" fill="#1E293B" />
                    <circle cx="45" cy="40" r="1.5" fill="#1E293B" />
                    {/* Smile */}
                    <path d="M 37 45 Q 40 48, 43 45" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
              </div>

              {/* Text Info */}
              <div className="space-y-1.5 text-center sm:text-left">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Sirine Dahmane
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  Software Engineering Student
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md pt-0.5">
                  Designed and developed as an educational project focused on making numerical analysis more interactive and accessible.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Bottom Row: What NumiViz offers + Glowing Explore Banner --- */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">What NumiViz offers</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Card 1: Interactive Lab */}
            <div
              onClick={() => navigate('/tools')}
              className="bg-white/95 rounded-[28px] border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all cursor-pointer space-y-3 group relative overflow-hidden"
            >
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-200/60 via-blue-100/40 to-indigo-100/30 blur-sm" />
                <svg viewBox="0 0 60 60" className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                  <path d="M 2 40 C 15 20, 30 50, 58 25" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
                  <path d="M 2 30 C 20 45, 40 15, 58 35" stroke="#818CF8" strokeWidth="1.2" fill="none" />
                </svg>
                <div className="relative w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs border border-sky-200/70 group-hover:scale-105 transition-transform">
                  <FlaskConical className="w-6 h-6" />
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-base group-hover:text-sky-600 transition-colors">
                Interactive Lab
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Experiment with numerical methods and visualize execution step by step.
              </p>
            </div>

            {/* Card 2: Learning */}
            <div
              onClick={() => navigate('/modules')}
              className="bg-white/95 rounded-[28px] border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer space-y-3 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs border border-purple-200/70 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>

                <svg viewBox="0 0 50 35" className="w-10 h-7 text-slate-400 opacity-60">
                  <path d="M 5 28 L 22 24 L 22 6 L 5 10 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M 45 28 L 28 24 L 28 6 L 45 10 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="2" y1="2" x2="8" y2="12" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-600 transition-colors">
                Learning
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Follow structured courses, rich video animations, and interactive quizzes.
              </p>
            </div>

            {/* Card 3: Practice */}
            <div
              onClick={() => navigate('/practice')}
              className="bg-white/95 rounded-[28px] border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer space-y-3 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs border border-emerald-200/70 group-hover:scale-105 transition-transform">
                  <Target className="w-6 h-6" />
                </div>

                <svg viewBox="0 0 45 35" className="w-9 h-7 text-emerald-600 opacity-70">
                  <path d="M 4 4 L 4 30 L 40 30" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  <path d="M 6 24 C 15 20, 22 10, 38 6" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                </svg>
              </div>

              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                Practice
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strengthen your understanding through auto-checked problem trainers and progressive hints.
              </p>
            </div>

            {/* Card 4: Glowing Explore NumiViz Dark Card Banner */}
            <div className="relative bg-[#0B132B] rounded-[28px] border border-slate-800 p-6 shadow-xl flex flex-col justify-center items-center text-center overflow-hidden group">
              {/* Subtle Coordinate Grid in background */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Faint coordinate curves & constellation points */}
              <svg viewBox="0 0 160 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <path d="M 10 80 Q 40 30, 80 50 T 150 20" stroke="#818CF8" strokeWidth="1.2" fill="none" />
                <circle cx="80" cy="50" r="1.5" fill="#818CF8" />
                <circle cx="150" cy="20" r="1.5" fill="#F59E0B" />
              </svg>

              {/* Chalk Math Formula in bottom-right */}
              <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-400/50 select-none pointer-events-none">
                f(x) = formules
              </span>

              {/* Glowing CTA Button */}
              <div className="relative z-10 my-auto">
                <div className="relative inline-block">
                  <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500/60 via-orange-500/50 to-blue-500/60 blur-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  <button
                    onClick={() => navigate('/tools')}
                    className="relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <span>Explore NumiViz</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

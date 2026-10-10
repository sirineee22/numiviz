import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, BookOpen, Target, GraduationCap, ArrowRight,
  User, Layers, Award, UserCheck, BookPlus, Edit3, Activity, BarChart3
} from 'lucide-react';
import HomeNavbar from '@/components/HomeNavbar';
import PublicFooter from '@/components/PublicFooter';

export default function GuidePage() {
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
            <pattern id="guideGridLeft" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="96" height="192" fill="url(#guideGridLeft)" />
        </svg>
      </div>

      <div className="hidden xl:block absolute right-4 top-36 w-24 h-48 rounded-2xl border-2 border-amber-300/50 bg-amber-50/15 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 96 192" className="w-full h-full opacity-40">
          <defs>
            <pattern id="guideGridRight" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="96" height="192" fill="url(#guideGridRight)" />
        </svg>
      </div>

      {/* Hand-Drawn Margin Notebook Doodles */}
      {/* Left Margin Doodles */}
      <div className="hidden lg:block absolute left-4 xl:left-8 top-[380px] pointer-events-none select-none z-0 text-slate-400 space-y-24">
        {/* Curving downward arrow with chevron */}
        <svg viewBox="0 0 50 70" className="w-9 h-14 text-slate-500">
          <path d="M38 4 C 18 15, 12 40, 16 60" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M10 52 L 16 62 L 24 54" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Spring coil doodle */}
        <svg viewBox="0 0 30 90" className="w-6 h-20 text-slate-500">
          <path d="M15 4 C 4 10, 4 20, 20 25 C 4 30, 4 40, 20 45 C 4 50, 4 60, 20 65 C 4 70, 4 80, 20 85" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        {/* Mini curly arrow */}
        <svg viewBox="0 0 40 40" className="w-7 h-7 text-slate-400">
          <path d="M8 8 C 24 8, 28 24, 18 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 28 L 18 34 L 22 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Right Margin Doodles */}
      <div className="hidden lg:block absolute right-4 xl:right-8 top-[360px] pointer-events-none select-none z-0 text-slate-400 space-y-24">
        {/* Curved arrow */}
        <svg viewBox="0 0 50 60" className="w-9 h-12 text-slate-500">
          <path d="M10 8 C 30 12, 40 28, 32 50" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M24 44 L 32 52 L 38 42" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Cross-hatched shaded round scribble sketch */}
        <svg viewBox="0 0 60 60" className="w-12 h-12 text-slate-500">
          <circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="14" y1="18" x2="44" y2="40" stroke="currentColor" strokeWidth="1.2" />
          <line x1="18" y1="12" x2="48" y2="34" stroke="currentColor" strokeWidth="1.2" />
          <line x1="12" y1="26" x2="40" y2="46" stroke="currentColor" strokeWidth="1.2" />
          <line x1="22" y1="46" x2="46" y2="16" stroke="currentColor" strokeWidth="1.2" />
          <line x1="14" y1="38" x2="38" y2="12" stroke="currentColor" strokeWidth="1.2" />
        </svg>

        {/* Wavy arrow pointing down */}
        <svg viewBox="0 0 40 60" className="w-8 h-12 text-slate-500">
          <path d="M28 6 C 18 16, 26 28, 14 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8 40 L 14 50 L 22 44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <HomeNavbar scrolled={scrolled} />

      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-24 relative z-10 space-y-10">
        {/* --- Header Section --- */}
        <div>
          <div className="relative inline-block mb-1.5">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 tracking-tight leading-tight">
              How NumiViz Works
            </h1>
            {/* Hand-drawn amber brush wavy underline */}
            <svg
              className="w-52 sm:w-64 h-3.5 text-amber-500 overflow-visible mt-0.5"
              viewBox="0 0 220 12"
              fill="none"
            >
              <path
                d="M 3 6 C 50 2, 120 10, 180 4 C 195 2.5, 210 5, 218 7"
                stroke="#F59E0B"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-slate-600 text-sm sm:text-base font-normal max-w-2xl">
            Everything you need to know to get the most out of our interactive numerical platform.
          </p>
        </div>

        {/* --- Row 1: Two Top Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Create your account (Span 5) */}
          <div className="md:col-span-5 bg-white/95 rounded-[28px] border border-slate-200/90 p-7 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex items-start gap-4.5">
            {/* Sparkle star doodle top right */}
            <svg viewBox="0 0 24 24" className="absolute top-5 right-5 w-5 h-5 text-amber-500 pointer-events-none opacity-80">
              <path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" fill="currentColor" />
            </svg>

            {/* Blue Avatar Circle */}
            <div className="w-13 h-13 rounded-2xl bg-blue-100/90 text-blue-600 flex items-center justify-center shrink-0 shadow-xs border border-blue-200/60">
              <User className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 pt-0.5">
              <h2 className="font-bold text-slate-900 text-lg">Create your account</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sign up to unlock the full learning experience, save your exercise progress, and resume practice anytime.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 pt-1 group"
              >
                <span>Sign up free</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Why NumiViz? (Span 7) */}
          <div className="md:col-span-7 bg-white/95 rounded-[28px] border border-slate-200/90 p-7 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 max-w-md">
              <h2 className="font-bold text-slate-900 text-lg">Why NumiViz?</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Instead of learning numerical methods only through static formulas, NumiViz lets you see algorithms in action, explore, and understand how they reach their results in real time.
              </p>
            </div>

            {/* Hand-Drawn Coordinate & Checkmark Sketch */}
            <div className="hidden sm:flex flex-col items-center shrink-0 pointer-events-none select-none">
              {/* Mini coordinate plot with axes and curve */}
              <svg viewBox="0 0 90 65" className="w-24 h-16 text-slate-500">
                {/* Axes */}
                <path d="M 8 6 L 8 56 L 82 56" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <text x="3" y="10" fontSize="9" fontFamily="monospace" fill="currentColor">y</text>
                <text x="80" y="64" fontSize="9" fontFamily="monospace" fill="currentColor">x</text>
                {/* Curve */}
                <path d="M 8 46 Q 30 12, 50 28 T 80 18" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <circle cx="50" cy="28" r="2" fill="#F59E0B" />
              </svg>

              {/* Checkmarks & wave */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-emerald-500 font-bold text-sm">✓</span>
                <span className="text-emerald-500 font-bold text-sm">✓</span>
                {/* Scribble wave */}
                <svg viewBox="0 0 40 12" className="w-8 h-2.5 text-slate-400">
                  <path d="M 2 8 C 8 2, 14 12, 20 6 C 26 2, 32 10, 38 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* --- Row 2: For Students 5-Step Stepper Journey --- */}
        <div className="bg-white/95 rounded-[32px] border-2 border-white/95 p-6 sm:p-8 shadow-[0_16px_36px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 text-sm">🎓</span>
              <span>For Students</span>
            </h2>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-stone-100 px-2.5 py-0.5 rounded-full">
              5-Step Learning Roadmap
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 items-start">
            {[
              {
                num: '1',
                icon: User,
                label: 'Create account',
                desc: 'Free student profile',
                bg: 'bg-blue-50 text-blue-600 border-blue-200/80',
                color: 'text-blue-500'
              },
              {
                num: '2',
                icon: Layers,
                label: 'Choose modules',
                desc: 'Linear, ODEs, roots',
                bg: 'bg-amber-50 text-amber-600 border-amber-200/80',
                color: 'text-amber-500'
              },
              {
                num: '3',
                icon: GraduationCap,
                label: 'Learn',
                desc: 'Theory & step-by-step',
                bg: 'bg-purple-50 text-purple-600 border-purple-200/80',
                color: 'text-purple-500'
              },
              {
                num: '4',
                icon: Target,
                label: 'Practice',
                desc: 'Numerical solvers',
                bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
                color: 'text-emerald-500'
              },
              {
                num: '5',
                icon: Award,
                label: 'Take quizzes',
                desc: 'Test your mastery',
                bg: 'bg-rose-50 text-rose-600 border-rose-200/80',
                color: 'text-rose-500'
              },
            ].map((step, idx, arr) => (
              <div key={step.label} className="flex items-start gap-1.5 group">
                <div className="flex flex-col items-center text-center space-y-2 w-full">
                  {/* Step number badge */}
                  <span className={`text-sm sm:text-base font-serif font-black italic ${step.color} select-none`}>
                    {step.num}
                  </span>
                  {/* Step Icon Container */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${step.bg} border-2 flex items-center justify-center shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:shadow-md`}>
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {step.label}
                    </span>
                    <span className="block text-[11px] text-stone-500 font-medium leading-tight">
                      {step.desc}
                    </span>
                  </div>
                </div>

                {/* Arrow connector */}
                {idx < arr.length - 1 && (
                  <div className="hidden sm:flex items-center text-slate-300 select-none pt-7">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1.5" />
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- Row 2.5: For Professors 5-Step Teaching Journey --- */}
        <div className="bg-white/95 rounded-[32px] border-2 border-white/95 p-6 sm:p-8 shadow-[0_16px_36px_rgba(0,0,0,0.05)] relative overflow-hidden mt-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 text-sm">👨‍🏫</span>
              <span>For Professors</span>
            </h2>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-stone-100 px-2.5 py-0.5 rounded-full">
              5-Step Teaching Suite
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 items-start">
            {[
              {
                num: '1',
                icon: UserCheck,
                label: 'Teacher account',
                desc: 'Educator permissions',
                bg: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
                color: 'text-indigo-500'
              },
              {
                num: '2',
                icon: BookPlus,
                label: 'Create modules',
                desc: 'Course structure',
                bg: 'bg-amber-50 text-amber-600 border-amber-200/80',
                color: 'text-amber-500'
              },
              {
                num: '3',
                icon: Edit3,
                label: 'Design lessons',
                desc: 'Theory, LaTeX & media',
                bg: 'bg-purple-50 text-purple-600 border-purple-200/80',
                color: 'text-purple-500'
              },
              {
                num: '4',
                icon: Activity,
                label: 'Add simulations',
                desc: 'Interactive lab studio',
                bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
                color: 'text-emerald-500'
              },
              {
                num: '5',
                icon: BarChart3,
                label: 'Track progress',
                desc: 'Student analytics',
                bg: 'bg-rose-50 text-rose-600 border-rose-200/80',
                color: 'text-rose-500'
              },
            ].map((step, idx, arr) => (
              <div key={step.label} className="flex items-start gap-1.5 group">
                <div className="flex flex-col items-center text-center space-y-2 w-full">
                  {/* Step number badge */}
                  <span className={`text-sm sm:text-base font-serif font-black italic ${step.color} select-none`}>
                    {step.num}
                  </span>
                  {/* Step Icon Container */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${step.bg} border-2 flex items-center justify-center shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:shadow-md`}>
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {step.label}
                    </span>
                    <span className="block text-[11px] text-stone-500 font-medium leading-tight">
                      {step.desc}
                    </span>
                  </div>
                </div>

                {/* Arrow connector */}
                {idx < arr.length - 1 && (
                  <div className="hidden sm:flex items-center text-slate-300 select-none pt-7">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-1.5" />
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- Row 3: What NumiViz offers --- */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">What NumiViz offers</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Interactive Lab */}
            <div
              onClick={() => navigate('/tools')}
              className="bg-white/95 rounded-[28px] border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all cursor-pointer space-y-3 group relative overflow-hidden"
            >
              {/* Watercolor splash background and harmonic curves */}
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
              {/* Open notebook and pencil sketch */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs border border-purple-200/70 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>

                {/* Hand-drawn open book & pencil sketch */}
                <svg viewBox="0 0 50 35" className="w-10 h-7 text-slate-400 opacity-60">
                  {/* Book */}
                  <path d="M 5 28 L 22 24 L 22 6 L 5 10 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M 45 28 L 28 24 L 28 6 L 45 10 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  {/* Pencil */}
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

                {/* Mini coordinate chart sketch */}
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

            {/* Card 4: Teaching */}
            <div
              onClick={() => navigate('/auth')}
              className="bg-white/95 rounded-[28px] border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all cursor-pointer space-y-3 group relative overflow-hidden"
            >
              {/* Technical graph paper pattern in background */}
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs border border-amber-200/70 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>

              <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                Teaching
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Give professors tools to create, edit, and manage custom numerical learning content.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

import React, { useState } from 'react';
import { ChevronRight, ArrowUpRight } from 'lucide-react';

interface CategoryProps {
  label: string;
  href: string;
  methods: string[];
  color: string;
  accentBg: string;
  badge: string;
  type: 'linear' | 'nonlinear' | 'integration' | 'ode' | 'interpolation' | 'diff';
  onClick: () => void;
}

export default function MethodCategoryCard({
  label,
  methods,
  color,
  accentBg,
  badge,
  type,
  onClick,
}: CategoryProps) {
  const [hovered, setHovered] = useState(false);

  // Render dedicated interactive SVG math visualization according to category
  const renderMathVisual = () => {
    switch (type) {
      case 'linear':
        // Two intersecting lines with glowing intersection point
        return (
          <svg className="w-full h-16 overflow-visible" viewBox="0 0 160 60">
            {/* Grid background */}
            <line x1="0" y1="30" x2="160" y2="30" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="80" y1="0" x2="80" y2="60" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
            {/* Line 1: y = 0.5x + 10 */}
            <line
              x1="10" y1="45" x2="150" y2="15"
              stroke="#2563eb" strokeWidth="2"
              className="transition-all duration-300"
              style={{ strokeDasharray: hovered ? 'none' : 'none' }}
            />
            {/* Line 2: y = -0.6x + 50 */}
            <line
              x1="10" y1="10" x2="150" y2="50"
              stroke="#06b6d4" strokeWidth="2"
              className="transition-all duration-300"
            />
            {/* Intersection Point (80, 30) */}
            <circle cx="80" cy="30" r={hovered ? 5 : 3.5} fill="#3b82f6" className="transition-all duration-300" />
            <circle
              cx="80" cy="30" r={hovered ? 9 : 6}
              fill="none" stroke="#3b82f6" strokeWidth="1.5"
              className={hovered ? 'animate-ping' : 'opacity-40'}
            />
          </svg>
        );

      case 'nonlinear':
        // Cubic curve with tangent line to root
        return (
          <svg className="w-full h-16 overflow-visible" viewBox="0 0 160 60">
            <line x1="0" y1="40" x2="160" y2="40" stroke="#e2e8f0" strokeWidth="1" />
            {/* Smooth curve f(x) */}
            <path
              d="M 10 52 Q 60 55 90 40 T 150 8"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.2"
            />
            {/* Tangent line */}
            <line
              x1="45" y1="58" x2="125" y2="15"
              stroke="#f43f5e"
              strokeWidth="1.5"
              strokeDasharray={hovered ? 'none' : '3 3'}
              className="transition-all duration-300"
            />
            {/* Root Point on axis */}
            <circle cx="90" cy="40" r={hovered ? 4.5 : 3} fill="#10b981" />
            {/* Tangent contact point */}
            <circle cx="95" cy="32" r="3" fill="#f43f5e" />
          </svg>
        );

      case 'integration':
        // Riemann trapezoids under bell/quadratic curve
        return (
          <svg className="w-full h-16 overflow-visible" viewBox="0 0 160 60">
            <line x1="10" y1="50" x2="150" y2="50" stroke="#e2e8f0" strokeWidth="1" />
            {/* Area under curve fill */}
            <path
              d="M 25 50 L 25 35 Q 80 8 135 38 L 135 50 Z"
              fill="url(#integGrad)"
              opacity={hovered ? 0.9 : 0.65}
              className="transition-opacity duration-300"
            />
            {/* Trapezoid partition lines */}
            <line x1="52" y1="50" x2="52" y2="23" stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="80" y1="50" x2="80" y2="14" stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="108" y1="50" x2="108" y2="24" stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
            {/* Top curve */}
            <path d="M 25 35 Q 80 8 135 38" fill="none" stroke="#0d9488" strokeWidth="2.2" />
            <defs>
              <linearGradient id="integGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'ode':
        // Damped oscillator curve / phase trajectory
        return (
          <svg className="w-full h-16 overflow-visible" viewBox="0 0 160 60">
            <line x1="0" y1="30" x2="160" y2="30" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
            {/* Damped wave */}
            <path
              d="M 10 30 Q 30 2 50 30 T 90 30 T 120 30 T 145 30"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.2"
              className={hovered ? 'animate-pulse' : ''}
            />
            <circle cx="30" cy="16" r="3" fill="#06b6d4" />
            <circle cx="70" cy="40" r="3" fill="#06b6d4" />
          </svg>
        );

      case 'interpolation':
        // Interpolation polynomial passing exactly through points
        return (
          <svg className="w-full h-16 overflow-visible" viewBox="0 0 160 60">
            {/* Smooth polynomial spline */}
            <path
              d="M 15 45 C 35 15, 60 55, 90 20 S 135 48, 150 15"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.2"
            />
            {/* Data knots */}
            {[
              { x: 25, y: 35 },
              { x: 60, y: 48 },
              { x: 95, y: 22 },
              { x: 135, y: 38 },
            ].map((pt, i) => (
              <g key={i}>
                <circle cx={pt.x} cy={pt.y} r={hovered ? 4.5 : 3.5} fill="#4f46e5" />
                <circle cx={pt.x} cy={pt.y} r="6" fill="none" stroke="#818cf8" strokeWidth="1" opacity="0.6" />
              </g>
            ))}
          </svg>
        );

      case 'diff':
        // Finite difference secant narrowing to tangent
        return (
          <svg className="w-full h-16 overflow-visible" viewBox="0 0 160 60">
            <path d="M 15 48 Q 80 40 145 12" fill="none" stroke="#a855f7" strokeWidth="2.2" />
            {/* Tangent line */}
            <line x1="40" y1="52" x2="130" y2="18" stroke="#ec4899" strokeWidth="1.8" />
            {/* Secant line with h step */}
            <line
              x1="55" y1="46" x2="125" y2="20"
              stroke="#94a3b8"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              className={hovered ? 'opacity-30' : 'opacity-80'}
            />
            <circle cx="75" cy="38" r="3.5" fill="#a855f7" />
            <circle cx="115" cy="24" r="3.5" fill="#ec4899" />
          </svg>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative text-left bg-white/90 backdrop-blur-md border border-slate-200/90 hover:border-blue-400/80 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top ambient glow on hover */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl transition-opacity duration-300 pointer-events-none ${
          hovered ? 'opacity-40' : 'opacity-0'
        } ${accentBg}`}
      />

      <div>
        {/* Header: Badge & Method count */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badge}`}>
            {label}
          </span>
          <div className="flex items-center text-slate-400 group-hover:text-blue-600 transition-colors">
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Animated Mathematical Visualizer Preview */}
        <div className="my-3 py-2 px-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-center">
          {renderMathVisual()}
        </div>

        {/* List of algorithms */}
        <ul className="space-y-1.5 mt-4">
          {methods.map((m) => (
            <li key={m} className="flex items-center gap-2 text-xs text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors shrink-0" />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Explore Link */}
      <div className="flex items-center gap-1 mt-5 pt-3 border-t border-slate-100 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
        Launch interactive solvers
        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
}

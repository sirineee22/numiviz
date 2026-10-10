/**
 * NumericalLab - /tools
 * High-performance, animated, professional numerical computational studio.
 * Interactive category switcher, rich tool palette, and sleek laboratory workspace
 * styled to match the warm math notebook theme.
 */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Grid3X3, Activity, Sigma, Waves, Diff, Compass, Spline, Cpu,
  Sparkles, Layers, Search, ChevronRight,
  CheckCircle2, ArrowRight, Zap, Play, Terminal, History, LogIn, BookOpen,
} from 'lucide-react';
import HomeNavbar from '@/components/HomeNavbar';
import PublicFooter from '@/components/PublicFooter';
import DesmosGraph from '@/components/DesmosGraph';
import MatrixLabPage from './MatrixLabPage';
import LinearSystemSolver from '@/pages/modules/LinearSystemSolver';
import NonlinearEquationsTool from '@/components/NonlinearEquationsTool';
import LinearSystemsIterativeTool from '@/components/LinearSystemsIterativeTool';
import NumericalIntegrationTool from '@/components/NumericalIntegrationTool';
import ODESolverTool from '@/components/ODESolverTool';
import ODESystemTool from '@/components/ODESystemTool';
import NumericalDiffTool from '@/components/NumericalDiffTool';
import InterpolationTool from '@/components/InterpolationTool';
import EigenvalueTool from '@/components/EigenvalueTool';
import MethodTheoryModal from '@/components/MethodTheoryModal';

// ── Category metadata with icons & colors ─────────────────────────────────────
interface CategoryDef {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  badge: string;
  glow: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    id: 'linear',
    label: 'Linear Systems',
    icon: Grid3X3,
    color: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    glow: 'from-amber-600/10 to-orange-600/10',
  },
  {
    id: 'nonlinear',
    label: 'Nonlinear Equations',
    icon: Activity,
    color: 'text-purple-600',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    glow: 'from-purple-600/10 to-pink-600/10',
  },
  {
    id: 'integration',
    label: 'Integration',
    icon: Sigma,
    color: 'text-teal-600',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    glow: 'from-teal-600/10 to-emerald-600/10',
  },
  {
    id: 'ode',
    label: 'Diff. Equations',
    icon: Waves,
    color: 'text-cyan-600',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    glow: 'from-cyan-600/10 to-blue-600/10',
  },
  {
    id: 'differentiation',
    label: 'Differentiation',
    icon: Diff,
    color: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    glow: 'from-rose-600/10 to-purple-600/10',
  },
  {
    id: 'graphing',
    label: 'Graphing',
    icon: Compass,
    color: 'text-indigo-600',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    glow: 'from-indigo-600/10 to-violet-600/10',
  },
  {
    id: 'interpolation',
    label: 'Interpolation',
    icon: Spline,
    color: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    glow: 'from-amber-600/10 to-yellow-600/10',
  },
  {
    id: 'eigenvalue',
    label: 'Eigenvalues',
    icon: Cpu,
    color: 'text-orange-600',
    badge: 'bg-orange-50 text-orange-800 border-orange-200',
    glow: 'from-orange-600/10 to-amber-600/10',
  },
];

// ── Tool Registry ─────────────────────────────────────────────────────────────
interface ToolDef {
  id: string;
  label: string;
  description: string;
  category: string;
  tag: string;
}

const TOOLS: ToolDef[] = [
  // Linear Systems
  { id: 'linear-2x2',   label: '2×2 Graphical Solver', category: 'linear',        description: 'Solve a 2×2 system with intersecting geometry lines.', tag: 'Geometric' },
  { id: 'jacobi',       label: 'Jacobi Iteration',       category: 'linear',        description: 'Simultaneous displacement solver with 2D phase trajectory.', tag: 'Iterative' },
  { id: 'gauss-seidel', label: 'Gauss-Seidel',          category: 'linear',        description: 'Successive displacement solver with orthogonal staircase path.', tag: 'Faster' },
  { id: 'matrix-lab',   label: 'Matrix Algebra Lab',    category: 'linear',        description: 'Det, Inv, Transpose, Condition number, and LU/Gauss decomposition.', tag: 'Full Suite' },
  // Nonlinear
  { id: 'newton',       label: 'Newton-Raphson',        category: 'nonlinear',     description: 'Quadratic convergence with osculating tangent lines.', tag: 'O(ε²)' },
  { id: 'bisection',    label: 'Bisection Method',      category: 'nonlinear',     description: 'Robust bracketing solver by halving intervals.', tag: 'Guaranteed' },
  { id: 'fixedpoint',   label: 'Fixed Point Iteration', category: 'nonlinear',     description: 'Iterate x = g(x) with convergence condition |g\'(x)| < 1.', tag: 'Banach' },
  { id: 'secant',       label: 'Secant Method',         category: 'nonlinear',     description: 'Superlinear root-finding without analytical derivatives.', tag: 'O(ε^1.618)' },
  // Integration
  { id: 'trapezoidal',  label: 'Trapezoidal Rule',      category: 'integration',   description: 'Piecewise linear area approximation with O(h²) error.', tag: 'Linear' },
  { id: 'simpson13',    label: "Simpson's 1/3 Rule",    category: 'integration',   description: 'Parabolic 3-point quadrature with O(h⁴) accuracy.', tag: 'O(h⁴)' },
  { id: 'simpson38',    label: "Simpson's 3/8 Rule",    category: 'integration',   description: 'Cubic 4-point quadrature formula for multiples of 3.', tag: 'Cubic' },
  { id: 'gauss-legendre', label: 'Gauss-Legendre',      category: 'integration',   description: 'n-point Gaussian quadrature: exact for polynomials degree ≤ 2n-1.', tag: 'O(h^{2n})' },
  { id: 'romberg',      label: 'Romberg Integration',   category: 'integration',   description: 'Richardson extrapolation applied to the trapezoidal rule (super-accuracy).', tag: 'Richardson' },
  // ODEs
  { id: 'euler',        label: 'Euler Method',          category: 'ode',           description: 'First-order initial value problem solver with O(h) step.', tag: '1st Order' },
  { id: 'heun',         label: 'Heun (Improved Euler)', category: 'ode',           description: 'Predictor-corrector 2nd-order method; trapezoid correction.', tag: '2nd Order' },
  { id: 'rk4',          label: 'Runge-Kutta 4 (RK4)',   category: 'ode',           description: 'Classic 4th-order predictor-corrector vector field tracer.', tag: 'Standard' },
  { id: 'ode-system',   label: 'ODE Systems',           category: 'ode',           description: 'Pendulum, Lotka-Volterra (predator-prey), or custom 2-equation systems via RK4.', tag: 'Systems' },
  // Differentiation
  { id: 'diff',         label: 'Finite Differences',    category: 'differentiation',description: 'Forward, backward, and central differences with step h analysis.', tag: 'O(h²)' },
  { id: 'richardson',   label: 'Richardson Extrapolation', category: 'differentiation', description: 'Higher-order derivative approximation by eliminating error terms systematically.', tag: 'O(h^{2k})' },
  // Graphing
  { id: 'desmos',       label: 'Desmos Interactive',    category: 'graphing',      description: 'Full-featured mathematical graphing canvas.', tag: 'Plotter' },
  // Interpolation & Approximation
  { id: 'lagrange',      label: 'Lagrange Interpolation',   category: 'interpolation', description: 'Exact polynomial through n nodes using Lagrange basis functions.', tag: 'Exact' },
  { id: 'newton-dd',     label: 'Newton Div. Differences',  category: 'interpolation', description: 'Same polynomial as Lagrange, computed via a divided-difference table.', tag: 'DD Table' },
  { id: 'spline',        label: 'Natural Cubic Spline',     category: 'interpolation', description: 'Piecewise C² cubic through all nodes with natural boundary conditions.', tag: 'C² Smooth' },
  { id: 'least-squares', label: 'Least Squares Fit',        category: 'interpolation', description: 'Best-fit polynomial of chosen degree; shows R² and residuals.', tag: 'Best Fit' },
  // Eigenvalues
  { id: 'power',         label: 'Power Method',             category: 'eigenvalue',    description: 'Dominant eigenvalue by repeated matrix-vector multiplication.', tag: 'Dominant λ' },
  { id: 'inverse-power', label: 'Inverse Power Method',     category: 'eigenvalue',    description: 'Smallest eigenvalue (or nearest to shift s) by solving (A-sI)v.', tag: 'Smallest λ' },
];

const TOOL_TO_PANEL: Record<string, string> = {
  jacobi:           'linear-iterative',
  'gauss-seidel':   'linear-iterative',
  newton:           'nonlinear',
  bisection:        'nonlinear',
  fixedpoint:       'nonlinear',
  secant:           'nonlinear',
  trapezoidal:      'integration',
  simpson13:        'integration',
  simpson38:        'integration',
  'gauss-legendre': 'integration',
  romberg:          'integration',
  euler:            'ode',
  heun:             'ode',
  rk4:              'ode',
  'ode-system':     'ode-system',
  richardson:       'richardson',
  lagrange:         'interpolation',
  'newton-dd':      'interpolation',
  spline:           'interpolation',
  'least-squares':  'interpolation',
  power:            'eigenvalue',
  'inverse-power':  'eigenvalue',
};

// ── History badge ─────────────────────────────────────────────────────────────
function HistoryBadge() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <button
        onClick={() => navigate('/history')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
          bg-amber-50 border border-amber-200/90 text-amber-800 text-[11px] font-semibold
          hover:bg-amber-100 hover:border-amber-300 transition-all shadow-2xs"
      >
        <History className="h-3.5 w-3.5 text-amber-600" />
        View History
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/auth')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
        bg-white/80 border border-stone-200/90 text-stone-600 text-[11px] font-medium
        hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 transition-all shadow-2xs group"
    >
      <LogIn className="h-3.5 w-3.5 text-stone-400 group-hover:text-amber-600 transition-colors" />
      Sign in to save history
    </button>
  );
}

// ── Panel Renderer ────────────────────────────────────────────────────────────
function Panel({
  toolId,
  panelId,
  tool,
}: {
  toolId: string;
  panelId: string;
  tool: ToolDef;
}) {
  const [showTheoryModal, setShowTheoryModal] = useState(false);
  const nonlinearMethod = ['newton', 'bisection', 'fixedpoint', 'secant'].includes(toolId) ? toolId : 'newton';
  const integMethod     = ['trapezoidal', 'simpson13', 'simpson38', 'gauss-legendre', 'romberg'].includes(toolId) ? toolId : 'trapezoidal';
  const odeMethod       = ['euler', 'heun', 'rk4'].includes(toolId) ? toolId : 'euler';
  const linearMethod    = ['jacobi', 'gauss-seidel'].includes(toolId) ? toolId : 'jacobi';

  const interpolationMethod = ['lagrange', 'newton-dd', 'spline', 'least-squares'].includes(toolId) ? toolId : 'lagrange';
  const eigenMethod         = ['power', 'inverse-power'].includes(toolId) ? toolId : 'power';

  const content: Record<string, React.ReactNode> = {
    'linear-2x2':       <LinearSystemSolver />,
    'linear-iterative': <LinearSystemsIterativeTool defaultMethod={linearMethod} />,
    'matrix-lab':       <MatrixLabPage />,
    nonlinear:          <NonlinearEquationsTool defaultMethod={nonlinearMethod} />,
    integration:        <NumericalIntegrationTool defaultMethod={integMethod} />,
    ode:                <ODESolverTool focusMethod={odeMethod} />,
    'ode-system':       <ODESystemTool />,
    diff:               <NumericalDiffTool />,
    richardson:         <NumericalDiffTool defaultTab="richardson" />,
    interpolation:      <InterpolationTool defaultMethod={interpolationMethod} />,
    eigenvalue:         <EigenvalueTool defaultMethod={eigenMethod} />,
    desmos: (
      <div className="h-[640px] rounded-3xl overflow-hidden border-2 border-white/90 shadow-[0_16px_36px_rgba(0,0,0,0.06)] bg-white">
        <DesmosGraph expression="y=x^2" />
      </div>
    ),
  };

  const panel = content[panelId];

  if (!panel) {
    return (
      <div className="py-24 text-center text-stone-400 text-sm border-2 border-dashed border-stone-200 rounded-3xl bg-white/60 backdrop-blur-md">
        Select a method from the laboratory catalog to start.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Studio Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white/85 backdrop-blur-2xl rounded-3xl border-2 border-white/95 shadow-[0_12px_28px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{tool.label}</h2>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300/80 uppercase tracking-wide">
              {tool.tag}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl font-medium">{tool.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Animated Theory Explainer Button */}
          <button
            onClick={() => setShowTheoryModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group cursor-pointer"
            title="Afficher l'explication théorique, les formules et les étapes"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Comprendre la méthode</span>
            <BookOpen className="w-3.5 h-3.5 opacity-90 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <HistoryBadge />
          <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100/80 border border-stone-200/90 text-[11px] font-semibold text-stone-700 shadow-2xs font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Engine 60 FPS
          </span>
        </div>
      </div>

      {/* Main Interactive Tool Body */}
      <div>{panel}</div>

      {/* Animated Method Theory Modal */}
      <MethodTheoryModal
        isOpen={showTheoryModal}
        onClose={() => setShowTheoryModal(false)}
        toolId={toolId}
      />
    </div>
  );
}

// ── Main NumericalLab Component ───────────────────────────────────────────────
export default function NumericalLab() {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeToolId, setActiveToolId] = useState('linear-2x2');
  const [activeCategory, setActiveCategory] = useState('linear');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync with ?tool= query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tool = params.get('tool');
    if (tool && TOOLS.find((t) => t.id === tool)) {
      setActiveToolId(tool);
      const found = TOOLS.find((t) => t.id === tool);
      if (found) setActiveCategory(found.category);
    }
  }, [location.search]);

  const selectTool = (t: ToolDef) => {
    setActiveToolId(t.id);
    setActiveCategory(t.category);
    const url = new URL(window.location.href);
    url.searchParams.set('tool', t.id);
    window.history.replaceState({}, '', url.toString());
  };

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];
  const toolsInCategory = TOOLS.filter(
    (t) =>
      t.category === activeCategory &&
      (searchQuery === '' || t.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const activeTool = TOOLS.find((t) => t.id === activeToolId) ?? TOOLS[0];
  const panelId = TOOL_TO_PANEL[activeToolId] ?? activeToolId;

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-slate-800 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden flex flex-col">
      {/* Math Dot Grid Background Canvas */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #CBD5E1 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          opacity: 0.65,
        }}
      />

      {/* Ambient Glowing Pastel Orbs */}
      <div className="fixed top-12 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="fixed top-1/3 right-10 w-[420px] h-[420px] bg-indigo-200/15 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-emerald-200/15 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Left Technical Margin Frame */}
      <div className="hidden 2xl:flex fixed left-4 top-24 bottom-12 flex-col justify-between items-center py-6 pointer-events-none select-none z-0 text-stone-300 font-mono text-[10px] tracking-widest border-r border-dashed border-stone-200 pr-3">
        <span>+ 00.00</span>
        <span className="rotate-90 origin-center text-stone-400 font-semibold">[STUDIO_LAB]</span>
        <span>f(x) = 0</span>
        <span className="rotate-90 origin-center">dx/dt</span>
        <span>+ 99.99</span>
      </div>

      {/* Right Technical Margin Frame */}
      <div className="hidden 2xl:flex fixed right-4 top-24 bottom-12 flex-col justify-between items-center py-6 pointer-events-none select-none z-0 text-stone-300 font-mono text-[10px] tracking-widest border-l border-dashed border-stone-200 pl-3">
        <span>λ_max</span>
        <span className="-rotate-90 origin-center text-stone-400 font-semibold">[NUMERICAL_CORE]</span>
        <span>∫ f(x)dx</span>
        <span className="-rotate-90 origin-center">||Ax - b||</span>
        <span>+ 60FPS</span>
      </div>

      <HomeNavbar scrolled={scrolled} />

      {/* ── Top Laboratory Studio Header ──────────────────────────────────────── */}
      <div className="relative z-10 pt-[88px] pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-2xl border-2 border-white/95 rounded-[28px] p-6 sm:p-8 shadow-[0_16px_36px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                  Numerical Analysis{' '}
                  <span className="relative inline-block text-slate-900">
                    Laboratory
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-3 text-amber-500 pointer-events-none"
                      viewBox="0 0 260 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M3 10C50 3 130 12 180 5C220 -1 250 8 257 6"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-2xl font-medium leading-relaxed">
                  Workspace de calcul numérique en temps réel. Ajustez les paramètres, avancez pas à pas dans les itérations, analysez la décroissance de l'erreur et tracez les trajectoires géométriques.
                </p>
              </div>

              {/* Quick Stats Pill */}
              <div className="flex items-center gap-4 bg-stone-50/90 border border-stone-200/80 rounded-2xl p-3 shadow-2xs self-start lg:self-auto">
                <div className="px-3 text-center border-r border-stone-200/80">
                  <div className="text-lg font-black text-blue-600">26</div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Solveurs</div>
                </div>
                <div className="px-3 text-center border-r border-stone-200/80">
                  <div className="text-lg font-black text-purple-600">8</div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Domaines</div>
                </div>
                <div className="px-3 text-center">
                  <div className="text-lg font-black text-emerald-600">60</div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">FPS Moteur</div>
                </div>
              </div>
            </div>

            {/* ── Category Pill Tabs ──────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5 mt-7 pt-0.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      const first = TOOLS.find((t) => t.category === cat.id);
                      if (first) selectTool(first);
                    }}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 shrink-0 border-2 whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/25 scale-[1.02]'
                        : 'bg-stone-50/80 hover:bg-stone-100/90 text-stone-600 hover:text-stone-900 border-stone-200/70 shadow-2xs backdrop-blur-sm hover:scale-[1.01]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : cat.color}`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Workspace ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* ── Left Sidebar Tool Palette ──────────────────────────────────────── */}
          <aside className="lg:col-span-3 space-y-5">
            <div className="bg-white/85 backdrop-blur-2xl border-2 border-white/95 rounded-[28px] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.06)] space-y-4">
              {/* Category Title & Method Counter */}
              <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <currentCategory.icon className={`h-4 w-4 ${currentCategory.color}`} />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    {currentCategory.label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                  {toolsInCategory.length} méthodes
                </span>
              </div>

              {/* Tool Search Filter */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrer les algorithmes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-2 bg-stone-50/80 border border-stone-200/90 rounded-xl text-xs text-slate-800 placeholder:text-stone-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Tools List */}
              <div className="space-y-1.5 pt-1 max-h-[460px] overflow-y-auto no-scrollbar pr-0.5">
                {toolsInCategory.map((t) => {
                  const isSelected = activeToolId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => selectTool(t)}
                      className={`w-full text-left p-3 rounded-2xl text-xs transition-all duration-150 flex items-center justify-between group border ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-300/90 text-blue-950 font-bold shadow-xs'
                          : 'hover:bg-stone-50/90 text-stone-600 hover:text-stone-900 border-transparent'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate text-[13px]">{t.label}</div>
                        <div className="text-[10px] text-stone-400 font-medium truncate mt-0.5">
                          {t.tag}
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                          isSelected
                            ? 'text-blue-600 translate-x-0.5'
                            : 'text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Tips / Notebook Sticky Note */}
            <div className="hidden lg:block bg-gradient-to-br from-blue-50/90 to-indigo-50/70 border border-blue-200/80 rounded-3xl p-5 text-xs text-blue-950 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Astuce Numérique
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800/90 font-medium">
                Utilisez <strong>Étape Suivante</strong> pour observer l'évolution de la convergence itération par itération et surveiller la décroissance logarithmique de l'erreur résiduelle.
              </p>
            </div>
          </aside>

          {/* ── Main Laboratory Panel ─────────────────────────────────────────── */}
          <main className="lg:col-span-9 min-w-0">
            <Panel toolId={activeToolId} panelId={panelId} tool={activeTool} />
          </main>

        </div>
      </div>

      <PublicFooter />
    </div>
  );
}

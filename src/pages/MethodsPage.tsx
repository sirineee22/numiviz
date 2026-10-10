/**
 * MethodsPage — /methods
 * Organized numerical method library with categories, difficulty, learn + try.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Search, FlaskConical, BookOpen, ChevronRight } from 'lucide-react';
import HomeNavbar from '@/components/HomeNavbar';
import PublicFooter from '@/components/PublicFooter';

// ─── Method data ──────────────────────────────────────────────────────────────
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface Method {
  id: string;
  name: string;
  desc: string;
  difficulty: Difficulty;
  toolId: string; // maps to NumericalLab toolId
  tags?: string[];
}

interface Category {
  id: string;
  label: string;
  description: string;
  methods: Method[];
}

const CATEGORIES: Category[] = [
  {
    id: 'linear',
    label: 'Linear Systems',
    description: 'Solve systems of the form Ax = b using direct and iterative methods.',
    methods: [
      { id: 'gauss',       name: 'Gaussian Elimination',  desc: 'Row reduction with back substitution. O(n³) direct method.', difficulty: 'Beginner',     toolId: 'matrix-lab' },
      { id: 'lu',          name: 'LU Decomposition',       desc: 'Factor A = LU, then solve two triangular systems.',          difficulty: 'Intermediate', toolId: 'matrix-lab' },
      { id: 'jacobi',      name: 'Jacobi Method',          desc: 'Iterative solver that updates all variables simultaneously.', difficulty: 'Intermediate', toolId: 'jacobi' },
      { id: 'gs',          name: 'Gauss-Seidel',           desc: 'Improved Jacobi: uses updated values immediately.',          difficulty: 'Intermediate', toolId: 'gauss-seidel' },
      { id: 'linear-2x2',  name: '2×2 Graphical Solver',   desc: 'Visualize the intersection of two lines in 2D.',            difficulty: 'Beginner',     toolId: 'linear-2x2' },
    ],
  },
  {
    id: 'nonlinear',
    label: 'Nonlinear Equations',
    description: 'Find roots of f(x) = 0 using iterative root-finding algorithms.',
    methods: [
      { id: 'newton',     name: 'Newton-Raphson',  desc: 'Quadratic convergence using the derivative f\'(x).',    difficulty: 'Intermediate', toolId: 'newton' },
      { id: 'bisection',  name: 'Bisection',        desc: 'Guaranteed convergence by halving a bracketing interval.', difficulty: 'Beginner',     toolId: 'bisection' },
      { id: 'fixedpoint', name: 'Fixed Point',      desc: 'Iterate x ← g(x) until convergence. Needs |g\'(x)| < 1.', difficulty: 'Intermediate', toolId: 'fixedpoint' },
      { id: 'secant',     name: 'Secant Method',    desc: 'Newton without the derivative — uses two previous points.',difficulty: 'Intermediate', toolId: 'secant' },
    ],
  },
  {
    id: 'integration',
    label: 'Numerical Integration',
    description: 'Approximate ∫f(x)dx when an analytic antiderivative is unavailable.',
    methods: [
      { id: 'trapz',      name: 'Trapezoidal Rule',   desc: 'Piecewise linear approximation. O(h²) accuracy.',       difficulty: 'Beginner',     toolId: 'trapezoidal' },
      { id: 'simp13',     name: "Simpson's 1/3 Rule", desc: 'Parabolic approximation. O(h⁴) accuracy. Needs even n.', difficulty: 'Intermediate', toolId: 'simpson13' },
      { id: 'simp38',     name: "Simpson's 3/8 Rule", desc: 'Cubic approximation. n must be a multiple of 3.',        difficulty: 'Intermediate', toolId: 'simpson38' },
    ],
  },
  {
    id: 'ode',
    label: 'Differential Equations',
    description: 'Solve initial value problems dy/dx = f(x, y), y(x₀) = y₀.',
    methods: [
      { id: 'euler', name: 'Euler Method',        desc: 'Simplest first-order method. Easy to implement, O(h).',    difficulty: 'Beginner',     toolId: 'euler' },
      { id: 'rk4',   name: 'Runge-Kutta 4 (RK4)', desc: 'Industry-standard. Uses 4 slope estimates per step, O(h⁴).', difficulty: 'Advanced',     toolId: 'rk4' },
    ],
  },
  {
    id: 'diff',
    label: 'Numerical Differentiation',
    description: 'Approximate derivatives using finite difference stencils and extrapolation.',
    methods: [
      { id: 'fdiff',      name: 'Finite Differences',        desc: 'Forward, backward, and central difference with step h analysis.',  difficulty: 'Beginner',     toolId: 'diff' },
      { id: 'richardson', name: 'Richardson Extrapolation',  desc: 'Systematic elimination of lower-order error terms for high order.', difficulty: 'Intermediate', toolId: 'richardson' },
    ],
  },
  {
    id: 'interpolation',
    label: 'Interpolation & Curve Fitting',
    description: 'Exact polynomial interpolation and optimal regression curves.',
    methods: [
      { id: 'lagrange',      name: 'Lagrange Interpolation',  desc: 'Exact degree n polynomial through nodes using Lagrange basis.',   difficulty: 'Beginner',     toolId: 'lagrange' },
      { id: 'newton-dd',     name: 'Newton Div. Differences', desc: 'Divided difference table formulation for incremental evaluation.', difficulty: 'Intermediate', toolId: 'newton-dd' },
      { id: 'spline',        name: 'Natural Cubic Spline',    desc: 'Piecewise C² smooth cubic curves with natural boundary conditions.', difficulty: 'Advanced',     toolId: 'spline' },
      { id: 'least-squares', name: 'Least Squares Fit',       desc: 'Polynomial regression of arbitrary degree with R² and residual plots.', difficulty: 'Intermediate', toolId: 'least-squares' },
    ],
  },
  {
    id: 'eigenvalue',
    label: 'Eigenvalues & Eigenvectors',
    description: 'Iterative computation of dominant and shifted spectral properties.',
    methods: [
      { id: 'power',         name: 'Power Method',            desc: 'Find dominant eigenvalue λ₁ and eigenvector via repeated matrix-vector products.', difficulty: 'Intermediate', toolId: 'power' },
      { id: 'inverse-power', name: 'Inverse Power Method',    desc: 'Find smallest eigenvalue or eigenvalue nearest to shift σ via (A - σI)⁻¹ solves.', difficulty: 'Advanced',     toolId: 'inverse-power' },
    ],
  },
  {
    id: 'matrices',
    label: 'Matrix Operations',
    description: 'Compute determinants, inverses, norms, products, and solve systems.',
    methods: [
      { id: 'matops', name: 'Matrix Laboratory', desc: 'Determinant, inverse, transpose, norm, Ax product, and system solvers.', difficulty: 'Beginner', toolId: 'matrix-lab' },
    ],
  },
  {
    id: 'visualizations',
    label: 'Visualizations',
    description: 'Interactive graphing and function visualization tools.',
    methods: [
      { id: 'desmos', name: 'Desmos Calculator', desc: 'Plot functions, sliders, parametric curves and more interactively.',   difficulty: 'Beginner', toolId: 'desmos' },
    ],
  },
];

const ALL_METHODS = CATEGORIES.flatMap(c => c.methods.map(m => ({ ...m, category: c.id, categoryLabel: c.label })));

const DIFF_COLOR: Record<Difficulty, string> = {
  Beginner:     'text-green-700 bg-green-50 border-green-200',
  Intermediate: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  Advanced:     'text-red-700 bg-red-50 border-red-200',
};

// ─── MethodCard ───────────────────────────────────────────────────────────────
function MethodCard({ m }: { m: Method & { categoryLabel?: string } }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-border rounded-lg p-5 flex flex-col gap-3
      hover:border-primary/30 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm text-foreground leading-snug">{m.name}</h3>
        <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded border ${DIFF_COLOR[m.difficulty]}`}>
          {m.difficulty}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={() => navigate(`/modules`)}
          className="flex items-center gap-1.5 text-xs font-medium text-foreground/70
            hover:text-primary transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5" /> Learn
        </button>
        <span className="text-border">|</span>
        <button
          onClick={() => navigate(`/tools?tool=${m.toolId}`)}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <FlaskConical className="h-3.5 w-3.5" /> Try
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MethodsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Scroll to hash on mount
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      setActiveCategory(hash);
      setTimeout(() => {
        categoryRefs.current[hash]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [location.hash]);

  const filteredMethods = search.trim()
    ? ALL_METHODS.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.desc.toLowerCase().includes(search.toLowerCase()) ||
        m.categoryLabel?.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div className="min-h-screen bg-transparent text-foreground font-sans overflow-x-hidden">
      <HomeNavbar scrolled={scrolled} />

      {/* Page header */}
      <section className="pt-[54px] pb-8 border-b border-border">
        <div className="section-container pt-8">
          <div className="max-w-2xl animate-fade-up">
            <div className="section-label">Method Library</div>
            <h1 className="heading-xl mt-2 mb-3">Numerical Methods</h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Browse all methods by category. Each includes theory, an interactive solver,
              iteration tables, convergence charts, and practice exercises.
            </p>
          </div>

          {/* Search */}
          <div className="mt-5 max-w-xs relative animate-fade-up [animation-delay:80ms]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search methods…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="nv-input pl-9"
            />
          </div>
        </div>
      </section>

      {/* Category quick-jump — underline tab style */}
      {!filteredMethods && (
        <div className="sticky top-16 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-stone-200/60">
          <div className="section-container">
            <div className="flex gap-0 overflow-x-auto no-scrollbar -mb-px">
              <button
                onClick={() => setActiveCategory('all')}
                className={`shrink-0 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all duration-150 ${
                  activeCategory === 'all'
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                All
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCategory(c.id);
                    categoryRefs.current[c.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`shrink-0 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all duration-150 ${
                    activeCategory === c.id
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="section-container py-10 space-y-12">
        {filteredMethods ? (
          <div>
            <p className="text-[13px] text-muted-foreground mb-5">
              {filteredMethods.length} result{filteredMethods.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredMethods.map(m => <MethodCard key={m.id} m={m} />)}
            </div>
            {filteredMethods.length === 0 && (
              <div className="empty-state">
                <p>No methods match your search.</p>
              </div>
            )}
          </div>
        ) : (
          CATEGORIES.map(cat => (
            <div key={cat.id} ref={el => { categoryRefs.current[cat.id] = el; }}>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h2 className="text-[1.15rem] font-semibold text-foreground">{cat.label}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                </div>
                <button
                  onClick={() => navigate('/tools')}
                  className="hidden sm:flex items-center gap-1 text-xs text-primary hover:underline underline-offset-2"
                >
                  Open in Lab <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {cat.methods.map(m => <MethodCard key={m.id} m={m} />)}
              </div>
              <div className="h-px bg-border mt-12" />
            </div>
          ))
        )}
      </main>

      {/* CTA */}
      <section className="py-12 section-stripe">
        <div className="section-container text-center">
          <h2 className="heading-md mb-2">See a method in action</h2>
          <p className="text-[14px] text-muted-foreground mb-5">Open the Numerical Lab and experiment with real inputs.</p>
          <button className="btn-primary" onClick={() => navigate('/tools')}>
            <FlaskConical className="h-3.5 w-3.5" />
            Open Numerical Lab
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

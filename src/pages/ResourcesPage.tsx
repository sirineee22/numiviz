/**
 * ResourcesPage — /resources
 * Unified with NumiViz's signature warm paper theme (#FAF9F6, dot grid, ambient glows, decorative frames).
 * Allows choosing between:
 * 1. Formula Sheets (Authentic Seyès French ruled notebook)
 * 2. Scientific Libraries & Courses (NumPy, SciPy, MIT OCW, Wolfram MathWorld, Julia, Netlib)
 * 3. University Textbooks (Burden & Faires, Numerical Recipes, Atkinson, Trefethen & Bau, Golub, Hairer)
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BookOpen, ExternalLink, FileText, Bookmark, 
  Search, Sparkles, Code2, GraduationCap, ChevronRight,
  Layers, CheckCircle2
} from 'lucide-react';
import HomeNavbar from '@/components/HomeNavbar';
import PublicFooter from '@/components/PublicFooter';
import NumiVizFormulaSheets from '@/components/NumiVizFormulaSheets';

const BOOKS = [
  { 
    title: 'Numerical Analysis', 
    authors: 'Richard L. Burden, J. Douglas Faires, Annette M. Burden', 
    edition: '10th ed., Cengage Learning', 
    level: 'Undergraduate Standard', 
    desc: 'The definitive textbook for university courses covering roots of equations, interpolation, numerical quadrature, linear systems, and ODEs with pseudocode and error analysis.',
    topics: ['Nonlinear equations', 'Interpolation', 'Numerical Quadrature', 'Linear Systems', 'Initial-Value Problems'],
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200'
  },
  { 
    title: 'Numerical Recipes: The Art of Scientific Computing', 
    authors: 'William H. Press, Saul A. Teukolsky, William T. Vetterling, Brian P. Flannery', 
    edition: '3rd ed., Cambridge University Press', 
    level: 'Advanced & Implementation', 
    desc: 'Essential practical reference containing robust C++ algorithms, detailed scientific implementations, numerical linear algebra, eigensystems, FFT, and stiff ODE solvers.',
    topics: ['Algorithm implementations', 'Krylov methods', 'FFT', 'Stiff ODEs', 'Optimization'],
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200'
  },
  { 
    title: 'An Introduction to Numerical Analysis', 
    authors: 'Kendall E. Atkinson', 
    edition: '2nd ed., John Wiley & Sons', 
    level: 'Mathematical Foundations', 
    desc: 'Renowned for rigorous yet lucid mathematical proofs of convergence, error expansions, orthogonal polynomials, Gaussian quadrature, and boundary value problems.',
    topics: ['Convergence proofs', 'Gaussian quadrature', 'Approximation theory', 'Eigenvalues'],
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200'
  },
  { 
    title: 'Numerical Linear Algebra', 
    authors: 'Lloyd N. Trefethen, David Bau III', 
    edition: 'SIAM (Society for Industrial and Applied Mathematics)', 
    level: 'Graduate Linear Algebra', 
    desc: 'A modern, modular masterpiece covering QR factorization, SVD, conditioning, stability, GMRES, conjugate gradients, and iterative Krylov subspace methods.',
    topics: ['SVD & QR', 'Conditioning & Stability', 'Iterative GMRES', 'Lanczos & Arnoldi'],
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200'
  },
  { 
    title: 'Matrix Computations', 
    authors: 'Gene H. Golub, Charles F. Van Loan', 
    edition: '4th ed., Johns Hopkins University Press', 
    level: 'Advanced Reference', 
    desc: 'The universally acclaimed bible of numerical linear algebra. Exhaustive analysis of algorithms, perturbation theory, structured matrices, and high-performance BLAS.',
    topics: ['Matrix factorizations', 'Perturbation bounds', 'Sparse matrices', 'Eigenvalue algorithms'],
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200'
  },
  { 
    title: 'Solving Ordinary Differential Equations I & II', 
    authors: 'Ernst Hairer, Syvert P. Nørsett, Gerhard Wanner', 
    edition: 'Springer Series in Computational Mathematics', 
    level: 'Specialized Reference', 
    desc: 'The benchmark reference for nonstiff and stiff ODEs, Runge-Kutta stages, multistep Adams methods, symplectic integrators, and differential-algebraic equations.',
    topics: ['Runge-Kutta Order Conditions', 'Stiff Systems', 'Symplectic Integration', 'DAEs'],
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200'
  },
];

const ONLINE_LIBRARIES = [
  { 
    name: 'NumPy Documentation', 
    url: 'https://numpy.org/doc/', 
    desc: 'The foundational package for scientific computing with Python. High-performance multidimensional arrays, vectorization, and C-accelerated BLAS/LAPACK linear algebra bindings.', 
    tag: 'Python Foundation',
    category: 'Core Scientific Ecosystem',
    highlights: ['Multi-dimensional ndarray', 'Broadcasting rules', 'numpy.linalg solver']
  },
  { 
    name: 'SciPy Reference Guide', 
    url: 'https://docs.scipy.org/doc/scipy/reference/', 
    desc: 'Comprehensive scientific algorithms: scipy.optimize (root-finding), scipy.integrate (quadrature & ODE solvers), scipy.interpolate (splines), and sparse linear algebra.', 
    tag: 'Algorithms & Solvers',
    category: 'Core Scientific Ecosystem',
    highlights: ['scipy.optimize.brentq & newton', 'scipy.integrate.solve_ivp', 'scipy.interpolate.CubicSpline']
  },
  { 
    name: 'MIT OpenCourseWare: Numerical Analysis', 
    url: 'https://ocw.mit.edu/courses/18-330-introduction-to-numerical-analysis-spring-2012/', 
    desc: 'Free MIT undergraduate & graduate curriculum: lecture notes, video lectures, problem sets, and exams taught by MIT mathematics faculty.', 
    tag: 'University Courseware',
    category: 'Open Educational Resources',
    highlights: ['MIT 18.330 Lecture notes', 'Problem sets & solutions', 'Interactive MATLAB/Julia code']
  },
  { 
    name: 'Wolfram MathWorld: Numerical Methods', 
    url: 'https://mathworld.wolfram.com/topics/NumericalMethods.html', 
    desc: "The web's most extensive mathematics encyclopedia. Deep theoretical formulas, proofs, algorithmic derivations, and interactive demonstrations.", 
    tag: 'Encyclopedia & Proofs',
    category: 'Mathematical Reference',
    highlights: ['Exact error derivations', 'Historical context', 'Comprehensive theorem statements']
  },
  { 
    name: 'Julia SciML Ecosystem', 
    url: 'https://sciml.ai/', 
    desc: 'Open source scientific machine learning and state-of-the-art differential equation solvers (DifferentialEquations.jl) beating C/Fortran benchmarks in speed and accuracy.', 
    tag: 'Modern Solvers',
    category: 'Next-Gen Scientific Computing',
    highlights: ['Adaptive stepsize RK45/Tsit5', 'Stiff Rosenbrock solvers', 'Automatic differentiation']
  },
  { 
    name: 'Netlib Repository', 
    url: 'https://www.netlib.org/', 
    desc: 'The legendary repository for numerical software: source code for LAPACK, LINPACK, EISPACK, BLAS, and QUADPACK that powers modern numerical engines.', 
    tag: 'Foundational Code',
    category: 'Historical & Standard Libraries',
    highlights: ['Fortran 77/90 source routines', 'QUADPACK numerical quadrature', 'LAPACK matrix benchmarks']
  },
];

type CategoryKey = 'formulas' | 'libraries' | 'books' | 'all';

export default function ResourcesPage() {
  const [scrolled, setScrolled] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Active category derived from ?category= query param (default: 'formulas')
  const currentCategory: CategoryKey = (searchParams.get('category') as CategoryKey) || 'formulas';

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const setCategory = (cat: CategoryKey) => {
    setSearchParams({ category: cat });
    setSearchQuery('');
  };

  // Filtered libraries for search
  const filteredLibraries = ONLINE_LIBRARIES.filter(lib => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      lib.name.toLowerCase().includes(q) ||
      lib.desc.toLowerCase().includes(q) ||
      lib.tag.toLowerCase().includes(q) ||
      lib.highlights.some(h => h.toLowerCase().includes(q))
    );
  });

  // Filtered books for search
  const filteredBooks = BOOKS.filter(book => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(q) ||
      book.authors.toLowerCase().includes(q) ||
      book.desc.toLowerCase().includes(q) ||
      book.topics.some(t => t.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="min-h-screen font-sans text-slate-900 w-full relative overflow-x-hidden flex flex-col justify-between"
      style={{ backgroundColor: '#FAF9F6' }}
    >
      {/* Delicate dot grid background matching the site theme */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Ambient glowing gradient orbs */}
      <div className="absolute -top-12 -left-12 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-orange-300/35 via-amber-200/20 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute -top-10 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-amber-400/35 via-orange-300/25 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[480px] -right-16 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-indigo-400/35 via-purple-300/20 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Decorative Technical Grid Frames on Outer Margins */}
      <div className="hidden xl:block absolute left-4 top-36 w-24 h-48 rounded-2xl border-2 border-amber-300/50 bg-amber-50/15 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 96 192" className="w-full h-full opacity-40">
          <defs>
            <pattern id="resGridLeft" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="96" height="192" fill="url(#resGridLeft)" />
        </svg>
      </div>

      <div className="hidden xl:block absolute right-4 top-36 w-24 h-48 rounded-2xl border-2 border-amber-300/50 bg-amber-50/15 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 96 192" className="w-full h-full opacity-40">
          <defs>
            <pattern id="resGridRight" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="96" height="192" fill="url(#resGridRight)" />
        </svg>
      </div>

      {/* Top Navigation */}
      <HomeNavbar scrolled={scrolled} />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full pt-24 pb-16">
        
        {/* Top Header & Category Selector */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <div className="bg-white/85 backdrop-blur-2xl rounded-[28px] border-2 border-stone-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.04)] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Header branding */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-center justify-center shrink-0 shadow-2xs text-amber-700">
                <Bookmark className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  NumiViz Reference Center
                </h1>
              </div>
            </div>

            {/* Category Selector Buttons */}
            <div className="flex items-center gap-2 p-1.5 bg-stone-100/80 rounded-2xl overflow-x-auto no-scrollbar border border-stone-200/80">
              <button
                onClick={() => setCategory('formulas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 ${
                  currentCategory === 'formulas'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Formula Sheets</span>
              </button>

              <button
                onClick={() => setCategory('libraries')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 ${
                  currentCategory === 'libraries'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Libraries & Courses</span>
              </button>

              <button
                onClick={() => setCategory('books')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 ${
                  currentCategory === 'books'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>University Textbooks</span>
              </button>

              <button
                onClick={() => setCategory('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 ${
                  currentCategory === 'all'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                }`}
              >
                All
              </button>
            </div>

          </div>
        </section>

        {/* 1. FORMULA SHEETS (Seyès French Ruled Notebook) */}
        {(currentCategory === 'formulas' || currentCategory === 'all') && (
          <section id="formula-sheets">
            <NumiVizFormulaSheets />
          </section>
        )}

        {/* 2. SCIENTIFIC LIBRARIES & COURSES */}
        {(currentCategory === 'libraries' || currentCategory === 'all') && (
          <section id="libraries" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 mb-1">
                  <ExternalLink className="w-3 h-3 text-blue-600" />
                  Documentation & Open Courseware
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Scientific Libraries & Courses
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                  High-performance computing packages, reference implementations, and university course materials.
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-72">
                <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter libraries & courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200/90 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/15 shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Grid of Library Cards */}
            <div className="grid sm:grid-cols-2 gap-5">
              {filteredLibraries.map((lib) => (
                <a
                  key={lib.name}
                  href={lib.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/85 backdrop-blur-2xl border-2 border-white/95 rounded-[24px] p-6 shadow-[0_12px_28px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-blue-400/80 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
                          <Code2 className="h-4 w-4" />
                        </div>
                        <span className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                          {lib.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/70 shrink-0">
                        {lib.tag}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 font-medium leading-relaxed">
                      {lib.desc}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {lib.highlights.map((h, i) => (
                        <span key={i} className="text-[10px] font-mono font-semibold text-slate-700 bg-stone-100/90 border border-stone-200/70 px-2 py-0.5 rounded-md">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-500 group-hover:text-blue-600 transition-colors">
                    <span>Visit Documentation</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* 3. UNIVERSITY TEXTBOOKS */}
        {(currentCategory === 'books' || currentCategory === 'all') && (
          <section id="books" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 mb-1">
                  <BookOpen className="w-3 h-3 text-blue-600" />
                  Classic Literature & Foundation
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  University Textbooks & References
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                  Standard university textbooks covering formal proofs, error expansions, and algorithmic derivations.
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-72">
                <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter textbooks & authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200/90 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-stone-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Grid of Textbook Cards */}
            <div className="grid md:grid-cols-2 gap-5">
              {filteredBooks.map((b) => (
                <div
                  key={b.title}
                  className="group bg-white/85 backdrop-blur-2xl rounded-[26px] border-2 border-white/95 shadow-[0_12px_28px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-blue-400/80 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <h3 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                          {b.title}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${b.badgeColor}`}>
                        {b.level}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-stone-500">
                      {b.authors} · <span className="italic text-stone-400">{b.edition}</span>
                    </div>

                    <p className="text-xs text-stone-600 font-medium leading-relaxed pt-1">
                      {b.desc}
                    </p>

                    {/* Key Topics */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {b.topics.map((topic, i) => (
                        <span key={i} className="text-[10px] font-mono font-semibold text-blue-800 bg-blue-50/80 border border-blue-200/70 px-2 py-0.5 rounded-md">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}

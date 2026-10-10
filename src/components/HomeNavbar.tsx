/**
 * HomeNavbar — Top navigation bar with airy, modern spacing matching the NumiViz design mockup.
 * Includes interactive Resources dropdown menu allowing users to choose between:
 * - Formula Sheets (Seyès French ruled notebook)
 * - Scientific Libraries & Courses
 * - University Textbooks
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogIn, LogOut, Menu, X, ChevronDown, 
  FileText, ExternalLink, BookOpen, Layers
} from 'lucide-react';

export const RESOURCE_SUBMENU = [
  { 
    label: 'Formula Sheets', 
    desc: 'Interactive formula sheets with LaTeX, error bounds, and stopping tests',
    href: '/resources?category=formulas',
    icon: FileText,
    iconColor: 'text-amber-700 bg-amber-100/90 border-amber-300/80',
  },
  { 
    label: 'Scientific Libraries & Courses', 
    desc: 'NumPy, SciPy, MIT OCW, Wolfram MathWorld & Julia solvers',
    href: '/resources?category=libraries',
    icon: ExternalLink,
    iconColor: 'text-blue-700 bg-blue-100/90 border-blue-300/80',
  },
  { 
    label: 'University Textbooks', 
    desc: 'Classic numerical analysis literature & theoretical foundations',
    href: '/resources?category=books',
    icon: BookOpen,
    iconColor: 'text-purple-700 bg-purple-100/90 border-purple-300/80',
  },
];

export default function HomeNavbar({ scrolled = false }: { scrolled?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isProfessor = user?.role === 'professeur';

  const isAt = (p: string) => {
    if (p === '/') return location.pathname === '/';
    return location.pathname.startsWith(p);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setResourcesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setResourcesOpen(false);
    }, 180);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => {
      document.removeEventListener('mousedown', clickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const PUBLIC_LINKS = [
    { label: 'Home',          href: '/' },
    { label: 'Numerical Lab', href: '/tools' },
    { label: 'Practice',      href: '/practice' },
    { label: 'Resources',     href: '/resources', hasDropdown: true },
    { label: 'Courses',       href: '/modules' },
    { label: 'Guide',         href: '/guide' },
    { label: 'About',         href: '/about' },
  ];

  const STUDENT_LINKS = [
    { label: 'Home',          href: '/' },
    { label: 'Numerical Lab', href: '/tools' },
    { label: 'Practice',      href: '/practice' },
    { label: 'Resources',     href: '/resources', hasDropdown: true },
    { label: 'Courses',       href: '/modules' },
    { label: 'My Progress',   href: '/history' },
    { label: 'Guide',         href: '/guide' },
    { label: 'About',         href: '/about' },
  ];

  const PROFESSOR_LINKS = [
    { label: 'Home',           href: '/' },
    { label: 'Numerical Lab',  href: '/tools' },
    { label: 'Practice',       href: '/practice' },
    { label: 'Resources',      href: '/resources', hasDropdown: true },
    { label: 'Courses',        href: '/modules' },
    { label: 'Manage Courses', href: '/module-wizard' },
    { label: 'Guide',          href: '/guide' },
    { label: 'About',          href: '/about' },
  ];

  const navLinks = !isAuthenticated
    ? PUBLIC_LINKS
    : isProfessor
    ? PROFESSOR_LINKS
    : STUDENT_LINKS;

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF9F6]/94 backdrop-blur-md border-b border-stone-200/80 shadow-xs'
          : 'bg-[#FAF9F6]/85 backdrop-blur-xs border-b border-stone-200/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
        >
          <div className="h-8 w-8 relative flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
              <path d="M6 23L12 9" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
              <path d="M12 9L19 23" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M19 9V23" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
              <rect x="22.5" y="10.5" width="2.5" height="2.5" rx="0.8" fill="#3B82F6" />
              <rect x="22.5" y="15" width="2.5" height="2.5" rx="0.8" fill="#3B82F6" />
              <rect x="22.5" y="19.5" width="2.5" height="2.5" rx="0.8" fill="#3B82F6" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:opacity-90 transition-opacity">
            Numi<span className="text-[#F97316]">Viz</span>
          </span>
        </button>

        {/* Center: Desktop Navigation Links with comfortable spacing */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          {navLinks.map((l) => {
            const active = isAt(l.href);

            if (l.hasDropdown) {
              return (
                <div
                  key={l.href}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => {
                      navigate(l.href);
                      setResourcesOpen(false);
                    }}
                    className={`flex items-center gap-1.5 text-[14.5px] font-medium transition-colors duration-150 relative py-1.5 px-0.5 ${
                      active
                        ? 'text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{l.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        resourcesOpen ? 'rotate-180 text-slate-900' : 'text-slate-400'
                      }`}
                    />
                    {active && (
                      <svg
                        className="absolute -bottom-0.5 inset-x-0 w-full h-2 text-slate-900 pointer-events-none overflow-visible"
                        viewBox="0 0 60 8"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M 2 4.5 C 18 2, 42 2, 58 4.5"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Dropdown Menu Floating Popover */}
                  {resourcesOpen && (
                    <div 
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[340px] z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl border-2 border-stone-200/90 shadow-[0_18px_40px_rgba(0,0,0,0.12)] p-2 space-y-1">
                        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold border-b border-stone-100 flex items-center justify-between">
                          <span>Choose Resource</span>
                          <span>NumiViz</span>
                        </div>

                        {RESOURCE_SUBMENU.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.href}
                              onClick={(e) => {
                                e.stopPropagation();
                                setResourcesOpen(false);
                                navigate(item.href);
                              }}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-stone-50/90 transition-all flex items-start gap-3 group focus:outline-none"
                            >
                              <div className={`p-2 rounded-xl border shrink-0 ${item.iconColor} transition-transform group-hover:scale-105`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                                    {item.label}
                                  </span>
                                  {item.badge && (
                                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-stone-500 font-medium leading-snug mt-0.5 line-clamp-2">
                                  {item.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={l.href}
                onClick={() => navigate(l.href)}
                className={`text-[14.5px] font-medium transition-colors duration-150 relative py-1.5 px-0.5 ${
                  active
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {l.label}
                {active && (
                  <svg
                    className="absolute -bottom-0.5 inset-x-0 w-full h-2 text-slate-900 pointer-events-none overflow-visible"
                    viewBox="0 0 60 8"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 2 4.5 C 18 2, 42 2, 58 4.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Right side: Auth Controls */}
        <div className="hidden lg:flex items-center gap-5">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate(isProfessor ? '/professor-dashboard' : '/dashboard')}
                className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <span className="max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
              </button>

              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors px-2 py-1.5"
              >
                <LogIn className="h-4 w-4 text-slate-500" />
                Login
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t border-stone-200/70 bg-[#FAF9F6]/95 backdrop-blur-xl shadow-lg px-6 py-4 space-y-2 max-h-[85vh] overflow-y-auto"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.18) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        >
          {navLinks.map((l) => {
            if (l.hasDropdown) {
              return (
                <div key={l.href} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => { setMobileOpen(false); navigate(l.href); }}
                      className={`flex-1 text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isAt(l.href)
                          ? 'text-amber-800 bg-amber-50 font-bold border border-amber-200/80 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                      }`}
                    >
                      {l.label}
                    </button>
                    <button
                      onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                      className="p-2 text-stone-500 hover:text-stone-900"
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${mobileResourcesOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {mobileResourcesOpen && (
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-amber-300 ml-3">
                      {RESOURCE_SUBMENU.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => {
                            setMobileOpen(false);
                            navigate(item.href);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white flex items-center justify-between"
                        >
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={l.href}
                onClick={() => { setMobileOpen(false); navigate(l.href); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isAt(l.href)
                    ? 'text-amber-800 bg-amber-50 font-bold border border-amber-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {l.label}
              </button>
            );
          })}

          <div className="border-t border-stone-200/70 pt-3 mt-3 flex items-center justify-between">
            {isAuthenticated ? (
              <button
                onClick={() => { setMobileOpen(false); logout(); navigate('/'); }}
                className="w-full text-left px-3.5 py-2 text-sm text-red-600 font-semibold"
              >
                Log Out
              </button>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => { setMobileOpen(false); navigate('/auth'); }}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-slate-700 text-center hover:bg-white transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => { setMobileOpen(false); navigate('/auth'); }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold text-center hover:bg-blue-700 transition-colors shadow-2xs"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

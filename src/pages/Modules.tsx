import HomeNavbar from '@/components/HomeNavbar';
import PublicFooter from '@/components/PublicFooter';
import React, { useEffect, useState } from "react";
import { API_BASE } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Edit3, Trash2, Search, ArrowRight, Book, Clock,
  Grid3X3, Waves, Sigma, Activity, Sparkles, CheckCircle2, ChevronRight, Play, Compass, Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from "@/components/ui/textarea";

// Minimal Module type matching backend
interface Module {
  id: number;
  titre: string;
  type: string;
  description?: string;
  contenu?: string;
  id_enseignant?: number;
  niveau?: string;
  categorie?: string;
  duree?: string;
  nb_lecons?: number;
  methodes?: string[];
  objectifs?: string[];
  enseignant_nom?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Lesson {
  id: number;
  titre: string;
  contenu: string;
  id_module: number;
}
interface Exercise {
  id: number;
  question: string;
  solution: string;
  id_module: number;
}

// Clean helper to decode raw unicode escape sequences (e.g., \u00e8 -> è) and remove unwanted JSON quotes
function cleanCategory(raw?: string, index: number = 0): string {
  if (!raw) {
    const defaults = ["Systèmes linéaires", "Équations différentielles", "Systèmes linéaires", "Intégration numérique"];
    return defaults[index % defaults.length];
  }
  let s = String(raw).trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  s = s.replace(/^["']|["']$/g, '').trim();

  if (/lin[eé]aire/i.test(s)) return "Systèmes linéaires";
  if (/diff[eé]rentiel/i.test(s)) return "Équations différentielles";
  if (/non[- ]?lin[eé]aire/i.test(s)) return "Équations non linéaires";
  if (/int[eé]gra/i.test(s)) return "Intégration numérique";
  if (/optimi/i.test(s)) return "Optimisation numérique";

  return s || "Systèmes linéaires";
}

function cleanNiveau(raw?: string, index: number = 0): string {
  if (!raw) {
    return index % 2 === 0 ? "Intermédiaire" : "Débutant";
  }
  let s = String(raw).replace(/^["']|["']$/g, '').trim();
  s = s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  if (/interm/i.test(s)) return "Intermédiaire";
  if (/d[eé]but/i.test(s) || /begin/i.test(s)) return "Débutant";
  if (/avanc/i.test(s) || /adv/i.test(s)) return "Avancé";
  return s || "Débutant";
}

const Modules: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState<Partial<Module>>({
    titre: "", type: "", description: "", contenu: "",
    id_enseignant: undefined, niveau: "Débutant", categorie: "",
    duree: "", nb_lecons: 1, methodes: [], objectifs: [],
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [enseignants, setEnseignants] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState<Partial<Lesson>>({ titre: '', contenu: '' });
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [exerciseForm, setExerciseForm] = useState<Partial<Exercise>>({ question: '', solution: '' });
  const [editingExerciseId, setEditingExerciseId] = useState<number | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Module>>({});
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchModules();
    if (user?.role === "professeur") {
      fetch(API_BASE + "/users")
        .then(res => res.json())
        .then(data => setEnseignants(data.filter((u: User) => u.role === "professeur")))
        .catch(err => console.error("Error fetching teachers:", err));
    }
  }, [user]);

  const fetchModules = () => {
    setLoading(true);
    fetch(API_BASE + "/modules")
      .then(res => {
        if (!res.ok) throw new Error("Erreur de chargement");
        return res.json();
      })
      .then(data => {
        setModules(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "id_enseignant" ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? (API_BASE + "/modules/" + editingId) : (API_BASE + "/modules");
    const payload = {
      ...form,
      id_enseignant: user?.id,
    };
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur d'enregistrement");
        return res.json();
      })
      .then(() => {
        setShowModal(false);
        setEditingId(null);
        setForm({
          titre: "", type: "", description: "", contenu: "",
          id_enseignant: undefined, niveau: "Débutant", categorie: "",
          duree: "", nb_lecons: 1, methodes: [], objectifs: [],
        });
        fetchModules();
      })
      .catch(err => setError(err.message));
  };

  const handleEdit = (mod: Module) => {
    setEditingId(mod.id);
    setForm(mod);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Voulez-vous supprimer ce module ?")) return;
    fetch(API_BASE + "/modules/" + id, { method: "DELETE" })
      .then(res => {
        if (!res.ok) throw new Error("Erreur de suppression");
        fetchModules();
      })
      .catch(err => setError(err.message));
  };

  const handleSaveModule = (id: number) => {
    fetch(API_BASE + "/modules/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur d'enregistrement");
        return res.json();
      })
      .then(() => {
        setEditingModuleId(null);
        fetchModules();
      })
      .catch(err => setError(err.message));
  };

  const filteredModules = modules.filter(m =>
    m.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.categorie && m.categorie.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div
      className="min-h-screen font-sans text-slate-900 w-full relative overflow-x-hidden flex flex-col justify-between"
      style={{ backgroundColor: '#FAF9F6' }}
    >
      {/* Delicate dot grid */}
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
            <pattern id="modulesGridLeft" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="96" height="192" fill="url(#modulesGridLeft)" />
        </svg>
      </div>

      <div className="hidden xl:block absolute right-4 top-36 w-24 h-48 rounded-2xl border-2 border-amber-300/50 bg-amber-50/15 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 96 192" className="w-full h-full opacity-40">
          <defs>
            <pattern id="modulesGridRight" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="96" height="192" fill="url(#modulesGridRight)" />
        </svg>
      </div>

      {/* Hand-Drawn Margin Notebook Doodles */}
      <div className="hidden lg:block absolute left-4 xl:left-8 top-[360px] pointer-events-none select-none z-0 text-slate-400 space-y-24">
        <svg viewBox="0 0 50 70" className="w-9 h-14 text-slate-500">
          <path d="M38 4 C 18 15, 12 40, 16 60" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M10 52 L 16 62 L 24 54" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 30 90" className="w-6 h-20 text-slate-500">
          <path d="M15 4 C 4 10, 4 20, 20 25 C 4 30, 4 40, 20 45 C 4 50, 4 60, 20 65 C 4 70, 4 80, 20 85" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

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
        </svg>
      </div>

      {/* Navigation */}
      <HomeNavbar scrolled={scrolled} />

      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-24 relative z-10 flex-grow w-full">
        {/* Top Return Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 border border-stone-200/90 text-xs font-semibold text-stone-700 hover:text-slate-900 shadow-2xs hover:bg-white transition-all active:scale-[0.98]"
          >
            <span>←</span>
            <span>Retour à l'accueil</span>
          </button>
        </div>

        {/* Welcome Header in White Card with Yellow Doodle Underline */}
        <div className="relative mb-8 bg-white/85 backdrop-blur-2xl rounded-[32px] border-2 border-white/95 shadow-[0_16px_36px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.02)] p-6 sm:p-8 overflow-hidden">
          {/* Subtle soft ambient glow inside header card */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-gradient-to-br from-amber-300/20 via-orange-200/10 to-transparent blur-2xl pointer-events-none" />

          {/* Flower Asterisk Doodle near header right */}
          <div className="absolute right-6 top-6 text-slate-400 hidden sm:block pointer-events-none select-none">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-400/80">
              <path d="M12 2v20m-10-10h20m-14.14-7.07l14.14 14.14m0-14.14L4.93 19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2.5 flex flex-wrap items-baseline gap-2">
                <span>Welcome back,</span>
                <span className="relative inline-block text-slate-900">
                  <span>{user?.name || 'serine dahmane'}</span>
                  {/* Yellow hand-drawn underline doodle */}
                  <svg
                    viewBox="0 0 190 12"
                    className="absolute -bottom-2 left-0 w-full h-3 pointer-events-none select-none overflow-visible"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 2 7 Q 95 3, 188 6"
                      stroke="#FAC028"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="inline-block text-3xl md:text-4xl">👋</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base font-normal max-w-2xl mt-1 leading-relaxed">
                Continue your numerical analysis journey. Select a method to explore algorithms and visualizations.
              </p>
            </div>

            {user?.role === "professeur" && (
              <Button className="shrink-0 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md" onClick={() => navigate('/module-wizard')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Add New Module
              </Button>
            )}
          </div>
        </div>

        {/* Search Input Bar with Star Doodle and 35K Badge */}
        <div className="relative mb-10 max-w-xl">
          <span className="absolute -top-3 right-6 text-slate-400 text-sm select-none pointer-events-none">✧</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search for a numerical method (e.g., Newton-Raphson)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-16 h-14 rounded-2xl bg-white/95 border-slate-200/90 shadow-sm text-base text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-500/30"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-500 bg-stone-100 border border-stone-200/80 px-2.5 py-1 rounded-lg select-none">
            35K
          </span>
        </div>
        
        {error && <div className="p-4 mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{error}</div>}

        {/* Modules Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-96 bg-white/60 rounded-3xl border border-slate-200/70"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 items-stretch">
            {filteredModules.map((mod, idx) => {
              const displayCategory = cleanCategory(mod.categorie, idx);
              const displayNiveau = cleanNiveau(mod.niveau, idx);

              // Match card designs to the user screenshot
              const getCardTheme = (cat: string, index: number) => {
                const themes = [
                  {
                    pillClass: "bg-[#EDE9FE] text-[#6D28D9]",
                    glowGradient: "from-teal-300/40 via-emerald-200/20 to-transparent",
                    chapterBadge: "CHAPITRE 01",
                    sketch: (
                      <svg viewBox="0 0 100 100" className="absolute top-2 right-2 w-28 h-28 text-slate-300/70 pointer-events-none select-none" fill="none">
                        <circle cx="85" cy="15" r="30" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
                        <circle cx="85" cy="15" r="50" stroke="currentColor" strokeWidth="0.75" />
                        <circle cx="85" cy="15" r="70" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" />
                        <line x1="85" y1="15" x2="25" y2="75" stroke="currentColor" strokeWidth="0.75" />
                        <line x1="85" y1="15" x2="45" y2="85" stroke="currentColor" strokeWidth="0.75" />
                      </svg>
                    ),
                    dotColors: ["bg-blue-600", "bg-purple-600", "bg-amber-500"],
                    fallbackObjectives: [
                      "L'objectif de ce chapitre est de résoudre...",
                      "D'équations linéaires",
                      "Équations différentielles"
                    ],
                    duration: "4-6 heures",
                  },
                  {
                    pillClass: "bg-[#DCFCE7] text-[#15803D]",
                    glowGradient: "from-purple-300/40 via-indigo-200/20 to-transparent",
                    chapterBadge: "CHAPITRE 02",
                    sketch: (
                      <div className="absolute top-4 right-5 w-11 h-11 border border-slate-400/80 pointer-events-none select-none">
                        <svg viewBox="0 0 44 44" className="w-full h-full text-slate-400" fill="none">
                          <line x1="0" y1="22" x2="44" y2="22" stroke="currentColor" strokeWidth="0.9" />
                          <line x1="22" y1="0" x2="22" y2="44" stroke="currentColor" strokeWidth="0.9" />
                          <line x1="6" y1="6" x2="38" y2="38" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                          <line x1="38" y1="6" x2="6" y2="38" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                        </svg>
                      </div>
                    ),
                    dotColors: ["bg-blue-600", "bg-purple-600", "bg-amber-500"],
                    fallbackObjectives: [
                      "L'objectif de ce chapitre est de résoudre...",
                      "L'objectif de ce chapitre est maîtrisé.",
                      "Équations différentielles"
                    ],
                    duration: "4-6 heures",
                  },
                  {
                    pillClass: "bg-[#FEF3C7] text-[#B45309]",
                    glowGradient: "from-amber-300/40 via-orange-200/20 to-transparent",
                    chapterBadge: displayNiveau || "Intermédiaire",
                    sketch: (
                      <svg viewBox="0 0 100 80" className="absolute top-2 right-2 w-28 h-24 text-slate-300/70 pointer-events-none select-none" fill="none">
                        <path d="M10 65 C 40 10, 70 80, 100 20" stroke="currentColor" strokeWidth="0.9" />
                        <path d="M15 72 C 45 25, 75 90, 105 32" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 2" />
                        <path d="M20 80 C 50 40, 80 98, 110 42" stroke="currentColor" strokeWidth="0.75" />
                      </svg>
                    ),
                    dotColors: ["bg-emerald-600", "bg-amber-500", "bg-purple-600"],
                    fallbackObjectives: [
                      "L'objectif de ce chapitre est de résoudre...",
                      "L'objectif de ce chapitre est maîtrisé.",
                      "Systèmes linéaires"
                    ],
                    duration: "1hr",
                  },
                  {
                    pillClass: "bg-[#FCE7F3] text-[#BE185D]",
                    glowGradient: "from-pink-300/40 via-rose-200/20 to-transparent",
                    chapterBadge: displayNiveau || "Débutant",
                    sketch: (
                      <svg viewBox="0 0 80 80" className="absolute top-3 right-3 w-20 h-20 text-slate-300/70 pointer-events-none select-none" fill="none">
                        <rect x="10" y="10" width="60" height="60" rx="8" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 3" />
                        <path d="M15 65 Q 40 15, 65 65" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    ),
                    dotColors: ["bg-rose-500", "bg-purple-600", "bg-blue-600"],
                    fallbackObjectives: [
                      "L'objectif de ce chapitre est de résoudre...",
                      "L'objectif de ce chapitre est maîtrisé.",
                      "Équations non linéaires"
                    ],
                    duration: "2-3 heures",
                  },
                  {
                    pillClass: "bg-[#E0E7FF] text-[#4338CA]",
                    glowGradient: "from-sky-300/40 via-indigo-200/20 to-transparent",
                    chapterBadge: displayNiveau || "Débutant",
                    sketch: (
                      <svg viewBox="0 0 100 80" className="absolute top-2 right-2 w-28 h-24 text-slate-300/70 pointer-events-none select-none" fill="none">
                        <line x1="10" y1="70" x2="90" y2="70" stroke="currentColor" strokeWidth="0.9" />
                        <line x1="20" y1="10" x2="20" y2="70" stroke="currentColor" strokeWidth="0.9" />
                        <path d="M20 50 Q 55 10, 90 40" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    ),
                    dotColors: ["bg-indigo-600", "bg-cyan-600", "bg-amber-500"],
                    fallbackObjectives: [
                      "L'objectif de ce chapitre est de résoudre...",
                      "Approximation des intégrales définies",
                      "Évaluation de l'ordre de convergence"
                    ],
                    duration: "3-4 heures",
                  },
                  {
                    pillClass: "bg-[#CCFBF1] text-[#0F766E]",
                    glowGradient: "from-teal-300/40 via-cyan-200/20 to-transparent",
                    chapterBadge: displayNiveau || "Intermédiaire",
                    sketch: (
                      <svg viewBox="0 0 80 80" className="absolute top-3 right-3 w-20 h-20 text-slate-300/70 pointer-events-none select-none" fill="none">
                        <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="0.9" strokeDasharray="4 2" />
                        <circle cx="40" cy="40" r="16" stroke="currentColor" strokeWidth="0.9" />
                        <circle cx="40" cy="40" r="4" fill="currentColor" />
                      </svg>
                    ),
                    dotColors: ["bg-teal-600", "bg-emerald-600", "bg-blue-600"],
                    fallbackObjectives: [
                      "Minimisation sans contraintes",
                      "Méthodes du gradient et Newton",
                      "Visualisation des courbes de niveau"
                    ],
                    duration: "4 heures",
                  }
                ];

                return themes[index % themes.length];
              };

              const theme = getCardTheme(displayCategory, idx);
              const objectivesList = (Array.isArray(mod.objectifs) && mod.objectifs.length >= 3)
                ? mod.objectifs.slice(0, 3)
                : theme.fallbackObjectives;

              return (
                <div
                  key={mod.id}
                  className="group bg-white/85 backdrop-blur-2xl rounded-[32px] border-2 border-white/95 shadow-[0_16px_36px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 relative p-6 sm:p-7"
                >
                  {/* Subtle Background Math Sketch Watermark in Header */}
                  {theme.sketch}

                  {/* Soft Watercolor Glow Splash in Bottom-Right Corner */}
                  <div className={`absolute -right-6 -bottom-6 w-44 h-40 rounded-full bg-gradient-to-tl ${theme.glowGradient} blur-2xl pointer-events-none z-0`} />

                  {/* Top Badges Row */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold ${theme.pillClass}`}>
                      {displayCategory}
                    </span>
                    <span className="text-[11px] font-medium tracking-wide uppercase text-stone-500 bg-white/60 border border-stone-200/90 px-3 py-0.5 rounded-full shadow-2xs">
                      {theme.chapterBadge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="relative z-10 mt-5">
                    {editingModuleId === mod.id ? (
                      <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 shadow-xs">
                        <Input
                          value={editData.titre || ""}
                          onChange={e => setEditData({...editData, titre: e.target.value})}
                          placeholder="Title"
                          className="font-semibold text-base"
                        />
                        <Textarea
                          value={editData.description || ""}
                          onChange={e => setEditData({...editData, description: e.target.value})}
                          placeholder="Description"
                          className="resize-none text-xs"
                          rows={3}
                        />
                        <div className="flex gap-2 justify-end mt-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingModuleId(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => handleSaveModule(mod.id)}>Save</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-[1.18rem] font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                          {mod.titre}
                        </h2>
                        <p className="text-xs text-stone-500 font-normal line-clamp-2 mt-2 leading-relaxed">
                          {mod.description || "L'objectif de ce chapitre est de résoudre des systèmes de Cramer en utilisant des méthodes numériques avancées."}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Metadata Row: Duration & Lessons */}
                  <div className="relative z-10 flex items-center gap-4 text-xs text-stone-600 font-medium mt-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-stone-400" />
                      <span>{mod.duree || theme.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Book className="h-3.5 w-3.5 text-stone-400" />
                      <span>{mod.nb_lecons || 1} {mod.nb_lecons && mod.nb_lecons > 1 ? 'leçons' : 'leçon'}</span>
                    </div>
                  </div>

                  {/* Divider Line & Course Status */}
                  <div className="relative z-10 pt-3 border-t border-stone-200/70 flex items-center justify-between text-xs text-stone-600 font-medium mt-3">
                    <span>Statut du cours</span>
                    <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-900" />
                      100% interactif
                    </span>
                  </div>

                  {/* Objectives Section with Colorful Dots */}
                  <div className="relative z-10 mt-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 tracking-wider uppercase">
                      <span>🎯</span>
                      <span>OBJECTIFS DU CHAPITRE</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-stone-600">
                      {objectivesList.map((obj, i) => {
                        const dotClass = theme.dotColors[i % theme.dotColors.length];
                        return (
                          <li key={i} className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${dotClass} shrink-0`} />
                            <span className="line-clamp-1 font-medium text-stone-700">{obj}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Action Button: Start Learning */}
                  <div className="relative z-10 pt-5 mt-auto">
                    <button
                      onClick={() => navigate('/module/' + mod.id)}
                      className="w-full py-3.5 px-5 rounded-2xl bg-[#1D68EC] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <span>Start Learning</span>
                      <span className="text-base leading-none">→</span>
                    </button>

                    {user?.role === "professeur" && (
                      <div className="flex gap-2 w-full mt-2.5">
                        <Button size="sm" variant="secondary" className="flex-1 text-xs rounded-xl" onClick={() => {
                          setEditingModuleId(mod.id);
                          setEditData({
                            titre: mod.titre, description: mod.description, type: mod.type,
                            niveau: mod.niveau, categorie: mod.categorie, duree: mod.duree,
                            objectifs: mod.objectifs || [],
                          });
                        }}>
                          <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1 text-xs rounded-xl" onClick={() => handleDelete(mod.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {filteredModules.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-200 mt-8">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">No modules found</h3>
            <p className="text-slate-500 max-w-sm mb-6 text-sm">
              We couldn't find any modules matching "{searchTerm}". Try a different search term.
            </p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>Clear search</Button>
          </div>
        )}
      </main>

      <PublicFooter />

      {/* Edit/Add Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Module" : "Add Module"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input name="titre" value={form.titre} onChange={handleChange} placeholder="Title" required />
            <Input name="type" value={form.type} onChange={handleChange} placeholder="Type" required />
            <Input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
            <Input name="contenu" value={form.contenu} onChange={handleChange} placeholder="Content" />
            <Input name="niveau" value={form.niveau || ''} onChange={handleChange} placeholder="Level" />
            <Input name="categorie" value={form.categorie} onChange={handleChange} placeholder="Category" />
            <Input name="duree" value={form.duree} onChange={handleChange} placeholder="Duration" />
            <textarea
              name="objectifs"
              value={Array.isArray(form.objectifs) ? form.objectifs.join('\n') : ''}
              onChange={e => setForm({ ...form, objectifs: e.target.value.split('\n').filter(line => line.trim() !== '') })}
              placeholder="One objective per line"
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit">{editingId ? "Save" : "Add"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Modules;

/**
 * PracticePage - /practice
 * Interactive Trainer with 50+ validated numerical analysis problems.
 * Real-time answer auto-checking, progressive hints, "Open in Lab",
 * guest localStorage & DB progress synchronization.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HomeNavbar from '@/components/HomeNavbar';
import PublicFooter from '@/components/PublicFooter';
import { MathText } from '@/components/MathText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2, XCircle, RotateCcw, ChevronRight, BookOpen,
  Loader2, Trophy, Target, Sparkles, HelpCircle, ArrowRight,
  FlaskConical, AlertCircle, Search, Check, ExternalLink, Lightbulb
} from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { buildLabUrl } from '@/lib/labParams';
import {
  PublicExercise,
  Chapter,
  Difficulty,
  CheckAnswerResult,
  ExerciseProgress
} from '@/types/practice';

const CHAPTER_META: Record<Chapter, { label: string; color: string; bg: string }> = {
  nonlinear:     { label: 'Nonlinear Eq.',     color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
  linear:        { label: 'Linear Systems',    color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200' },
  integration:   { label: 'Integration',       color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  ode:           { label: 'Differential Eqs.', color: 'text-purple-600',  bg: 'bg-purple-50 border-purple-200' },
  differentiation:{ label: 'Differentiation',  color: 'text-fuchsia-600', bg: 'bg-fuchsia-50 border-fuchsia-200' },
  interpolation: { label: 'Interpolation',     color: 'text-rose-600',    bg: 'bg-rose-50 border-rose-200' },
  eigenvalue:    { label: 'Eigenvalues',       color: 'text-indigo-600',  bg: 'bg-indigo-50 border-indigo-200' },
};

const DIFFICULTY_META: Record<Difficulty, { label: string; badge: string }> = {
  easy:   { label: 'Easy',   badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  medium: { label: 'Medium', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  hard:   { label: 'Hard',   badge: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const CHAPTERS: Chapter[] = [
  'nonlinear', 'linear', 'integration', 'ode', 'differentiation', 'interpolation', 'eigenvalue'
];

export default function PracticePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Data state
  const [exercises, setExercises] = useState<PublicExercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedChapter, setSelectedChapter] = useState<Chapter | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unsolved' | 'attempted' | 'solved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Per-exercise user input & response
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [checkResults, setCheckResults] = useState<Record<string, CheckAnswerResult>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  // Progressive hints & solutions
  const [unlockedHints, setUnlockedHints] = useState<Record<string, string[]>>({});
  const [loadingHint, setLoadingHint] = useState<Record<string, boolean>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, string>>({});
  const [loadingSolution, setLoadingSolution] = useState<Record<string, boolean>>({});

  // Progress state
  const [progressMap, setProgressMap] = useState<Record<string, ExerciseProgress>>(() => {
    try {
      const saved = localStorage.getItem('numiviz_practice_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch exercises from backend
  useEffect(() => {
    async function loadExercises() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/practice/exercises`);
        if (res.ok) {
          const data: PublicExercise[] = await res.json();
          setExercises(data);
        }
      } catch (err) {
        console.error('Failed to load exercises:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExercises();
  }, []);

  // Save progress to localStorage and DB sync
  useEffect(() => {
    try {
      localStorage.setItem('numiviz_practice_progress', JSON.stringify(progressMap));
    } catch {}

    // Sync with backend if user is authenticated
    if (isAuthenticated && user?.id) {
      const items = Object.values(progressMap);
      if (items.length > 0) {
        fetch(`${API_BASE}/practice/progress/sync?user_id=${user.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        }).catch(() => {});
      }
    }
  }, [progressMap, isAuthenticated, user]);

  // Handle Answer Check
  const handleCheck = async (exercise: PublicExercise) => {
    const answer = userInputs[exercise.id] ?? '';
    if (!answer.trim()) return;

    setSubmitting((s) => ({ ...s, [exercise.id]: true }));
    try {
      const res = await fetch(`${API_BASE}/practice/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: exercise.id,
          answer: answer.trim(),
        }),
      });

      if (res.ok) {
        const data: CheckAnswerResult = await res.json();
        setCheckResults((prev) => ({ ...prev, [exercise.id]: data }));

        // Update progress state
        setProgressMap((prev) => {
          const current = prev[exercise.id] || {
            exercise_id: exercise.id,
            status: 'unsolved',
            hints_used: (unlockedHints[exercise.id] || []).length,
            attempts: 0,
          };

          const isSolved = data.status === 'correct';
          return {
            ...prev,
            [exercise.id]: {
              ...current,
              status: isSolved ? 'solved' : 'attempted',
              attempts: current.attempts + 1,
              solved_at: isSolved ? new Date().toISOString() : current.solved_at,
            },
          };
        });

        // Auto reveal solution on correct
        if (data.status === 'correct' && data.solution) {
          setRevealedSolutions((s) => ({ ...s, [exercise.id]: data.solution! }));
        }
      }
    } catch (err) {
      console.error('Check answer failed:', err);
    } finally {
      setSubmitting((s) => ({ ...s, [exercise.id]: false }));
    }
  };

  // Progressive Hint Unlocking
  const handleUnlockHint = async (exercise: PublicExercise) => {
    const currentHints = unlockedHints[exercise.id] || [];
    const nextLevel = currentHints.length + 1;
    if (nextLevel > exercise.hints_count) return;

    setLoadingHint((l) => ({ ...l, [exercise.id]: true }));
    try {
      const res = await fetch(`${API_BASE}/practice/exercises/${exercise.id}/hint/${nextLevel}`);
      if (res.ok) {
        const data = await res.json();
        setUnlockedHints((prev) => ({
          ...prev,
          [exercise.id]: [...(prev[exercise.id] || []), data.hint],
        }));

        // Track hints used in progress
        setProgressMap((prev) => {
          const curr = prev[exercise.id] || {
            exercise_id: exercise.id,
            status: 'unsolved',
            hints_used: 0,
            attempts: 0,
          };
          return {
            ...prev,
            [exercise.id]: {
              ...curr,
              hints_used: nextLevel,
            },
          };
        });
      }
    } catch (err) {
      console.error('Failed to load hint:', err);
    } finally {
      setLoadingHint((l) => ({ ...l, [exercise.id]: false }));
    }
  };

  // Reveal Full Solution
  const handleRevealSolution = async (exercise: PublicExercise) => {
    if (revealedSolutions[exercise.id]) return;

    setLoadingSolution((l) => ({ ...l, [exercise.id]: true }));
    try {
      const res = await fetch(`${API_BASE}/practice/exercises/${exercise.id}/solution`);
      if (res.ok) {
        const data = await res.json();
        setRevealedSolutions((prev) => ({ ...prev, [exercise.id]: data.solution }));
      }
    } catch (err) {
      console.error('Failed to reveal solution:', err);
    } finally {
      setLoadingSolution((l) => ({ ...l, [exercise.id]: false }));
    }
  };

  // Filter exercises
  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      if (selectedChapter !== 'all' && ex.chapter !== selectedChapter) return false;
      if (selectedDifficulty !== 'all' && ex.difficulty !== selectedDifficulty) return false;

      const prog = progressMap[ex.id]?.status || 'unsolved';
      if (selectedStatus !== 'all' && prog !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ex.title.toLowerCase().includes(q);
        const matchesStmt = ex.statement.toLowerCase().includes(q);
        const matchesMethod = ex.method.toLowerCase().includes(q);
        if (!matchesTitle && !matchesStmt && !matchesMethod) return false;
      }

      return true;
    });
  }, [exercises, selectedChapter, selectedDifficulty, selectedStatus, searchQuery, progressMap]);

  // Overall statistics
  const totalSolved = Object.values(progressMap).filter((p) => p.status === 'solved').length;
  const totalAttempted = Object.values(progressMap).filter((p) => p.status === 'attempted').length;
  const totalCount = exercises.length || 52;
  const progressPercent = Math.round((totalSolved / totalCount) * 100);

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
            <pattern id="pracGridLeft" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="96" height="192" fill="url(#pracGridLeft)" />
        </svg>
      </div>

      <div className="hidden xl:block absolute right-4 top-36 w-24 h-48 rounded-2xl border-2 border-amber-300/50 bg-amber-50/15 overflow-hidden pointer-events-none z-0">
        <svg viewBox="0 0 96 192" className="w-full h-full opacity-40">
          <defs>
            <pattern id="pracGridRight" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#F59E0B" strokeWidth="0.65" />
            </pattern>
          </defs>
          <rect width="96" height="192" fill="url(#pracGridRight)" />
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

      <HomeNavbar scrolled={scrolled} />

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
        {/* Header Hero */}
        <div className="bg-white/85 backdrop-blur-2xl rounded-[32px] p-7 sm:p-9 border-2 border-white shadow-[0_16px_40px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.03)] relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Practice{' '}
                <span className="relative inline-block text-slate-900">
                  Laboratory
                  <svg
                    className="absolute -bottom-1.5 inset-x-0 w-full h-3 text-amber-400 pointer-events-none overflow-visible"
                    viewBox="0 0 160 12"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 2 7 C 45 2, 115 2, 158 7"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Test your numerical methods knowledge with automated step-by-step verification,
                intelligent sign & precision feedback, progressive hints, and direct execution in the Numerical Lab.
              </p>
            </div>

            {/* Overall Progress Widget */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 min-w-[280px] space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Your Mastery
                </span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {progressPercent}% Solved
                </span>
              </div>
              <Progress value={progressPercent} className="h-2.5 bg-slate-200" />
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>{totalSolved} solved</span>
                <span>{totalAttempted} in progress</span>
                <span>{totalCount} total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white/85 backdrop-blur-2xl rounded-[28px] p-6 border-2 border-white shadow-[0_12px_32px_rgba(0,0,0,0.05)] space-y-4">
          {/* Top row: Search and Difficulty */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by topic, formula, or method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              />
            </div>

            {/* Status pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {(['all', 'unsolved', 'attempted', 'solved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    selectedStatus === st
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
            <button
              onClick={() => setSelectedChapter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedChapter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Chapters ({exercises.length})
            </button>
            {CHAPTERS.map((ch) => {
              const meta = CHAPTER_META[ch];
              const count = exercises.filter((e) => e.chapter === ch).length;
              const isSelected = selectedChapter === ch;
              return (
                <button
                  key={ch}
                  onClick={() => setSelectedChapter(ch)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{meta.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercises List */}
        {loading ? (
          <div className="py-24 text-center text-slate-500 space-y-3 bg-white rounded-3xl border border-slate-200/80">
            <Loader2 className="h-7 w-7 animate-spin mx-auto text-blue-600" />
            <p className="text-sm font-medium">Loading practice problems...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-2">
            <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
            <h3 className="font-semibold text-slate-800 text-base">No problems match your filters</h3>
            <p className="text-xs text-slate-500">Try selecting a different chapter or resetting the search query.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSelectedChapter('all'); setSelectedStatus('all'); setSearchQuery(''); }}
              className="mt-2 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((ex, idx) => {
              const chMeta = CHAPTER_META[ex.chapter];
              const diffMeta = DIFFICULTY_META[ex.difficulty];
              const result = checkResults[ex.id];
              const isSolved = progressMap[ex.id]?.status === 'solved' || result?.status === 'correct';
              const hints = unlockedHints[ex.id] || [];
              const solution = revealedSolutions[ex.id];
              const labUrl = buildLabUrl(ex.method, ex.params);

              return (
                <div
                  key={ex.id}
                  className={`group bg-white/85 backdrop-blur-2xl rounded-[28px] border-2 transition-all duration-300 overflow-hidden shadow-[0_14px_35px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 ${
                    isSolved
                      ? 'border-emerald-400/80 ring-2 ring-emerald-500/20'
                      : result?.status === 'close'
                      ? 'border-amber-400/80 ring-2 ring-amber-500/20'
                      : result?.status === 'wrong'
                      ? 'border-rose-400/80 ring-2 ring-rose-500/20'
                      : 'border-white hover:border-blue-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-white">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        #{idx + 1}
                      </span>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${chMeta.bg} ${chMeta.color}`}>
                        {chMeta.label}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${diffMeta.badge}`}>
                        {diffMeta.label}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 uppercase">
                        {ex.method}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSolved && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Solved
                        </span>
                      )}

                      {/* "Open in Lab" Quick Action Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(labUrl)}
                        className="h-8 text-xs font-semibold gap-1.5 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100/70 hover:border-blue-300 transition"
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        Open in Lab
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </Button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mb-2">
                        {ex.title}
                      </h3>
                      <div className="text-sm text-slate-700 leading-relaxed font-sans">
                        <MathText text={ex.statement} />
                      </div>
                    </div>

                    {/* Answer Input Section */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-stone-200/90 shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        <div className="flex-1">
                          <Input
                            placeholder={
                              ex.type === 'numeric'
                                ? 'Enter numerical answer (e.g. 1.414 or sqrt(2))...'
                                : ex.type === 'next_iteration'
                                ? 'Enter next iteration value x_k...'
                                : 'Enter value or answer...'
                            }
                            value={userInputs[ex.id] ?? ''}
                            onChange={(e) =>
                              setUserInputs((u) => ({ ...u, [ex.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCheck(ex);
                            }}
                            className="bg-white font-mono text-xs sm:text-sm h-10 border-slate-300"
                          />
                        </div>

                        <Button
                          onClick={() => handleCheck(ex)}
                          disabled={submitting[ex.id] || !(userInputs[ex.id] || '').trim()}
                          className="h-10 text-xs font-semibold px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs shrink-0"
                        >
                          {submitting[ex.id] ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                              Verifying...
                            </>
                          ) : isSolved ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1.5" />
                              Check Again
                            </>
                          ) : (
                            'Submit Answer'
                          )}
                        </Button>
                      </div>

                      {/* Real-time Feedback Alert */}
                      {result && (
                        <div
                          className={`p-3 rounded-lg text-xs flex items-start gap-2.5 transition ${
                            result.status === 'correct'
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                              : result.status === 'close'
                              ? 'bg-amber-50 border border-amber-200 text-amber-800'
                              : result.status === 'invalid'
                              ? 'bg-purple-50 border border-purple-200 text-purple-800'
                              : 'bg-rose-50 border border-rose-200 text-rose-800'
                          }`}
                        >
                          {result.status === 'correct' ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                          ) : result.status === 'close' ? (
                            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                          )}
                          <div className="space-y-0.5">
                            <p className="font-semibold">{result.message}</p>
                            {result.details && (
                              <p className="text-[11px] opacity-80">{result.details}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progressive Hints Drawer */}
                    {hints.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {hints.map((hintText, hIdx) => (
                          <div
                            key={hIdx}
                            className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5"
                          >
                            <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <span className="font-bold text-amber-800">
                                Hint {hIdx + 1}:
                              </span>{' '}
                              <MathText text={hintText} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Unlocked Solution Display */}
                    {solution && (
                      <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 border border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Step-by-Step Solution
                        </div>
                        <div className="text-xs text-slate-200 font-sans leading-relaxed">
                          <MathText text={solution} />
                        </div>
                      </div>
                    )}

                    {/* Card Actions Footer: Progressive Hints & Reveal Solution */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                      <div className="flex items-center gap-2">
                        {hints.length < ex.hints_count && (
                          <button
                            onClick={() => handleUnlockHint(ex)}
                            disabled={loadingHint[ex.id]}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-amber-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-amber-50 transition"
                          >
                            <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                            {loadingHint[ex.id]
                              ? 'Unlocking Hint...'
                              : `Show Hint (${hints.length + 1} of ${ex.hints_count})`}
                          </button>
                        )}

                        {!solution && (
                          <button
                            onClick={() => handleRevealSolution(ex)}
                            disabled={loadingSolution[ex.id]}
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100 transition"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            {loadingSolution[ex.id] ? 'Loading Solution...' : 'Reveal Solution'}
                          </button>
                        )}
                      </div>

                      {progressMap[ex.id]?.attempts ? (
                        <span className="text-[11px] text-slate-400">
                          {progressMap[ex.id].attempts} attempt
                          {progressMap[ex.id].attempts > 1 ? 's' : ''}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      
        {/* --- FORMULA SHEETS SECTION (Matching NumiViz Style Guide) --- */}
        <section className="pt-10 border-t border-slate-200/60 space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Formula Sheets</h2>
            <p className="text-sm text-slate-500">Quick-reference formulas for all major methods.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Root Finding */}
            <div className="bg-white/85 backdrop-blur-2xl rounded-[28px] border-2 border-white shadow-[0_14px_35px_rgba(0,0,0,0.06)] p-6 sm:p-7 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Root Finding</h3>
                <span className="text-base font-bold text-purple-400 select-none">÷ × + =</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Newton-Raphson</div>
                  <div className="p-2.5 rounded-xl bg-[#EDE9FE]/70 text-[#6D28D9] font-mono font-medium">
                    {"x_{n+1} = x_n - f(x_n)/f'(x_n)"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Bisection</div>
                  <div className="p-2.5 rounded-xl bg-[#EDE9FE]/70 text-[#6D28D9] font-mono font-medium">
                    c = (a + b)/2, sign check f(a)·f(c)
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Secant</div>
                  <div className="p-2.5 rounded-xl bg-[#EDE9FE]/70 text-[#6D28D9] font-mono font-medium text-[11px] overflow-x-auto">
                    {"x_{n+1} = x_n - f(x_n)(x_n - x_{n-1})/(f(x_n) - f(x_{n-1}))"}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Integration */}
            <div className="bg-white/85 backdrop-blur-2xl rounded-[28px] border-2 border-white shadow-[0_14px_35px_rgba(0,0,0,0.06)] p-6 sm:p-7 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Integration</h3>
                  <p className="text-[11px] text-slate-400">Area and accumulation.</p>
                </div>
                <div className="w-12 h-8">
                  <svg viewBox="0 0 50 30" className="w-full h-full">
                    <path d="M5,25 Q25,5 45,20" stroke="#F59E0B" strokeWidth="2" fill="none" />
                    <line x1="12" y1="20" x2="12" y2="28" stroke="#FBBF24" strokeWidth="1" strokeDasharray="1 1" />
                    <line x1="38" y1="18" x2="38" y2="28" stroke="#FBBF24" strokeWidth="1" strokeDasharray="1 1" />
                  </svg>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Trapezoidal</div>
                  <div className="p-2.5 rounded-xl bg-[#FEF3C7] text-[#B45309] font-mono font-medium text-[11px] overflow-x-auto">
                    h/2 · [f(x_0) + 2Σf(x_i) + f(x_n)]
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Simpson's 1/3</div>
                  <div className="p-2.5 rounded-xl bg-[#FEF3C7] text-[#B45309] font-mono font-medium text-[11px] overflow-x-auto">
                    h/3 · [f(x_0) + 4f(x_1) + 2f(x_2) + ... + f(x_n)]
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Differentiate & ODE Solvers */}
            <div className="bg-white/85 backdrop-blur-2xl rounded-[28px] border-2 border-white shadow-[0_14px_35px_rgba(0,0,0,0.06)] p-6 sm:p-7 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Differentiate & ODE Solvers</h3>
                  <p className="text-[11px] text-slate-400">Stepwise state progression.</p>
                </div>
                <div className="w-12 h-8">
                  <svg viewBox="0 0 50 30" className="w-full h-full">
                    <path d="M5,15 Q20,5 35,25 T48,15" stroke="#F43F5E" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Euler</div>
                  <div className="p-2.5 rounded-xl bg-[#FFE4E6] text-[#E11D48] font-mono font-medium">
                    {"y_{t+1} = y_t + h·f(x_t, y_t)"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">RK4 (Runge-Kutta 4)</div>
                  <div className="p-2.5 rounded-xl bg-[#FFE4E6] text-[#E11D48] font-mono font-medium text-[11px] overflow-x-auto">
                    {"y_{t+1} = y_t + h/6·(k_1 + 2k_2 + 2k_3 + k_4)"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <PublicFooter />
    </div>
  );
}
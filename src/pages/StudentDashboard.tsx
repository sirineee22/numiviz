/**
 * StudentDashboard — /dashboard
 * Purpose: Continue learning, track progress, see recent quiz activity.
 * APIs: GET /modules, GET /progress/module/{uid}/{mid}, GET /quizzes/results/{uid}
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, ArrowRight, CheckCircle2, Clock,
  Trophy, FlaskConical, Target, Loader2, History,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface ModuleRow {
  id: number;
  titre: string;
  niveau: string | null;
  duree: string | null;
}
interface ModuleProgress {
  overall_progress: number;
  video_progress: number;
  quiz_score: number;
  total_videos: number;
  watched_videos: number;
}
interface QuizResult {
  id_score: number;
  module_title: string;
  lesson_title: string;
  score: number;
  total_questions: number;
  passed: boolean;
  completed_at: string;
}
interface ModuleWithProgress extends ModuleRow {
  progress: ModuleProgress | null;
}

const LEVEL_COLORS: Record<string, string> = {
  Débutant:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  Intermédiaire: 'bg-amber-50 text-amber-700 border-amber-200',
  Avancé:        'bg-red-50 text-red-700 border-red-200',
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const modRes = await fetch(`${API_BASE}/modules`);
        const mods: ModuleRow[] = await modRes.json();
        const withProgress = await Promise.all(
          mods.map(async (m) => {
            try {
              const pRes = await fetch(`${API_BASE}/progress/module/${user.id}/${m.id}`);
              const progress: ModuleProgress = pRes.ok ? await pRes.json() : null;
              return { ...m, progress };
            } catch { return { ...m, progress: null }; }
          })
        );
        setModules(withProgress);
        const qRes = await fetch(`${API_BASE}/quizzes/results/${user.id}`);
        if (qRes.ok) setQuizResults(await qRes.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (!user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">Please log in to see your dashboard.</p>
        <button className="btn-primary" onClick={() => navigate('/auth')}>Log in</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  // ── Derived data ──────────────────────────────────────────────────────────
  const inProgress = modules
    .filter(m => (m.progress?.overall_progress ?? 0) > 0 && (m.progress?.overall_progress ?? 0) < 99)
    .sort((a, b) => (b.progress?.overall_progress ?? 0) - (a.progress?.overall_progress ?? 0));

  const notStarted = modules.filter(m => !m.progress?.overall_progress);
  const completed   = modules.filter(m => (m.progress?.overall_progress ?? 0) >= 99);

  const overallPct = modules.length > 0
    ? Math.round(modules.reduce((s, m) => s + (m.progress?.overall_progress ?? 0), 0) / modules.length)
    : 0;

  const recentQuizzes = quizResults.slice(0, 4);
  const passedCount   = quizResults.filter(r => r.passed).length;

  const continueModule = inProgress[0] ?? notStarted[0] ?? null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {completed.length > 0
              ? `${completed.length} module${completed.length > 1 ? 's' : ''} completed · keep going`
              : 'Start learning numerical analysis'}
          </p>
        </div>
        <button
          onClick={() => navigate('/tools')}
          className="btn-primary shrink-0 group"
        >
          <FlaskConical className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
          Open Lab
        </button>
      </div>

      {/* ── Continue learning — main CTA ───────────────────────────── */}
      {continueModule && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Continue learning
          </h2>
          <button
            onClick={() => navigate(`/module/${continueModule.id}`)}
            className="w-full bg-white border border-slate-200 rounded-xl p-5
              hover:border-blue-300 hover:shadow-[0_4px_20px_rgba(26,86,219,0.08)]
              transition-all duration-200 text-left group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-200
                  flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 text-[15px] truncate">
                    {continueModule.titre}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {continueModule.niveau && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border
                        ${LEVEL_COLORS[continueModule.niveau] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {continueModule.niveau}
                      </span>
                    )}
                    {continueModule.duree && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{continueModule.duree}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600
                group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span className="font-mono font-medium text-slate-700">
                  {Math.round(continueModule.progress?.overall_progress ?? 0)}%
                </span>
              </div>
              <Progress value={continueModule.progress?.overall_progress ?? 0} className="h-1.5" />
            </div>
          </button>
        </section>
      )}

      {/* ── Stats row ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Overall',
            value: `${overallPct}%`,
            sub: 'completion',
            icon: Target,
            color: 'text-blue-600',
            bg: 'bg-blue-50 border-blue-200',
          },
          {
            label: 'Completed',
            value: String(completed.length),
            sub: `of ${modules.length} modules`,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-200',
          },
          {
            label: 'Quizzes',
            value: String(passedCount),
            sub: `of ${quizResults.length} passed`,
            icon: Trophy,
            color: 'text-amber-600',
            bg: 'bg-amber-50 border-amber-200',
          },
          {
            label: 'In Progress',
            value: String(inProgress.length),
            sub: `${notStarted.length} not started`,
            icon: BookOpen,
            color: 'text-violet-600',
            bg: 'bg-violet-50 border-violet-200',
          },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-4">
            <div className={`h-8 w-8 rounded-lg ${s.bg} border flex items-center justify-center mb-3`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900 leading-none">{s.value}</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-tight">{s.label}</div>
            <div className="text-[11px] text-slate-400">{s.sub}</div>
          </div>
        ))}
      </section>

      {/* ── Bottom two-col ─────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* All modules */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              All modules
            </h2>
            <button
              onClick={() => navigate('/modules')}
              className="text-xs text-blue-600 hover:underline underline-offset-2 flex items-center gap-0.5"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {modules.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-400">No modules available yet.</p>
              </div>
            ) : (
              modules.slice(0, 5).map(m => {
                const pct = Math.round(m.progress?.overall_progress ?? 0);
                return (
                  <button
                    key={m.id}
                    onClick={() => navigate(`/module/${m.id}`)}
                    className="w-full flex items-center gap-3 bg-white border border-slate-200 rounded-lg
                      px-3 py-2.5 hover:border-blue-300 hover:shadow-sm transition-all text-left group"
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border ${
                      pct >= 99
                        ? 'bg-emerald-50 border-emerald-200'
                        : pct > 0
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      {pct >= 99
                        ? <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        : <BookOpen className={`h-3 w-3 ${pct > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-slate-800 truncate">{m.titre}</div>
                      <Progress value={pct} className="h-0.5 mt-1" />
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 shrink-0">{pct}%</span>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Recent quiz results */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Recent quiz results
            </h2>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-blue-600 hover:underline underline-offset-2 flex items-center gap-0.5"
            >
              <History className="h-3 w-3" /> History
            </button>
          </div>
          <div className="space-y-2">
            {recentQuizzes.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-400">No quizzes taken yet.</p>
                <button
                  onClick={() => navigate('/modules')}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  Start a module →
                </button>
              </div>
            ) : (
              recentQuizzes.map(r => (
                <div key={r.id_score}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-slate-800 truncate">
                        {r.lesson_title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {r.module_title}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      r.passed
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-red-700 bg-red-50 border-red-200'
                    }`}>
                      {Math.round(r.score)}%
                    </span>
                  </div>
                  <Progress value={r.score} className="h-0.5 mt-2" />
                </div>
              ))
            )}
          </div>

          {/* Practice shortcut */}
          <button
            onClick={() => navigate('/practice')}
            className="w-full mt-3 flex items-center justify-center gap-2
              border border-dashed border-slate-200 rounded-lg px-4 py-3
              text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600
              hover:bg-blue-50/50 transition-all duration-150 group"
          >
            <Target className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Practice exercises
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </section>
      </div>
    </div>
  );
}

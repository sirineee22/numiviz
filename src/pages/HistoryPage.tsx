/**
 * HistoryPage — /history
 * Shows linear system history + calculation history from the iterative solver.
 * Allows reopening, deleting, and clearing.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeNavbar from '@/components/HomeNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trash2, ExternalLink, Download, RefreshCw, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, Loader2, Clock,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface LinearHistory {
  id: number;
  equation1: string;
  equation2: string;
  solution_type: string;
  solution_x: number | null;
  solution_y: number | null;
  timestamp: string;
}

interface CalcHistory {
  id: number;
  method: string;
  category: string;
  problem: string;
  params: Record<string, unknown> | null;
  result: number | null;
  iterations: number | null;
  converged: boolean | null;
  timestamp: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  nonlinear:       'bg-orange-100 text-orange-700',
  'linear-iter':   'bg-blue-100 text-blue-700',
  integration:     'bg-teal-100 text-teal-700',
  ode:             'bg-purple-100 text-purple-700',
  differentiation: 'bg-rose-100 text-rose-700',
  'linear-system': 'bg-slate-100 text-slate-700',
};

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const [linearHistory, setLinearHistory] = useState<LinearHistory[]>([]);
  const [calcHistory, setCalcHistory] = useState<CalcHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [lRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/api/history/linear-system/${user.id}`),
        fetch(`${API_BASE}/api/calc-history/${user.id}`),
      ]);
      if (lRes.ok) setLinearHistory(await lRes.json());
      if (cRes.ok) setCalcHistory(await cRes.json());
    } catch (e) {
      console.error('History load error', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteLinear = async (id: number) => {
    await fetch(`${API_BASE}/api/history/linear-system/${user?.id}`, { method: 'DELETE' });
    setLinearHistory([]);
  };

  const deleteSingle = async (id: number) => {
    await fetch(`${API_BASE}/api/calc-history/${id}`, { method: 'DELETE' });
    setCalcHistory((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAll = async () => {
    if (!user) return;
    if (!window.confirm('Clear all calculation history?')) return;
    await fetch(`${API_BASE}/api/calc-history/user/${user.id}/all`, { method: 'DELETE' });
    setCalcHistory([]);
  };

  const exportCSV = (rows: (LinearHistory | CalcHistory)[], filename: string) => {
    const isLinear = (r: LinearHistory | CalcHistory): r is LinearHistory =>
      'equation1' in r;

    const header = isLinear(rows[0] as LinearHistory)
      ? 'id,equation1,equation2,solution_type,x,y,timestamp'
      : 'id,method,category,problem,result,iterations,converged,timestamp';

    const lines = rows.map((r) => {
      if (isLinear(r)) {
        return `${r.id},"${r.equation1}","${r.equation2}",${r.solution_type},${r.solution_x ?? ''},${r.solution_y ?? ''},${r.timestamp}`;
      }
      return `${r.id},${r.method},${r.category},"${r.problem}",${r.result ?? ''},${r.iterations ?? ''},${r.converged ?? ''},${r.timestamp}`;
    });

    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (key: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(key)) { n.delete(key); } else { n.add(key); }
      return n;
    });

  const fmtDate = (ts: string) =>
    new Date(ts).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Button onClick={() => navigate('/auth')}>Log in to see history</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <HomeNavbar scrolled={scrolled} />
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calculation History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All your previous computations. Click any row to expand details.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {/* Linear System History */}
      {(linearHistory.length > 0 || !loading) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              Linear System Solver
              <Badge variant="secondary">{linearHistory.length}</Badge>
            </h2>
            <div className="flex gap-2">
              {linearHistory.length > 0 && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => exportCSV(linearHistory, 'linear_history.csv')} className="gap-1.5">
                    <Download className="h-4 w-4" /> CSV
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteLinear(0)} className="gap-1.5 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" /> Clear all
                  </Button>
                </>
              )}
            </div>
          </div>

          {linearHistory.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              {linearHistory.map((r, idx) => {
                const key = `lin-${r.id}`;
                const isExp = expanded.has(key);
                return (
                  <div key={r.id} className={`border-b border-border/50 last:border-0 ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                    <button
                      onClick={() => toggleExpand(key)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                    >
                      {isExp ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                      <span className="font-mono text-sm flex-1 truncate">{r.equation1} ; {r.equation2}</span>
                      <Badge variant={r.solution_type === 'unique' ? 'default' : 'secondary'} className="text-xs shrink-0">
                        {r.solution_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{fmtDate(r.timestamp)}
                      </span>
                    </button>
                    {isExp && (
                      <div className="px-10 pb-4 space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Equation 1: <span className="font-mono text-foreground">{r.equation1}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Equation 2: <span className="font-mono text-foreground">{r.equation2}</span>
                        </div>
                        {r.solution_x != null && (
                          <div className="text-sm">
                            Solution: <span className="font-mono font-semibold">x = {r.solution_x.toPrecision(8)}, y = {r.solution_y?.toPrecision(8)}</span>
                          </div>
                        )}
                        <Button
                          size="sm" variant="outline" className="gap-1.5 mt-2"
                          onClick={() => navigate('/tools')}
                        >
                          <ExternalLink className="h-3 w-3" /> Reopen in solver
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Calculation History */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            Iterative Calculations
            <Badge variant="secondary">{calcHistory.length}</Badge>
          </h2>
          <div className="flex gap-2">
            {calcHistory.length > 0 && (
              <>
                <Button size="sm" variant="ghost" onClick={() => exportCSV(calcHistory, 'calc_history.csv')} className="gap-1.5">
                  <Download className="h-4 w-4" /> CSV
                </Button>
                <Button size="sm" variant="ghost" onClick={clearAll} className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" /> Clear all
                </Button>
              </>
            )}
          </div>
        </div>

        {calcHistory.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            {calcHistory.map((r, idx) => {
              const key = `calc-${r.id}`;
              const isExp = expanded.has(key);
              return (
                <div key={r.id} className={`border-b border-border/50 last:border-0 ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <button onClick={() => toggleExpand(key)} className="flex items-center gap-3 flex-1 text-left hover:bg-muted/10 -mx-4 px-4 py-2 transition-colors min-w-0">
                      {isExp ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[r.category] ?? 'bg-muted text-muted-foreground'} shrink-0`}>
                        {r.category}
                      </span>
                      <span className="font-medium text-sm shrink-0">{r.method}</span>
                      <span className="font-mono text-xs text-muted-foreground truncate">{r.problem}</span>
                    </button>
                    {r.converged != null && (
                      r.converged
                        ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        : <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />{fmtDate(r.timestamp)}
                    </span>
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => deleteSingle(r.id)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {isExp && (
                    <div className="px-10 pb-4 space-y-2 text-sm">
                      <div className="text-muted-foreground">
                        Problem: <span className="font-mono text-foreground">{r.problem}</span>
                      </div>
                      {r.result != null && (
                        <div className="text-muted-foreground">
                          Result: <span className="font-mono font-semibold text-foreground">{r.result.toPrecision(10)}</span>
                        </div>
                      )}
                      {r.iterations != null && (
                        <div className="text-muted-foreground">
                          Iterations: <span className="font-semibold text-foreground">{r.iterations}</span>
                        </div>
                      )}
                      {r.params && (
                        <div className="text-muted-foreground">
                          Parameters: <span className="font-mono text-xs text-foreground">{JSON.stringify(r.params)}</span>
                        </div>
                      )}
                      <Button
                        size="sm" variant="outline" className="gap-1.5 mt-1"
                        onClick={() => navigate('/tools')}
                      >
                        <ExternalLink className="h-3 w-3" /> Open in Lab
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-10 text-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
      No history yet. Use the math tools to start computing.
    </div>
  );
}

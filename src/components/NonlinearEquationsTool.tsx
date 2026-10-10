import { useLabInitialParams } from '@/lib/labParams';
/**
 * NonlinearEquationsTool
 * Replaces EquationsNonLineairesInteractiveGraph with a full iterative solver experience.
 * Methods: Newton-Raphson · Bisection · Fixed Point · Secant
 */
import React, { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import IterativeSolverPanel, { SolverResult } from './IterativeSolverPanel';
import CompareMethodsPanel from './CompareMethodsPanel';
import { API_BASE } from '@/lib/api';

interface FormState {
  fx: string;
  x0: string;
  x1: string;
  gx: string;
  tol: string;
  maxIter: string;
}

const DEFAULTS: FormState = {
  fx: 'x**3 - 2*x - 5',
  x0: '2',
  x1: '3',
  gx: '',
  tol: '1e-8',
  maxIter: '50',
};

const METHOD_COLORS: Record<string, string> = {
  newton:     'text-orange-600',
  bisection:  'text-teal-600',
  fixedpoint: 'text-purple-600',
  secant:     'text-blue-600',
};

const METHOD_LABELS: Record<string, string> = {
  newton:     'Newton-Raphson',
  bisection:  'Bisection',
  fixedpoint: 'Fixed Point',
  secant:     'Secant',
};

export default function NonlinearEquationsTool({ defaultMethod = 'newton' }: { defaultMethod?: string }) {
  const initial = useLabInitialParams(DEFAULTS);
  const [form, setForm] = useState<FormState>(initial);
  const [results, setResults] = useState<Record<string, SolverResult>>({});

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const buildFetch = useCallback(
    (method: string) => async (): Promise<SolverResult> => {
      const body: Record<string, unknown> = {
        fx: form.fx,
        method,
        x0: parseFloat(form.x0),
        tol: parseFloat(form.tol) || 1e-8,
        max_iter: parseInt(form.maxIter) || 50,
      };
      if (method === 'bisection' || method === 'secant') {
        body.x1 = parseFloat(form.x1);
      }
      if (method === 'fixedpoint' && form.gx.trim()) {
        body.gx = form.gx.trim();
      }
      const res = await fetch(`${API_BASE}/api/iterative/nonlinear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(d?.detail || `HTTP ${res.status}`);
      }
      return res.json();
    },
    [form]
  );

  const handleResult = (method: string) => (r: SolverResult) =>
    setResults((prev) => ({ ...prev, [method]: r }));

  const inputClass = 'font-mono text-sm';

  return (
    <div className="space-y-6">
      {/* ── Parameter inputs ───────────────────────────────── */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Problem Setup
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>f(x) &mdash; find root of f(x)=0</Label>
            <Input className={inputClass} value={form.fx} onChange={set('fx')}
              placeholder="e.g. x**3 - 2*x - 5" />
            <p className="text-xs text-muted-foreground">Use ** for power, * for multiply</p>
          </div>
          <div className="space-y-1">
            <Label>x₀ — initial guess (or left bound a)</Label>
            <Input className={inputClass} type="number" value={form.x0} onChange={set('x0')} />
          </div>
          <div className="space-y-1">
            <Label>x₁ — right bound b (Bisection) / 2nd point (Secant)</Label>
            <Input className={inputClass} type="number" value={form.x1} onChange={set('x1')} />
          </div>
          <div className="space-y-1">
            <Label>g(x) — for Fixed Point: x = g(x)</Label>
            <Input className={inputClass} value={form.gx} onChange={set('gx')}
              placeholder="leave blank to use x - f(x)" />
          </div>
          <div className="space-y-1">
            <Label>Tolerance</Label>
            <Input className={inputClass} value={form.tol} onChange={set('tol')} placeholder="1e-8" />
          </div>
          <div className="space-y-1">
            <Label>Max Iterations</Label>
            <Input className={inputClass} type="number" value={form.maxIter} onChange={set('maxIter')} />
          </div>
        </div>
      </div>

      {/* ── Method tabs ────────────────────────────────────── */}
      <Tabs defaultValue={defaultMethod}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {Object.entries(METHOD_LABELS).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="text-sm">
              {label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="compare" className="text-sm">
            Compare All
          </TabsTrigger>
        </TabsList>

        {Object.keys(METHOD_LABELS).map((method) => (
          <TabsContent key={method} value={method} className="mt-4">
            <div className="rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold text-base ${METHOD_COLORS[method]}`}>
                  {METHOD_LABELS[method]}
                </h3>
                {results[method] && (
                  <Badge variant={results[method].converged ? 'default' : 'destructive'}>
                    {results[method].converged ? '✓ Converged' : '✗ Not converged'}
                  </Badge>
                )}
              </div>

              {method === 'bisection' && (
                <p className="text-xs text-muted-foreground">
                  Requires f(a)·f(b) &lt; 0. Uses x₀ as <em>a</em> and x₁ as <em>b</em>.
                </p>
              )}
              {method === 'secant' && (
                <p className="text-xs text-muted-foreground">
                  Uses x₀ and x₁ as the two starting points.
                </p>
              )}
              {method === 'fixedpoint' && (
                <p className="text-xs text-muted-foreground">
                  Iterates x ← g(x). If g(x) is blank, uses g(x) = x − f(x).
                </p>
              )}
              {method === 'newton' && (
                <p className="text-xs text-muted-foreground">
                  Uses numerical derivative f′(x) ≈ [f(x+h)−f(x−h)] / 2h.
                </p>
              )}

              <IterativeSolverPanel
                key={method + form.fx + form.x0}
                title={METHOD_LABELS[method]}
                fetchIterations={buildFetch(method)}
                onResult={handleResult(method)}
              />
            </div>
          </TabsContent>
        ))}

        <TabsContent value="compare" className="mt-4">
          <CompareMethodsPanel
            methods={Object.keys(METHOD_LABELS)}
            methodLabels={METHOD_LABELS}
            fetchMethod={buildFetch}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * EigenvalueTool
 * Power Method · Inverse Power Method
 * Shows Rayleigh quotient convergence per iteration.
 */
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Plus, Minus, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { API_BASE } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface EigenIterRow {
  iteration: number;
  eigenvalue: number;
  error: number;
  rel_error: number;
  eigenvector_norm: number;
}

interface EigenResult {
  method: string;
  eigenvalue: number;
  eigenvector: number[];
  iterations: EigenIterRow[];
  converged: boolean;
  stopping_reason: string;
  final_error: number;
  total_iterations: number;
  shift?: number | null;
}

const SCI = (v: number | null | undefined) =>
  v == null || !isFinite(v) ? '—' : v.toExponential(4);

const FMT = (v: number, d = 8) => v.toPrecision(d);

// ─── Matrix editor ────────────────────────────────────────────────────────────
function MatrixEditor({
  A, setA, n, setN,
}: {
  A: number[][];
  setA: React.Dispatch<React.SetStateAction<number[][]>>;
  n: number;
  setN: (n: number) => void;
}) {
  const resize = (newN: number) => {
    const clamped = Math.max(2, Math.min(8, newN));
    setN(clamped);
    setA(prev =>
      Array.from({ length: clamped }, (_, i) =>
        Array.from({ length: clamped }, (_, j) =>
          prev[i]?.[j] ?? (i === j ? 1 : 0)
        )
      )
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-xs">Matrix A ({n}×{n})</Label>
        <button
          type="button"
          onClick={() => resize(n - 1)}
          className="h-5 w-5 rounded border border-border flex items-center justify-center hover:bg-secondary"
        >
          <Minus className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => resize(n + 1)}
          className="h-5 w-5 rounded border border-border flex items-center justify-center hover:bg-secondary"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <div
        className="inline-grid gap-1"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}
      >
        {A.map((row, i) =>
          row.map((val, j) => (
            <Input
              key={`${i}-${j}`}
              type="number"
              value={val}
              onChange={e => {
                const v = parseFloat(e.target.value) || 0;
                setA(prev => prev.map((r, ri) => r.map((c, ci) => ri === i && ci === j ? v : c)));
              }}
              className="w-16 h-8 text-center font-mono text-sm p-1"
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Single method panel ──────────────────────────────────────────────────────
function MethodPanel({ method }: { method: 'power' | 'inverse-power' }) {
  const [n, setN] = useState(3);
  const [A, setA] = useState<number[][]>([
    [4, 1, 0],
    [1, 3, 1],
    [0, 1, 2],
  ]);
  const [sigma, setSigma] = useState('0');
  const [tol, setTol] = useState('1e-10');
  const [maxIter, setMaxIter] = useState('200');
  const [result, setResult] = useState<EigenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = method === 'power'
    ? `${API_BASE}/api/eigenvalue/power`
    : `${API_BASE}/api/eigenvalue/inverse-power`;

  const run = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const body: Record<string, unknown> = {
        A,
        tol: parseFloat(tol) || 1e-10,
        max_iter: parseInt(maxIter) || 200,
      };
      if (method === 'inverse-power') body.shift = parseFloat(sigma) || 0;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(d?.detail || `HTTP ${res.status}`);
      }
      setResult(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [A, tol, maxIter, sigma, method, endpoint]);

  const reset = () => { setResult(null); setError(null); };

  const exportCSV = () => {
    if (!result) return;
    const header = 'iteration,eigenvalue,error,rel_error\n';
    const rows = result.iterations.map(r =>
      `${r.iteration},${r.eigenvalue},${r.error},${r.rel_error}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${method}_eigenvalue.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = result?.iterations.map(r => ({
    k: r.iteration,
    eigenvalue: r.eigenvalue,
    logErr: r.error > 0 ? Math.log10(r.error) : null,
  })) ?? [];

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          {method === 'power' ? 'Power Method — dominant eigenvalue' : 'Inverse Power — smallest / nearest eigenvalue'}
        </h3>

        <MatrixEditor A={A} setA={setA} n={n} setN={setN} />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {method === 'inverse-power' && (
            <div className="space-y-1">
              <Label className="text-xs">Shift σ</Label>
              <Input className="font-mono text-sm" value={sigma} onChange={e => setSigma(e.target.value)} />
              <p className="text-[10px] text-muted-foreground">Finds eigenvalue nearest to σ</p>
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Tolerance</Label>
            <Input className="font-mono text-sm" value={tol} onChange={e => setTol(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max Iterations</Label>
            <Input className="font-mono text-sm" type="number" value={maxIter} onChange={e => setMaxIter(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={run} disabled={loading} className="gap-1.5">
            <Play className="h-4 w-4" /> {loading ? 'Computing…' : 'Run'}
          </Button>
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          {result && (
            <Button variant="ghost" size="sm" onClick={exportCSV} className="gap-1.5">
              <Download className="h-4 w-4" /> CSV
            </Button>
          )}
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>

      {result && (
        <>
          {/* Status */}
          <div className="flex flex-wrap gap-3 items-center text-sm">
            <Badge variant={result.converged ? 'default' : 'destructive'} className="gap-1">
              {result.converged
                ? <><CheckCircle2 className="h-3 w-3" /> Converged</>
                : <><AlertTriangle className="h-3 w-3" /> Not converged</>}
            </Badge>
            <span className="font-mono text-foreground font-semibold">
              λ ≈ {FMT(result.eigenvalue)}
            </span>
            <span className="text-muted-foreground">
              {result.total_iterations} iterations · final error {SCI(result.final_error)}
            </span>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
            {result.stopping_reason}
          </div>

          {/* Eigenvector */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Dominant eigenvector
            </p>
            <div className="flex flex-wrap gap-2">
              {result.eigenvector.map((v, i) => (
                <span key={i} className="font-mono text-xs bg-secondary border border-border px-2 py-0.5 rounded">
                  v[{i}] = {v.toPrecision(6)}
                </span>
              ))}
            </div>
          </div>

          {/* Rayleigh quotient convergence */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Rayleigh quotient convergence
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="k" tick={{ fontSize: 11 }} label={{ value: 'Iteration', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v?.toPrecision(8), 'λ_k']} labelFormatter={l => `Iter ${l}`} />
                  <Line type="monotone" dataKey="eigenvalue" name="Rayleigh quotient λ_k"
                    stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Log error convergence */}
          {chartData.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                log10(|error|) convergence
              </h4>
              <div className="h-44 w-full">
                <ResponsiveContainer>
                  <LineChart data={chartData.filter(d => d.logErr !== null)}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="k" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }}
                      label={{ value: 'log10(err)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [v?.toFixed(3), 'log10|error|']}
                      labelFormatter={l => `Iteration ${l}`} />
                    <Line type="monotone" dataKey="logErr" name="log10|error|"
                      stroke="#f97316" dot={false} strokeWidth={2} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Iteration table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-left">
                  <th className="px-3 py-2 font-semibold text-muted-foreground w-14">Iter</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Rayleigh quotient</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">|error|</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Rel. error</th>
                </tr>
              </thead>
              <tbody>
                {result.iterations.map((r, idx) => (
                  <tr key={r.iteration}
                    className={`border-b border-border/50 hover:bg-muted/20 ${
                      idx === result.iterations.length - 1 ? 'bg-primary/5' : ''
                    }`}>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{r.iteration}</td>
                    <td className="px-3 py-1.5 font-mono font-medium">{FMT(r.eigenvalue)}</td>
                    <td className="px-3 py-1.5 font-mono">{SCI(r.error)}</td>
                    <td className="px-3 py-1.5 font-mono">{SCI(r.rel_error)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!result && !loading && !error && (
        <div className="py-12 text-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
          Enter a symmetric matrix and click <strong>Run</strong>.
          <br />Example: 3×3 symmetric positive-definite matrix above.
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EigenvalueTool({ defaultMethod = 'power' }: { defaultMethod?: string }) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue={defaultMethod}>
        <TabsList>
          <TabsTrigger value="power">Power Method</TabsTrigger>
          <TabsTrigger value="inverse-power">Inverse Power</TabsTrigger>
        </TabsList>
        <TabsContent value="power" className="mt-4">
          <MethodPanel method="power" />
        </TabsContent>
        <TabsContent value="inverse-power" className="mt-4">
          <MethodPanel method="inverse-power" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

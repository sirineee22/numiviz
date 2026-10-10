/**
 * CompareMethodsPanel
 * Runs multiple methods on the same problem and shows a synchronized
 * comparison table + overlaid convergence chart.
 */
import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Play, Download } from 'lucide-react';
import { SolverResult } from './IterativeSolverPanel';

interface Props {
  methods: string[];
  methodLabels: Record<string, string>;
  fetchMethod: (method: string) => () => Promise<SolverResult>;
}

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ef4444'];
const SCI = (v: number | null | undefined) =>
  v == null || !isFinite(v) ? '—' : v.toExponential(3);

export default function CompareMethodsPanel({ methods, methodLabels, fetchMethod }: Props) {
  const [results, setResults] = useState<Record<string, SolverResult>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const runAll = async () => {
    setLoading(true);
    setErrors({});
    const next: Record<string, SolverResult> = {};
    const errs: Record<string, string> = {};
    await Promise.all(
      methods.map(async (m) => {
        try {
          next[m] = await fetchMethod(m)();
        } catch (e: unknown) {
          errs[m] = e instanceof Error ? e.message : 'Error';
        }
      })
    );
    setResults(next);
    setErrors(errs);
    setLoading(false);
  };

  // Build chart data — each method may have different iteration counts
  const maxIter = Math.max(...Object.values(results).map((r) => r.total_iterations), 0);
  const chartData = Array.from({ length: maxIter }, (_, i) => {
    const row: Record<string, number | null> = { iteration: i + 1 };
    for (const m of methods) {
      const r = results[m];
      if (r && r.iterations[i]) {
        const err = r.iterations[i].error;
        row[m] = err > 0 ? Math.log10(err) : null;
      } else {
        row[m] = null;
      }
    }
    return row;
  });

  const exportCSV = () => {
    const header = ['Method', 'Converged', 'Iterations', 'Root', 'Final Error', 'Stopping Reason'].join(',');
    const rows = methods.map((m) => {
      const r = results[m];
      if (!r) return `${methodLabels[m]},—,—,—,—,${errors[m] || '—'}`;
      return [
        methodLabels[m],
        r.converged,
        r.total_iterations,
        r.root ?? '—',
        r.final_error,
        `"${r.stopping_reason}"`,
      ].join(',');
    });
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'comparison.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-border p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">Method Comparison</h3>
        <div className="flex gap-2">
          <Button onClick={runAll} disabled={loading} size="sm" className="gap-1.5">
            <Play className="h-4 w-4" />
            {loading ? 'Running…' : 'Run All Methods'}
          </Button>
          {Object.keys(results).length > 0 && (
            <Button onClick={exportCSV} size="sm" variant="outline" className="gap-1.5">
              <Download className="h-4 w-4" /> CSV
            </Button>
          )}
        </div>
      </div>

      {/* Comparison summary table */}
      {Object.keys(results).length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-left">
                <th className="px-3 py-2 font-semibold text-muted-foreground">Method</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">Status</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">Iterations</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">Root ≈</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">Final Error</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m, idx) => {
                const r = results[m];
                const err = errors[m];
                return (
                  <tr key={m} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium" style={{ color: COLORS[idx % COLORS.length] }}>
                      {methodLabels[m]}
                    </td>
                    <td className="px-3 py-2">
                      {err ? (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <XCircle className="h-3 w-3" /> Error
                        </Badge>
                      ) : r ? (
                        <Badge variant={r.converged ? 'default' : 'secondary'} className="gap-1 text-xs">
                          {r.converged
                            ? <><CheckCircle2 className="h-3 w-3" /> Converged</>
                            : 'Not converged'}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono">{r?.total_iterations ?? '—'}</td>
                    <td className="px-3 py-2 font-mono">
                      {r?.root != null ? r.root.toPrecision(10) : err ? <span className="text-destructive text-xs">{err}</span> : '—'}
                    </td>
                    <td className="px-3 py-2 font-mono">{r ? SCI(r.final_error) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Synchronized convergence chart */}
      {chartData.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Convergence — log₁₀(error) vs iteration
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="iteration" tick={{ fontSize: 11 }}
                  label={{ value: 'Iteration', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }}
                  label={{ value: 'log₁₀(error)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [v?.toFixed(4), '']} labelFormatter={(l) => `Iteration ${l}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {methods.map((m, idx) => (
                  results[m] && (
                    <Line
                      key={m}
                      type="monotone"
                      dataKey={m}
                      name={methodLabels[m]}
                      stroke={COLORS[idx % COLORS.length]}
                      dot={false}
                      strokeWidth={2}
                      connectNulls
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {Object.keys(results).length === 0 && !loading && (
        <div className="py-12 text-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
          Click <strong>Run All Methods</strong> to compare Newton, Bisection, Fixed Point and Secant on the same problem.
        </div>
      )}
    </div>
  );
}

/**
 * IterativeSolverPanel
 *
 * Reusable component for any iterative numerical method.
 * Supports: Run · Step · Pause · Reset
 * Shows: iteration table, convergence chart, error analysis, stopping reason.
 *
 * Props:
 *   fetchIterations — async function that returns IterationResult[]
 *   title           — display name of the method
 *   extraInfo       — optional JSX rendered above the table
 *   onResult        — optional callback with final root/solution
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play, StepForward, Pause, RotateCcw, Download, Copy, CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react';

export interface IterationRow {
  iteration: number;
  x_n: number;
  fx_n: number;
  error: number;
  abs_error?: number | null;
  rel_error?: number | null;
}

export interface SolverResult {
  method: string;
  iterations: IterationRow[];
  root?: number | null;
  solution?: number[] | null;   // for linear systems
  converged: boolean;
  stopping_reason: string;
  final_error: number;
  total_iterations: number;
  function_str?: string;
}

interface Props {
  fetchIterations: () => Promise<SolverResult>;
  title: string;
  extraInfo?: React.ReactNode;
  onResult?: (result: SolverResult) => void;
  /** If true the step mode advances one iteration at a time from preloaded data */
  allowStep?: boolean;
}

const FMT = (v: number | null | undefined, digits = 8) =>
  v === null || v === undefined || !isFinite(v) ? '—' : v.toPrecision(digits);

const SCI = (v: number | null | undefined) =>
  v === null || v === undefined || !isFinite(v) ? '—' : v.toExponential(4);

export default function IterativeSolverPanel({
  fetchIterations, title, extraInfo, onResult, allowStep = true,
}: Props) {
  const [allRows, setAllRows] = useState<IterationRow[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    stopInterval();
    setAllRows([]);
    setVisibleCount(0);
    setResult(null);
    setRunning(false);
    setError(null);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchIterations();
      setAllRows(res.iterations);
      setResult(res);
      onResult?.(res);
      return res;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchIterations, onResult]);

  // Run all — animate iterations at ~60ms each
  const handleRun = async () => {
    reset();
    const res = await load();
    if (!res) return;
    setVisibleCount(0);
    setRunning(true);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= res.iterations.length) {
        stopInterval();
        setRunning(false);
      }
    }, 60);
  };

  // Step — show one more row
  const handleStep = async () => {
    if (allRows.length === 0) {
      const res = await load();
      if (!res) return;
      setVisibleCount(1);
      return;
    }
    if (visibleCount < allRows.length) {
      setVisibleCount((v) => v + 1);
    }
  };

  const handlePause = () => {
    stopInterval();
    setRunning(false);
  };

  // Export CSV
  const exportCSV = () => {
    const header = 'Iteration,x_n,f(x_n),Error,Abs Error,Rel Error\n';
    const rows = visibleRows
      .map((r) => `${r.iteration},${r.x_n},${r.fx_n},${r.error},${r.abs_error ?? ''},${r.rel_error ?? ''}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_iterations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy table as text
  const copyTable = async () => {
    const lines = ['Iter\tx_n\t\t\t\tf(x_n)\t\t\t\tError'];
    visibleRows.forEach((r) =>
      lines.push(`${r.iteration}\t${r.x_n}\t${r.fx_n}\t${r.error}`)
    );
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const visibleRows = allRows.slice(0, visibleCount);
  const chartData = visibleRows.map((r) => ({
    iteration: r.iteration,
    error: r.error > 0 ? Math.log10(r.error) : null,
    absError: r.abs_error && r.abs_error > 0 ? Math.log10(r.abs_error) : null,
  }));

  const isDone = visibleCount >= allRows.length && allRows.length > 0;
  const lastRow = visibleRows[visibleRows.length - 1];

  return (
    <div className="space-y-5">
      {/* ── Controls ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={handleRun} disabled={loading || running} size="sm" className="gap-1.5">
          <Play className="h-4 w-4" /> Run
        </Button>
        {allowStep && (
          <Button onClick={handleStep} disabled={loading || running || isDone} size="sm" variant="outline" className="gap-1.5">
            <StepForward className="h-4 w-4" /> Step
          </Button>
        )}
        <Button onClick={handlePause} disabled={!running} size="sm" variant="outline" className="gap-1.5">
          <Pause className="h-4 w-4" /> Pause
        </Button>
        <Button onClick={reset} size="sm" variant="ghost" className="gap-1.5">
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>

        {allRows.length > 0 && (
          <div className="ml-auto flex gap-2">
            <Button onClick={copyTable} size="sm" variant="ghost" className="gap-1.5">
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button onClick={exportCSV} size="sm" variant="ghost" className="gap-1.5">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        )}
      </div>

      {/* ── Loading / Error ───────────────────────────────────── */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Computing…
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Status bar ───────────────────────────────────────── */}
      {result && (
        <div className="flex flex-wrap gap-3 items-center text-sm">
          <Badge variant={result.converged ? 'default' : 'destructive'} className="gap-1">
            {result.converged
              ? <><CheckCircle2 className="h-3 w-3" /> Converged</>
              : <><AlertTriangle className="h-3 w-3" /> Not converged</>}
          </Badge>
          <span className="text-muted-foreground">
            Iteration <strong>{visibleCount}</strong> / {result.total_iterations}
          </span>
          {lastRow && (
            <span className="text-muted-foreground">
              Error: <strong className="font-mono">{SCI(lastRow.error)}</strong>
            </span>
          )}
          {result.root !== undefined && result.root !== null && isDone && (
            <span className="text-muted-foreground">
              Root ≈ <strong className="font-mono">{FMT(result.root)}</strong>
            </span>
          )}
        </div>
      )}

      {result && isDone && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Stopping reason: </span>
          {result.stopping_reason}
        </div>
      )}

      {extraInfo}

      {/* ── Iteration Table ───────────────────────────────────── */}
      {visibleRows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-left">
                <th className="px-3 py-2 font-semibold text-muted-foreground w-16">Iter</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">xₙ</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">f(xₙ)</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">Error</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">|f(xₙ)|</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">Rel. Error</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, idx) => {
                const isLast = idx === visibleRows.length - 1;
                return (
                  <tr
                    key={row.iteration}
                    className={`border-b border-border/50 transition-colors ${
                      isLast && running ? 'bg-primary/5 font-medium' : 'hover:bg-muted/20'
                    }`}
                  >
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{row.iteration}</td>
                    <td className="px-3 py-1.5 font-mono">{FMT(row.x_n)}</td>
                    <td className="px-3 py-1.5 font-mono">{SCI(row.fx_n)}</td>
                    <td className="px-3 py-1.5 font-mono">{SCI(row.error)}</td>
                    <td className="px-3 py-1.5 font-mono">{SCI(row.abs_error)}</td>
                    <td className="px-3 py-1.5 font-mono">{SCI(row.rel_error)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Error Convergence Chart ───────────────────────────── */}
      {chartData.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Convergence — log₁₀(error) vs iteration
          </h4>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="iteration"
                  label={{ value: 'Iteration', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  label={{ value: 'log₁₀(error)', angle: -90, position: 'insideLeft', fontSize: 11 }}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(v: number) => [v?.toFixed(4), '']}
                  labelFormatter={(l) => `Iteration ${l}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone" dataKey="error" name="log₁₀(|error|)"
                  stroke="hsl(var(--primary))" dot={false} strokeWidth={2} connectNulls
                />
                <Line
                  type="monotone" dataKey="absError" name="log₁₀(|f(xₙ)|)"
                  stroke="#f97316" dot={false} strokeWidth={1.5} strokeDasharray="4 2" connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Error Analysis Summary ────────────────────────────── */}
      {isDone && result && lastRow && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Final Error', value: SCI(result.final_error) },
            { label: '|f(xₙ)|', value: SCI(lastRow.abs_error) },
            { label: 'Relative Error', value: SCI(lastRow.rel_error) },
            { label: 'Iterations', value: String(result.total_iterations) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-muted/20 p-3 text-center">
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <div className="font-mono text-sm font-semibold">{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * InterpolationTool
 * =================
 * Methods: Lagrange · Newton Divided Differences · Natural Cubic Spline · Least Squares
 *
 * UI pattern:
 *   - Shared data input (x-values, y-values, optional eval point)
 *   - Tabs per method
 *   - Per tab: Run / Reset / CSV buttons, coefficient table, curve chart, residual chart
 *
 * Does NOT use IterativeSolverPanel (interpolation is non-iterative).
 * Uses its own InterpolationResultPanel to keep the existing panel untouched.
 */
import React, { useState, useCallback } from 'react';
import {
  ScatterChart, Scatter, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input }  from '@/components/ui/input';
import { Label }  from '@/components/ui/label';
import { Badge }  from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Play, RotateCcw, Download, Copy, CheckCircle2,
  XCircle, Info, TrendingUp,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface InterpolationResponse {
  method: string;
  curve_x: number[];
  curve_y: number[];
  data_x:  number[];
  data_y:  number[];
  table:   Record<string, number | string | null>[];
  residuals: { x: number; y_data: number; y_fit: number; residual: number }[];
  poly_str: string;
  degree:  number;
  eval_x:  number | null;
  eval_y:  number | null;
  converged: boolean;
  stopping_reason: string;
}

// ─── Method config ────────────────────────────────────────────────────────────

type MethodId = 'lagrange' | 'newton-dd' | 'spline' | 'least-squares';

const METHOD_LABELS: Record<MethodId, string> = {
  'lagrange':      'Lagrange',
  'newton-dd':     'Newton Div. Diff.',
  'spline':        'Natural Cubic Spline',
  'least-squares': 'Least Squares',
};

const METHOD_COLORS: Record<MethodId, string> = {
  'lagrange':      'hsl(var(--primary))',
  'newton-dd':     '#f97316',
  'spline':        '#14b8a6',
  'least-squares': '#a855f7',
};

const METHOD_DESC: Record<MethodId, string> = {
  'lagrange':      'Exact polynomial through all nodes using Lagrange basis functions.',
  'newton-dd':     'Exact polynomial via divided-difference table (same result as Lagrange, shown differently).',
  'spline':        'Piecewise cubic polynomial with continuous 1st and 2nd derivatives (C² natural spline).',
  'least-squares': 'Best-fit polynomial minimising Σ(yᵢ − P(xᵢ))². Degree < n (does not pass through every point).',
};

const FMT = (v: number | null | undefined, d = 8) =>
  v == null || !isFinite(v) ? '—' : Number(v).toPrecision(d);
const SCI = (v: number | null | undefined) =>
  v == null || !isFinite(v) ? '—' : Number(v).toExponential(4);

// ─── InterpolationResultPanel ─────────────────────────────────────────────────

interface PanelProps {
  methodId:  MethodId;
  dataX:     string;
  dataY:     string;
  evalX:     string;
  degree:    string;   // only for least-squares
}

function InterpolationResultPanel({ methodId, dataX, dataY, evalX, degree }: PanelProps) {
  const [result,  setResult]  = useState<InterpolationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [copied,  setCopied]  = useState(false);

  const reset = () => { setResult(null); setError(null); };

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const endpoint = `${API_BASE}/api/interpolation/${methodId}`;
      const body: Record<string, unknown> = {
        x_data: dataX.trim(),
        y_data: dataY.trim(),
      };
      if (evalX.trim()) body.eval_x = parseFloat(evalX);
      if (methodId === 'least-squares') body.degree = Math.max(1, parseInt(degree) || 1);

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
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [methodId, dataX, dataY, evalX, degree]);

  // ── CSV export ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!result) return;
    const header = 'x,y_data,y_fit,residual\n';
    const rows = result.residuals
      .map(r => `${r.x},${r.y_data},${r.y_fit},${r.residual}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${methodId}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyTable = async () => {
    if (!result) return;
    const lines = ['x\ty_data\ty_fit\tresidual'];
    result.residuals.forEach(r =>
      lines.push(`${r.x}\t${r.y_data}\t${r.y_fit}\t${r.residual}`)
    );
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ── Curve chart data ──────────────────────────────────────────────────────
  const curveData = result
    ? result.curve_x.map((x, i) => ({ x, y: result.curve_y[i] }))
    : [];
  const scatterData = result
    ? result.data_x.map((x, i) => ({ x, y: result.data_y[i] }))
    : [];
  const residualData = result
    ? result.residuals.map(r => ({ x: r.x, residual: r.residual }))
    : [];

  const color = METHOD_COLORS[methodId];

  return (
    <div className="space-y-5">
      {/* ── Controls ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={run} disabled={loading} size="sm" className="gap-1.5">
          <Play className="h-4 w-4" />
          {loading ? 'Computing…' : 'Run'}
        </Button>
        <Button onClick={reset} size="sm" variant="ghost" className="gap-1.5">
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
        {result && (
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

      {/* ── Loading spinner ──────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Computing…
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Result summary ───────────────────────────────────────────── */}
      {result && (
        <>
          {/* Polynomial string */}
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm font-mono break-all">
            {result.poly_str}
          </div>

          {/* Eval point result */}
          {result.eval_y !== null && result.eval_x !== null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 text-blue-500 shrink-0" />
              P({FMT(result.eval_x)}) ={' '}
              <strong className="font-mono text-foreground">{FMT(result.eval_y)}</strong>
            </div>
          )}

          {/* ── Curve chart ──────────────────────────────────────────── */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Interpolating Curve
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curveData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }}
                    label={{ value: 'x', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }}
                    label={{ value: 'P(x)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number) => [v?.toPrecision(8), 'P(x)']}
                    labelFormatter={(l: number) => `x = ${Number(l).toPrecision(6)}`}
                  />
                  {/* Smooth curve */}
                  <Line
                    type="monotone" dataKey="y" name="P(x)"
                    stroke={color} dot={false} strokeWidth={2} connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter overlay (data points) — separate chart so dots are visible */}
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="x" type="number" tick={{ fontSize: 11 }} name="x" />
                  <YAxis dataKey="y" type="number" tick={{ fontSize: 11 }} name="y" />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(v: number) => [FMT(v), '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Scatter name="Data nodes" data={scatterData} fill={color} />
                  {result.eval_x !== null && result.eval_y !== null && (
                    <Scatter
                      name={`P(${result.eval_x})`}
                      data={[{ x: result.eval_x, y: result.eval_y }]}
                      fill="#f97316"
                      shape="star"
                    />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Residual chart ────────────────────────────────────────── */}
          {residualData.some(r => Math.abs(r.residual) > 1e-12) && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Residuals at Data Points
              </h4>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={residualData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [SCI(v), 'residual']} />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
                    <Bar dataKey="residual" fill={color} opacity={0.75} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── Coefficient / difference table ─────────────────────────── */}
          {result.table.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {methodId === 'newton-dd' ? 'Divided-Difference Table'
                  : methodId === 'spline' ? 'Spline Segment Coefficients'
                  : methodId === 'least-squares' ? 'Polynomial Coefficients'
                  : 'Lagrange Basis Values'}
              </h4>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border text-left">
                      {Object.keys(result.table[0]).map(col => (
                        <th key={col} className="px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.table.map((row, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                        {Object.values(row).map((val, ci) => (
                          <td key={ci} className="px-3 py-1.5 font-mono">
                            {typeof val === 'number'
                              ? (Math.abs(val) < 1e-3 && val !== 0 ? SCI(val) : FMT(val, 6))
                              : val ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Summary stats ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Degree', value: String(result.degree) },
              { label: 'Data points', value: String(result.data_x.length) },
              { label: 'Max |residual|',
                value: SCI(Math.max(...result.residuals.map(r => Math.abs(r.residual)))) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">{label}</div>
                <div className="font-mono text-sm font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main InterpolationTool component ────────────────────────────────────────

export default function InterpolationTool({ defaultMethod = 'lagrange' }: { defaultMethod?: string }) {
  // Shared inputs
  const [dataX,  setDataX]  = useState('0, 1, 2, 3, 4');
  const [dataY,  setDataY]  = useState('0, 1, 4, 9, 16');
  const [evalX,  setEvalX]  = useState('2.5');
  const [degree, setDegree] = useState('2');   // only for least-squares

  const inputClass = 'font-mono text-sm';

  return (
    <div className="space-y-6">
      {/* ── Shared Problem Setup ──────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Data Points
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <Label>x-values (comma-separated)</Label>
            <Input className={inputClass} value={dataX} onChange={e => setDataX(e.target.value)}
              placeholder="0, 1, 2, 3, 4" />
          </div>
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <Label>y-values (comma-separated)</Label>
            <Input className={inputClass} value={dataY} onChange={e => setDataY(e.target.value)}
              placeholder="0, 1, 4, 9, 16" />
          </div>
          <div className="space-y-1">
            <Label>Evaluate at x (optional)</Label>
            <Input className={inputClass} value={evalX} onChange={e => setEvalX(e.target.value)}
              placeholder="e.g. 2.5" />
          </div>
          <div className="space-y-1">
            <Label>Degree (Least Squares only)</Label>
            <Input className={inputClass} type="number" min={1} max={20} value={degree}
              onChange={e => setDegree(e.target.value)} />
            <p className="text-xs text-muted-foreground">Must be &lt; number of points</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Use ** for power · * for multiply · All methods share the same data inputs above.
        </p>
      </div>

      {/* ── Method Tabs ───────────────────────────────────────────────── */}
      <Tabs defaultValue={defaultMethod}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {(Object.entries(METHOD_LABELS) as [MethodId, string][]).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="text-sm">{label}</TabsTrigger>
          ))}
        </TabsList>

        {(Object.entries(METHOD_LABELS) as [MethodId, string][]).map(([method, label]) => (
          <TabsContent key={method} value={method} className="mt-4">
            <div className="rounded-xl border border-border p-5 space-y-4">
              {/* Method header */}
              <div className="flex flex-wrap items-start gap-3">
                <div>
                  <h3 className="font-semibold text-base" style={{ color: METHOD_COLORS[method] }}>
                    {label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{METHOD_DESC[method]}</p>
                </div>
                <Badge variant="outline" className="ml-auto shrink-0">
                  {method === 'lagrange'      ? 'Exact' :
                   method === 'newton-dd'     ? 'Exact' :
                   method === 'spline'        ? 'C² Smooth' :
                   'Best Fit'}
                </Badge>
              </div>

              <InterpolationResultPanel
                key={method + dataX + dataY + evalX + degree}
                methodId={method}
                dataX={dataX}
                dataY={dataY}
                evalX={evalX}
                degree={degree}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

import { useLabInitialParams } from '@/lib/labParams';
/**
 * ODESolverTool — Euler & RK4
 * Solves dy/dx = f(x,y), compares with exact solution if provided.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Download, Copy, CheckCircle2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { API_BASE } from '@/lib/api';
import { MathInputWithToolbar } from './MathToolbar';

interface ODEPoint {
  x: number;
  y_num: number;
  y_exact: number | null;
  error: number | null;
}

interface ODEResult {
  method: string;
  points: ODEPoint[];
  h: number;
  total_steps: number;
  function_str: string;
}

const METHOD_LABELS: Record<string, string> = {
  euler: 'Euler Method',
  heun:  'Heun (Improved Euler)',
  rk4:   'Runge-Kutta 4 (RK4)',
};

export default function ODESolverTool({ focusMethod }: { focusMethod?: string }) {
  const initial = useLabInitialParams({ fxy: 'x + y', x0: '0', y0: '1', xEnd: '2', h: '0.1' });
  const [fxy, setFxy] = useState(initial.fxy || 'x + y');
  const [x0, setX0] = useState(String(initial.x0 ?? '0'));
  const [y0, setY0] = useState(String(initial.y0 ?? '1'));
  const [xEnd, setXEnd] = useState(String(initial.xEnd ?? '2'));
  const [h, setH] = useState(String(initial.h ?? '0.1'));
  const [exact, setExact] = useState('2*exp(x) - x - 1');
  const [results, setResults] = useState<Record<string, ODEResult>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchMethod = async (method: string): Promise<ODEResult> => {
    const res = await fetch(`${API_BASE}/api/ode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fxy,
        x0: parseFloat(x0),
        y0: parseFloat(y0),
        x_end: parseFloat(xEnd),
        h: parseFloat(h) || 0.1,
        method,
        exact: exact.trim() || null,
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(d?.detail || `HTTP ${res.status}`);
    }
    return res.json();
  };

  const runAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await Promise.all(
        Object.keys(METHOD_LABELS).map((m) => fetchMethod(m).then((r) => [m, r] as const))
      );
      setResults(Object.fromEntries(all));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = (method: string, r: ODEResult) => {
    const header = 'x,y_num' + (r.points[0]?.y_exact != null ? ',y_exact,error' : '') + '\n';
    const rows = r.points.map((p) =>
      `${p.x},${p.y_num}` + (p.y_exact != null ? `,${p.y_exact},${p.error}` : '')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${method}_ode.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Build merged chart data from euler + rk4 + exact
  const eulerData = results.euler?.points || [];
  const rk4Data = results.rk4?.points || [];
  const maxLen = Math.max(eulerData.length, rk4Data.length);

  const chartData = Array.from({ length: maxLen }, (_, i) => {
    const ep = eulerData[i];
    const rp = rk4Data[i];
    return {
      x: ep?.x ?? rp?.x,
      euler: ep?.y_num,
      rk4: rp?.y_num,
      exact: ep?.y_exact ?? rp?.y_exact,
    };
  });

  const hasExact = chartData.some((d) => d.exact != null);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
        <MathInputWithToolbar
          label="dy/dx = f(x, y) — Équation Différentielle Ordinaire"
          value={fxy}
          onChange={setFxy}
          placeholder="ex: x + y, -2*x*y, sin(x) - y"
          prefix="f(x, y) ="
          helperText="Utilisez x et y comme variables. Cliquez sur un symbole pour insérer une puissance ou fonction."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-1">
          <div className="space-y-1">
            <Label>x₀ (Départ)</Label>
            <Input className="font-mono" type="number" value={x0} onChange={(e) => setX0(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>y₀ = y(x₀)</Label>
            <Input className="font-mono" type="number" value={y0} onChange={(e) => setY0(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>x fin</Label>
            <Input className="font-mono" type="number" value={xEnd} onChange={(e) => setXEnd(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Pas h</Label>
            <Input className="font-mono" type="number" value={h} onChange={(e) => setH(e.target.value)} />
          </div>
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label>Solution exacte (opt.)</Label>
            <Input className="font-mono" value={exact} onChange={(e) => setExact(e.target.value)} placeholder="ex: 2*exp(x) - x - 1" />
          </div>
        </div>
        <Button onClick={runAll} disabled={loading} className="gap-1.5">
          <Play className="h-4 w-4" /> {loading ? 'Computing…' : 'Solve'}
        </Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>

      {/* Comparison chart */}
      {chartData.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Solution y(x)
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="x" tickFormatter={(v) => Number(v).toFixed(2)} tick={{ fontSize: 11 }} label={{ value: 'x', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} label={{ value: 'y', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [v?.toFixed(6), '']} labelFormatter={(l) => `x = ${Number(l).toFixed(4)}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {results.euler && <Line type="monotone" dataKey="euler" name="Euler" stroke="#f97316" dot={false} strokeWidth={2} />}
                {results.rk4 && <Line type="monotone" dataKey="rk4" name="RK4" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />}
                {hasExact && <Line type="monotone" dataKey="exact" name="Exact" stroke="#10b981" dot={false} strokeWidth={1.5} strokeDasharray="5 3" />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Error comparison chart */}
      {hasExact && results.euler && results.rk4 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Global Error |y_num - y_exact|
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <LineChart
                data={chartData.map((d) => ({
                  x: d.x,
                  euler_err: d.euler != null && d.exact != null ? Math.abs(d.euler - d.exact) : null,
                  rk4_err: d.rk4 != null && d.exact != null ? Math.abs(d.rk4 - d.exact) : null,
                }))}
                margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="x" tickFormatter={(v) => Number(v).toFixed(2)} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v.toExponential(1)} />
                <Tooltip formatter={(v: number) => [v?.toExponential(4), '']} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="euler_err" name="Euler error" stroke="#f97316" dot={false} strokeWidth={1.5} connectNulls />
                <Line type="monotone" dataKey="rk4_err" name="RK4 error" stroke="hsl(var(--primary))" dot={false} strokeWidth={1.5} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Comparison table */}
      {Object.keys(results).length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-left">
                <th className="px-3 py-2 font-semibold text-muted-foreground">Method</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">Steps</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">h</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">y(x_end)</th>
                {hasExact && <th className="px-3 py-2 font-semibold text-muted-foreground">Max Error</th>}
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(results).map(([m, r]) => {
                const last = r.points[r.points.length - 1];
                const maxErr = hasExact
                  ? Math.max(...r.points.filter((p) => p.error != null).map((p) => p.error!))
                  : null;
                const isFocused = focusMethod === m;
                return (
                  <tr key={m} className={`border-b border-border/50 hover:bg-muted/20 ${isFocused ? 'bg-primary/5 font-semibold' : ''}`}>
                    <td className="px-3 py-2 font-medium">{METHOD_LABELS[m]}</td>
                    <td className="px-3 py-2 font-mono">{r.total_steps}</td>
                    <td className="px-3 py-2 font-mono">{r.h}</td>
                    <td className="px-3 py-2 font-mono">{last?.y_num.toPrecision(8)}</td>
                    {hasExact && <td className="px-3 py-2 font-mono">{maxErr != null ? maxErr.toExponential(4) : '—'}</td>}
                    <td className="px-3 py-2">
                      <Button size="sm" variant="ghost" onClick={() => exportCSV(m, r)} className="gap-1 h-7">
                        <Download className="h-3 w-3" /> CSV
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {Object.keys(results).length === 0 && !loading && (
        <div className="py-12 text-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
          Enter the ODE dy/dx = f(x,y) and initial conditions, then click <strong>Solve</strong>.
          <br />Example: f(x,y) = x + y, y(0) = 1, solve on [0, 2]
        </div>
      )}
    </div>
  );
}

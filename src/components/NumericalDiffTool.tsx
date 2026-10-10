/**
 * NumericalDiffTool
 * Forward · Backward · Central difference + error-vs-h analysis + Richardson Extrapolation
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Copy, Download, CheckCircle2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { API_BASE } from '@/lib/api';

interface DiffResult {
  method: string;
  h: number;
  approximation: number;
  abs_error: number | null;
  formula: string;
}

interface DiffResponse {
  x0: number;
  fx0: number;
  results: DiffResult[];
  function_str: string;
  h_analysis: { h: number; central: number; abs_error: number | null }[];
}

const METHOD_LABELS: Record<string, string> = {
  forward:  'Forward Difference',
  backward: 'Backward Difference',
  central:  'Central Difference',
};

const METHOD_COLORS: Record<string, string> = {
  forward:  '#f97316',
  backward: '#8b5cf6',
  central:  'hsl(var(--primary))',
};

export default function NumericalDiffTool({ defaultTab = "finite" }: { defaultTab?: string }) {
  const [fx, setFx] = useState('sin(x)');
  const [x0, setX0] = useState('1');
  const [h, setH] = useState('0.001');
  const [exactDeriv, setExactDeriv] = useState('');
  const [data, setData] = useState<DiffResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const compute = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/differentiation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fx,
          x0: parseFloat(x0),
          h: parseFloat(h) || 0.001,
          exact_derivative: exactDeriv ? parseFloat(exactDeriv) : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(d?.detail || `HTTP ${res.status}`);
      }
      setData(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const copyResults = async () => {
    if (!data) return;
    const lines = [
      `f(x) = ${data.function_str}`,
      `x₀ = ${data.x0}`,
      `f(x₀) = ${data.fx0}`,
      '',
      ...data.results.map(
        (r) => `${METHOD_LABELS[r.method]}: ${r.approximation.toPrecision(10)}` +
               (r.abs_error != null ? `  |error| = ${r.abs_error.toExponential(4)}` : '')
      ),
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      'method,approximation,abs_error,formula',
      ...data.results.map((r) =>
        `"${METHOD_LABELS[r.method]}",${r.approximation},${r.abs_error ?? ''},${r.formula}`
      ),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'differentiation.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const hAnalysisData = data?.h_analysis.map((p) => ({
    h: p.h,
    logH: Math.log10(p.h),
    logErr: p.abs_error != null && p.abs_error > 0 ? Math.log10(p.abs_error) : null,
  })) ?? [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="finite">Finite Differences</TabsTrigger>
          <TabsTrigger value="richardson">Richardson Extrapolation</TabsTrigger>
        </TabsList>

        {/* ── Finite Differences ── */}
        <TabsContent value="finite" className="mt-4 space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Approximate f′(x₀)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label>f(x)</Label>
            <Input className="font-mono" value={fx} onChange={(e) => setFx(e.target.value)} placeholder="sin(x)" />
          </div>
          <div className="space-y-1">
            <Label>x₀</Label>
            <Input className="font-mono" type="number" value={x0} onChange={(e) => setX0(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Step size h</Label>
            <Input className="font-mono" type="number" value={h} onChange={(e) => setH(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Exact f′(x₀) (optional)</Label>
            <Input
              className="font-mono" type="number" value={exactDeriv}
              onChange={(e) => setExactDeriv(e.target.value)}
              placeholder="for error analysis"
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={compute} disabled={loading} className="gap-1.5">
            <Play className="h-4 w-4" /> {loading ? 'Computing…' : 'Compute'}
          </Button>
          {data && (
            <>
              <Button size="sm" variant="ghost" onClick={copyResults} className="gap-1.5">
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button size="sm" variant="ghost" onClick={exportCSV} className="gap-1.5">
                <Download className="h-4 w-4" /> CSV
              </Button>
            </>
          )}
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>

      {data && (
        <>
          {/* f(x₀) info */}
          <div className="flex gap-4 flex-wrap text-sm">
            <span className="text-muted-foreground">
              f({data.x0}) = <strong className="font-mono">{data.fx0.toPrecision(10)}</strong>
            </span>
            {exactDeriv && (
              <span className="text-muted-foreground">
                Exact f′({data.x0}) = <strong className="font-mono">{parseFloat(exactDeriv).toPrecision(10)}</strong>
              </span>
            )}
          </div>

          {/* Results table */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-left">
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Method</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Formula</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">Approximation f′(x₀)</th>
                  <th className="px-3 py-2 font-semibold text-muted-foreground">|Error|</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((r) => (
                  <tr key={r.method} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium" style={{ color: METHOD_COLORS[r.method] }}>
                      {METHOD_LABELS[r.method]}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{r.formula}</td>
                    <td className="px-3 py-2 font-mono font-semibold">{r.approximation.toPrecision(10)}</td>
                    <td className="px-3 py-2 font-mono">
                      {r.abs_error != null ? r.abs_error.toExponential(4) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Error vs h analysis */}
          {hAnalysisData.length > 0 && exactDeriv && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Central Difference: log₁₀|error| vs log₁₀(h)
              </h4>
              <p className="text-xs text-muted-foreground">
                Shows the optimal step size — too large → truncation error dominates; too small → round-off error dominates.
              </p>
              <div className="h-52 w-full">
                <ResponsiveContainer>
                  <LineChart data={hAnalysisData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="logH"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `10^${v.toFixed(0)}`}
                      label={{ value: 'log₁₀(h)', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      label={{ value: 'log₁₀|error|', angle: -90, position: 'insideLeft', fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(v: number) => [`10^${v?.toFixed(2)}`, '']}
                      labelFormatter={(l) => `h = 10^${Number(l).toFixed(1)}`}
                    />
                    <Line
                      type="monotone" dataKey="logErr" name="log₁₀|error|"
                      stroke="hsl(var(--primary))" dot={{ r: 3 }} strokeWidth={2} connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Formula explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.results.map((r) => (
              <div key={r.method} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
                <div className="text-xs font-semibold" style={{ color: METHOD_COLORS[r.method] }}>
                  {METHOD_LABELS[r.method]}
                </div>
                <div className="font-mono text-xs text-muted-foreground">{r.formula}</div>
                <div className="font-mono text-sm font-semibold">{r.approximation.toPrecision(8)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {!data && !loading && (
          <div className="py-12 text-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
            Enter f(x) and x₀, then click <strong>Compute</strong>.
            <br />Example: f(x) = sin(x), x₀ = 1 → exact f′(1) = cos(1) ≈ 0.5403
          </div>
        )}
        </TabsContent>

        {/* ── Richardson Extrapolation ── */}
        <TabsContent value="richardson" className="mt-4">
          <RichardsonPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Richardson Panel ────────────────────────────────────────────────────────────
function RichardsonPanel() {
  const [fx, setFx] = useState('sin(x)');
  const [x0, setX0] = useState('1');
  const [h0, setH0] = useState('0.1');
  const [levels, setLevels] = useState('4');
  const [exactDeriv, setExactDeriv] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compute = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/differentiation/richardson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fx,
          x0: parseFloat(x0),
          h0: parseFloat(h0) || 0.1,
          levels: parseInt(levels) || 4,
          exact_derivative: exactDeriv ? parseFloat(exactDeriv) : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(d?.detail || `HTTP ${res.status}`);
      }
      setData(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Richardson Extrapolation — f′(x₀)
        </h3>
        <p className="text-xs text-muted-foreground">
          Eliminates lower-order error terms by combining central differences at decreasing step sizes.
          Achieves O(h<sup>2k</sup>) accuracy at level k.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label>f(x)</Label>
            <Input className="font-mono" value={fx} onChange={e => setFx(e.target.value)} placeholder="sin(x)" />
          </div>
          <div className="space-y-1">
            <Label>x₀</Label>
            <Input className="font-mono" type="number" value={x0} onChange={e => setX0(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Initial h₀</Label>
            <Input className="font-mono" type="number" value={h0} onChange={e => setH0(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Levels (1–8)</Label>
            <Input className="font-mono" type="number" min={1} max={8} value={levels} onChange={e => setLevels(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Exact f′(x₀)</Label>
            <Input className="font-mono" type="number" value={exactDeriv} onChange={e => setExactDeriv(e.target.value)} placeholder="optional" />
          </div>
        </div>
        <Button onClick={compute} disabled={loading} className="gap-1.5">
          <Play className="h-4 w-4" /> {loading ? 'Computing…' : 'Compute'}
        </Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>

      {data && (
        <>
          <div className="text-sm text-muted-foreground">
            Best approximation: <strong className="font-mono text-foreground">{data.best_approximation?.toPrecision(12)}</strong>
            {data.abs_error != null && (
              <span className="ml-4">|error| = <strong className="font-mono">{data.abs_error.toExponential(4)}</strong></span>
            )}
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-3 py-2 text-left text-muted-foreground">h</th>
                  <th className="px-3 py-2 text-left text-muted-foreground">Level</th>
                  <th className="px-3 py-2 text-left text-muted-foreground">D[i][j]</th>
                  <th className="px-3 py-2 text-left text-muted-foreground">|error|</th>
                </tr>
              </thead>
              <tbody>
                {data.rows?.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-3 py-1.5">{r.h.toExponential(2)}</td>
                    <td className="px-3 py-1.5">{r.level}</td>
                    <td className="px-3 py-1.5 font-semibold">{r.approximation?.toPrecision(10)}</td>
                    <td className="px-3 py-1.5">{r.abs_error != null ? r.abs_error.toExponential(4) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!data && !loading && (
        <div className="py-12 text-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
          Enter f(x) and x₀, then click <strong>Compute</strong>.<br />
          Example: f(x) = sin(x), x₀ = 1 → exact f′(1) = cos(1) ≈ 0.5403
        </div>
      )}
    </div>
  );
}

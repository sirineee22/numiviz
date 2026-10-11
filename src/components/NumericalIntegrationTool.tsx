import { useLabInitialParams } from '@/lib/labParams';
/**
 * NumericalIntegrationTool
 * Trapezoidal · Simpson 1/3 · Simpson 3/8
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, Download, Copy, CheckCircle2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { API_BASE } from '@/lib/api';
import { MathInputWithToolbar } from './MathToolbar';

interface IntegResult {
  method: string;
  result: number;
  steps: { label: string; x: number; fx: number; weight: number }[];
  n_intervals: number;
  h: number;
  abs_error: number | null;
  rel_error: number | null;
  function_str: string;
}

const METHOD_LABELS: Record<string, string> = {
  trapezoidal:      'Trapezoidal Rule',
  simpson13:        "Simpson's 1/3 Rule",
  simpson38:        "Simpson's 3/8 Rule",
  'gauss-legendre': 'Gauss-Legendre',
  romberg:          'Romberg',
};

const FMT = (v: number | null | undefined, d = 10) =>
  v == null ? '—' : Number(v).toPrecision(d);

export default function NumericalIntegrationTool({ defaultMethod = 'trapezoidal' }: { defaultMethod?: string }) {
  const initial = useLabInitialParams({ fx: 'x**2', a: '0', b: '1', n: '8' });
  const [fx, setFx] = useState(initial.fx || 'x**2');
  const [a, setA] = useState(String(initial.a ?? '0'));
  const [b, setB] = useState(String(initial.b ?? '1'));
  const [n, setN] = useState(String(initial.n ?? '8'));
  const [exact, setExact] = useState('');
  const [results, setResults] = useState<Record<string, IntegResult>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchMethod = async (method: string): Promise<IntegResult> => {
    const res = await fetch(`${API_BASE}/api/integration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fx, a: parseFloat(a), b: parseFloat(b),
        n: parseInt(n) || 8,
        method,
        exact: exact ? parseFloat(exact) : null,
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

  const exportCSV = (method: string, r: IntegResult) => {
    const header = 'x_i,f(x_i),weight\n';
    const rows = r.steps.map((s) => `${s.x},${s.fx},${s.weight}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${method}_integration.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const copyResult = async (r: IntegResult) => {
    const text = `∫f(x)dx from ${a} to ${b}\nMethod: ${METHOD_LABELS[r.method]}\nn = ${r.n_intervals}, h = ${r.h}\nResult: ${r.result}\n${r.abs_error != null ? `Abs Error: ${r.abs_error}` : ''}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
        <MathInputWithToolbar
          label="f(x) — Fonction à intégrer"
          value={fx}
          onChange={setFx}
          placeholder="ex: x^2, sin(x), exp(-x^2)"
          prefix="f(x) ="
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="space-y-1">
            <Label>a (Borne inf.)</Label>
            <Input className="font-mono" type="number" value={a} onChange={(e) => setA(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>b (Borne sup.)</Label>
            <Input className="font-mono" type="number" value={b} onChange={(e) => setB(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>n (Sous-intervalles)</Label>
            <Input className="font-mono" type="number" value={n} onChange={(e) => setN(e.target.value)} />
            <p className="text-xs text-muted-foreground">Pair pour S1/3, mult 3 pour S3/8</p>
          </div>
          <div className="space-y-1">
            <Label>Valeur exacte (optionnelle)</Label>
            <Input className="font-mono" type="number" value={exact} onChange={(e) => setExact(e.target.value)} placeholder="pour calcul d'erreur" />
          </div>
        </div>
        <Button onClick={runAll} disabled={loading} className="gap-1.5">
          <Play className="h-4 w-4" /> {loading ? 'Computing…' : 'Compute All Methods'}
        </Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>

      {/* Comparison summary */}
      {Object.keys(results).length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-left">
                <th className="px-3 py-2 font-semibold text-muted-foreground">Method</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">Result</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">n</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">h</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">|Error|</th>
                <th className="px-3 py-2 font-semibold text-muted-foreground">Rel Error</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(results).map(([m, r]) => (
                <tr key={m} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-3 py-2 font-medium">{METHOD_LABELS[m]}</td>
                  <td className="px-3 py-2 font-mono font-semibold">{FMT(r.result)}</td>
                  <td className="px-3 py-2 font-mono">{r.n_intervals}</td>
                  <td className="px-3 py-2 font-mono">{r.h.toPrecision(4)}</td>
                  <td className="px-3 py-2 font-mono">{r.abs_error != null ? r.abs_error.toExponential(4) : '—'}</td>
                  <td className="px-3 py-2 font-mono">{r.rel_error != null ? (r.rel_error * 100).toFixed(4) + '%' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed tabs per method */}
      {Object.keys(results).length > 0 && (
        <Tabs defaultValue={defaultMethod}>
          <TabsList>
            {Object.entries(METHOD_LABELS).map(([k, v]) => (
              <TabsTrigger key={k} value={k}>{v}</TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(results).map(([m, r]) => (
            <TabsContent key={m} value={m} className="mt-4 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <Badge className="text-sm px-3 py-1">
                    ≈ {FMT(r.result, 12)}
                  </Badge>
                  {r.abs_error != null && (
                    <span className="text-sm text-muted-foreground">
                      |error| = {r.abs_error.toExponential(4)}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => copyResult(r)} className="gap-1.5">
                    {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => exportCSV(m, r)} className="gap-1.5">
                    <Download className="h-4 w-4" /> CSV
                  </Button>
                </div>
              </div>

              {/* Bar chart of sample points */}
              <div className="h-52 w-full">
                <ResponsiveContainer>
                  <BarChart data={r.steps.slice(0, 30)} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" tickFormatter={(v) => Number(v).toFixed(2)} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [v.toPrecision(6), 'f(x)']} labelFormatter={(l) => `x = ${Number(l).toFixed(4)}`} />
                    <Bar dataKey="fx" fill="hsl(var(--primary))" opacity={0.7} name="f(x)" />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Step table */}
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border text-left">
                      <th className="px-3 py-2 font-semibold text-muted-foreground">Node</th>
                      <th className="px-3 py-2 font-semibold text-muted-foreground">x_i</th>
                      <th className="px-3 py-2 font-semibold text-muted-foreground">f(x_i)</th>
                      <th className="px-3 py-2 font-semibold text-muted-foreground">Weight</th>
                      <th className="px-3 py-2 font-semibold text-muted-foreground">Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.steps.map((s, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="px-3 py-1.5 font-mono text-muted-foreground">{s.label}</td>
                        <td className="px-3 py-1.5 font-mono">{s.x.toPrecision(8)}</td>
                        <td className="px-3 py-1.5 font-mono">{s.fx.toPrecision(8)}</td>
                        <td className="px-3 py-1.5 font-mono">{s.weight}</td>
                        <td className="px-3 py-1.5 font-mono text-muted-foreground">{(s.weight * s.fx).toPrecision(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {Object.keys(results).length === 0 && !loading && (
        <div className="py-12 text-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
          Enter a function and bounds, then click <strong>Compute All Methods</strong>.
        </div>
      )}
    </div>
  );
}

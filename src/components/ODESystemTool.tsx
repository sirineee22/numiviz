/**
 * ODESystemTool — Pendulum · Lotka-Volterra · Custom 2-eq system via RK4
 * Backend: POST /api/ode/system
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, RotateCcw, Download } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter,
} from 'recharts';
import { API_BASE } from '@/lib/api';

interface ODESysPoint { t: number; y1: number; y2: number; }
interface ODESystemResponse {
  preset: string;
  points: ODESysPoint[];
  label_y1: string;
  label_y2: string;
  h: number;
  total_steps: number;
}

const COLORS = { y1: 'hsl(var(--primary))', y2: '#f97316' };

export default function ODESystemTool() {
  const [preset, setPreset] = useState<'pendulum' | 'lotka-volterra' | 'custom'>('pendulum');
  const [result, setResult] = useState<ODESystemResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'time' | 'phase'>('time');

  // Pendulum params
  const [theta0, setTheta0] = useState('1.0');
  const [omega0, setOmega0] = useState('0.0');
  const [length, setLength] = useState('1.0');
  const [damping, setDamping] = useState('0.0');
  const [tEnd, setTEnd] = useState('20');
  const [h, setH] = useState('0.05');

  // Lotka-Volterra params
  const [x0, setX0] = useState('10');
  const [y0, setY0] = useState('5');
  const [alpha, setAlpha] = useState('1.0');
  const [beta, setBeta] = useState('0.1');
  const [delta, setDelta] = useState('0.075');
  const [gamma, setGamma] = useState('1.5');
  const [lvTEnd, setLvTEnd] = useState('50');

  // Custom params
  const [f1, setF1] = useState('-y2');
  const [f2, setF2] = useState('y1');
  const [cy1_0, setCy1_0] = useState('1.0');
  const [cy2_0, setCy2_0] = useState('0.0');
  const [cTEnd, setCTEnd] = useState('20');

  const run = async () => {
    setLoading(true); setError(null);
    try {
      const body: Record<string, unknown> = { preset };

      if (preset === 'pendulum') {
        Object.assign(body, {
          y1_0: parseFloat(theta0), y2_0: parseFloat(omega0),
          length: parseFloat(length), damping: parseFloat(damping),
          t_end: parseFloat(tEnd), h: parseFloat(h),
        });
      } else if (preset === 'lotka-volterra') {
        Object.assign(body, {
          y1_0: parseFloat(x0), y2_0: parseFloat(y0),
          alpha: parseFloat(alpha), beta: parseFloat(beta),
          delta: parseFloat(delta), gamma: parseFloat(gamma),
          t_end: parseFloat(lvTEnd), h: 0.05,
        });
      } else {
        Object.assign(body, {
          f1, f2,
          y1_0: parseFloat(cy1_0), y2_0: parseFloat(cy2_0),
          t_end: parseFloat(cTEnd), h: parseFloat(h),
        });
      }

      const res = await fetch(`${API_BASE}/api/ode/system`, {
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
    } finally { setLoading(false); }
  };

  const reset = () => { setResult(null); setError(null); };

  const exportCSV = () => {
    if (!result) return;
    const header = `t,${result.label_y1},${result.label_y2}\n`;
    const rows = result.points.map(p => `${p.t},${p.y1},${p.y2}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ode_system_${preset}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Downsample for chart performance
  const chartPts = result ? (result.points.length > 600
    ? result.points.filter((_, i) => i % Math.ceil(result.points.length / 600) === 0)
    : result.points) : [];

  return (
    <div className="space-y-5">
      {/* Preset tabs */}
      <Tabs value={preset} onValueChange={v => { setPreset(v as typeof preset); setResult(null); }}>
        <TabsList>
          <TabsTrigger value="pendulum">Pendulum</TabsTrigger>
          <TabsTrigger value="lotka-volterra">Lotka-Volterra</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        {/* ── Pendulum ── */}
        <TabsContent value="pendulum" className="mt-4">
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              θ″ + (g/L)sin(θ) + c·θ′ = 0 &nbsp;→&nbsp; system: θ′ = ω, ω′ = −(g/L)sin(θ) − c·ω
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'θ₀ (rad)', val: theta0, set: setTheta0 },
                { label: 'ω₀ (rad/s)', val: omega0, set: setOmega0 },
                { label: 'Length L (m)', val: length, set: setLength },
                { label: 'Damping c', val: damping, set: setDamping },
                { label: 't end', val: tEnd, set: setTEnd },
                { label: 'Step h', val: h, set: setH },
              ].map(f => (
                <div key={f.label} className="space-y-1">
                  <Label className="text-xs">{f.label}</Label>
                  <Input className="font-mono text-sm" type="number" value={f.val} onChange={e => f.set(e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Lotka-Volterra ── */}
        <TabsContent value="lotka-volterra" className="mt-4">
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              dx/dt = αx − βxy &nbsp;(prey)&nbsp;&nbsp;·&nbsp;&nbsp; dy/dt = δxy − γy &nbsp;(predator)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Prey x₀', val: x0, set: setX0 },
                { label: 'Predator y₀', val: y0, set: setY0 },
                { label: 'α (prey growth)', val: alpha, set: setAlpha },
                { label: 'β (predation)', val: beta, set: setBeta },
                { label: 'δ (pred. growth)', val: delta, set: setDelta },
                { label: 'γ (pred. death)', val: gamma, set: setGamma },
              ].map(f => (
                <div key={f.label} className="space-y-1">
                  <Label className="text-xs">{f.label}</Label>
                  <Input className="font-mono text-sm" type="number" value={f.val} onChange={e => f.set(e.target.value)} />
                </div>
              ))}
              <div className="space-y-1">
                <Label className="text-xs">t end</Label>
                <Input className="font-mono text-sm" type="number" value={lvTEnd} onChange={e => setLvTEnd(e.target.value)} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Custom ── */}
        <TabsContent value="custom" className="mt-4">
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Variables: t, y1, y2 &nbsp;·&nbsp; Use standard math syntax
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">dy1/dt = f1(t, y1, y2)</Label>
                <Input className="font-mono text-sm" value={f1} onChange={e => setF1(e.target.value)} placeholder="-y2" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">dy2/dt = f2(t, y1, y2)</Label>
                <Input className="font-mono text-sm" value={f2} onChange={e => setF2(e.target.value)} placeholder="y1" />
              </div>
              {[
                { label: 'y1(0)', val: cy1_0, set: setCy1_0 },
                { label: 'y2(0)', val: cy2_0, set: setCy2_0 },
                { label: 't end', val: cTEnd, set: setCTEnd },
                { label: 'Step h', val: h, set: setH },
              ].map(f => (
                <div key={f.label} className="space-y-1">
                  <Label className="text-xs">{f.label}</Label>
                  <Input className="font-mono text-sm" type="number" value={f.val} onChange={e => f.set(e.target.value)} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={run} disabled={loading} className="gap-1.5">
          <Play className="h-4 w-4" /> {loading ? 'Solving…' : 'Run RK4'}
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

      {result && (
        <>
          {/* Summary */}
          <div className="flex gap-4 text-xs text-muted-foreground font-mono">
            <span>Steps: <strong className="text-foreground">{result.total_steps}</strong></span>
            <span>h = <strong className="text-foreground">{result.h}</strong></span>
            <span>Points: <strong className="text-foreground">{result.points.length}</strong></span>
          </div>

          {/* View toggle */}
          <div className="flex gap-1">
            {(['time', 'phase'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  view === v ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}>
                {v === 'time' ? 'Time series' : 'Phase portrait'}
              </button>
            ))}
          </div>

          {/* Time series */}
          {view === 'time' && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Time evolution
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer>
                  <LineChart data={chartPts} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="t" tick={{ fontSize: 10 }} label={{ value: 't', position: 'insideBottomRight', offset: -5, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [v?.toPrecision(6), '']} labelFormatter={l => `t = ${Number(l).toFixed(3)}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="y1" name={result.label_y1}
                      stroke={COLORS.y1} dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="y2" name={result.label_y2}
                      stroke={COLORS.y2} dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Phase portrait */}
          {view === 'phase' && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Phase portrait — {result.label_y1} vs {result.label_y2}
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="y1" name={result.label_y1} tick={{ fontSize: 10 }}
                      label={{ value: result.label_y1, position: 'insideBottomRight', offset: -5, fontSize: 10 }} />
                    <YAxis dataKey="y2" name={result.label_y2} tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: number) => [v?.toPrecision(5), '']} />
                    <Scatter name="Trajectory" data={chartPts} fill={COLORS.y1} opacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {!result && !loading && (
        <div className="py-12 text-center text-muted-foreground text-sm border-2 border-dashed border-border/50 rounded-xl">
          Select a preset and click <strong>Run RK4</strong> to solve the system.
        </div>
      )}
    </div>
  );
}

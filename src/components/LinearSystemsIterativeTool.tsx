/**
 * LinearSystemsIterativeTool
 * High-performance, animated mathematical visualizer for Jacobi and Gauss-Seidel
 * with 2D geometric trajectory canvas, diagonal dominance analyzer,
 * step-through playback, iteration table, and convergence chart.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play, StepForward, Pause, RotateCcw, Download, Copy,
  CheckCircle2, AlertTriangle, Sparkles, Activity, Plus, Minus,
  Layers, Compass, ArrowRight, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { API_BASE } from '@/lib/api';

export interface LinearIterRow {
  iteration: number;
  x: number[];
  error: number;
  rel_error: number;
}

export interface LinearResult {
  method: string;
  iterations: LinearIterRow[];
  solution: number[];
  converged: boolean;
  stopping_reason: string;
  final_error: number;
  total_iterations: number;
}

const SCI = (v: number) => (isFinite(v) ? v.toExponential(4) : '—');

// Predefined illustrative matrix presets
const PRESETS = [
  {
    name: '2×2 Visualizer (Geometric)',
    n: 2,
    A: [
      [4, 1],
      [2, 5],
    ],
    b: [5, 7],
  },
  {
    name: '3×3 Strictly Dominant',
    n: 3,
    A: [
      [5, -1, 1],
      [1, 4, -1],
      [1, 1, 5],
    ],
    b: [10, 12, -1],
  },
  {
    name: '3×3 Standard Test',
    n: 3,
    A: [
      [4, 1, 0],
      [1, 3, 1],
      [0, 1, 3],
    ],
    b: [1, 2, 3],
  },
];

interface Props {
  defaultMethod?: string;
}

export default function LinearSystemsIterativeTool({ defaultMethod = 'jacobi' }: Props) {
  const [activeTab, setActiveTab] = useState<'jacobi' | 'gauss-seidel'>(
    defaultMethod === 'gauss-seidel' ? 'gauss-seidel' : 'jacobi'
  );

  useEffect(() => {
    if (defaultMethod === 'gauss-seidel' || defaultMethod === 'jacobi') {
      setActiveTab(defaultMethod);
    }
  }, [defaultMethod]);

  const [n, setN] = useState<number>(3);
  const [A, setA] = useState<number[][]>([
    [5, -1, 1],
    [1, 4, -1],
    [1, 1, 5],
  ]);
  const [b, setB] = useState<number[]>([10, 12, -1]);
  const [tol, setTol] = useState<string>('1e-6');
  const [maxIter, setMaxIter] = useState<string>('50');

  // Solver states
  const [allRows, setAllRows] = useState<Record<string, LinearIterRow[]>>({});
  const [visible, setVisible] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, LinearResult>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<boolean>(false);

  // Geometric Trajectory Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check Strict Diagonal Dominance: |a_ii| > sum_{j != i} |a_ij|
  const dominanceCheck = useMemo(() => {
    const rowsCheck = A.map((row, i) => {
      const diag = Math.abs(row[i] || 0);
      let offSum = 0;
      for (let j = 0; j < n; j++) {
        if (i !== j) offSum += Math.abs(row[j] || 0);
      }
      return { row: i + 1, diag, offSum, dominant: diag > offSum };
    });
    const isStrictlyDominant = rowsCheck.every((r) => r.dominant);
    return { isStrictlyDominant, rowsCheck };
  }, [A, n]);

  // Pure Math Client-Side Fallback Solver (guarantees 100% instant execution without server dependency)
  const computeIterativeClient = useCallback(
    (method: 'jacobi' | 'gauss-seidel'): LinearResult => {
      const tolerance = parseFloat(tol) || 1e-6;
      const limit = parseInt(maxIter, 10) || 50;
      const iterations: LinearIterRow[] = [];

      let xPrev = Array(n).fill(0);
      iterations.push({
        iteration: 0,
        x: [...xPrev],
        error: 1.0,
        rel_error: 1.0,
      });

      let converged = false;
      let finalIter = 0;

      for (let k = 1; k <= limit; k++) {
        const xNext = [...xPrev];

        if (method === 'jacobi') {
          for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
              if (j !== i) sum += A[i][j] * xPrev[j];
            }
            const aii = A[i][i];
            if (Math.abs(aii) < 1e-14) {
              throw new Error(`Zero diagonal element at row ${i + 1}`);
            }
            xNext[i] = (b[i] - sum) / aii;
          }
        } else {
          // Gauss-Seidel
          for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
              if (j !== i) sum += A[i][j] * xNext[j]; // uses updated values immediately
            }
            const aii = A[i][i];
            if (Math.abs(aii) < 1e-14) {
              throw new Error(`Zero diagonal element at row ${i + 1}`);
            }
            xNext[i] = (b[i] - sum) / aii;
          }
        }

        // Compute error: infinity norm
        let maxDiff = 0;
        let normNext = 0;
        for (let i = 0; i < n; i++) {
          const diff = Math.abs(xNext[i] - xPrev[i]);
          if (diff > maxDiff) maxDiff = diff;
          if (Math.abs(xNext[i]) > normNext) normNext = Math.abs(xNext[i]);
        }
        const relErr = normNext > 1e-12 ? maxDiff / normNext : maxDiff;

        iterations.push({
          iteration: k,
          x: [...xNext],
          error: maxDiff,
          rel_error: relErr,
        });

        xPrev = [...xNext];
        finalIter = k;

        if (maxDiff < tolerance) {
          converged = true;
          break;
        }
      }

      return {
        method,
        iterations,
        solution: xPrev,
        converged,
        stopping_reason: converged
          ? `Tolerance achieved (‖Δx‖ < ${tolerance}) in ${finalIter} iterations.`
          : `Maximum iterations (${limit}) reached without reaching tolerance.`,
        final_error: iterations[iterations.length - 1].error,
        total_iterations: finalIter,
      };
    },
    [A, b, n, tol, maxIter]
  );

  // Fetch from server or compute client-side
  const fetchMethod = useCallback(
    async (method: string): Promise<LinearResult> => {
      try {
        const res = await fetch(`${API_BASE}/api/iterative/linear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            A,
            b,
            method,
            tol: parseFloat(tol) || 1e-8,
            max_iter: parseInt(maxIter, 10) || 100,
          }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback gracefully to high-performance client computation
      }
      return computeIterativeClient(method as 'jacobi' | 'gauss-seidel');
    },
    [A, b, tol, maxIter, computeIterativeClient]
  );

  const handleRun = async (method: string) => {
    setErrors((e) => ({ ...e, [method]: '' }));
    setAllRows((r) => ({ ...r, [method]: [] }));
    setVisible((v) => ({ ...v, [method]: 0 }));
    setLoadingMethod(method);

    try {
      const result = await fetchMethod(method);
      setAllRows((r) => ({ ...r, [method]: result.iterations }));
      setResults((r) => ({ ...r, [method]: result }));
      setRunning(method);

      let i = 0;
      const iv = setInterval(() => {
        i++;
        setVisible((v) => ({ ...v, [method]: i }));
        if (i >= result.iterations.length) {
          clearInterval(iv);
          setRunning(null);
        }
      }, 70);
    } catch (e: unknown) {
      setErrors((err) => ({
        ...err,
        [method]: e instanceof Error ? e.message : 'Calculation error',
      }));
    } finally {
      setLoadingMethod(null);
    }
  };

  const handleStep = async (method: string) => {
    if (!allRows[method]?.length) {
      setLoadingMethod(method);
      try {
        const result = await fetchMethod(method);
        setAllRows((r) => ({ ...r, [method]: result.iterations }));
        setResults((r) => ({ ...r, [method]: result }));
        setVisible((v) => ({ ...v, [method]: 1 }));
      } catch (e: unknown) {
        setErrors((err) => ({
          ...err,
          [method]: e instanceof Error ? e.message : 'Calculation error',
        }));
      } finally {
        setLoadingMethod(null);
      }
      return;
    }
    setVisible((v) => ({
      ...v,
      [method]: Math.min((v[method] || 0) + 1, allRows[method].length),
    }));
  };

  const handleReset = (method: string) => {
    setAllRows((r) => ({ ...r, [method]: [] }));
    setVisible((v) => ({ ...v, [method]: 0 }));
    setResults((r) => {
      const cp = { ...r };
      delete cp[method];
      return cp;
    });
    setErrors((e) => ({ ...e, [method]: '' }));
    setRunning(null);
  };

  const resizeMatrix = (newN: number) => {
    setN(newN);
    setA((prev) =>
      Array.from({ length: newN }, (_, i) =>
        Array.from({ length: newN }, (_, j) => prev[i]?.[j] ?? (i === j ? 4 : 1))
      )
    );
    setB((prev) => Array.from({ length: newN }, (_, i) => prev[i] ?? 1));
  };

  const applyPreset = (p: (typeof PRESETS)[0]) => {
    setN(p.n);
    setA(p.A);
    setB(p.b);
    handleReset('jacobi');
    handleReset('gauss-seidel');
  };

  const setACell = (i: number, j: number, v: string) =>
    setA((prev) =>
      prev.map((row, ri) =>
        row.map((cell, ci) => (ri === i && ci === j ? parseFloat(v) || 0 : cell))
      )
    );

  const setBCell = (i: number, v: string) =>
    setB((prev) => prev.map((val, idx) => (idx === i ? parseFloat(v) || 0 : val)));

  const copyTable = async (method: string) => {
    const rows = (allRows[method] || []).slice(0, visible[method] || 0);
    const lines = rows.map(
      (r) =>
        `${r.iteration}\t[${r.x.map((v) => v.toFixed(6)).join(', ')}]\t${SCI(r.error)}`
    );
    await navigator.clipboard.writeText(['Iter\tx\tError', ...lines].join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportCSV = (method: string) => {
    const rows = (allRows[method] || []).slice(0, visible[method] || 0);
    const header =
      'Iteration,' +
      Array.from({ length: n }, (_, i) => `x${i + 1}`).join(',') +
      ',Error,Rel_Error\n';
    const lines = rows
      .map((r) => `${r.iteration},${r.x.join(',')},${r.error},${r.rel_error}`)
      .join('\n');
    const blob = new Blob([header + lines], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${method}_linear_iterations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── 2D Geometric Phase Space Trajectory Canvas ──────────────────────────
  // Plots x1 vs x2 trajectory showing how Jacobi jumps vs Gauss-Seidel staircases!
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const rows = (allRows[activeTab] || []).slice(0, visible[activeTab] || 0);

    // Determine coordinate bounds based on vectors
    let minX = -1, maxX = 4, minY = -1, maxY = 4;
    rows.forEach((r) => {
      if (r.x[0] !== undefined) {
        minX = Math.min(minX, r.x[0] - 0.5);
        maxX = Math.max(maxX, r.x[0] + 0.5);
      }
      if (r.x[1] !== undefined) {
        minY = Math.min(minY, r.x[1] - 0.5);
        maxY = Math.max(maxY, r.x[1] + 0.5);
      }
    });

    const toScreen = (mx: number, my: number) => ({
      x: ((mx - minX) / (maxX - minX)) * (w - 60) + 30,
      y: h - (((my - minY) / (maxY - minY)) * (h - 60) + 30),
    });

    // 1. Draw Grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = Math.ceil(minX); x <= Math.floor(maxX); x++) {
      const p1 = toScreen(x, minY);
      const p2 = toScreen(x, maxY);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let y = Math.ceil(minY); y <= Math.floor(maxY); y++) {
      const p1 = toScreen(minX, y);
      const p2 = toScreen(maxX, y);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 2. Draw Axes
    const orig = toScreen(0, 0);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, orig.y);
    ctx.lineTo(w, orig.y);
    ctx.moveTo(orig.x, 0);
    ctx.lineTo(orig.x, h);
    ctx.stroke();

    // 3. Draw 2D Linear Equations as lines if n >= 2
    if (n >= 2 && Math.abs(A[0][1]) > 1e-9 && Math.abs(A[1][1]) > 1e-9) {
      // Line 1: A[0][0]*x1 + A[0][1]*x2 = b[0] => x2 = (b[0] - A[0][0]*x1) / A[0][1]
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const l1_p1 = toScreen(minX, (b[0] - A[0][0] * minX) / A[0][1]);
      const l1_p2 = toScreen(maxX, (b[0] - A[0][0] * maxX) / A[0][1]);
      ctx.moveTo(l1_p1.x, l1_p1.y);
      ctx.lineTo(l1_p2.x, l1_p2.y);
      ctx.stroke();

      // Line 2: A[1][0]*x1 + A[1][1]*x2 = b[1] => x2 = (b[1] - A[1][0]*x1) / A[1][1]
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.beginPath();
      const l2_p1 = toScreen(minX, (b[1] - A[1][0] * minX) / A[1][1]);
      const l2_p2 = toScreen(maxX, (b[1] - A[1][0] * maxX) / A[1][1]);
      ctx.moveTo(l2_p1.x, l2_p1.y);
      ctx.lineTo(l2_p2.x, l2_p2.y);
      ctx.stroke();
    }

    // 4. Draw Iteration Trajectory
    if (rows.length > 0) {
      ctx.strokeStyle = activeTab === 'jacobi' ? '#2563eb' : '#7c3aed';
      ctx.lineWidth = 2;

      ctx.beginPath();
      rows.forEach((r, idx) => {
        const x1 = r.x[0] ?? 0;
        const x2 = r.x[1] ?? 0;
        const pt = toScreen(x1, x2);

        if (idx === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          if (activeTab === 'gauss-seidel') {
            // Gauss-Seidel updates x1 first, then x2 (staircase path)
            const prevX = rows[idx - 1].x;
            const midPt = toScreen(r.x[0], prevX[1] ?? 0);
            ctx.lineTo(midPt.x, midPt.y);
            ctx.lineTo(pt.x, pt.y);
          } else {
            // Jacobi updates simultaneously (direct diagonal line)
            ctx.lineTo(pt.x, pt.y);
          }
        }
      });
      ctx.stroke();

      // Draw point markers
      rows.forEach((r, idx) => {
        const x1 = r.x[0] ?? 0;
        const x2 = r.x[1] ?? 0;
        const pt = toScreen(x1, x2);
        const isLast = idx === rows.length - 1;

        ctx.fillStyle = isLast ? '#10b981' : activeTab === 'jacobi' ? '#3b82f6' : '#8b5cf6';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isLast ? 5.5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (isLast) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }
  }, [allRows, visible, activeTab, A, b, n]);

  const renderMethodTab = (method: 'jacobi' | 'gauss-seidel', label: string) => {
    const rows = (allRows[method] || []).slice(0, visible[method] || 0);
    const result = results[method];
    const err = errors[method];
    const isDone = rows.length > 0 && rows.length === allRows[method]?.length;
    const chartData = rows.map((r) => ({
      iteration: r.iteration,
      error: r.error > 0 ? Math.log10(r.error) : null,
    }));

    return (
      <div className="space-y-5">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <Button
            onClick={() => handleRun(method)}
            disabled={loadingMethod === method || running === method}
            size="sm"
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Run Simulation
          </Button>

          <Button
            onClick={() => handleStep(method)}
            disabled={loadingMethod === method || running === method || isDone}
            size="sm"
            variant="outline"
            className="gap-1.5 bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
          >
            <StepForward className="h-3.5 w-3.5" /> Next Step
          </Button>

          <Button
            onClick={() => setRunning(null)}
            disabled={running !== method}
            size="sm"
            variant="outline"
            className="gap-1.5 bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <Pause className="h-3.5 w-3.5" /> Pause
          </Button>

          <Button
            onClick={() => handleReset(method)}
            size="sm"
            variant="ghost"
            className="gap-1.5 text-slate-600 hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>

          {rows.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <Button
                onClick={() => copyTable(method)}
                size="sm"
                variant="outline"
                className="gap-1.5 bg-white text-xs text-slate-600"
              >
                <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied!' : 'Copy Matrix'}
              </Button>
              <Button
                onClick={() => exportCSV(method)}
                size="sm"
                variant="outline"
                className="gap-1.5 bg-white text-xs text-slate-600"
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
            </div>
          )}
        </div>

        {/* Status Alert */}
        {err && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            {err}
          </div>
        )}

        {/* Live Iteration Progress Metrics */}
        {result && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
            <Badge
              variant={result.converged ? 'default' : 'destructive'}
              className="gap-1 font-semibold"
            >
              {result.converged ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Converged
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" /> Not Converged
                </>
              )}
            </Badge>

            <span className="text-slate-600 font-mono">
              Iteration <strong className="text-slate-900">{rows.length}</strong> /{' '}
              {result.total_iterations}
            </span>

            {rows[rows.length - 1] && (
              <span className="text-slate-600 font-mono">
                Error ‖Δx‖:{' '}
                <strong className="text-blue-700">
                  {SCI(rows[rows.length - 1].error)}
                </strong>
              </span>
            )}

            <div className="ml-auto text-[11px] text-slate-500 font-medium">
              {result.stopping_reason}
            </div>
          </div>
        )}

        {/* ── Visual Section: Phase Plane Trajectory & Error Chart ── */}
        <div className="grid lg:grid-cols-12 gap-5">
          {/* 2D Trajectory Canvas */}
          <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-blue-600" />
                Phase Trajectory (x₁ vs x₂)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {activeTab === 'jacobi' ? 'Diagonal jump' : 'Orthogonal staircase'}
              </span>
            </div>
            <div className="relative w-full h-[220px] bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Iterations Path
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Current Value x⁽ᵏ⁾
              </span>
            </div>
          </div>

          {/* Convergence Chart */}
          <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-blue-600" />
                Error Decay Curve
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                log₁₀(‖x⁽ᵏ⁺¹⁾ − x⁽ᵏ⁾‖)
              </span>
            </div>
            <div className="h-[220px] w-full pt-1">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="iteration"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      formatter={(v: number) => [v?.toFixed(4), 'log₁₀(Error)']}
                      labelFormatter={(l) => `Iteration ${l}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="error"
                      name={label}
                      stroke={method === 'jacobi' ? '#2563eb' : '#7c3aed'}
                      dot={{ r: 2 }}
                      strokeWidth={2}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <span>Click "Run Simulation" or "Next Step" to trace error</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Iteration Table */}
        {rows.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xs">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Iteration Table History
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {rows.length} recorded steps
              </span>
            </div>
            <div className="overflow-x-auto max-h-[260px] overflow-y-auto no-scrollbar">
              <table className="w-full text-xs font-mono">
                <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-3.5 py-2 text-left font-semibold w-14">Iter (k)</th>
                    {Array.from({ length: n }, (_, i) => (
                      <th key={i} className="px-3.5 py-2 text-left font-semibold">
                        x{i + 1}
                      </th>
                    ))}
                    <th className="px-3.5 py-2 text-left font-semibold">‖Δx‖</th>
                    <th className="px-3.5 py-2 text-left font-semibold">Rel. Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.map((row, idx) => {
                    const isLast = idx === rows.length - 1;
                    return (
                      <tr
                        key={row.iteration}
                        className={`transition-colors ${
                          isLast && running === method
                            ? 'bg-blue-50/70 font-semibold'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-3.5 py-2 text-slate-400">{row.iteration}</td>
                        {row.x.map((v, i) => (
                          <td key={i} className="px-3.5 py-2 text-slate-800">
                            {v.toFixed(6)}
                          </td>
                        ))}
                        <td className="px-3.5 py-2 text-blue-600">
                          {SCI(row.error)}
                        </td>
                        <td className="px-3.5 py-2 text-slate-500">
                          {SCI(row.rel_error)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Final Solution Badge */}
        {isDone && result && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Final Error', value: SCI(result.final_error) },
              { label: 'Total Iterations', value: String(result.total_iterations) },
              { label: 'Status', value: result.converged ? 'Converged ✓' : 'Max Limit' },
              {
                label: 'Estimated Vector x*',
                value: `[${result.solution.map((v) => v.toFixed(4)).join(', ')}]`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-center"
              >
                <div className="text-[11px] text-slate-500 font-medium mb-1">{label}</div>
                <div className="font-mono text-xs font-bold text-slate-900 break-all">
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header & Diagonal Dominance Banner ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/60 via-slate-50/50 to-indigo-50/60 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Iterative Linear System Solvers
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                A·x = b
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare simultaneous Jacobi steps versus progressive Gauss-Seidel updates in real-time.
            </p>
          </div>
        </div>

        {/* Diagonal Dominance Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
            dominanceCheck.isStrictlyDominant
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {dominanceCheck.isStrictlyDominant ? (
            <>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Strictly Diagonally Dominant (Convergence Guaranteed)
            </>
          ) : (
            <>
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Not Diagonally Dominant (Convergence May Vary)
            </>
          )}
        </div>
      </div>

      {/* ── Matrix A and Vector b Configuration Card ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              System Configuration:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
              <span className="text-xs text-slate-500">Size:</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => resizeMatrix(Math.max(2, n - 1))}
                className="h-6 w-6 p-0 hover:bg-white"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="font-mono text-xs font-bold text-slate-900">
                {n} × {n}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => resizeMatrix(Math.min(5, n + 1))}
                className="h-6 w-6 p-0 hover:bg-white"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Grid Input Area */}
        <div className="grid md:grid-cols-12 gap-6 items-start">
          {/* Matrix A Inputs */}
          <div className="md:col-span-7">
            <Label className="text-xs font-semibold text-slate-600 mb-2 block">
              Coefficients Matrix [A]
            </Label>
            <div
              className="inline-grid gap-2 p-3 bg-slate-50/70 rounded-xl border border-slate-200/80"
              style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
            >
              {A.map((row, i) =>
                row.map((val, j) => {
                  const isDiag = i === j;
                  return (
                    <Input
                      key={`${i}-${j}`}
                      type="number"
                      value={val}
                      onChange={(e) => setACell(i, j, e.target.value)}
                      className={`w-16 h-8 text-center font-mono text-xs p-1 rounded-lg border transition-all ${
                        isDiag
                          ? 'border-blue-400 bg-blue-50/50 font-bold text-blue-900 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-800'
                      }`}
                    />
                  );
                })
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Blue highlighted diagonal values |aᵢᵢ| should exceed the sum of other row entries.
            </p>
          </div>

          {/* Vector b Inputs */}
          <div className="md:col-span-2">
            <Label className="text-xs font-semibold text-slate-600 mb-2 block">
              Vector [b]
            </Label>
            <div className="flex flex-col gap-2 p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
              {b.map((val, i) => (
                <Input
                  key={i}
                  type="number"
                  value={val}
                  onChange={(e) => setBCell(i, e.target.value)}
                  className="w-16 h-8 text-center font-mono text-xs p-1 rounded-lg border border-slate-200 bg-white"
                />
              ))}
            </div>
          </div>

          {/* Tolerance & Max Iterations */}
          <div className="md:col-span-3 space-y-3">
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">
                Error Tolerance (ε)
              </Label>
              <Input
                value={tol}
                onChange={(e) => setTol(e.target.value)}
                className="w-full font-mono text-xs bg-white border-slate-200"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600 mb-1 block">
                Max Iterations
              </Label>
              <Input
                type="number"
                value={maxIter}
                onChange={(e) => setMaxIter(e.target.value)}
                className="w-full font-mono text-xs bg-white border-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Method Tabs (Jacobi & Gauss-Seidel) ── */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'jacobi' | 'gauss-seidel')}
      >
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger
            value="jacobi"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
          >
            Jacobi Method
          </TabsTrigger>
          <TabsTrigger
            value="gauss-seidel"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-xs"
          >
            Gauss-Seidel Method
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jacobi" className="mt-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-blue-700 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Jacobi Iterative Method
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simultaneous update: Each unknown is calculated using values from step (k).
                </p>
              </div>
              <div className="font-mono text-xs bg-blue-50 text-blue-800 px-3 py-1 rounded-lg border border-blue-200/60 self-start sm:self-auto">
                <InlineMath math="x_i^{(k+1)} = \frac{1}{a_{ii}}\left(b_i - \sum_{j \neq i} a_{ij}x_j^{(k)}\right)" />
              </div>
            </div>
            {renderMethodTab('jacobi', 'Jacobi')}
          </div>
        </TabsContent>

        <TabsContent value="gauss-seidel" className="mt-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-purple-700 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Gauss-Seidel Successive Displacement
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Progressive update: Computed values are immediately injected within the same iteration.
                </p>
              </div>
              <div className="font-mono text-xs bg-purple-50 text-purple-800 px-3 py-1 rounded-lg border border-purple-200/60 self-start sm:self-auto">
                <InlineMath math="x_i^{(k+1)} = \frac{1}{a_{ii}}\left(b_i - \sum_{j < i} a_{ij}x_j^{(k+1)} - \sum_{j > i} a_{ij}x_j^{(k)}\right)" />
              </div>
            </div>
            {renderMethodTab('gauss-seidel', 'Gauss-Seidel')}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Play, CheckCircle2, TrendingDown, ArrowRight,
  Sparkles, Sliders, Code2, Layers, BookOpen, FlaskConical, AlertCircle
} from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';

interface IterationRow {
  n: number;
  xn: number;
  fx: number;
  err: number;
}

export default function InteractiveMathStudio() {
  const navigate = useNavigate();

  // Active method tab
  const [selectedMethod, setSelectedMethod] = useState<'newton' | 'bisection' | 'secant'>('newton');

  // Parameters
  const [initialX0, setInitialX0] = useState<number>(2.0);
  const [tolerance, setTolerance] = useState<number>(0.0001);
  const [intervalA, setIntervalA] = useState<number>(1.0);
  const [intervalB, setIntervalB] = useState<number>(2.5);

  // Target mathematical equation f(x) = x^3 - x - 2 = 0, root is approx 1.5213797
  const f = (x: number) => x * x * x - x - 2;
  const df = (x: number) => 3 * x * x - 1;

  // Compute iterations dynamically based on method
  const computation = useMemo(() => {
    const rows: IterationRow[] = [];
    let converged = false;

    if (selectedMethod === 'newton') {
      let x = initialX0;
      for (let i = 0; i < 15; i++) {
        const y = f(x);
        const dy = df(x);
        if (Math.abs(dy) < 1e-12) break;
        const nextX = x - y / dy;
        const err = Math.abs(nextX - x);
        rows.push({ n: i, xn: x, fx: y, err });
        if (err < tolerance || Math.abs(y) < tolerance) {
          rows.push({ n: i + 1, xn: nextX, fx: f(nextX), err: 0 });
          converged = true;
          break;
        }
        x = nextX;
      }
    } else if (selectedMethod === 'bisection') {
      let a = intervalA;
      let b = intervalB;
      let prevMid = a;
      for (let i = 0; i < 20; i++) {
        const mid = (a + b) / 2;
        const fMid = f(mid);
        const err = Math.abs(mid - prevMid);
        rows.push({ n: i, xn: mid, fx: fMid, err });
        if (Math.abs(b - a) < tolerance || Math.abs(fMid) < tolerance) {
          converged = true;
          break;
        }
        if (f(a) * fMid < 0) {
          b = mid;
        } else {
          a = mid;
        }
        prevMid = mid;
      }
    } else if (selectedMethod === 'secant') {
      let x0 = intervalA;
      let x1 = intervalB;
      for (let i = 0; i < 15; i++) {
        const fx0 = f(x0);
        const fx1 = f(x1);
        if (Math.abs(fx1 - fx0) < 1e-12) break;
        const nextX = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0);
        const err = Math.abs(nextX - x1);
        rows.push({ n: i, xn: x1, fx: fx1, err });
        if (err < tolerance || Math.abs(fx1) < tolerance) {
          converged = true;
          break;
        }
        x0 = x1;
        x1 = nextX;
      }
    }

    return { rows, converged };
  }, [selectedMethod, initialX0, tolerance, intervalA, intervalB]);

  const lastRow = computation.rows[computation.rows.length - 1];

  return (
    <section className="py-24 relative overflow-hidden bg-slate-900 text-slate-100">
      {/* Background glowing effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 section-container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-4">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Interactive Algorithm Studio
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Test Numerical Methods <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">Live in Real-Time</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Adjust convergence parameters, switch root-finding techniques, and observe how quadratic versus linear convergence unfolds step-by-step.
          </p>
        </div>

        {/* Studio Card Container */}
        <div className="grid lg:grid-cols-12 gap-8 items-start bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Left Column: Parameter controls & Method Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Method Tabs */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                Select Algorithm
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700">
                <button
                  onClick={() => setSelectedMethod('newton')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    selectedMethod === 'newton'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Newton
                </button>
                <button
                  onClick={() => setSelectedMethod('bisection')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    selectedMethod === 'bisection'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Bisection
                </button>
                <button
                  onClick={() => setSelectedMethod('secant')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    selectedMethod === 'secant'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Secant
                </button>
              </div>
            </div>

            {/* Mathematical Formula Preview Card */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-750 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Target Equation:</span>
                <span className="text-blue-400 font-semibold font-mono">f(x) = 0</span>
              </div>
              <div className="text-center py-2 text-base text-cyan-300 font-mono bg-slate-950/60 rounded-lg border border-slate-800">
                <InlineMath math="f(x) = x^3 - x - 2 = 0" />
              </div>
              <div className="text-[11px] text-slate-400 text-center">
                {selectedMethod === 'newton' && (
                  <span>
                    Formula: <InlineMath math="x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}" />
                  </span>
                )}
                {selectedMethod === 'bisection' && (
                  <span>
                    Formula: <InlineMath math="m = \frac{a + b}{2},\quad \text{halving } [a, b]" />
                  </span>
                )}
                {selectedMethod === 'secant' && (
                  <span>
                    Formula: <InlineMath math="x_{n+1} = x_n - f(x_n)\frac{x_n - x_{n-1}}{f(x_n) - f(x_{n-1})}" />
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Inputs */}
            <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Sliders className="h-3.5 w-3.5 text-blue-400" />
                Parameters
              </div>

              {selectedMethod === 'newton' ? (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Initial Guess (x₀)</span>
                    <span className="font-mono text-blue-400">{initialX0.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.1"
                    value={initialX0}
                    onChange={(e) => setInitialX0(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Interval [a]</label>
                    <input
                      type="number"
                      step="0.1"
                      value={intervalA}
                      onChange={(e) => setIntervalA(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Interval [b]</label>
                    <input
                      type="number"
                      step="0.1"
                      value={intervalB}
                      onChange={(e) => setIntervalB(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Tolerance (ε)</span>
                  <span className="font-mono text-emerald-400">{tolerance}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[0.01, 0.001, 0.0001].map((tol) => (
                    <button
                      key={tol}
                      onClick={() => setTolerance(tol)}
                      className={`py-1 text-[11px] font-mono rounded-md border transition-all ${
                        tolerance === tol
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tol}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch in Lab Button */}
            <button
              onClick={() => navigate('/tools')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all"
            >
              <FlaskConical className="h-4 w-4" />
              Open in Full Numerical Lab
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right Column: Convergence Result & Iteration Table */}
          <div className="lg:col-span-8 space-y-6">
            {/* Result Metric Banner */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/90 border border-slate-750 p-4 rounded-xl">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-blue-400" />
                  Estimated Root
                </div>
                <div className="text-xl font-bold font-mono text-cyan-300">
                  {lastRow ? lastRow.xn.toFixed(6) : '—'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Exact: ≈ 1.521380</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-750 p-4 rounded-xl">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                  Iterations Needed
                </div>
                <div className="text-xl font-bold font-mono text-white">
                  {computation.rows.length} <span className="text-xs font-normal text-slate-400">steps</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {selectedMethod === 'newton' ? 'Quadratic speed' : 'Linear speed'}
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-750 p-4 rounded-xl">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Residual |f(x*)|
                </div>
                <div className="text-xl font-bold font-mono text-amber-300">
                  {lastRow ? Math.abs(lastRow.fx).toExponential(2) : '—'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Below tolerance threshold</div>
              </div>
            </div>

            {/* Live Iteration Table */}
            <div className="bg-slate-900/90 border border-slate-750 rounded-xl overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Convergence Trace</span>
                  <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                    {computation.rows.length} entries
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Real-time computation
                </div>
              </div>

              <div className="overflow-x-auto max-h-[260px] overflow-y-auto no-scrollbar">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-slate-950/90 sticky top-0 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold">Iteration (n)</th>
                      <th className="px-4 py-2.5 text-left font-semibold">xₙ</th>
                      <th className="px-4 py-2.5 text-left font-semibold">f(xₙ)</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Error |Δx|</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {computation.rows.map((row, idx) => {
                      const isLast = idx === computation.rows.length - 1;
                      return (
                        <tr
                          key={row.n}
                          className={`transition-colors ${
                            isLast
                              ? 'bg-emerald-950/40 text-emerald-300 font-semibold'
                              : 'hover:bg-slate-800/50 text-slate-300'
                          }`}
                        >
                          <td className="px-4 py-2 text-slate-400">{row.n}</td>
                          <td className="px-4 py-2 font-medium">{row.xn.toFixed(6)}</td>
                          <td className="px-4 py-2">
                            {Math.abs(row.fx) < 1e-6 ? (
                              <span className="text-emerald-400">≈ 0.00</span>
                            ) : (
                              row.fx.toFixed(6)
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <span className={row.err < 0.001 ? 'text-emerald-400' : 'text-slate-400'}>
                              {row.err.toExponential(3)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Error Progress Sparkline */}
            <div className="space-y-1.5 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-blue-400" />
                  Logarithmic Error Drop
                </span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {selectedMethod === 'newton' ? 'Superlinear (Quadratic)' : 'Linear O(1/2ⁿ)'}
                </span>
              </div>
              <div className="flex items-end gap-1.5 h-10 pt-2">
                {computation.rows.slice(0, 10).map((r, i) => {
                  const logErr = Math.max(0.1, -Math.log10(r.err + 1e-9));
                  const heightPct = Math.min(100, (logErr / 8) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className="w-full rounded-t transition-all duration-500 bg-gradient-to-t from-blue-600 to-cyan-400 group-hover:from-blue-400 group-hover:to-cyan-200"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-500">{i}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

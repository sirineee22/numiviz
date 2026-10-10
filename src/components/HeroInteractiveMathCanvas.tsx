import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, RotateCcw, ChevronRight, Sparkles, Activity,
  Maximize2, Zap, Layers, BarChart2, Info
} from 'lucide-react';
import { InlineMath } from 'react-katex';

type SimMode = 'newton' | 'riemann' | 'rk4';

interface NewtonStep {
  x: number;
  fx: number;
  dfx: number;
  nextX: number;
}

export default function HeroInteractiveMathCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<SimMode>('newton');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; mathX: number; mathY: number } | null>(null);

  // Newton state
  const [newtonStepIndex, setNewtonStepIndex] = useState<number>(0);
  const [newtonInitialX, setNewtonInitialX] = useState<number>(2.5);

  // Riemann state
  const [riemannN, setRiemannN] = useState<number>(8);

  // RK4 state (custom seeds placed by user or default)
  const [rk4Seeds, setRk4Seeds] = useState<Array<{ x: number; y: number }>>([
    { x: -3.5, y: 1.5 },
    { x: -3.5, y: -1.0 },
    { x: -3.5, y: 0.2 },
  ]);

  // Telemetry info
  const [telemetry, setTelemetry] = useState({
    iter: 0,
    val: '0.0000',
    fx: '0.0000',
    err: '0.00e0',
    status: 'Running',
  });

  // Target Newton function: f(x) = x^3 - 2x - 2, root ≈ 1.76929235
  const fNewton = useCallback((x: number) => x * x * x - 2 * x - 2, []);
  const dfNewton = useCallback((x: number) => 3 * x * x - 2, []);

  // Compute Newton steps up to 6 iterations
  const newtonSteps = React.useMemo<NewtonStep[]>(() => {
    const steps: NewtonStep[] = [];
    let cur = newtonInitialX;
    for (let i = 0; i < 7; i++) {
      const fx = fNewton(cur);
      const dfx = dfNewton(cur);
      if (Math.abs(dfx) < 1e-9) break;
      const next = cur - fx / dfx;
      steps.push({ x: cur, fx, dfx, nextX: next });
      cur = next;
    }
    return steps;
  }, [newtonInitialX, fNewton, dfNewton]);

  // Riemann target: f(x) = 1.8 + Math.sin(1.2 * x) * Math.cos(0.5 * x) on [0.4, 5.4]
  const fRiemann = useCallback((x: number) => 1.8 + Math.sin(1.2 * x) * Math.cos(0.5 * x), []);

  // ODE target: dy/dx = Math.sin(x) - 0.4 * y
  const fODE = useCallback((x: number, y: number) => Math.sin(x) - 0.4 * y, []);

  // Update telemetry when Newton step changes
  useEffect(() => {
    if (mode === 'newton') {
      const step = newtonSteps[Math.min(newtonStepIndex, newtonSteps.length - 1)];
      if (step) {
        const err = Math.abs(step.nextX - step.x);
        setTelemetry({
          iter: newtonStepIndex,
          val: step.x.toFixed(5),
          fx: step.fx.toFixed(5),
          err: err < 1e-5 ? '≈ 0.00 (converged)' : err.toExponential(2),
          status: err < 1e-4 ? 'Converged' : 'Iterating',
        });
      }
    } else if (mode === 'riemann') {
      // Numerical Riemann approximation
      const a = 0.5;
      const b = 5.2;
      const dx = (b - a) / riemannN;
      let leftSum = 0;
      let midSum = 0;
      for (let i = 0; i < riemannN; i++) {
        const xLeft = a + i * dx;
        const xMid = a + (i + 0.5) * dx;
        leftSum += fRiemann(xLeft) * dx;
        midSum += fRiemann(xMid) * dx;
      }
      setTelemetry({
        iter: riemannN,
        val: midSum.toFixed(4),
        fx: `n=${riemannN}`,
        err: Math.abs(leftSum - midSum).toFixed(4),
        status: 'Area approx',
      });
    } else {
      setTelemetry({
        iter: rk4Seeds.length,
        val: 'O(h⁴) RK4',
        fx: "y'=sin(x)-0.4y",
        err: '< 10⁻⁴',
        status: 'Vector Field',
      });
    }
  }, [mode, newtonStepIndex, newtonSteps, riemannN, rk4Seeds.length, fRiemann]);

  // Main Canvas Rendering Engine (60 FPS smooth loop)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let timerAcc = 0;

    // Viewport transform
    let xMin = -3.5;
    let xMax = 4.5;
    let yMin = -4;
    let yMax = 5.5;

    if (mode === 'riemann') {
      xMin = -0.5;
      xMax = 6.0;
      yMin = -0.8;
      yMax = 3.6;
    } else if (mode === 'rk4') {
      xMin = -4.5;
      xMax = 4.5;
      yMin = -3.0;
      yMax = 3.0;
    }

    const toScreen = (mx: number, my: number, w: number, h: number) => {
      const sx = ((mx - xMin) / (xMax - xMin)) * w;
      const sy = h - ((my - yMin) / (yMax - yMin)) * h;
      return { x: sx, y: sy };
    };

    const toMath = (sx: number, sy: number, w: number, h: number) => {
      const mx = xMin + (sx / w) * (xMax - xMin);
      const my = yMin + ((h - sy) / h) * (yMax - yMin);
      return { x: mx, y: my };
    };

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Handle auto-advance
      if (isPlaying) {
        timerAcc += dt * speed;
        if (mode === 'newton' && timerAcc > 1.4) {
          timerAcc = 0;
          setNewtonStepIndex((prev) => (prev + 1) % Math.min(newtonSteps.length, 5));
        } else if (mode === 'riemann' && timerAcc > 1.8) {
          timerAcc = 0;
          setRiemannN((prev) => (prev >= 32 ? 4 : prev * 2));
        }
      }

      // Handle high-DPI
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // ─── 1. Background Grid & Axes ──────────────────────────────────────────
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
      ctx.lineWidth = 1;

      // Vertical grid lines
      const xStart = Math.ceil(xMin);
      const xEnd = Math.floor(xMax);
      for (let x = xStart; x <= xEnd; x++) {
        const p1 = toScreen(x, yMin, w, h);
        const p2 = toScreen(x, yMax, w, h);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Label
        if (x !== 0) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px Inter, monospace';
          const p = toScreen(x, 0, w, h);
          ctx.fillText(x.toString(), p.x + 3, Math.min(h - 8, Math.max(14, p.y + 13)));
        }
      }

      // Horizontal grid lines
      const yStart = Math.ceil(yMin);
      const yEnd = Math.floor(yMax);
      for (let y = yStart; y <= yEnd; y++) {
        const p1 = toScreen(xMin, y, w, h);
        const p2 = toScreen(xMax, y, w, h);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Label
        if (y !== 0) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px Inter, monospace';
          const p = toScreen(0, y, w, h);
          ctx.fillText(y.toString(), Math.min(w - 20, Math.max(8, p.x + 4)), p.y - 3);
        }
      }

      // Primary Axes (X and Y in bolder slate)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;

      // X Axis
      const xAxis1 = toScreen(xMin, 0, w, h);
      const xAxis2 = toScreen(xMax, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(xAxis1.x, xAxis1.y);
      ctx.lineTo(xAxis2.x, xAxis2.y);
      ctx.stroke();

      // Y Axis
      const yAxis1 = toScreen(0, yMin, w, h);
      const yAxis2 = toScreen(0, yMax, w, h);
      ctx.beginPath();
      ctx.moveTo(yAxis1.x, yAxis1.y);
      ctx.lineTo(yAxis2.x, yAxis2.y);
      ctx.stroke();

      // ─── 2. Draw Simulation Modes ──────────────────────────────────────────

      // ── MODE A: Newton-Raphson ──
      if (mode === 'newton') {
        // Draw f(x) curve
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        let first = true;
        for (let px = 0; px <= w; px += 2) {
          const mx = toMath(px, 0, w, h).x;
          const my = fNewton(mx);
          const sp = toScreen(mx, my, w, h);
          if (first) {
            ctx.moveTo(sp.x, sp.y);
            first = false;
          } else {
            ctx.lineTo(sp.x, sp.y);
          }
        }
        ctx.stroke();

        // Draw Root Indicator
        const rootX = 1.76929;
        const rootPt = toScreen(rootX, 0, w, h);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(rootPt.x, rootPt.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Root pulse ring
        const pulse = (Math.sin(time * 0.005) + 1) * 0.5;
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.4 - pulse * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rootPt.x, rootPt.y, 6 + pulse * 8, 0, Math.PI * 2);
        ctx.stroke();

        // Render iterative tangent steps
        const maxIdx = Math.min(newtonStepIndex, newtonSteps.length - 1);
        for (let i = 0; i <= maxIdx; i++) {
          const step = newtonSteps[i];
          const isCurrent = i === maxIdx;
          const ptCurve = toScreen(step.x, step.fx, w, h);
          const ptAxis = toScreen(step.x, 0, w, h);
          const ptNextAxis = toScreen(step.nextX, 0, w, h);

          // Vertical drop line to curve
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = isCurrent ? '#f59e0b' : 'rgba(148, 163, 184, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(ptAxis.x, ptAxis.y);
          ctx.lineTo(ptCurve.x, ptCurve.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Tangent line segment
          ctx.strokeStyle = isCurrent ? '#ef4444' : 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = isCurrent ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(ptCurve.x, ptCurve.y);
          ctx.lineTo(ptNextAxis.x, ptNextAxis.y);
          ctx.stroke();

          // Dots
          ctx.fillStyle = isCurrent ? '#3b82f6' : '#94a3b8';
          ctx.beginPath();
          ctx.arc(ptCurve.x, ptCurve.y, isCurrent ? 5 : 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = isCurrent ? '#ef4444' : '#f87171';
          ctx.beginPath();
          ctx.arc(ptNextAxis.x, ptNextAxis.y, isCurrent ? 5 : 3, 0, Math.PI * 2);
          ctx.fill();

          // Current step label
          if (isCurrent) {
            ctx.fillStyle = '#1e293b';
            ctx.font = '600 11px Inter, sans-serif';
            ctx.fillText(`x${i} = ${step.x.toFixed(3)}`, ptAxis.x + 4, ptAxis.y - 8);
            ctx.fillStyle = '#ef4444';
            ctx.fillText(`x${i + 1} = ${step.nextX.toFixed(3)}`, ptNextAxis.x + 4, ptNextAxis.y + 14);
          }
        }
      }

      // ── MODE B: Riemann Integral ──
      else if (mode === 'riemann') {
        const a = 0.5;
        const b = 5.2;
        const n = riemannN;
        const dx = (b - a) / n;

        // Draw Riemann Rectangles
        for (let i = 0; i < n; i++) {
          const x0 = a + i * dx;
          const x1 = x0 + dx;
          const xMid = (x0 + x1) / 2;
          const height = fRiemann(xMid);

          const p0 = toScreen(x0, 0, w, h);
          const p1 = toScreen(x1, 0, w, h);
          const pTop = toScreen(x0, height, w, h);

          const rectW = p1.x - p0.x;
          const rectH = p0.y - pTop.y;

          // Gradient fill for rectangle
          const grad = ctx.createLinearGradient(0, pTop.y, 0, p0.y);
          grad.addColorStop(0, 'rgba(59, 130, 246, 0.45)');
          grad.addColorStop(1, 'rgba(6, 182, 212, 0.15)');

          ctx.fillStyle = grad;
          ctx.fillRect(p0.x, pTop.y, rectW, rectH);

          ctx.strokeStyle = 'rgba(37, 99, 235, 0.8)';
          ctx.lineWidth = 1;
          ctx.strokeRect(p0.x, pTop.y, rectW, rectH);

          // Midpoint marker
          const pMidTop = toScreen(xMid, height, w, h);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(pMidTop.x, pMidTop.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw smooth curve f(x)
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 3;
        ctx.beginPath();
        let first = true;
        for (let px = 0; px <= w; px += 2) {
          const mx = toMath(px, 0, w, h).x;
          const my = fRiemann(mx);
          const sp = toScreen(mx, my, w, h);
          if (first) {
            ctx.moveTo(sp.x, sp.y);
            first = false;
          } else {
            ctx.lineTo(sp.x, sp.y);
          }
        }
        ctx.stroke();

        // Bounds a and b markers
        const pa = toScreen(a, 0, w, h);
        const pb = toScreen(b, 0, w, h);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);

        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pa.x, toScreen(a, fRiemann(a), w, h).y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pb.x, pb.y);
        ctx.lineTo(pb.x, toScreen(b, fRiemann(b), w, h).y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ef4444';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.fillText('a = 0.5', pa.x - 14, pa.y + 15);
        ctx.fillText('b = 5.2', pb.x - 14, pb.y + 15);
      }

      // ── MODE C: Runge-Kutta 4 Vector Field ──
      else if (mode === 'rk4') {
        // Draw Vector Field arrows
        const gridStep = 0.6;
        const arrowLen = 14;

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = 1;

        for (let x = xMin; x <= xMax; x += gridStep) {
          for (let y = yMin; y <= yMax; y += gridStep) {
            const slope = fODE(x, y);
            const angle = Math.atan(slope);
            const pt = toScreen(x, y, w, h);

            const dx = Math.cos(angle) * (arrowLen / 2);
            const dy = -Math.sin(angle) * (arrowLen / 2);

            ctx.beginPath();
            ctx.moveTo(pt.x - dx, pt.y - dy);
            ctx.lineTo(pt.x + dx, pt.y + dy);
            ctx.stroke();
          }
        }

        // Draw RK4 Trajectories from seeds
        rk4Seeds.forEach((seed, sIdx) => {
          const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];
          const col = colors[sIdx % colors.length];

          ctx.strokeStyle = col;
          ctx.lineWidth = 2.5;
          ctx.beginPath();

          let cx = seed.x;
          let cy = seed.y;
          const hStep = 0.05;
          const startPt = toScreen(cx, cy, w, h);
          ctx.moveTo(startPt.x, startPt.y);

          // Forward RK4 integration
          for (let step = 0; step < 160; step++) {
            const k1 = fODE(cx, cy);
            const k2 = fODE(cx + hStep / 2, cy + (hStep * k1) / 2);
            const k3 = fODE(cx + hStep / 2, cy + (hStep * k2) / 2);
            const k4 = fODE(cx + hStep, cy + hStep * k3);

            cy += (hStep / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
            cx += hStep;

            if (cx > xMax || cy > yMax || cy < yMin) break;
            const pt = toScreen(cx, cy, w, h);
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();

          // Draw seed origin bead
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(startPt.x, startPt.y, 5, 0, Math.PI * 2);
          ctx.fill();

          // Animated particle moving along trajectory
          const tCycle = (time * 0.001 * speed + sIdx * 0.4) % 1;
          let px = seed.x;
          let py = seed.y;
          const totalSteps = Math.floor(160 * tCycle);
          for (let step = 0; step < totalSteps; step++) {
            const k1 = fODE(px, py);
            const k2 = fODE(px + hStep / 2, py + (hStep * k1) / 2);
            const k3 = fODE(px + hStep / 2, py + (hStep * k2) / 2);
            const k4 = fODE(px + hStep, py + hStep * k3);
            py += (hStep / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
            px += hStep;
          }
          const beadPt = toScreen(px, py, w, h);
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = col;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(beadPt.x, beadPt.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }

      // ─── 3. Mouse Hover Crosshair ──────────────────────────────────────────
      if (mousePos && mousePos.x >= 0 && mousePos.x <= w && mousePos.y >= 0 && mousePos.y <= h) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);

        // Crosshair lines
        ctx.beginPath();
        ctx.moveTo(mousePos.x, 0);
        ctx.lineTo(mousePos.x, h);
        ctx.moveTo(0, mousePos.y);
        ctx.lineTo(w, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Hover coordinate tooltip
        const label = `(${mousePos.mathX.toFixed(2)}, ${mousePos.mathY.toFixed(2)})`;
        ctx.font = '10px "Inter", monospace';
        const textWidth = ctx.measureText(label).width;

        const tipX = Math.min(w - textWidth - 14, mousePos.x + 10);
        const tipY = Math.max(20, mousePos.y - 10);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.roundRect(tipX - 4, tipY - 12, textWidth + 8, 16, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, tipX, tipY);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, isPlaying, speed, newtonStepIndex, newtonSteps, riemannN, rk4Seeds, mousePos, fNewton, dfNewton, fRiemann, fODE]);

  // Handle canvas mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    let xMin = -3.5, xMax = 4.5, yMin = -4, yMax = 5.5;
    if (mode === 'riemann') {
      xMin = -0.5; xMax = 6.0; yMin = -0.8; yMax = 3.6;
    } else if (mode === 'rk4') {
      xMin = -4.5; xMax = 4.5; yMin = -3.0; yMax = 3.0;
    }

    const mathX = xMin + (sx / rect.width) * (xMax - xMin);
    const mathY = yMin + ((rect.height - sy) / rect.height) * (yMax - yMin);

    setMousePos({ x: sx, y: sy, mathX, mathY });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  // Canvas click: allows setting initial value for Newton or adding a custom trajectory seed in RK4
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mousePos) return;
    if (mode === 'newton') {
      const clamped = Math.max(-3, Math.min(4, mousePos.mathX));
      setNewtonInitialX(clamped);
      setNewtonStepIndex(0);
    } else if (mode === 'rk4') {
      setRk4Seeds((prev) => [...prev.slice(-3), { x: mousePos.mathX, y: mousePos.mathY }]);
    }
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (mode === 'newton') {
      setNewtonStepIndex((p) => (p + 1) % newtonSteps.length);
    } else if (mode === 'riemann') {
      setRiemannN((p) => (p >= 48 ? 4 : p + 4));
    }
  };

  const handleReset = () => {
    setNewtonStepIndex(0);
    setRiemannN(8);
    setRk4Seeds([
      { x: -3.5, y: 1.5 },
      { x: -3.5, y: -1.0 },
      { x: -3.5, y: 0.2 },
    ]);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl overflow-hidden transition-all duration-300"
    >
      {/* ── Top Window Bar with macOS style dots and Mode Switcher ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 hover:bg-rose-600 transition-colors" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 hover:bg-amber-600 transition-colors" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 hover:bg-emerald-600 transition-colors" />
          </div>
          <span className="text-xs font-semibold text-slate-700 tracking-tight ml-2 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
            NumiViz Engine
            <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 font-medium">
              v2.4
            </span>
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
          <button
            onClick={() => { setMode('newton'); handleReset(); }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === 'newton'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Newton Tangent
          </button>
          <button
            onClick={() => { setMode('riemann'); handleReset(); }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === 'riemann'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riemann Sums
          </button>
          <button
            onClick={() => { setMode('rk4'); handleReset(); }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === 'rk4'
                ? 'bg-white text-blue-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ODE Vector Field
          </button>
        </div>
      </div>

      {/* ── Active Math Formula & Live Telemetry HUD Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-gradient-to-r from-blue-50/50 via-slate-50/40 to-cyan-50/50 border-b border-slate-200/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Formula:</span>
          <div className="font-mono text-slate-800 bg-white/80 px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
            {mode === 'newton' && <InlineMath math="f(x) = x^3 - 2x - 2 = 0" />}
            {mode === 'riemann' && <InlineMath math="\int_{0.5}^{5.2} \left[1.8 + \sin(1.2x)\cos(0.5x)\right] dx" />}
            {mode === 'rk4' && <InlineMath math="\frac{dy}{dx} = \sin(x) - 0.4y" />}
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Step:</span>
            <span className="font-semibold text-blue-600">{telemetry.iter}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Value:</span>
            <span className="font-semibold text-slate-900">{telemetry.val}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-slate-400">Err:</span>
            <span className="text-emerald-600 font-semibold">{telemetry.err}</span>
          </div>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {telemetry.status}
          </span>
        </div>
      </div>

      {/* ── High-DPI Interactive Canvas ── */}
      <div className="relative w-full h-[320px] sm:h-[360px] bg-white cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Subtle Canvas Hint Overlay */}
        <div className="absolute top-2.5 right-3 pointer-events-none text-[11px] text-slate-400 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-200/60 shadow-2xs">
          {mode === 'newton' && 'Click canvas to change starting x₀'}
          {mode === 'riemann' && 'Animating partitions n → ∞'}
          {mode === 'rk4' && 'Click canvas to spawn trajectory'}
        </div>
      </div>

      {/* ── Bottom Controls Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/90 border-t border-slate-200/80">
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all"
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            {isPlaying ? 'Pause' : 'Simulate'}
          </button>

          {/* Next Step */}
          <button
            onClick={handleNextStep}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-100 active:scale-95 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs transition-all"
            title="Advance one iteration"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            Step
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md bg-white hover:bg-slate-100 active:scale-95 text-slate-600 border border-slate-200 shadow-2xs transition-all"
            title="Reset to default parameters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Speed / Slider controls */}
        <div className="flex items-center gap-3">
          {mode === 'riemann' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-medium text-slate-500">n = {riemannN}</span>
              <input
                type="range"
                min="4"
                max="48"
                step="4"
                value={riemannN}
                onChange={(e) => {
                  setRiemannN(parseInt(e.target.value, 10));
                  setIsPlaying(false);
                }}
                className="w-20 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>
          )}

          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] text-slate-500 font-medium">Speed:</span>
            {[1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                  speed === s
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

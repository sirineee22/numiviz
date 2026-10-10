import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  symbol: string;
  size: number;
  opacity: number;
  angle: number;
  vAngle: number;
}

const MATH_SYMBOLS = [
  '∫', '∑', '∂x', '∇', 'λ', 'π', 'lim', 'dx', 'f(x)', 'eˣ', '√x', '≈',
  'xₙ', 'A⁻¹', 'det', 'O(h⁴)', 'Δy', 'σ', 'θ', 'sin(x)', '∈ ℝ'
];

export default function MathBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates for subtle interactive reaction
    const mouse = { x: -1000, y: -1000, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Create floating math symbols
    const count = Math.min(28, Math.floor(width / 50));
    const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.2 - Math.random() * 0.35, // slow upward drift
      symbol: MATH_SYMBOLS[i % MATH_SYMBOLS.length],
      size: 11 + Math.random() * 7,
      opacity: 0.12 + Math.random() * 0.18,
      angle: (Math.random() - 0.5) * 0.2,
      vAngle: (Math.random() - 0.5) * 0.003,
    }));

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle mathematical coordinate grid
      const gridSize = 48;
      ctx.save();
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.035)'; // very subtle primary blue
      ctx.lineWidth = 1;

      // Draw faint grid lines
      const offsetX = (tick * 0.2) % gridSize;
      const offsetY = (tick * 0.2) % gridSize;

      ctx.beginPath();
      for (let x = offsetX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw subtle intersection points
      ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
      for (let x = offsetX; x < width; x += gridSize * 2) {
        for (let y = offsetY; y < height; y += gridSize * 2) {
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }
      ctx.restore();

      // 2. Subtle sine wave flow in background
      ctx.save();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const waveMid = height * 0.45;
      for (let x = 0; x < width; x += 6) {
        const y = waveMid + Math.sin(x * 0.005 + tick * 0.015) * 35 + Math.cos(x * 0.01 - tick * 0.01) * 15;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second harmonic wave
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.beginPath();
      const waveMid2 = height * 0.7;
      for (let x = 0; x < width; x += 6) {
        const y = waveMid2 + Math.cos(x * 0.007 - tick * 0.012) * 45 + Math.sin(x * 0.014 + tick * 0.008) * 18;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // 3. Floating Math Symbols
      ctx.save();
      ctx.font = '500 13px "Inter", "Cambria Math", "KaTeX_Math", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.vAngle;

        // Mouse gentle repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 && dist > 0) {
            const force = (140 - dist) / 140;
            p.x += (dx / dist) * force * 1.5;
            p.y += (dy / dist) * force * 1.5;
          }
        }

        // Wrap boundaries
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) {
          p.y = height + 30;
          p.x = Math.random() * width;
        }
        if (p.y > height + 30) p.y = -30;

        // Render symbol
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = `rgba(37, 99, 235, ${p.opacity})`;
        ctx.font = `${p.size}px "Inter", monospace`;
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.85 }}
      aria-hidden="true"
    />
  );
}

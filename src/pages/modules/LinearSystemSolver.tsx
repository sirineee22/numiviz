import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '@/lib/api';
import JXG from 'jsxgraph';
import '@/styles/jsxgraph.css';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  History as HistoryIcon,
  HelpCircle,
  Play,
  Trash2,
} from 'lucide-react';

export type HistoryEntry = {
  id: number;
  equation1: string;
  equation2: string;
  solution_type: string;
  solution: { x: number; y: number } | null;
};

export interface ParsedLine {
  isVertical: boolean;
  m: number;
  b: number;
  xIntercept?: number;
}

export interface SolveResult {
  solution: { x: number; y: number } | null;
  solutionType: 'unique' | 'none' | 'infinite' | 'invalid';
  line1: ParsedLine | null;
  line2: ParsedLine | null;
  steps: string[];
}

/**
 * Parses user input strings into a line representation.
 * Supports:
 * - y = mx + b (e.g. "y = 2x + 1", "y = -x + 4", "y = 0.5x - 3")
 * - y = mx (e.g. "y = 3x")
 * - y = b (e.g. "y = 5")
 * - x = c (e.g. "x = 3", "x = -2")
 * - ax + by = c (e.g. "2x + 3y = 6", "x - y = 1")
 */
export function parseLinearEquation(raw: string): ParsedLine | null {
  if (!raw || typeof raw !== 'string') return null;
  const eq = raw.replace(/\s+/g, '').toLowerCase();

  // Case 1: x = c (vertical line)
  const vertMatch = eq.match(/^x=([+-]?\d+(?:\.\d+)?)$/);
  if (vertMatch) {
    const c = parseFloat(vertMatch[1]);
    return { isVertical: true, m: Infinity, b: 0, xIntercept: c };
  }

  // Case 2: y = mx + b or y = b
  if (eq.startsWith('y=')) {
    const rhs = eq.slice(2);
    if (rhs === 'x') {
      return { isVertical: false, m: 1, b: 0 };
    }
    if (rhs === '-x') {
      return { isVertical: false, m: -1, b: 0 };
    }

    if (rhs.includes('x')) {
      const match = rhs.match(/^([+-]?(?:\d+(?:\.\d+)?)?)x([+-]\d+(?:\.\d+)?)?$/);
      if (match) {
        const mStr = match[1];
        let m = 1;
        if (mStr === '-') m = -1;
        else if (mStr === '' || mStr === '+') m = 1;
        else m = parseFloat(mStr);

        const b = match[2] ? parseFloat(match[2]) : 0;
        return { isVertical: false, m, b };
      }
    } else {
      const val = parseFloat(rhs);
      if (!isNaN(val)) {
        return { isVertical: false, m: 0, b: val };
      }
    }
  }

  // Case 3: ax + by = c (standard form)
  const stdMatch = eq.match(/^([+-]?(?:\d+(?:\.\d+)?)?)x([+-](?:\d+(?:\.\d+)?)?)y=([+-]?\d+(?:\.\d+)?)$/);
  if (stdMatch) {
    const aStr = stdMatch[1];
    const a = aStr === '-' ? -1 : aStr === '' || aStr === '+' ? 1 : parseFloat(aStr);

    const bStr = stdMatch[2];
    const bCoeff = bStr === '-' ? -1 : bStr === '' || bStr === '+' ? 1 : parseFloat(bStr);

    const c = parseFloat(stdMatch[3]);

    if (Math.abs(bCoeff) > 1e-9) {
      return {
        isVertical: false,
        m: -a / bCoeff,
        b: c / bCoeff,
      };
    } else if (Math.abs(a) > 1e-9) {
      return {
        isVertical: true,
        m: Infinity,
        b: 0,
        xIntercept: c / a,
      };
    }
  }

  return null;
}

/**
 * Computes exact algebraic solution with step-by-step resolution
 */
export function solveSystemLocally(eq1Str: string, eq2Str: string): SolveResult {
  const l1 = parseLinearEquation(eq1Str);
  const l2 = parseLinearEquation(eq2Str);

  if (!l1 || !l2) {
    return {
      solution: null,
      solutionType: 'invalid',
      line1: l1,
      line2: l2,
      steps: ["Impossible d'analyser l'une des équations. Utilisez le format y = mx + b ou ax + by = c."],
    };
  }

  // Both vertical
  if (l1.isVertical && l2.isVertical) {
    const x1 = l1.xIntercept ?? 0;
    const x2 = l2.xIntercept ?? 0;
    if (Math.abs(x1 - x2) < 1e-7) {
      return {
        solution: null,
        solutionType: 'infinite',
        line1: l1,
        line2: l2,
        steps: [
          `Les deux droites sont verticales et confondues en x = ${x1}.`,
          `Il existe une infinité de points de contact le long de cette droite.`,
        ],
      };
    }
    return {
      solution: null,
      solutionType: 'none',
      line1: l1,
      line2: l2,
      steps: [
        `Les deux droites sont verticales et distinctes (x = ${x1} et x = ${x2}).`,
        `Elles sont strictement parallèles et ne se coupent jamais.`,
      ],
    };
  }

  // Line 1 vertical, Line 2 regular
  if (l1.isVertical) {
    const x = l1.xIntercept ?? 0;
    const y = l2.m * x + l2.b;
    return {
      solution: { x, y },
      solutionType: 'unique',
      line1: l1,
      line2: l2,
      steps: [
        `Ligne 1 est verticale : x = ${x.toFixed(4)}`,
        `Substitution dans Ligne 2 : y = (${l2.m.toFixed(4)}) × (${x.toFixed(4)}) + (${l2.b.toFixed(4)}) = ${y.toFixed(4)}`,
        `Solution unique trouvée en S(${x.toFixed(4)}, ${y.toFixed(4)})`,
      ],
    };
  }

  // Line 2 vertical, Line 1 regular
  if (l2.isVertical) {
    const x = l2.xIntercept ?? 0;
    const y = l1.m * x + l1.b;
    return {
      solution: { x, y },
      solutionType: 'unique',
      line1: l1,
      line2: l2,
      steps: [
        `Ligne 2 est verticale : x = ${x.toFixed(4)}`,
        `Substitution dans Ligne 1 : y = (${l1.m.toFixed(4)}) × (${x.toFixed(4)}) + (${l1.b.toFixed(4)}) = ${y.toFixed(4)}`,
        `Solution unique trouvée en S(${x.toFixed(4)}, ${y.toFixed(4)})`,
      ],
    };
  }

  // Both regular lines
  const dm = l1.m - l2.m;
  const db = l2.b - l1.b;

  if (Math.abs(dm) < 1e-7) {
    if (Math.abs(db) < 1e-7) {
      return {
        solution: null,
        solutionType: 'infinite',
        line1: l1,
        line2: l2,
        steps: [
          `Les pentes sont identiques (m₁ = m₂ = ${l1.m.toFixed(4)}) et les ordonnées à l'origine sont égales (b₁ = b₂ = ${l1.b.toFixed(4)}).`,
          `Les deux équations représentent la même droite. Il y a une infinité de solutions.`,
        ],
      };
    }
    return {
      solution: null,
      solutionType: 'none',
      line1: l1,
      line2: l2,
      steps: [
        `Les pentes sont égales (m₁ = m₂ = ${l1.m.toFixed(4)}) mais les ordonnées à l'origine diffèrent (b₁ = ${l1.b.toFixed(4)} ≠ b₂ = ${l2.b.toFixed(4)}).`,
        `Les droites sont strictement parallèles et ne se coupent jamais : aucune solution.`,
      ],
    };
  }

  const x = db / dm;
  const y = l1.m * x + l1.b;

  return {
    solution: { x, y },
    solutionType: 'unique',
    line1: l1,
    line2: l2,
    steps: [
      `Égalisation des deux équations : ${l1.m.toFixed(2)}x + ${l1.b.toFixed(2)} = ${l2.m.toFixed(2)}x + ${l2.b.toFixed(2)}`,
      `Regroupement des termes en x : (${l1.m.toFixed(2)} - ${l2.m.toFixed(2)})x = ${l2.b.toFixed(2)} - ${l1.b.toFixed(2)}`,
      `Résolution pour x : ${dm.toFixed(4)}x = ${db.toFixed(4)} ⟹ x = ${x.toFixed(4)}`,
      `Calcul de y par substitution : y = ${l1.m.toFixed(2)}(${x.toFixed(4)}) + ${l1.b.toFixed(2)} = ${y.toFixed(4)}`,
      `Intersection unique : S(${x.toFixed(4)}, ${y.toFixed(4)})`,
    ],
  };
}

const PRESETS = [
  { label: 'Intersection Standard', eq1: 'y = 2x + 1', eq2: 'y = -x + 4', desc: 'S(1, 3)' },
  { label: 'Perpendiculaires', eq1: 'y = 2x - 1', eq2: 'y = -0.5x + 4', desc: 'm₁ × m₂ = -1' },
  { label: 'Parallèles (0 solution)', eq1: 'y = 2x + 1', eq2: 'y = 2x + 5', desc: 'm₁ = m₂' },
  { label: 'Confondues (∞ solutions)', eq1: 'y = 2x + 1', eq2: 'y = 2x + 1', desc: 'Même droite' },
  { label: 'Droite Verticale', eq1: 'x = 3', eq2: 'y = -x + 2', desc: 'x = constante' },
];

const LinearSystemSolver: React.FC = () => {
  const { user } = useAuth();
  const boardContainerId = 'jxgbox-linear-system-interactive';
  const boardRef = useRef<JXG.Board | null>(null);

  // Board Element Refs
  const p1Ref = useRef<JXG.Point | null>(null);
  const p2Ref = useRef<JXG.Point | null>(null);
  const line1Ref = useRef<JXG.Line | null>(null);

  const p3Ref = useRef<JXG.Point | null>(null);
  const p4Ref = useRef<JXG.Point | null>(null);
  const line2Ref = useRef<JXG.Line | null>(null);

  const solPointRef = useRef<JXG.Point | null>(null);
  const isDraggingRef = useRef(false);

  // States
  const [eq1, setEq1] = useState('y = 2x + 1');
  const [eq2, setEq2] = useState('y = -x + 4');
  const [solveData, setSolveData] = useState<SolveResult>(() => solveSystemLocally('y = 2x + 1', 'y = -x + 4'));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isSolving, setIsSolving] = useState(false);

  // Sync solve data whenever eq1 or eq2 changes
  const executeSolve = useCallback(async (currentEq1: string, currentEq2: string) => {
    setIsSolving(true);
    // 1. Instant robust local solver
    const localResult = solveSystemLocally(currentEq1, currentEq2);
    setSolveData(localResult);

    // 2. Synchronize with backend API for persistence and history if available
    try {
      const response = await axios.post(`${API_BASE}/api/solve-linear-system`, {
        eq1: currentEq1,
        eq2: currentEq2,
        user_id: user?.id,
      });

      if (response.data && user) {
        fetchHistory();
      }
    } catch {
      // Backend request fails or is offline: local solution is already active, so do not break
    } finally {
      setIsSolving(false);
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_BASE}/api/history/linear-system/${user.id}`);
      const formatted = response.data.map((item: { solution_x: number | null; solution_y: number | null; [key: string]: unknown }) => ({
        ...item,
        solution: item.solution_x !== null ? { x: item.solution_x, y: item.solution_y } : null,
      }));
      setHistory(formatted);
    } catch {
      // Fail silently for background history
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    try {
      await axios.delete(`${API_BASE}/api/history/linear-system/${user.id}`);
      setHistory([]);
      toast({ title: 'Historique vidé', description: 'Votre historique a été réinitialisé avec succès.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de vider l'historique." });
    }
  };

  // Initialize JSXGraph Board once on mount
  useEffect(() => {
    const container = document.getElementById(boardContainerId);
    if (!container) return;

    // Clean up any existing board before initializing
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current);
    }

    const board = JXG.JSXGraph.initBoard(boardContainerId, {
      boundingbox: [-10, 10, 10, -10],
      axis: true,
      grid: true,
      showCopyright: false,
      showNavigation: false,
      zoom: { factorX: 1.25, factorY: 1.25, wheel: true, needShift: false },
      pan: { enabled: true, needTwoFingers: false },
    });
    boardRef.current = board;

    // Helper to format equation from two dragged points
    const updateEquationFromPoints = (ptA: JXG.Point, ptB: JXG.Point, setEquation: (eq: string) => void) => {
      const dx = ptB.X() - ptA.X();
      if (Math.abs(dx) < 1e-5) {
        setEquation(`x = ${ptA.X().toFixed(2)}`);
        return;
      }
      const m = (ptB.Y() - ptA.Y()) / dx;
      const b = ptA.Y() - m * ptA.X();
      const bSign = b >= 0 ? '+' : '-';
      setEquation(`y = ${m.toFixed(2)}x ${bSign} ${Math.abs(b).toFixed(2)}`);
    };

    // --- Line 1 (Royal Blue) ---
    const p1 = board.create('point', [0, 1], {
      name: 'P₁',
      size: 3,
      face: 'o',
      color: '#2563eb',
      fillColor: '#3b82f6',
      strokeColor: '#1d4ed8',
      strokeWidth: 2,
    });
    const p2 = board.create('point', [2, 5], {
      name: 'P₂',
      size: 3,
      face: 'o',
      color: '#2563eb',
      fillColor: '#3b82f6',
      strokeColor: '#1d4ed8',
      strokeWidth: 2,
    });
    const line1 = board.create('line', [p1, p2], {
      strokeColor: '#2563eb',
      strokeWidth: 3,
      highlightStrokeColor: '#1d4ed8',
      highlightStrokeWidth: 4,
    });
    p1Ref.current = p1;
    p2Ref.current = p2;
    line1Ref.current = line1;

    // --- Line 2 (Rose / Red) ---
    const p3 = board.create('point', [0, 4], {
      name: 'P₃',
      size: 3,
      face: 'o',
      color: '#e11d48',
      fillColor: '#f43f5e',
      strokeColor: '#be123c',
      strokeWidth: 2,
    });
    const p4 = board.create('point', [2, 2], {
      name: 'P₄',
      size: 3,
      face: 'o',
      color: '#e11d48',
      fillColor: '#f43f5e',
      strokeColor: '#be123c',
      strokeWidth: 2,
    });
    const line2 = board.create('line', [p3, p4], {
      strokeColor: '#e11d48',
      strokeWidth: 3,
      highlightStrokeColor: '#be123c',
      highlightStrokeWidth: 4,
    });
    p3Ref.current = p3;
    p4Ref.current = p4;
    line2Ref.current = line2;

    // --- Intersection Solution Point (Emerald Green) ---
    const solPt = board.create('point', [1, 3], {
      name: 'S (Solution)',
      size: 5,
      face: 'o',
      color: '#059669',
      fillColor: '#10b981',
      strokeColor: '#047857',
      strokeWidth: 2.5,
      fixed: true,
      visible: true,
    });
    solPointRef.current = solPt;

    // Drag handlers with lock protection
    const handleDragStart = () => { isDraggingRef.current = true; };
    const handleDragEnd = () => { isDraggingRef.current = false; };

    p1.on('down', handleDragStart);
    p2.on('down', handleDragStart);
    p3.on('down', handleDragStart);
    p4.on('down', handleDragStart);

    p1.on('up', handleDragEnd);
    p2.on('up', handleDragEnd);
    p3.on('up', handleDragEnd);
    p4.on('up', handleDragEnd);

    p1.on('drag', () => updateEquationFromPoints(p1, p2, setEq1));
    p2.on('drag', () => updateEquationFromPoints(p1, p2, setEq1));
    p3.on('drag', () => updateEquationFromPoints(p3, p4, setEq2));
    p4.on('drag', () => updateEquationFromPoints(p3, p4, setEq2));

    return () => {
      JXG.JSXGraph.freeBoard(board);
    };
  }, []);

  // Update JSXGraph points and lines when equations or solutions change
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    // If currently dragging, avoid overwriting user control
    if (isDraggingRef.current) return;

    // Update Line 1 points
    if (solveData.line1 && p1Ref.current && p2Ref.current) {
      if (solveData.line1.isVertical) {
        const x = solveData.line1.xIntercept ?? 0;
        p1Ref.current.setPosition(JXG.COORDS_BY_USER, [x, -4]);
        p2Ref.current.setPosition(JXG.COORDS_BY_USER, [x, 4]);
      } else {
        const xA = -3;
        const yA = solveData.line1.m * xA + solveData.line1.b;
        const xB = 3;
        const yB = solveData.line1.m * xB + solveData.line1.b;
        p1Ref.current.setPosition(JXG.COORDS_BY_USER, [xA, yA]);
        p2Ref.current.setPosition(JXG.COORDS_BY_USER, [xB, yB]);
      }
    }

    // Update Line 2 points
    if (solveData.line2 && p3Ref.current && p4Ref.current) {
      if (solveData.line2.isVertical) {
        const x = solveData.line2.xIntercept ?? 0;
        p3Ref.current.setPosition(JXG.COORDS_BY_USER, [x, -4]);
        p4Ref.current.setPosition(JXG.COORDS_BY_USER, [x, 4]);
      } else {
        const xA = -3;
        const yA = solveData.line2.m * xA + solveData.line2.b;
        const xB = 3;
        const yB = solveData.line2.m * xB + solveData.line2.b;
        p3Ref.current.setPosition(JXG.COORDS_BY_USER, [xA, yA]);
        p4Ref.current.setPosition(JXG.COORDS_BY_USER, [xB, yB]);
      }
    }

    // Update Intersection point
    if (solPointRef.current) {
      if (solveData.solutionType === 'unique' && solveData.solution) {
        solPointRef.current.setPosition(JXG.COORDS_BY_USER, [solveData.solution.x, solveData.solution.y]);
        solPointRef.current.setAttribute({ visible: true });
      } else {
        solPointRef.current.setAttribute({ visible: false });
      }
    }

    board.update();
  }, [solveData]);

  // Debounced solve on equation text changes
  useEffect(() => {
    const handler = setTimeout(() => {
      executeSolve(eq1, eq2);
    }, 250);

    return () => clearTimeout(handler);
  }, [eq1, eq2, executeSolve]);

  // Initial history fetch
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  // Board View Controls
  const handleResetView = () => {
    if (!boardRef.current) return;
    boardRef.current.setBoundingBox([-10, 10, 10, -10], false);
  };

  const handleCenterSolution = () => {
    if (!boardRef.current || !solveData.solution) return;
    const { x, y } = solveData.solution;
    const span = 6;
    boardRef.current.setBoundingBox([x - span, y + span, x + span, y - span], true);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!boardRef.current) return;
    const factor = direction === 'in' ? 1.25 : 0.8;
    boardRef.current.zoomIn();
    if (direction === 'out') {
      boardRef.current.zoomOut();
      boardRef.current.zoomOut();
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setEq1(preset.eq1);
    setEq2(preset.eq2);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Presets */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-amber-50/60 border border-blue-100/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Cas d'étude prédéfinis :
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="text-xs font-semibold px-3 py-1 rounded-xl bg-white/90 hover:bg-blue-600 hover:text-white border border-stone-200/90 text-stone-700 shadow-2xs transition-all duration-150 active:scale-95 cursor-pointer"
              title={`${p.eq1} & ${p.eq2}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Equation Form + Live JSXGraph Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Equation Editor & Analytical Resolution */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="rounded-3xl border-2 border-stone-200/80 shadow-md bg-white overflow-hidden">
            <CardHeader className="bg-stone-50/70 border-b border-stone-100 pb-4">
              <CardTitle className="text-base font-black text-slate-900 flex items-center justify-between">
                <span>Équations du Système</span>
                <span className="text-[11px] font-semibold text-stone-600 bg-stone-200/70 px-2.5 py-0.5 rounded-full">
                  Système 2×2
                </span>
              </CardTitle>
              <CardDescription className="text-xs text-stone-600">
                Saisissez les équations sous forme <code className="text-blue-600 font-bold">y = mx + b</code> ou <code className="text-indigo-600 font-bold">ax + by = c</code>.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Equation 1 (Blue) */}
              <div className="p-3.5 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="eq1" className="text-xs font-bold text-blue-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shadow-xs" />
                    Droite 1 (L₁)
                  </Label>
                  {solveData.line1 && !solveData.line1.isVertical && (
                    <span className="text-[11px] font-mono text-blue-800 font-semibold">
                      m₁ = {solveData.line1.m.toFixed(2)}, b₁ = {solveData.line1.b.toFixed(2)}
                    </span>
                  )}
                </div>
                <Input
                  id="eq1"
                  value={eq1}
                  onChange={(e) => setEq1(e.target.value)}
                  placeholder="ex: y = 2x + 1 ou 2x - y = -1"
                  className="font-mono text-sm bg-white border-blue-300 focus-visible:ring-blue-500 rounded-xl"
                />
              </div>

              {/* Equation 2 (Red) */}
              <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="eq2" className="text-xs font-bold text-rose-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block shadow-xs" />
                    Droite 2 (L₂)
                  </Label>
                  {solveData.line2 && !solveData.line2.isVertical && (
                    <span className="text-[11px] font-mono text-rose-800 font-semibold">
                      m₂ = {solveData.line2.m.toFixed(2)}, b₂ = {solveData.line2.b.toFixed(2)}
                    </span>
                  )}
                </div>
                <Input
                  id="eq2"
                  value={eq2}
                  onChange={(e) => setEq2(e.target.value)}
                  placeholder="ex: y = -x + 4 ou x + y = 4"
                  className="font-mono text-sm bg-white border-rose-300 focus-visible:ring-rose-500 rounded-xl"
                />
              </div>

              <Button
                onClick={() => executeSolve(eq1, eq2)}
                disabled={isSolving}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-2.5 rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Recalculer & Résoudre</span>
              </Button>

              {/* Solution Banner */}
              <div className="pt-2">
                {solveData.solutionType === 'unique' && solveData.solution && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300/80 text-emerald-950 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Solution Unique
                    </div>
                    <div className="font-mono text-xl font-black text-emerald-700">
                      S = ({solveData.solution.x.toFixed(4)}, {solveData.solution.y.toFixed(4)})
                    </div>
                    <p className="text-xs text-emerald-800/80">
                      Les deux droites sont sécantes en un unique point d'intersection.
                    </p>
                  </div>
                )}

                {solveData.solutionType === 'none' && (
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300/80 text-amber-950 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Aucune Solution
                    </div>
                    <div className="text-sm font-bold text-amber-800">
                      Droites strictement parallèles
                    </div>
                    <p className="text-xs text-amber-800/80">
                      Les coefficients directeurs sont égaux (m₁ = m₂) avec des ordonnées à l'origine distinctes. Aucun point commun.
                    </p>
                  </div>
                )}

                {solveData.solutionType === 'infinite' && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-300/80 text-indigo-950 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-indigo-800">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      Infinité de Solutions
                    </div>
                    <div className="text-sm font-bold text-indigo-800">
                      Droites Confondues
                    </div>
                    <p className="text-xs text-indigo-800/80">
                      Les deux équations décrivent la même droite. Chaque point de la droite est une solution.
                    </p>
                  </div>
                )}

                {solveData.solutionType === 'invalid' && (
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300/80 text-rose-950 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Format Invalide
                    </div>
                    <p className="text-xs text-rose-800">
                      Vérifiez la syntaxe des équations (ex: <code>y = 2x + 1</code> ou <code>x + y = 3</code>).
                    </p>
                  </div>
                )}
              </div>

              {/* Step-by-Step Algebraic Details */}
              <div className="mt-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  Démarche algébrique :
                </span>
                <ul className="text-xs font-mono space-y-1.5 text-stone-700">
                  {solveData.steps.map((st, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">›</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Interactive JSXGraph Visualizer */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="rounded-3xl border-2 border-stone-200/80 shadow-md bg-white overflow-hidden">
            <CardHeader className="bg-stone-50/70 border-b border-stone-100 pb-3 flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Visualisation Graphique Interactive</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    60 FPS
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-stone-500">
                  Déplacez les points P₁/P₂ ou P₃/P₄ à la souris pour manipuler les droites.
                </CardDescription>
              </div>

              {/* View Controls Toolbar */}
              <div className="flex items-center gap-1.5 bg-white border border-stone-200/90 rounded-xl p-1 shadow-2xs">
                {solveData.solution && (
                  <Button
                    onClick={handleCenterSolution}
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg cursor-pointer"
                    title="Centrer sur le point d'intersection"
                  >
                    <Maximize2 className="w-3.5 h-3.5 mr-1" />
                    Centrer
                  </Button>
                )}
                <Button
                  onClick={handleResetView}
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                  title="Réinitialiser l'échelle [-10, 10]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
                <Button
                  onClick={() => handleZoom('in')}
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
                <Button
                  onClick={() => handleZoom('out')}
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {/* JSXGraph Canvas Host */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-stone-200/90 shadow-inner bg-white">
                <div
                  id={boardContainerId}
                  className="jxgbox w-full h-[460px]"
                  style={{ width: '100%', height: '460px', touchAction: 'none' }}
                />
              </div>

              {/* Legend & Tips */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-stone-600">
                <div className="flex flex-wrap items-center gap-4 font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <span className="w-3 h-1 bg-blue-600 rounded-full inline-block" />
                    Droite L₁ (Bleu)
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-3 h-1 bg-rose-600 rounded-full inline-block" />
                    Droite L₂ (Rouge)
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block ring-2 ring-emerald-200" />
                    Point S (Intersection)
                  </span>
                </div>
                <div className="text-[11px] text-stone-600 italic">
                  💡 Glissez les points pour modifier les équations en temps réel
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History Card (when logged in) */}
      {user && history.length > 0 && (
        <Card className="rounded-3xl border-2 border-stone-200/80 shadow-md bg-white overflow-hidden">
          <CardHeader className="bg-stone-50/70 border-b border-stone-100 flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                <HistoryIcon className="w-4 h-4 text-amber-600" />
                <span>Historique de vos systèmes résolus</span>
              </CardTitle>
              <CardDescription className="text-xs text-stone-500">
                Retrouvez vos sessions antérieures enregistrées dans votre espace.
              </CardDescription>
            </div>
            <Button
              onClick={handleClearHistory}
              variant="outline"
              size="sm"
              className="rounded-xl border-stone-300 text-stone-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Vider l'historique
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-stone-50/50">
                <TableRow>
                  <TableHead className="font-bold text-stone-700">Équation 1</TableHead>
                  <TableHead className="font-bold text-stone-700">Équation 2</TableHead>
                  <TableHead className="font-bold text-stone-700">Type de Solution</TableHead>
                  <TableHead className="font-bold text-stone-700 text-right">Point d'Intersection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-blue-50/30 transition-colors">
                    <TableCell className="font-mono font-medium text-blue-700">{entry.equation1}</TableCell>
                    <TableCell className="font-mono font-medium text-rose-700">{entry.equation2}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        entry.solution_type === 'unique'
                          ? 'bg-emerald-100 text-emerald-800'
                          : entry.solution_type === 'none'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {entry.solution_type === 'unique' ? 'Solution unique' : entry.solution_type === 'none' ? 'Aucune' : 'Infinité'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-stone-800">
                      {entry.solution
                        ? `(${entry.solution.x.toFixed(2)}, ${entry.solution.y.toFixed(2)})`
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LinearSystemSolver;

import { useState } from "react";
import { API_BASE } from '@/lib/api';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calculator, Play, Info, CheckCircle2, ChevronRight, Hash } from "lucide-react";

function generateEmptyMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export default function MatrixLabPage() {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [matrix, setMatrix] = useState<number[][]>(generateEmptyMatrix(2, 2));
  const [vectorB, setVectorB] = useState<number[]>(Array(2).fill(0));
  const [result, setResult] = useState<string>("");
  const [solveMethod, setSolveMethod] = useState("gauss");
  const [loading, setLoading] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const handleMatrixChange = (i: number, j: number, value: string) => {
    const newMatrix = matrix.map((row, rowIdx) =>
      row.map((cell, colIdx) => (rowIdx === i && colIdx === j ? Number(value) : cell))
    );
    setMatrix(newMatrix);
  };

  const handleSizeChange = (newRows: number, newCols: number) => {
    setRows(newRows);
    setCols(newCols);
    setMatrix(generateEmptyMatrix(newRows, newCols));
    setVectorB(Array(newRows).fill(0));
    setResult("");
  };

  // --- Opérations (API backend à connecter) ---
  const handleOperation = async (op: string) => {
    setLoading(true);
    setResult("");
    try {
      const resp = await fetch(`${API_BASE}/matrix/${op}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix }),
      });
      const data = await resp.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult("Erreur de connexion au backend.");
    }
    setLoading(false);
  };

  // --- Condition number ---
  const handleCondition = async () => {
    setLoading(true);
    setResult("");
    try {
      const resp = await fetch(`${API_BASE}/api/matrix/cond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix, norm_type: "2" }),
      });
      const data = await resp.json();
      const msg = [
        `Condition number κ(A) = ${data.cond?.toExponential(4)}`,
        `log₁₀(κ) = ${data.log10_cond?.toFixed(2)}`,
        `Rank = ${data.rank} / ${data.n}`,
        `Determinant = ${data.det ?? "n/a"}`,
        `Well-conditioned: ${data.is_well_conditioned ? "Yes (κ < 1e4)" : "No — near-singular!"}`,
        `Singular values: [${data.singular_values?.map((s: number) => s.toPrecision(5)).join(", ")}]`,
      ].join("\n");
      setResult(msg);
    } catch (e) {
      setResult("Erreur de connexion au backend.");
    }
    setLoading(false);
  };

  // --- Produit Ax ---
  const handleProductAx = async () => {
    setLoading(true);
    setResult("");
    try {
      const resp = await fetch(`${API_BASE}/matrix/product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix, vector: vectorB }),
      });
      const data = await resp.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult("Erreur de connexion au backend.");
    }
    setLoading(false);
  };

  // --- Résolution Ax=b ---
  const handleSolve = async () => {
    setLoading(true);
    setResult("");
    try {
        const resp = await fetch(`${API_BASE}/system/solve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matrix, vector: vectorB, method: solveMethod }),
        });
        const data = await resp.json();
        setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult("Erreur de connexion au backend.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Matrix Laboratory
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">Design matrices and perform advanced numerical operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Workspace Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-border/50">
            <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b border-border/50">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Matrix Configuration
              </h3>
              <div className="flex items-center gap-3 bg-muted p-1.5 rounded-lg">
                <div className="flex items-center gap-2 px-2">
                  <span className="text-sm font-medium text-muted-foreground">Rows</span>
                  <select 
                    value={rows} 
                    onChange={e => handleSizeChange(Number(e.target.value), cols)}
                    className="bg-background border-none rounded shadow-sm text-sm font-medium focus:ring-1 focus:ring-primary outline-none px-2 py-1 cursor-pointer"
                  >
                    {[2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <span className="text-muted-foreground/50">×</span>
                <div className="flex items-center gap-2 px-2">
                  <span className="text-sm font-medium text-muted-foreground">Cols</span>
                  <select 
                    value={cols} 
                    onChange={e => handleSizeChange(rows, Number(e.target.value))}
                    className="bg-background border-none rounded shadow-sm text-sm font-medium focus:ring-1 focus:ring-primary outline-none px-2 py-1 cursor-pointer"
                  >
                    {[2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center p-8 bg-muted/30 rounded-xl border border-dashed border-border mb-6 overflow-x-auto">
              <div className="relative inline-flex items-center gap-6">
                {/* Matrix Bracket Left */}
                <div className="w-4 border-t-2 border-b-2 border-l-2 border-primary/50 self-stretch rounded-l-md" />
                
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                  {matrix.map((row, i) => (
                    row.map((cell, j) => (
                      <input
                        key={`${i}-${j}`}
                        type="number"
                        value={cell}
                        onChange={e => handleMatrixChange(i, j, e.target.value)}
                        className="w-16 h-12 border-border bg-background rounded-lg text-center font-mono text-lg focus:ring-2 focus:ring-primary outline-none transition-shadow shadow-sm hover:border-primary/50"
                      />
                    ))
                  ))}
                </div>

                {/* Matrix Bracket Right */}
                <div className="w-4 border-t-2 border-b-2 border-r-2 border-primary/50 self-stretch rounded-r-md" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => handleOperation("determinant")} disabled={loading} variant="default" className="shadow-sm">
                Calculate Determinant
              </Button>
              <Button onClick={handleCondition} disabled={loading} variant="secondary" className="shadow-sm">
                cond(A)
              </Button>
              <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="shadow-sm border-dashed">
                    <Play className="mr-2 h-4 w-4" /> Watch Explainer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl border-0 p-0 overflow-hidden bg-black/90">
                  <DialogHeader className="p-6 bg-background rounded-t-xl absolute w-full z-10 opacity-0 hover:opacity-100 transition-opacity">
                    <DialogTitle>Determinant Explained</DialogTitle>
                  </DialogHeader>
                  <div className="w-full aspect-video flex items-center justify-center">
                    <video 
                      src={`${API_BASE}/media/videos/manim_determinantettranspose/1080p60/Ma.mp4`}
                      controls autoPlay className="w-full h-full object-contain"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-border/50">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
              Linear System Configuration
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-border flex-1 w-full">
                <span className="text-sm font-medium text-muted-foreground block mb-3">Vector b</span>
                <div className="flex flex-col gap-2">
                  {vectorB.map((val, idx) => (
                    <input
                      key={idx} type="number" value={val}
                      onChange={e => {
                        const newB = [...vectorB];
                        newB[idx] = Number(e.target.value);
                        setVectorB(newB);
                      }}
                      className="w-full border-border bg-background rounded-md px-3 py-2 text-center font-mono focus:ring-2 focus:ring-primary outline-none transition-shadow"
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground block">Algorithm Method</span>
                  <select 
                    value={solveMethod} onChange={e => setSolveMethod(e.target.value)} 
                    className="w-full bg-background border border-border rounded-lg shadow-sm text-sm p-3 focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="gauss">Gauss Elimination</option>
                    <option value="lu">LU Decomposition</option>
                    <option value="jacobi">Jacobi Iterative</option>
                    <option value="gauss-seidel">Gauss-Seidel Iterative</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button onClick={handleProductAx} disabled={loading} variant="secondary" className="w-full">
                    A × x Product
                  </Button>
                  <Button onClick={handleSolve} disabled={loading} className="w-full shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                    Solve Ax = b
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 h-full">
          <div className="glass-card rounded-2xl p-6 border border-border/50 h-full min-h-[400px] flex flex-col bg-muted/10">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Computation Output
            </h3>
            
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium animate-pulse">Computing solution...</span>
              </div>
            ) : !result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-xl">
                <Info className="h-8 w-8 mb-2" />
                <span className="text-sm">Run an operation to see results</span>
              </div>
            ) : (
              <div className="flex-1 overflow-auto bg-background rounded-xl border border-border p-4 font-mono text-sm shadow-inner">
                {(() => {
                  let parsed: { error?: string; detail?: string; solution?: number[]; L?: number[][]; U?: number[][]; convergence?: number[]; steps?: string[]; result?: unknown };
                  try {
                    parsed = JSON.parse(result);
                  } catch {
                    return <pre className="whitespace-pre-wrap">{result}</pre>;
                  }
                  if (parsed.error || parsed.detail) {
                    return (
                      <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-lg">
                        <span className="font-bold block mb-1">Error encountered:</span>
                        {parsed.error || parsed.detail}
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-4">
                      {parsed.solution && (
                        <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                          <b className="text-primary block mb-1">Solution vector:</b>
                          <div className="flex gap-2">
                            [ {parsed.solution.map((v: number) => v.toFixed(6)).join(', ')} ]
                          </div>
                        </div>
                      )}
                      
                      {parsed.L && parsed.U && (
                        <div className="grid grid-cols-1 gap-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <b className="text-muted-foreground block mb-2 text-xs uppercase tracking-wider">L Matrix:</b>
                            <pre className="whitespace-pre-wrap text-xs bg-background p-2 rounded border border-border">{JSON.stringify(parsed.L, null, 2)}</pre>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <b className="text-muted-foreground block mb-2 text-xs uppercase tracking-wider">U Matrix:</b>
                            <pre className="whitespace-pre-wrap text-xs bg-background p-2 rounded border border-border">{JSON.stringify(parsed.U, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                      
                      {parsed.convergence && (
                        <div>
                          <b className="text-muted-foreground block mb-2 text-xs uppercase tracking-wider">Convergence Trajectory:</b>
                          <ul className="space-y-1">
                            {parsed.convergence.map((err: number, i: number) => (
                              <li key={i} className="flex items-center gap-2 text-xs">
                                <span className="w-5 text-muted-foreground text-right">{i+1}.</span>
                                <span className="bg-muted px-2 py-0.5 rounded font-medium">{err.toExponential(3)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {parsed.steps && (
                        <div>
                          <b className="text-muted-foreground block mb-2 text-xs uppercase tracking-wider">Resolution Steps:</b>
                          <ul className="space-y-2">
                            {parsed.steps.map((s: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 bg-muted/50 p-2 rounded-lg text-xs">
                                <ChevronRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {!parsed.solution && !parsed.steps && !parsed.L && !parsed.convergence && (
                        <pre className="whitespace-pre-wrap text-foreground">{JSON.stringify(parsed, null, 2)}</pre>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

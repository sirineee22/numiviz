"""
Numerical Analysis Routes
Provides per-iteration data for all iterative methods so the frontend can
display Run / Step / Pause / Reset behaviour and a full iteration table.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Literal
import numpy as np
import math
from asteval import Interpreter

router = APIRouter()

# ─────────────────────────────────────────────
# Shared helpers
# ─────────────────────────────────────────────

def make_aeval() -> Interpreter:
    aeval = Interpreter()
    aeval.symtable['np'] = np
    aeval.symtable['math'] = math
    aeval.symtable['sqrt'] = math.sqrt
    aeval.symtable['exp'] = math.exp
    aeval.symtable['log'] = math.log
    aeval.symtable['sin'] = math.sin
    aeval.symtable['cos'] = math.cos
    aeval.symtable['tan'] = math.tan
    aeval.symtable['abs'] = abs
    return aeval

def safe_eval(aeval: Interpreter, expr: str, x_val: float) -> float:
    aeval.symtable['x'] = x_val
    result = aeval.eval(expr)
    if aeval.error:
        raise HTTPException(status_code=400,
            detail=f"Expression evaluation error in '{expr}': {aeval.error[0].get_error()}")
    if result is None or (isinstance(result, float) and math.isnan(result)):
        raise HTTPException(status_code=400,
            detail=f"Expression '{expr}' returned invalid value at x={x_val}")
    return float(result)

def numerical_derivative(aeval: Interpreter, expr: str, x: float, h: float = 1e-7) -> float:
    return (safe_eval(aeval, expr, x + h) - safe_eval(aeval, expr, x - h)) / (2 * h)


# ─────────────────────────────────────────────
# Nonlinear equation solver — full iterations
# ─────────────────────────────────────────────

class NonlinearSolveRequest(BaseModel):
    fx: str
    method: Literal["newton", "bisection", "fixedpoint", "secant"]
    x0: float
    x1: Optional[float] = None      # bisection right bound OR secant second point
    gx: Optional[str] = None        # fixed-point g(x)
    tol: float = 1e-8
    max_iter: int = 50

class IterationRow(BaseModel):
    iteration: int
    x_n: float
    fx_n: float
    error: float
    abs_error: Optional[float] = None
    rel_error: Optional[float] = None

class NonlinearSolveResponse(BaseModel):
    method: str
    iterations: List[IterationRow]
    root: Optional[float]
    converged: bool
    stopping_reason: str
    final_error: float
    total_iterations: int
    function_str: str


@router.post("/api/iterative/nonlinear", response_model=NonlinearSolveResponse)
def solve_nonlinear(req: NonlinearSolveRequest):
    fx_str = req.fx.replace('^', '**').strip()
    aeval = make_aeval()
    rows: List[IterationRow] = []
    converged = False
    stopping_reason = "Max iterations reached"
    root = None

    # ── Newton-Raphson ──────────────────────────────────────────────────────
    if req.method == "newton":
        x = req.x0
        for i in range(req.max_iter):
            fx = safe_eval(aeval, fx_str, x)
            dfx = numerical_derivative(aeval, fx_str, x)
            if abs(dfx) < 1e-14:
                stopping_reason = "Derivative too small (possible inflection point)"
                break
            x_new = x - fx / dfx
            err = abs(x_new - x)
            abs_err = abs(fx)
            rel_err = err / (abs(x_new) + 1e-14)
            rows.append(IterationRow(
                iteration=i + 1,
                x_n=x_new,
                fx_n=safe_eval(aeval, fx_str, x_new),
                error=err,
                abs_error=abs_err,
                rel_error=rel_err,
            ))
            x = x_new
            if err < req.tol:
                converged = True
                stopping_reason = f"Converged: |x_{{n+1}} - x_n| = {err:.2e} < tol={req.tol:.2e}"
                break
        root = x

    # ── Bisection ───────────────────────────────────────────────────────────
    elif req.method == "bisection":
        a = req.x0
        b = req.x1 if req.x1 is not None else req.x0 + 1.0
        fa = safe_eval(aeval, fx_str, a)
        fb = safe_eval(aeval, fx_str, b)
        if fa * fb > 0:
            raise HTTPException(status_code=400,
                detail=f"f(a)={fa:.4f} and f(b)={fb:.4f} have the same sign. "
                       "No sign change in [a, b]; bisection cannot proceed.")
        for i in range(req.max_iter):
            m = (a + b) / 2.0
            fm = safe_eval(aeval, fx_str, m)
            err = abs(b - a)
            rows.append(IterationRow(
                iteration=i + 1,
                x_n=m,
                fx_n=fm,
                error=err,
                abs_error=abs(fm),
                rel_error=err / (abs(m) + 1e-14),
            ))
            if abs(fm) < req.tol or err < req.tol:
                converged = True
                stopping_reason = f"Converged: interval width = {err:.2e} < tol={req.tol:.2e}"
                break
            if fa * fm < 0:
                b, fb = m, fm
            else:
                a, fa = m, fm
        root = (a + b) / 2.0

    # ── Fixed Point ─────────────────────────────────────────────────────────
    elif req.method == "fixedpoint":
        gx_str = (req.gx.replace('^', '**').strip()
                  if req.gx else f"x - ({fx_str})")
        x = req.x0
        for i in range(req.max_iter):
            g = safe_eval(aeval, gx_str, x)
            if abs(g) > 1e8:
                stopping_reason = "Diverged: |g(x)| > 1e8"
                break
            err = abs(g - x)
            fx_val = safe_eval(aeval, fx_str, g)
            rows.append(IterationRow(
                iteration=i + 1,
                x_n=g,
                fx_n=fx_val,
                error=err,
                abs_error=abs(fx_val),
                rel_error=err / (abs(g) + 1e-14),
            ))
            x = g
            if err < req.tol:
                converged = True
                stopping_reason = f"Converged: |g(x) - x| = {err:.2e} < tol={req.tol:.2e}"
                break
        root = x

    # ── Secant ──────────────────────────────────────────────────────────────
    elif req.method == "secant":
        x0 = req.x0
        x1 = req.x1 if req.x1 is not None else req.x0 + 0.5
        for i in range(req.max_iter):
            f0 = safe_eval(aeval, fx_str, x0)
            f1 = safe_eval(aeval, fx_str, x1)
            denom = f1 - f0
            if abs(denom) < 1e-14:
                stopping_reason = "f(x1) - f(x0) too small; method cannot proceed"
                break
            x2 = x1 - f1 * (x1 - x0) / denom
            err = abs(x2 - x1)
            fx2 = safe_eval(aeval, fx_str, x2)
            rows.append(IterationRow(
                iteration=i + 1,
                x_n=x2,
                fx_n=fx2,
                error=err,
                abs_error=abs(fx2),
                rel_error=err / (abs(x2) + 1e-14),
            ))
            x0, x1 = x1, x2
            if err < req.tol:
                converged = True
                stopping_reason = f"Converged: |x_{{n+1}} - x_n| = {err:.2e} < tol={req.tol:.2e}"
                break
        root = x1

    final_error = rows[-1].error if rows else float('inf')
    return NonlinearSolveResponse(
        method=req.method,
        iterations=rows,
        root=root,
        converged=converged,
        stopping_reason=stopping_reason,
        final_error=final_error,
        total_iterations=len(rows),
        function_str=req.fx,
    )


# ─────────────────────────────────────────────
# Linear system iterative solver — full iterations
# ─────────────────────────────────────────────

class LinearIterativeRequest(BaseModel):
    A: List[List[float]]
    b: List[float]
    x0: Optional[List[float]] = None
    method: Literal["jacobi", "gauss-seidel"]
    tol: float = 1e-8
    max_iter: int = 100

class LinearIterRow(BaseModel):
    iteration: int
    x: List[float]
    error: float
    rel_error: float

class LinearIterResponse(BaseModel):
    method: str
    iterations: List[LinearIterRow]
    solution: List[float]
    converged: bool
    stopping_reason: str
    final_error: float
    total_iterations: int


@router.post("/api/iterative/linear", response_model=LinearIterResponse)
def solve_linear_iterative(req: LinearIterativeRequest):
    A = np.array(req.A, dtype=float)
    b = np.array(req.b, dtype=float)
    n = len(b)
    x = np.array(req.x0, dtype=float) if req.x0 else np.zeros(n)

    # Diagonal dominance warning (non-blocking)
    for i in range(n):
        if abs(A[i, i]) < 1e-14:
            raise HTTPException(status_code=400,
                detail=f"Zero diagonal at row {i+1}. Reorder equations for diagonal dominance.")

    rows: List[LinearIterRow] = []
    converged = False
    stopping_reason = "Max iterations reached"

    for it in range(req.max_iter):
        if req.method == "jacobi":
            x_new = np.zeros(n)
            for i in range(n):
                s = np.dot(A[i], x) - A[i, i] * x[i]
                x_new[i] = (b[i] - s) / A[i, i]
        else:  # gauss-seidel
            x_new = x.copy()
            for i in range(n):
                s = np.dot(A[i, :i], x_new[:i]) + np.dot(A[i, i+1:], x_new[i+1:])
                x_new[i] = (b[i] - s) / A[i, i]

        err = float(np.linalg.norm(x_new - x, 2))
        norm_x = float(np.linalg.norm(x_new, 2))
        rel_err = err / (norm_x + 1e-14)

        rows.append(LinearIterRow(
            iteration=it + 1,
            x=x_new.tolist(),
            error=err,
            rel_error=rel_err,
        ))
        x = x_new
        if err < req.tol:
            converged = True
            stopping_reason = f"Converged: ‖x_{{k+1}} - x_k‖ = {err:.2e} < tol={req.tol:.2e}"
            break

    return LinearIterResponse(
        method=req.method,
        iterations=rows,
        solution=x.tolist(),
        converged=converged,
        stopping_reason=stopping_reason,
        final_error=rows[-1].error if rows else float('inf'),
        total_iterations=len(rows),
    )


# ─────────────────────────────────────────────
# Numerical Integration
# ─────────────────────────────────────────────

class IntegrationRequest(BaseModel):
    fx: str
    a: float
    b: float
    n: int = 100  # number of subintervals (must be even for Simpson)
    method: Literal["trapezoidal", "simpson13", "simpson38", "gauss-legendre", "romberg"]
    exact: Optional[float] = None  # user-supplied exact value for error analysis
    n_gauss: int = 5       # number of Gauss-Legendre nodes (1-10)
    romberg_m: int = 6     # Romberg: order of Richardson extrapolation table

class IntegrationResponse(BaseModel):
    method: str
    result: float
    steps: List[dict]
    n_intervals: int
    h: float
    abs_error: Optional[float]
    rel_error: Optional[float]
    function_str: str


@router.post("/api/integration", response_model=IntegrationResponse)
def integrate(req: IntegrationRequest):
    fx_str = req.fx.replace('^', '**').strip()
    aeval = make_aeval()
    a, b, n = req.a, req.b, req.n

    if n < 1:
        raise HTTPException(status_code=400, detail="n must be at least 1")
    if req.method == "simpson13" and n % 2 != 0:
        n += 1  # auto-correct to even
    if req.method == "simpson38" and n % 3 != 0:
        n += 3 - (n % 3)  # auto-correct to multiple of 3

    h = (b - a) / n
    xs = [a + i * h for i in range(n + 1)]
    fs = [safe_eval(aeval, fx_str, xi) for xi in xs]

    steps = []

    if req.method == "trapezoidal":
        # I ≈ h/2 * [f(x0) + 2f(x1) + ... + 2f(x_{n-1}) + f(xn)]
        result = (fs[0] + fs[-1] + 2 * sum(fs[1:-1])) * h / 2
        steps = [
            {"label": f"x_{i}", "x": xs[i], "fx": fs[i],
             "weight": 1 if (i == 0 or i == n) else 2}
            for i in range(min(n + 1, 20))  # limit to 20 rows
        ]

    elif req.method == "simpson13":
        # I ≈ h/3 * [f(x0) + 4f(x1) + 2f(x2) + 4f(x3) + ... + f(xn)]
        coeff = [1] + [4 if i % 2 == 1 else 2 for i in range(1, n)] + [1]
        result = sum(c * f for c, f in zip(coeff, fs)) * h / 3
        steps = [
            {"label": f"x_{i}", "x": xs[i], "fx": fs[i], "weight": coeff[i]}
            for i in range(min(n + 1, 20))
        ]

    elif req.method == "simpson38":
        # I ≈ 3h/8 * [f(x0) + 3f(x1) + 3f(x2) + 2f(x3) + ... + f(xn)]
        coeff = []
        for i in range(n + 1):
            if i == 0 or i == n:
                coeff.append(1)
            elif i % 3 == 0:
                coeff.append(2)
            else:
                coeff.append(3)
        result = sum(c * f for c, f in zip(coeff, fs)) * 3 * h / 8
        steps = [
            {"label": f"x_{i}", "x": xs[i], "fx": fs[i], "weight": coeff[i]}
            for i in range(min(n + 1, 20))
        ]
    elif req.method == "gauss-legendre":
        # Gauss-Legendre quadrature on [a, b] with n_gauss nodes
        from numpy.polynomial.legendre import leggauss
        ng = max(1, min(req.n_gauss, 10))
        xi, wi = leggauss(ng)          # nodes and weights on [-1, 1]
        # Transform to [a, b]: x = (b-a)/2 * t + (b+a)/2
        mid = (a + b) / 2.0
        half = (b - a) / 2.0
        result = 0.0
        steps = []
        for i, (t, w) in enumerate(zip(xi, wi)):
            xq = mid + half * t
            fq = safe_eval(aeval, fx_str, xq)
            contrib = half * w * fq
            result += contrib
            steps.append({
                "label": f"x_{i+1}",
                "x": round(xq, 12),
                "fx": fq,
                "weight": round(float(w), 10),
            })
        n = ng  # override n so response makes sense
        h = float(half * 2 / ng)

    elif req.method == "romberg":
        # Romberg integration: Richardson extrapolation on the trapezoidal rule
        m = max(2, min(req.romberg_m, 10))   # table size (rows = m+1)
        R = [[0.0] * (m + 1) for _ in range(m + 1)]
        # Row 0: single trapezoid over [a, b]
        fa_val = safe_eval(aeval, fx_str, a)
        fb_val = safe_eval(aeval, fx_str, b)
        R[0][0] = (b - a) * (fa_val + fb_val) / 2.0
        for j in range(1, m + 1):
            n_j = 2 ** j
            h_j = (b - a) / n_j
            # Composite trapezoid with n_j intervals
            inner = sum(
                safe_eval(aeval, fx_str, a + k * h_j)
                for k in range(1, n_j)
            )
            R[j][0] = h_j * ((fa_val + fb_val) / 2.0 + inner)
            # Richardson extrapolation
            for k in range(1, j + 1):
                R[j][k] = R[j][k - 1] + (R[j][k - 1] - R[j - 1][k - 1]) / (4 ** k - 1)
        result = R[m][m]
        # Build steps table: Romberg triangle
        steps = []
        for row in range(m + 1):
            for col in range(row + 1):
                steps.append({
                    "label": f"R({row},{col})",
                    "x": float(row),
                    "fx": R[row][col],
                    "weight": col,
                })
        n = 2 ** m
        h = (b - a) / n
    else:
        raise HTTPException(status_code=400, detail="Unknown integration method")

    abs_err = abs(result - req.exact) if req.exact is not None else None
    rel_err = abs_err / (abs(req.exact) + 1e-14) if abs_err is not None else None

    return IntegrationResponse(
        method=req.method,
        result=result,
        steps=steps,
        n_intervals=n,
        h=h,
        abs_error=abs_err,
        rel_error=rel_err,
        function_str=req.fx,
    )


# ─────────────────────────────────────────────
# ODE Solvers (Euler & RK4)
# ─────────────────────────────────────────────

class ODERequest(BaseModel):
    # dy/dx = f(x, y)
    fxy: str          # expression in terms of x and y
    x0: float
    y0: float
    x_end: float
    h: float = 0.1
    method: Literal["euler", "rk4", "heun"]   # heun = improved Euler (predictor-corrector)
    exact: Optional[str] = None   # optional exact solution y(x) for comparison

class ODEPoint(BaseModel):
    x: float
    y_num: float
    y_exact: Optional[float] = None
    error: Optional[float] = None

class ODEResponse(BaseModel):
    method: str
    points: List[ODEPoint]
    h: float
    total_steps: int
    function_str: str


@router.post("/api/ode", response_model=ODEResponse)
def solve_ode(req: ODERequest):
    fxy_str = req.fxy.replace('^', '**').strip()
    aeval = make_aeval()

    def f(x_val: float, y_val: float) -> float:
        aeval.symtable['x'] = x_val
        aeval.symtable['y'] = y_val
        result = aeval.eval(fxy_str)
        if aeval.error:
            raise HTTPException(status_code=400,
                detail=f"ODE expression error: {aeval.error[0].get_error()}")
        return float(result)

    exact_str = req.exact.replace('^', '**').strip() if req.exact else None

    def exact(x_val: float) -> Optional[float]:
        if exact_str is None:
            return None
        aeval.symtable['x'] = x_val
        r = aeval.eval(exact_str)
        return float(r) if r is not None else None

    x = req.x0
    y = req.y0
    h = req.h
    points: List[ODEPoint] = []

    # Add initial point
    y_ex = exact(x)
    points.append(ODEPoint(
        x=round(x, 10), y_num=y,
        y_exact=y_ex,
        error=abs(y - y_ex) if y_ex is not None else None
    ))

    max_steps = 10000
    steps = 0
    while x + h <= req.x_end + 1e-10 and steps < max_steps:
        if req.method == "euler":
            y = y + h * f(x, y)
        elif req.method == "heun":
            # Heun (improved Euler / trapezoidal predictor-corrector)
            k1 = f(x, y)
            y_pred = y + h * k1          # Euler predictor
            k2 = f(x + h, y_pred)        # slope at predicted point
            y = y + h * (k1 + k2) / 2   # corrected step
        else:  # rk4
            k1 = f(x, y)
            k2 = f(x + h/2, y + h*k1/2)
            k3 = f(x + h/2, y + h*k2/2)
            k4 = f(x + h, y + h*k3)
            y = y + h * (k1 + 2*k2 + 2*k3 + k4) / 6

        x = round(x + h, 10)
        y_ex = exact(x)
        points.append(ODEPoint(
            x=x, y_num=y,
            y_exact=y_ex,
            error=abs(y - y_ex) if y_ex is not None else None
        ))
        steps += 1

    return ODEResponse(
        method=req.method,
        points=points,
        h=h,
        total_steps=steps,
        function_str=req.fxy,
    )


# ─────────────────────────────────────────────
# Numerical Differentiation
# ─────────────────────────────────────────────

class DiffRequest(BaseModel):
    fx: str
    x0: float
    h: float = 0.001
    exact_derivative: Optional[float] = None

class DiffResult(BaseModel):
    method: str
    h: float
    approximation: float
    abs_error: Optional[float]
    formula: str

class DiffResponse(BaseModel):
    x0: float
    fx0: float
    results: List[DiffResult]
    function_str: str
    h_analysis: List[dict]  # error vs h for different step sizes


@router.post("/api/differentiation", response_model=DiffResponse)
def differentiate(req: DiffRequest):
    fx_str = req.fx.replace('^', '**').strip()
    aeval = make_aeval()
    x0 = req.x0
    h = req.h

    fx0 = safe_eval(aeval, fx_str, x0)

    # Three classic formulas
    forward = (safe_eval(aeval, fx_str, x0 + h) - fx0) / h
    backward = (fx0 - safe_eval(aeval, fx_str, x0 - h)) / h
    central = (safe_eval(aeval, fx_str, x0 + h) - safe_eval(aeval, fx_str, x0 - h)) / (2 * h)

    exact = req.exact_derivative

    results = [
        DiffResult(
            method="forward",
            h=h,
            approximation=forward,
            abs_error=abs(forward - exact) if exact is not None else None,
            formula="[f(x+h) - f(x)] / h",
        ),
        DiffResult(
            method="backward",
            h=h,
            approximation=backward,
            abs_error=abs(backward - exact) if exact is not None else None,
            formula="[f(x) - f(x-h)] / h",
        ),
        DiffResult(
            method="central",
            h=h,
            approximation=central,
            abs_error=abs(central - exact) if exact is not None else None,
            formula="[f(x+h) - f(x-h)] / (2h)",
        ),
    ]

    # Error vs h analysis (show how error changes as h varies)
    h_analysis = []
    for exp in range(-1, -8, -1):
        hi = 10.0 ** exp
        try:
            c = (safe_eval(aeval, fx_str, x0 + hi) - safe_eval(aeval, fx_str, x0 - hi)) / (2 * hi)
            h_analysis.append({
                "h": hi,
                "central": c,
                "abs_error": abs(c - exact) if exact is not None else None,
            })
        except Exception:
            pass

    return DiffResponse(
        x0=x0,
        fx0=fx0,
        results=results,
        function_str=req.fx,
        h_analysis=h_analysis,
    )


# ─────────────────────────────────────────────
# Calculation History save/retrieve
# ─────────────────────────────────────────────
import json as _json
from database import db_manager

class SaveHistoryRequest(BaseModel):
    user_id: Optional[int] = None
    method: str
    category: str
    problem: str
    params: Optional[dict] = None
    result: Optional[float] = None
    iterations: Optional[int] = None
    converged: Optional[bool] = None


@router.post("/api/calc-history")
def save_calc_history(req: SaveHistoryRequest):
    query = """
        INSERT INTO calc_history
        (id_utilisateur, method, category, problem, params, result, iterations, converged)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    db_manager.execute_query(query, (
        req.user_id,
        req.method,
        req.category,
        req.problem,
        _json.dumps(req.params) if req.params else None,
        req.result,
        req.iterations,
        req.converged,
    ))
    return {"status": "saved"}


@router.get("/api/calc-history/{user_id}")
def get_calc_history(user_id: int):
    query = """
        SELECT * FROM calc_history
        WHERE id_utilisateur = ?
        ORDER BY timestamp DESC
        LIMIT 100
    """
    rows = db_manager.execute_query(query, (user_id,))
    result = []
    for r in rows:
        result.append({
            "id": r["id"],
            "method": r["method"],
            "category": r["category"],
            "problem": r["problem"],
            "params": _json.loads(r["params"]) if r.get("params") else None,
            "result": r["result"],
            "iterations": r["iterations"],
            "converged": bool(r["converged"]) if r["converged"] is not None else None,
            "timestamp": r["timestamp"],
        })
    return result


@router.delete("/api/calc-history/{entry_id}")
def delete_calc_history_entry(entry_id: int):
    db_manager.execute_query("DELETE FROM calc_history WHERE id = ?", (entry_id,))
    return {"status": "deleted"}


@router.delete("/api/calc-history/user/{user_id}/all")
def clear_calc_history(user_id: int):
    db_manager.execute_query("DELETE FROM calc_history WHERE id_utilisateur = ?", (user_id,))
    return {"status": "cleared"}


# ─────────────────────────────────────────────────────────────────────────────
# Richardson Extrapolation for Differentiation
# ─────────────────────────────────────────────────────────────────────────────

class RichardsonRequest(BaseModel):
    fx: str
    x0: float
    h0: float = 0.1       # initial step size
    levels: int = 4       # number of Richardson levels (max 8)
    exact_derivative: Optional[float] = None

class RichardsonRow(BaseModel):
    level: int
    h: float
    approximation: float
    abs_error: Optional[float] = None

class RichardsonResponse(BaseModel):
    x0: float
    fx0: float
    table: List[List[float]]   # Richardson triangle D[i][j]
    h_values: List[float]
    best_approximation: float
    abs_error: Optional[float]
    function_str: str
    rows: List[RichardsonRow]


@router.post("/api/differentiation/richardson", response_model=RichardsonResponse)
def richardson_extrapolation(req: RichardsonRequest):
    fx_str = req.fx.replace('^', '**').strip()
    aeval = make_aeval()

    levels = max(1, min(req.levels, 8))
    h0 = req.h0
    if h0 <= 0:
        raise HTTPException(status_code=400, detail="h0 must be positive.")

    fx0 = safe_eval(aeval, fx_str, req.x0)

    # Build Richardson table using central differences
    # D[i][0] = central difference with h = h0 / 2^i
    h_values: List[float] = []
    D: List[List[float]] = []

    for i in range(levels):
        hi = h0 / (2 ** i)
        h_values.append(hi)
        try:
            d0 = (safe_eval(aeval, fx_str, req.x0 + hi) -
                  safe_eval(aeval, fx_str, req.x0 - hi)) / (2 * hi)
        except Exception as exc:
            raise HTTPException(status_code=400,
                detail=f"Evaluation error at level {i}: {exc}") from exc
        D.append([d0] + [0.0] * (levels - 1))

    # Richardson extrapolation: O(h^{2k}) accuracy at level k
    # D[i][j] = D[i][j-1] + (D[i][j-1] - D[i-1][j-1]) / (4^j - 1)
    for j in range(1, levels):
        for i in range(j, levels):
            D[i][j] = D[i][j-1] + (D[i][j-1] - D[i-1][j-1]) / (4**j - 1)

    best = D[levels - 1][levels - 1]
    abs_err = abs(best - req.exact_derivative) if req.exact_derivative is not None else None

    rows: List[RichardsonRow] = []
    for i in range(levels):
        for j in range(i + 1):
            rows.append(RichardsonRow(
                level=j,
                h=h_values[i],
                approximation=D[i][j],
                abs_error=abs(D[i][j] - req.exact_derivative) if req.exact_derivative is not None else None,
            ))

    return RichardsonResponse(
        x0=req.x0,
        fx0=fx0,
        table=[row[:levels] for row in D],
        h_values=h_values,
        best_approximation=best,
        abs_error=abs_err,
        function_str=req.fx,
        rows=rows,
    )


# ─────────────────────────────────────────────────────────────────────────────
# ODE Systems  (Pendulum · Lotka-Volterra · Custom 2-eq system)
# Solved with RK4 for robustness
# ─────────────────────────────────────────────────────────────────────────────

class ODESystemRequest(BaseModel):
    preset: Optional[str] = None   # "pendulum" | "lotka-volterra" | "custom"
    # Custom: two expressions dy1/dt and dy2/dt
    f1: Optional[str] = None       # dy1/dt = f1(t, y1, y2)
    f2: Optional[str] = None       # dy2/dt = f2(t, y1, y2)
    # Initial conditions
    y1_0: float = 0.5
    y2_0: float = 0.0
    t0: float = 0.0
    t_end: float = 10.0
    h: float = 0.05
    # Preset parameters
    alpha: float = 1.0     # Lotka-Volterra: prey growth
    beta:  float = 0.1     # Lotka-Volterra: predation
    delta: float = 0.075   # Lotka-Volterra: predator growth
    gamma: float = 1.5     # Lotka-Volterra: predator death
    length: float = 1.0    # Pendulum: L (metres)
    damping: float = 0.0   # Pendulum: damping coefficient

class ODESysPoint(BaseModel):
    t: float
    y1: float
    y2: float

class ODESystemResponse(BaseModel):
    preset: str
    points: List[ODESysPoint]
    label_y1: str
    label_y2: str
    h: float
    total_steps: int


@router.post("/api/ode/system", response_model=ODESystemResponse)
def solve_ode_system(req: ODESystemRequest):
    import math as _math
    aeval = make_aeval()

    preset = req.preset or "pendulum"
    g = 9.81

    if preset == "pendulum":
        # θ' = ω,  ω' = -(g/L)sin(θ) - damping·ω
        def f1(t, y1, y2): return y2
        def f2(t, y1, y2): return -(g / max(req.length, 1e-3)) * _math.sin(y1) - req.damping * y2
        label_y1, label_y2 = "θ (angle, rad)", "ω (angular velocity)"

    elif preset == "lotka-volterra":
        # dx/dt = α·x - β·x·y   (prey)
        # dy/dt = δ·x·y - γ·y   (predator)
        al, be, de, ga = req.alpha, req.beta, req.delta, req.gamma
        def f1(t, y1, y2): return al * y1 - be * y1 * y2
        def f2(t, y1, y2): return de * y1 * y2 - ga * y2
        label_y1, label_y2 = "Prey (x)", "Predator (y)"

    elif preset == "custom":
        if not req.f1 or not req.f2:
            raise HTTPException(status_code=400,
                detail="For preset='custom', both f1 and f2 must be provided.")
        f1_str = req.f1.replace('^', '**').strip()
        f2_str = req.f2.replace('^', '**').strip()

        def f1(t, y1, y2):
            aeval.symtable.update({"t": t, "y1": y1, "y2": y2})
            r = aeval.eval(f1_str)
            if aeval.error:
                raise HTTPException(status_code=400,
                    detail=f"f1 error: {aeval.error[0].get_error()}")
            return float(r)

        def f2(t, y1, y2):
            aeval.symtable.update({"t": t, "y1": y1, "y2": y2})
            r = aeval.eval(f2_str)
            if aeval.error:
                raise HTTPException(status_code=400,
                    detail=f"f2 error: {aeval.error[0].get_error()}")
            return float(r)

        label_y1, label_y2 = "y₁(t)", "y₂(t)"
    else:
        raise HTTPException(status_code=400,
            detail=f"Unknown preset '{preset}'. Choose: pendulum, lotka-volterra, custom.")

    t = req.t0
    y1, y2 = req.y1_0, req.y2_0
    h = req.h
    points: List[ODESysPoint] = [ODESysPoint(t=round(t, 10), y1=y1, y2=y2)]
    max_steps = 5000
    steps = 0

    while t + h <= req.t_end + 1e-10 and steps < max_steps:
        k1a = f1(t, y1, y2);            k1b = f2(t, y1, y2)
        k2a = f1(t+h/2, y1+h*k1a/2, y2+h*k1b/2)
        k2b = f2(t+h/2, y1+h*k1a/2, y2+h*k1b/2)
        k3a = f1(t+h/2, y1+h*k2a/2, y2+h*k2b/2)
        k3b = f2(t+h/2, y1+h*k2a/2, y2+h*k2b/2)
        k4a = f1(t+h, y1+h*k3a, y2+h*k3b)
        k4b = f2(t+h, y1+h*k3a, y2+h*k3b)
        y1 += h * (k1a + 2*k2a + 2*k3a + k4a) / 6
        y2 += h * (k1b + 2*k2b + 2*k3b + k4b) / 6
        t = round(t + h, 10)
        points.append(ODESysPoint(t=t, y1=y1, y2=y2))
        steps += 1

    return ODESystemResponse(
        preset=preset,
        points=points,
        label_y1=label_y1,
        label_y2=label_y2,
        h=h,
        total_steps=steps,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Matrix: condition number
# ─────────────────────────────────────────────────────────────────────────────

class CondRequest(BaseModel):
    matrix: List[List[float]]
    norm_type: str = "2"   # "1", "2", "inf", "fro"


@router.post("/api/matrix/cond")
def matrix_condition_number(req: CondRequest):
    A = np.array(req.matrix, dtype=float)
    n, m = A.shape
    if n != m:
        raise HTTPException(status_code=400, detail=f"Matrix must be square (got {n}×{m}).")
    if n > 50:
        raise HTTPException(status_code=400, detail="Matrix too large (max 50×50).")

    norm_map = {"1": 1, "2": 2, "inf": np.inf, "fro": "fro"}
    norm_key = norm_map.get(req.norm_type, 2)

    try:
        cond_val = float(np.linalg.cond(A, p=norm_key))
    except np.linalg.LinAlgError as exc:
        raise HTTPException(status_code=400, detail=f"Condition number failed: {exc}") from exc

    singular_values = np.linalg.svd(A, compute_uv=False).tolist()
    rank = int(np.linalg.matrix_rank(A))
    det = float(np.linalg.det(A)) if n <= 20 else None

    return {
        "cond": cond_val,
        "log10_cond": float(np.log10(cond_val)) if cond_val > 0 and np.isfinite(cond_val) else None,
        "rank": rank,
        "n": n,
        "singular_values": [round(float(s), 12) for s in singular_values],
        "det": round(det, 12) if det is not None else None,
        "is_well_conditioned": cond_val < 1e4,
        "norm_type": req.norm_type,
    }

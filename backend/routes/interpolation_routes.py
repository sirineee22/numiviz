"""
Interpolation & Approximation Routes
=====================================
Endpoints
  POST /api/interpolation/lagrange
  POST /api/interpolation/newton-dd
  POST /api/interpolation/spline
  POST /api/interpolation/least-squares

All endpoints:
- validate inputs and raise HTTP 400 with a friendly message (never 500)
- evaluate user-typed f(x) strings via a sandboxed asteval interpreter
- return a common InterpolationResponse so the frontend can render the same
  chart/table/CSV layout regardless of the method
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from typing import List, Optional, Literal
import numpy as np
import math
from asteval import Interpreter

router = APIRouter()

# ─── Hard limits ─────────────────────────────────────────────────────────────
MAX_EXPR_LEN   = 500    # characters
MAX_DATA_PTS   = 200    # data points
MAX_CURVE_PTS  = 400    # points sampled for the plotted curve
MAX_DEGREE     = 20     # maximum polynomial degree for least-squares

# ─── Shared asteval sandbox ──────────────────────────────────────────────────

def make_aeval() -> Interpreter:
    aeval = Interpreter()
    aeval.symtable["np"]   = np
    aeval.symtable["math"] = math
    for name in ("sqrt", "exp", "log", "log10", "sin", "cos", "tan",
                 "asin", "acos", "atan", "sinh", "cosh", "tanh", "abs", "pi", "e"):
        aeval.symtable[name] = getattr(math, name, None) or getattr(np, name)
    return aeval


def safe_eval_x(aeval: Interpreter, expr: str, x_val: float) -> float:
    """Evaluate expr(x) inside the sandbox; raises HTTP 400 on any error."""
    if len(expr) > MAX_EXPR_LEN:
        raise HTTPException(status_code=400,
            detail=f"Expression too long ({len(expr)} chars, max {MAX_EXPR_LEN}).")
    aeval.symtable["x"] = x_val
    result = aeval.eval(expr)
    if aeval.error:
        raise HTTPException(status_code=400,
            detail=f"Expression error in '{expr}': {aeval.error[0].get_error()}")
    if result is None or (isinstance(result, float) and (math.isnan(result) or math.isinf(result))):
        raise HTTPException(status_code=400,
            detail=f"Expression '{expr}' returned NaN or Inf at x={x_val}.")
    return float(result)


# ─── Common validation ───────────────────────────────────────────────────────

def parse_and_validate(x_str: str, y_str: str,
                       min_pts: int = 2) -> tuple[np.ndarray, np.ndarray]:
    """Parse comma-separated x/y strings; raise HTTP 400 on any issue."""
    try:
        xs = [float(v.strip()) for v in x_str.split(",") if v.strip()]
        ys = [float(v.strip()) for v in y_str.split(",") if v.strip()]
    except ValueError as exc:
        raise HTTPException(status_code=400,
            detail=f"Could not parse data points: {exc}. "
                   "Use comma-separated numbers, e.g. '0, 1, 2, 3'.") from exc

    if len(xs) < min_pts or len(ys) < min_pts:
        raise HTTPException(status_code=400,
            detail=f"At least {min_pts} data points are required.")
    if len(xs) != len(ys):
        raise HTTPException(status_code=400,
            detail=f"x and y must have the same number of values "
                   f"(got {len(xs)} x-values and {len(ys)} y-values).")
    if len(xs) > MAX_DATA_PTS:
        raise HTTPException(status_code=400,
            detail=f"Too many data points ({len(xs)}; max {MAX_DATA_PTS}).")
    if len(set(xs)) != len(xs):
        raise HTTPException(status_code=400,
            detail="x-values must be distinct (no duplicates allowed).")

    return np.array(xs, dtype=float), np.array(ys, dtype=float)


# ─── Shared Response Model ───────────────────────────────────────────────────

class InterpolationResponse(BaseModel):
    method: str
    # Curve for plotting (many points for a smooth line)
    curve_x: List[float]
    curve_y: List[float]
    # Data points (echoed back for the scatter plot)
    data_x: List[float]
    data_y: List[float]
    # Method-specific coefficient / difference table
    table: List[dict]
    # Residuals at each data point: {x, y_data, y_fit, residual}
    residuals: List[dict]
    # Human-readable polynomial string
    poly_str: str
    # Degree of the polynomial / spline order
    degree: int
    # Optional: value of the interpolating polynomial at eval_x
    eval_x: Optional[float] = None
    eval_y: Optional[float] = None
    # Standard fields expected by the frontend error bar
    converged: bool = True
    stopping_reason: str = "Interpolation complete"


# ═══════════════════════════════════════════════════════════════════════════════
# 1 — Lagrange Interpolation
# ═══════════════════════════════════════════════════════════════════════════════

class LagrangeRequest(BaseModel):
    x_data: str          # comma-separated, e.g. "0, 1, 2, 3"
    y_data: str          # comma-separated
    eval_x: Optional[float] = None   # optional point to evaluate at
    n_curve: int = MAX_CURVE_PTS     # how many curve points to generate

    @field_validator("n_curve")
    @classmethod
    def clamp_curve(cls, v: int) -> int:
        return max(50, min(v, MAX_CURVE_PTS))


def _lagrange_eval(xs: np.ndarray, ys: np.ndarray, x: float) -> float:
    """Evaluate the Lagrange interpolating polynomial at x."""
    n = len(xs)
    total = 0.0
    for i in range(n):
        L = 1.0
        for j in range(n):
            if i != j:
                denom = xs[i] - xs[j]
                if abs(denom) < 1e-14:
                    raise HTTPException(status_code=400,
                        detail=f"Duplicate x-values detected (xs[{i}]≈xs[{j}]). "
                               "All x-values must be distinct.")
                L *= (x - xs[j]) / denom
        total += ys[i] * L
    return total


@router.post("/api/interpolation/lagrange", response_model=InterpolationResponse)
def lagrange_interpolation(req: LagrangeRequest):
    xs, ys = parse_and_validate(req.x_data, req.y_data, min_pts=2)
    n = len(xs)

    # Build basis-polynomial table (one row per node)
    table = []
    for i in range(n):
        table.append({
            "node": i,
            "x_i": round(float(xs[i]), 10),
            "y_i": round(float(ys[i]), 10),
            "L_i(x*)": round(_lagrange_eval_basis(xs, i, req.eval_x), 10)
                       if req.eval_x is not None else None,
        })

    # Smooth curve
    x_lo, x_hi = float(xs.min()), float(xs.max())
    margin = max((x_hi - x_lo) * 0.05, 0.1)
    curve_xs = np.linspace(x_lo - margin, x_hi + margin, req.n_curve)
    try:
        curve_ys = [_lagrange_eval(xs, ys, float(cx)) for cx in curve_xs]
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    # Residuals
    residuals = []
    for xi, yi in zip(xs, ys):
        y_fit = _lagrange_eval(xs, ys, float(xi))
        residuals.append({
            "x": round(float(xi), 10),
            "y_data": round(float(yi), 10),
            "y_fit":  round(y_fit, 10),
            "residual": round(float(yi) - y_fit, 10),
        })

    eval_y = _lagrange_eval(xs, ys, req.eval_x) if req.eval_x is not None else None

    poly_str = f"Lagrange polynomial of degree {n - 1} through {n} nodes"

    return InterpolationResponse(
        method="lagrange",
        curve_x=[round(float(v), 10) for v in curve_xs],
        curve_y=[round(v, 10) for v in curve_ys],
        data_x=xs.tolist(),
        data_y=ys.tolist(),
        table=table,
        residuals=residuals,
        poly_str=poly_str,
        degree=n - 1,
        eval_x=req.eval_x,
        eval_y=round(eval_y, 10) if eval_y is not None else None,
    )


def _lagrange_eval_basis(xs: np.ndarray, i: int, x: Optional[float]) -> float:
    """Evaluate the i-th Lagrange basis polynomial at x."""
    if x is None:
        return 0.0
    L = 1.0
    for j in range(len(xs)):
        if i != j:
            denom = xs[i] - xs[j]
            if abs(denom) < 1e-14:
                return float("nan")
            L *= (x - xs[j]) / denom
    return float(L)


# ═══════════════════════════════════════════════════════════════════════════════
# 2 — Newton Divided Differences
# ═══════════════════════════════════════════════════════════════════════════════

class NewtonDDRequest(BaseModel):
    x_data: str
    y_data: str
    eval_x: Optional[float] = None
    n_curve: int = MAX_CURVE_PTS

    @field_validator("n_curve")
    @classmethod
    def clamp_curve(cls, v: int) -> int:
        return max(50, min(v, MAX_CURVE_PTS))


def _divided_diff_table(xs: np.ndarray, ys: np.ndarray) -> np.ndarray:
    """Return the full divided-difference table (lower-triangular)."""
    n = len(xs)
    table = np.zeros((n, n))
    table[:, 0] = ys
    for j in range(1, n):
        for i in range(j, n):
            denom = xs[i] - xs[i - j]
            if abs(denom) < 1e-14:
                raise HTTPException(status_code=400,
                    detail=f"Duplicate or too-close x-values at indices {i-j} and {i}.")
            table[i, j] = (table[i, j - 1] - table[i - 1, j - 1]) / denom
    return table


def _newton_eval(xs: np.ndarray, dd_table: np.ndarray, x: float) -> float:
    """Evaluate the Newton DD polynomial at x using Horner-like form."""
    n = len(xs)
    result = dd_table[n - 1, n - 1]
    for i in range(n - 2, -1, -1):
        result = result * (x - xs[i]) + dd_table[i, i]
    return float(result)


@router.post("/api/interpolation/newton-dd", response_model=InterpolationResponse)
def newton_divided_differences(req: NewtonDDRequest):
    xs, ys = parse_and_validate(req.x_data, req.y_data, min_pts=2)
    n = len(xs)

    dd = _divided_diff_table(xs, ys)

    # Build readable DD table: show the diagonal coefficients
    table = []
    for i in range(n):
        row: dict = {"node": i, "x_i": round(float(xs[i]), 10)}
        for j in range(i + 1):
            key = f"f[x{',x'.join(str(k) for k in range(i - j, i + 1))}]"
            row[key] = round(float(dd[i, j]), 10)
        table.append(row)

    # Coefficients = diagonal of DD table
    coeffs = [float(dd[i, i]) for i in range(n)]
    poly_str = _newton_poly_str(xs, coeffs)

    # Curve
    x_lo, x_hi = float(xs.min()), float(xs.max())
    margin = max((x_hi - x_lo) * 0.05, 0.1)
    curve_xs = np.linspace(x_lo - margin, x_hi + margin, req.n_curve)
    curve_ys = [_newton_eval(xs, dd, float(cx)) for cx in curve_xs]

    # Residuals (should all be ≈ 0 for interpolation)
    residuals = []
    for xi, yi in zip(xs, ys):
        y_fit = _newton_eval(xs, dd, float(xi))
        residuals.append({
            "x": round(float(xi), 10),
            "y_data": round(float(yi), 10),
            "y_fit":  round(y_fit, 10),
            "residual": round(float(yi) - y_fit, 10),
        })

    eval_y = _newton_eval(xs, dd, req.eval_x) if req.eval_x is not None else None

    return InterpolationResponse(
        method="newton-dd",
        curve_x=[round(float(v), 10) for v in curve_xs],
        curve_y=[round(v, 10) for v in curve_ys],
        data_x=xs.tolist(),
        data_y=ys.tolist(),
        table=table,
        residuals=residuals,
        poly_str=poly_str,
        degree=n - 1,
        eval_x=req.eval_x,
        eval_y=round(eval_y, 10) if eval_y is not None else None,
    )


def _newton_poly_str(xs: np.ndarray, coeffs: List[float]) -> str:
    """Build a human-readable Newton DD polynomial string."""
    if not coeffs:
        return "0"
    terms = [f"{coeffs[0]:.6g}"]
    for i in range(1, len(coeffs)):
        c = coeffs[i]
        if abs(c) < 1e-14:
            continue
        factor = "".join(f"(x - {xs[j]:.6g})" for j in range(i))
        sign = "+" if c >= 0 else "-"
        terms.append(f"{sign} {abs(c):.6g}·{factor}")
    return "P(x) = " + " ".join(terms)


# ═══════════════════════════════════════════════════════════════════════════════
# 3 — Natural Cubic Spline
# ═══════════════════════════════════════════════════════════════════════════════

class SplineRequest(BaseModel):
    x_data: str
    y_data: str
    eval_x: Optional[float] = None
    n_curve: int = MAX_CURVE_PTS

    @field_validator("n_curve")
    @classmethod
    def clamp_curve(cls, v: int) -> int:
        return max(50, min(v, MAX_CURVE_PTS))


@router.post("/api/interpolation/spline", response_model=InterpolationResponse)
def natural_cubic_spline(req: SplineRequest):
    xs, ys = parse_and_validate(req.x_data, req.y_data, min_pts=3)
    n = len(xs)

    # Sort by x (required for spline)
    order = np.argsort(xs)
    xs, ys = xs[order], ys[order]

    # Compute natural cubic spline via tridiagonal system
    # h[i] = x[i+1] - x[i]
    h = np.diff(xs)
    if np.any(h <= 0):
        raise HTTPException(status_code=400,
            detail="After sorting, some x-values are still equal or non-monotone. "
                   "Ensure all x-values are strictly distinct.")

    # Set up tridiagonal system for second derivatives (moments) M[i]
    # Natural BC: M[0] = M[n-1] = 0
    size = n - 2
    if size <= 0:
        raise HTTPException(status_code=400,
            detail="At least 3 distinct data points are required for a cubic spline.")

    # Build tridiagonal (Thomas algorithm)
    diag  = np.zeros(size)
    upper = np.zeros(size - 1)
    lower = np.zeros(size - 1)
    rhs   = np.zeros(size)

    for i in range(size):
        diag[i] = 2 * (h[i] + h[i + 1])
        rhs[i]  = 6 * ((ys[i + 2] - ys[i + 1]) / h[i + 1]
                       - (ys[i + 1] - ys[i])   / h[i])
    for i in range(size - 1):
        upper[i] = h[i + 1]
        lower[i] = h[i + 1]

    A = np.diag(diag) + np.diag(upper, 1) + np.diag(lower, -1)
    try:
        M_inner = np.linalg.solve(A, rhs)
    except np.linalg.LinAlgError as exc:
        raise HTTPException(status_code=400,
            detail=f"Singular system in spline calculation: {exc}. "
                   "Check that all x-values are distinct and well-spaced.") from exc

    M = np.concatenate([[0.0], M_inner, [0.0]])  # natural BC

    def spline_eval(x_query: float) -> float:
        # Find the interval
        idx = np.searchsorted(xs, x_query, side="right") - 1
        idx = int(np.clip(idx, 0, n - 2))
        i = idx
        hi = h[i]
        a = (xs[i + 1] - x_query) / hi
        b = (x_query  - xs[i])    / hi
        return (a * ys[i] + b * ys[i + 1]
                + ((a**3 - a) * M[i] + (b**3 - b) * M[i + 1]) * hi**2 / 6)

    # Curve
    x_lo, x_hi = float(xs[0]), float(xs[-1])
    margin = max((x_hi - x_lo) * 0.03, 0.05)
    curve_xs = np.linspace(x_lo - margin, x_hi + margin, req.n_curve)
    curve_ys = [spline_eval(float(cx)) for cx in curve_xs]

    # Residuals
    residuals = []
    for xi, yi in zip(xs, ys):
        y_fit = spline_eval(float(xi))
        residuals.append({
            "x": round(float(xi), 10),
            "y_data": round(float(yi), 10),
            "y_fit":  round(y_fit, 10),
            "residual": round(float(yi) - y_fit, 10),
        })

    # Table: show spline coefficients per segment
    table = []
    for i in range(n - 1):
        hi = h[i]
        # S_i(x) = a_i + b_i(x-x_i) + c_i(x-x_i)^2 + d_i(x-x_i)^3
        a_i = ys[i]
        b_i = (ys[i + 1] - ys[i]) / hi - hi * (2 * M[i] + M[i + 1]) / 6
        c_i = M[i] / 2
        d_i = (M[i + 1] - M[i]) / (6 * hi)
        table.append({
            "segment": i,
            "interval": f"[{xs[i]:.4g}, {xs[i+1]:.4g}]",
            "a (const)":  round(a_i, 8),
            "b (linear)": round(b_i, 8),
            "c (quadr.)": round(c_i, 8),
            "d (cubic)":  round(d_i, 8),
            "M_i (moment)": round(float(M[i]), 8),
        })

    eval_y = spline_eval(req.eval_x) if req.eval_x is not None else None

    return InterpolationResponse(
        method="spline",
        curve_x=[round(float(v), 10) for v in curve_xs],
        curve_y=[round(v, 10) for v in curve_ys],
        data_x=xs.tolist(),
        data_y=ys.tolist(),
        table=table,
        residuals=residuals,
        poly_str=f"Natural cubic spline: {n - 1} piece(s) through {n} nodes",
        degree=3,
        eval_x=req.eval_x,
        eval_y=round(eval_y, 10) if eval_y is not None else None,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# 4 — Least Squares (linear + polynomial)
# ═══════════════════════════════════════════════════════════════════════════════

class LeastSquaresRequest(BaseModel):
    x_data: str
    y_data: str
    degree: int = 1            # 1 = linear, 2+ = polynomial
    eval_x: Optional[float] = None
    n_curve: int = MAX_CURVE_PTS

    @field_validator("degree")
    @classmethod
    def check_degree(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Degree must be ≥ 1.")
        if v > MAX_DEGREE:
            raise ValueError(f"Degree must be ≤ {MAX_DEGREE}.")
        return v

    @field_validator("n_curve")
    @classmethod
    def clamp_curve(cls, v: int) -> int:
        return max(50, min(v, MAX_CURVE_PTS))


@router.post("/api/interpolation/least-squares", response_model=InterpolationResponse)
def least_squares(req: LeastSquaresRequest):
    xs, ys = parse_and_validate(req.x_data, req.y_data, min_pts=req.degree + 1)
    n = len(xs)

    if req.degree >= n:
        raise HTTPException(status_code=400,
            detail=f"Degree ({req.degree}) must be strictly less than the number "
                   f"of data points ({n}). Reduce the degree or add more points.")

    # Fit via numpy (uses SVD internally — numerically stable)
    try:
        # np.polyfit returns coefficients highest degree first
        coeffs_high = np.polyfit(xs, ys, req.degree)
    except np.linalg.LinAlgError as exc:
        raise HTTPException(status_code=400,
            detail=f"Least-squares fit failed (singular Vandermonde matrix): {exc}. "
                   "Try reducing the degree or spreading x-values more evenly.") from exc

    poly = np.poly1d(coeffs_high)

    # Residuals
    ys_fit = poly(xs)
    ss_res = float(np.sum((ys - ys_fit) ** 2))
    ss_tot = float(np.sum((ys - np.mean(ys)) ** 2))
    r_squared = 1.0 - ss_res / ss_tot if abs(ss_tot) > 1e-14 else 1.0

    residuals = []
    for xi, yi, yf in zip(xs, ys, ys_fit):
        residuals.append({
            "x":        round(float(xi), 10),
            "y_data":   round(float(yi), 10),
            "y_fit":    round(float(yf), 10),
            "residual": round(float(yi) - float(yf), 10),
        })

    # Coefficient table (lowest degree first for readability)
    coeffs_low = coeffs_high[::-1]  # a0 + a1·x + a2·x² + ...
    table = [
        {
            "term":        f"x^{i}" if i > 1 else ("x" if i == 1 else "1"),
            "coefficient": round(float(c), 10),
            "power":       i,
        }
        for i, c in enumerate(coeffs_low)
    ]
    table.append({"term": "R²", "coefficient": round(r_squared, 8), "power": None})

    # Poly string (highest degree first)
    poly_terms = []
    for i, c in enumerate(coeffs_high):
        power = req.degree - i
        if abs(c) < 1e-14:
            continue
        sign = "+" if c >= 0 else "-"
        if power == 0:
            poly_terms.append(f"{sign} {abs(c):.6g}")
        elif power == 1:
            poly_terms.append(f"{sign} {abs(c):.6g}x")
        else:
            poly_terms.append(f"{sign} {abs(c):.6g}x^{power}")
    poly_str = "P(x) = " + " ".join(poly_terms).lstrip("+ ").strip()
    poly_str += f"  (R²={r_squared:.6f})"

    # Smooth curve (extend a bit beyond data)
    x_lo, x_hi = float(xs.min()), float(xs.max())
    margin = max((x_hi - x_lo) * 0.08, 0.2)
    curve_xs = np.linspace(x_lo - margin, x_hi + margin, req.n_curve)
    curve_ys = poly(curve_xs)

    # Guard against diverging high-degree polynomials in the margin
    clip_val = max(abs(ys).max() * 100, 1e6)
    curve_ys = np.clip(curve_ys, -clip_val, clip_val)

    eval_y = float(poly(req.eval_x)) if req.eval_x is not None else None

    return InterpolationResponse(
        method="least-squares",
        curve_x=[round(float(v), 10) for v in curve_xs],
        curve_y=[round(float(v), 10) for v in curve_ys],
        data_x=xs.tolist(),
        data_y=ys.tolist(),
        table=table,
        residuals=residuals,
        poly_str=poly_str,
        degree=req.degree,
        eval_x=req.eval_x,
        eval_y=round(eval_y, 10) if eval_y is not None else None,
    )

"""
Eigenvalue Routes
==================
POST /api/eigenvalue/power          — Power method (dominant eigenvalue)
POST /api/eigenvalue/inverse-power  — Inverse power method (smallest eigenvalue)

Both return Rayleigh-quotient convergence per iteration so the frontend
can animate the convergence graph exactly like the iterative solvers.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

router = APIRouter()

MAX_N = 20      # largest matrix dimension accepted
MAX_ITER = 500


# ─── Shared models ────────────────────────────────────────────────────────────

class EigenRequest(BaseModel):
    A: List[List[float]]
    x0: Optional[List[float]] = None      # initial vector (random if None)
    shift: Optional[float] = None          # optional shift σ (for inverse power: solves (A-σI)v=w)
    tol: float = 1e-10
    max_iter: int = 200

class EigenIterRow(BaseModel):
    iteration: int
    eigenvalue: float          # Rayleigh quotient at this step
    error: float               # |λ_k - λ_{k-1}|
    rel_error: float
    eigenvector_norm: float    # ‖v_k‖₂ (should stay ≈ 1)

class EigenResponse(BaseModel):
    method: str
    eigenvalue: float
    eigenvector: List[float]
    iterations: List[EigenIterRow]
    converged: bool
    stopping_reason: str
    final_error: float
    total_iterations: int
    shift: Optional[float] = None


# ─── Validation helper ────────────────────────────────────────────────────────

def _validate_matrix(A_raw: List[List[float]], method: str) -> np.ndarray:
    A = np.array(A_raw, dtype=float)
    n, m = A.shape
    if n != m:
        raise HTTPException(status_code=400,
            detail=f"Matrix must be square (got {n}×{m}).")
    if n > MAX_N:
        raise HTTPException(status_code=400,
            detail=f"Matrix too large ({n}×{n}); max is {MAX_N}×{MAX_N}.")
    if n < 1:
        raise HTTPException(status_code=400, detail="Matrix must have at least 1 row.")
    return A


def _initial_vector(x0_raw: Optional[List[float]], n: int) -> np.ndarray:
    if x0_raw is not None:
        v = np.array(x0_raw, dtype=float)
        if len(v) != n:
            raise HTTPException(status_code=400,
                detail=f"Initial vector length ({len(v)}) must match matrix size ({n}).")
    else:
        rng = np.random.default_rng(42)
        v = rng.standard_normal(n)
    norm = np.linalg.norm(v)
    if norm < 1e-14:
        raise HTTPException(status_code=400,
            detail="Initial vector is (nearly) zero — cannot normalise.")
    return v / norm


# ═══════════════════════════════════════════════════════════════════════════════
# 1 — Power Method  (dominant eigenvalue)
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/api/eigenvalue/power", response_model=EigenResponse)
def power_method(req: EigenRequest):
    A = _validate_matrix(req.A, "power")
    n = A.shape[0]
    v = _initial_vector(req.x0, n)

    rows: List[EigenIterRow] = []
    lam = float(v @ A @ v)   # initial Rayleigh quotient
    converged = False
    stopping_reason = "Max iterations reached"

    for k in range(min(req.max_iter, MAX_ITER)):
        w = A @ v                       # multiply
        w_norm = np.linalg.norm(w)
        if w_norm < 1e-14:
            stopping_reason = "w = Av collapsed to zero (deflation needed)."
            break
        v_new = w / w_norm              # normalise

        lam_new = float(v_new @ A @ v_new)   # Rayleigh quotient
        err = abs(lam_new - lam)
        rel_err = err / (abs(lam_new) + 1e-14)

        rows.append(EigenIterRow(
            iteration=k + 1,
            eigenvalue=lam_new,
            error=err,
            rel_error=rel_err,
            eigenvector_norm=float(np.linalg.norm(v_new)),
        ))

        v = v_new
        lam = lam_new

        if err < req.tol:
            converged = True
            stopping_reason = f"Converged: |λ_k - λ_{{k-1}}| = {err:.2e} < tol={req.tol:.2e}"
            break

    return EigenResponse(
        method="power",
        eigenvalue=lam,
        eigenvector=v.tolist(),
        iterations=rows,
        converged=converged,
        stopping_reason=stopping_reason,
        final_error=rows[-1].error if rows else float("inf"),
        total_iterations=len(rows),
        shift=None,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# 2 — Inverse Power Method  (smallest eigenvalue, or eigenvalue nearest to σ)
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/api/eigenvalue/inverse-power", response_model=EigenResponse)
def inverse_power_method(req: EigenRequest):
    A = _validate_matrix(req.A, "inverse-power")
    n = A.shape[0]
    v = _initial_vector(req.x0, n)
    sigma = req.shift if req.shift is not None else 0.0

    # Factorise (A - σI) once
    B = A - sigma * np.eye(n)
    try:
        # LU factorisation for repeated solves
        from numpy.linalg import solve as np_solve
        # Check if B is singular
        if abs(np.linalg.det(B)) < 1e-14:
            raise HTTPException(status_code=400,
                detail=f"(A - σI) is singular for σ = {sigma}. "
                       "Choose a different shift that is not an eigenvalue of A.")
    except np.linalg.LinAlgError as exc:
        raise HTTPException(status_code=400,
            detail=f"Singular shifted matrix: {exc}. Try a different shift σ.") from exc

    rows: List[EigenIterRow] = []
    lam_shift = float(v @ B @ v)    # Rayleigh quotient w.r.t. shifted matrix
    converged = False
    stopping_reason = "Max iterations reached"

    for k in range(min(req.max_iter, MAX_ITER)):
        try:
            w = np.linalg.solve(B, v)    # solve (A - σI) w = v
        except np.linalg.LinAlgError:
            stopping_reason = "(A - σI) became singular mid-iteration."
            break

        w_norm = np.linalg.norm(w)
        if w_norm < 1e-14:
            stopping_reason = "w collapsed to zero."
            break
        v_new = w / w_norm

        # Rayleigh quotient of A (not B)
        lam_new = float(v_new @ A @ v_new)
        # For convergence, track change in shifted Rayleigh quotient
        lam_shift_new = float(v_new @ B @ v_new)
        err = abs(lam_new - (lam_shift + sigma))
        # Use proper error tracking
        lam_A_prev = lam_shift + sigma
        err = abs(lam_new - lam_A_prev)
        rel_err = err / (abs(lam_new) + 1e-14)

        rows.append(EigenIterRow(
            iteration=k + 1,
            eigenvalue=lam_new,
            error=err,
            rel_error=rel_err,
            eigenvector_norm=float(np.linalg.norm(v_new)),
        ))

        v = v_new
        lam_shift = lam_shift_new

        if err < req.tol:
            converged = True
            stopping_reason = f"Converged: |λ_k - λ_{{k-1}}| = {err:.2e} < tol={req.tol:.2e}"
            break

    final_lam = rows[-1].eigenvalue if rows else float(v @ A @ v)
    return EigenResponse(
        method="inverse-power",
        eigenvalue=final_lam,
        eigenvector=v.tolist(),
        iterations=rows,
        converged=converged,
        stopping_reason=stopping_reason,
        final_error=rows[-1].error if rows else float("inf"),
        total_iterations=len(rows),
        shift=sigma,
    )

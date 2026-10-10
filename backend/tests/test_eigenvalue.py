"""
Tests for eigenvalue routes — Power & Inverse Power methods.
Compares against numpy.linalg.eig / scipy.linalg.eig.
"""
import pytest
import numpy as np
from fastapi.testclient import TestClient
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from main import app

client = TestClient(app)

# ─── Helper ───────────────────────────────────────────────────────────────────
def _dominant_eigenvalue(A):
    """Reference: largest |eigenvalue| via numpy."""
    vals = np.linalg.eigvals(np.array(A, dtype=float))
    return float(vals[np.argmax(np.abs(vals))].real)

def _smallest_eigenvalue(A):
    vals = np.linalg.eigvals(np.array(A, dtype=float))
    return float(vals[np.argmin(np.abs(vals))].real)


# ─── Symmetric 2×2 ────────────────────────────────────────────────────────────
A2 = [[4, 1], [1, 3]]

def test_power_2x2_converges():
    r = client.post("/api/eigenvalue/power", json={"A": A2, "tol": 1e-10, "max_iter": 200})
    assert r.status_code == 200
    d = r.json()
    assert d["converged"] is True
    expected = _dominant_eigenvalue(A2)
    assert abs(d["eigenvalue"] - expected) < 1e-6

def test_power_2x2_eigenvector_normalised():
    r = client.post("/api/eigenvalue/power", json={"A": A2, "tol": 1e-10, "max_iter": 200})
    vec = np.array(r.json()["eigenvector"])
    assert abs(np.linalg.norm(vec) - 1.0) < 1e-8

def test_inverse_power_2x2_smallest():
    r = client.post("/api/eigenvalue/inverse-power", json={"A": A2, "shift": 0.0, "tol": 1e-10, "max_iter": 300})
    assert r.status_code == 200
    d = r.json()
    assert d["converged"] is True
    expected = _smallest_eigenvalue(A2)
    assert abs(d["eigenvalue"] - expected) < 1e-5


# ─── Symmetric 3×3 ────────────────────────────────────────────────────────────
A3 = [[4, 1, 0], [1, 3, 1], [0, 1, 2]]

def test_power_3x3_converges():
    r = client.post("/api/eigenvalue/power", json={"A": A3, "tol": 1e-10, "max_iter": 300})
    assert r.status_code == 200
    d = r.json()
    assert d["converged"] is True
    expected = _dominant_eigenvalue(A3)
    assert abs(d["eigenvalue"] - expected) < 1e-6

def test_power_3x3_eigenvector_length():
    r = client.post("/api/eigenvalue/power", json={"A": A3, "tol": 1e-10})
    vec = r.json()["eigenvector"]
    assert len(vec) == 3

def test_inverse_power_3x3_with_shift():
    # Shift near known smallest eigenvalue ~1.27
    r = client.post("/api/eigenvalue/inverse-power",
                    json={"A": A3, "shift": 1.0, "tol": 1e-10, "max_iter": 300})
    assert r.status_code == 200
    d = r.json()
    assert d["converged"] is True
    # eigenvalue closest to shift=1.0 should be near smallest
    expected = _smallest_eigenvalue(A3)
    assert abs(d["eigenvalue"] - expected) < 1e-4


# ─── Diagonal matrix (known eigenvalues) ─────────────────────────────────────
ADIAG = [[5, 0, 0], [0, 3, 0], [0, 0, 1]]

def test_power_diagonal_dominant_is_5():
    r = client.post("/api/eigenvalue/power", json={"A": ADIAG, "tol": 1e-12, "max_iter": 500})
    assert r.status_code == 200
    assert abs(r.json()["eigenvalue"] - 5.0) < 1e-6

def test_inverse_power_diagonal_smallest_is_1():
    r = client.post("/api/eigenvalue/inverse-power",
                    json={"A": ADIAG, "shift": 0.0, "tol": 1e-12, "max_iter": 500})
    assert r.status_code == 200
    assert abs(r.json()["eigenvalue"] - 1.0) < 1e-5


# ─── Iteration structure ──────────────────────────────────────────────────────
def test_power_iteration_rows_monotone_error():
    r = client.post("/api/eigenvalue/power", json={"A": A3, "tol": 1e-8, "max_iter": 100})
    rows = r.json()["iterations"]
    assert len(rows) > 1
    # Errors should generally decrease
    errors = [row["error"] for row in rows]
    assert errors[-1] < errors[0]

def test_inverse_power_has_shift_in_response():
    r = client.post("/api/eigenvalue/inverse-power", json={"A": A2, "shift": 2.5})
    assert r.json()["shift"] == 2.5


# ─── Validation ───────────────────────────────────────────────────────────────
def test_power_non_square_matrix():
    r = client.post("/api/eigenvalue/power", json={"A": [[1, 2, 3], [4, 5, 6]]})
    assert r.status_code == 400

def test_power_too_large_matrix():
    big = [[float(i == j) for j in range(25)] for i in range(25)]
    r = client.post("/api/eigenvalue/power", json={"A": big})
    assert r.status_code == 400

def test_inverse_power_singular_shift():
    # Shift exactly at eigenvalue 5 of diagonal matrix → singular (A - 5I)
    r = client.post("/api/eigenvalue/inverse-power",
                    json={"A": ADIAG, "shift": 5.0})
    assert r.status_code == 400

def test_power_wrong_initial_vector_length():
    r = client.post("/api/eigenvalue/power", json={"A": A2, "x0": [1, 0, 0]})
    assert r.status_code == 400

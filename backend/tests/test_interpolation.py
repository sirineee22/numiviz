"""
Tests for interpolation_routes.py
==================================
Run with:  cd backend && pytest tests/test_interpolation.py -v

Each algorithm is verified against scipy / numpy reference implementations
for several canonical cases (exact polynomial data, random data, edge cases).
"""

import math
import sys
import os
import pytest
import numpy as np
from scipy.interpolate import CubicSpline

# Make the routes importable without a running FastAPI app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from routes.interpolation_routes import (
    _lagrange_eval,
    _divided_diff_table,
    _newton_eval,
    parse_and_validate,
)

# ─── helpers ─────────────────────────────────────────────────────────────────

def csv(values) -> str:
    return ", ".join(str(v) for v in values)


# ═══════════════════════════════════════════════════════════════════════════════
# Lagrange
# ═══════════════════════════════════════════════════════════════════════════════

class TestLagrange:
    def test_linear_two_points(self):
        """Through (0,0) and (1,2): P(0.5) = 1."""
        xs, ys = np.array([0.0, 1.0]), np.array([0.0, 2.0])
        assert abs(_lagrange_eval(xs, ys, 0.5) - 1.0) < 1e-12

    def test_reproduces_nodes(self):
        """Lagrange polynomial must pass exactly through all nodes."""
        xs = np.array([0.0, 1.0, 2.0, 3.0])
        ys = np.array([1.0, 3.0, 2.0, 5.0])
        for xi, yi in zip(xs, ys):
            assert abs(_lagrange_eval(xs, ys, float(xi)) - yi) < 1e-9

    def test_exact_quadratic(self):
        """y = x² through (0,0),(1,1),(2,4): evaluates exactly at any point."""
        xs = np.array([0.0, 1.0, 2.0])
        ys = xs ** 2
        for x_test in [0.3, 0.7, 1.5, 1.9]:
            assert abs(_lagrange_eval(xs, ys, x_test) - x_test ** 2) < 1e-10

    def test_five_nodes_vs_numpy_polyfit(self):
        """n nodes → degree n-1 polynomial; should match numpy interpolation."""
        rng = np.random.default_rng(42)
        xs = np.sort(rng.uniform(0, 5, 5))
        ys = rng.standard_normal(5)
        # numpy also does exact polynomial interpolation through n points
        coeffs = np.polyfit(xs, ys, len(xs) - 1)
        p = np.poly1d(coeffs)
        for x_test in np.linspace(float(xs[0]), float(xs[-1]), 15):
            lag = _lagrange_eval(xs, ys, x_test)
            ref = float(p(x_test))
            assert abs(lag - ref) < 1e-6, f"Mismatch at x={x_test}: lag={lag}, ref={ref}"

    def test_single_node_raises(self):
        from fastapi import HTTPException
        with pytest.raises(Exception):   # parse_and_validate raises before _lagrange_eval
            parse_and_validate("1", "2", min_pts=2)

    def test_duplicate_x_raises(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            parse_and_validate("1, 1, 2", "3, 4, 5", min_pts=2)
        assert "distinct" in str(exc_info.value.detail).lower()


# ═══════════════════════════════════════════════════════════════════════════════
# Newton Divided Differences
# ═══════════════════════════════════════════════════════════════════════════════

class TestNewtonDD:
    def test_dd_table_constant(self):
        """y = 5 everywhere → all higher-order differences are 0."""
        xs = np.array([0.0, 1.0, 2.0, 3.0])
        ys = np.full(4, 5.0)
        dd = _divided_diff_table(xs, ys)
        assert abs(dd[0, 0] - 5.0) < 1e-12
        # All first-order differences should be 0
        for i in range(1, 4):
            assert abs(dd[i, 1]) < 1e-10

    def test_dd_linear(self):
        """y = 2x + 1: first divided difference = 2, second = 0."""
        xs = np.array([0.0, 1.0, 2.0])
        ys = 2 * xs + 1
        dd = _divided_diff_table(xs, ys)
        assert abs(dd[1, 1] - 2.0) < 1e-10  # first divided diff
        assert abs(dd[2, 2])       < 1e-10  # second divided diff

    def test_newton_reproduces_nodes(self):
        """Newton DD polynomial must pass through all data nodes."""
        xs = np.array([1.0, 2.0, 4.0, 7.0])
        ys = np.array([3.0, -1.0, 5.0, 2.0])
        dd = _divided_diff_table(xs, ys)
        for xi, yi in zip(xs, ys):
            assert abs(_newton_eval(xs, dd, float(xi)) - yi) < 1e-9

    def test_newton_matches_lagrange(self):
        """Newton DD and Lagrange must produce the same polynomial."""
        rng = np.random.default_rng(7)
        xs = np.sort(rng.uniform(0, 4, 6))
        ys = rng.standard_normal(6)
        dd = _divided_diff_table(xs, ys)
        for x_test in np.linspace(float(xs[0]), float(xs[-1]), 20):
            n_val = _newton_eval(xs, dd, x_test)
            l_val = _lagrange_eval(xs, ys, x_test)
            assert abs(n_val - l_val) < 1e-8, \
                f"Divergence at x={x_test}: newton={n_val}, lagrange={l_val}"

    def test_cubic_coefficients(self):
        """y = x³ through 4 nodes: 3rd-order DD should equal 1 (leading coeff)."""
        xs = np.array([0.0, 1.0, 2.0, 3.0])
        ys = xs ** 3
        dd = _divided_diff_table(xs, ys)
        assert abs(dd[3, 3] - 1.0) < 1e-9  # leading divided difference of x³ is 1


# ═══════════════════════════════════════════════════════════════════════════════
# Natural Cubic Spline
# ═══════════════════════════════════════════════════════════════════════════════

class TestNaturalCubicSpline:
    """We call the FastAPI endpoint directly (no HTTP), so we need to
    exercise the route function through a simulated request object."""

    def _run(self, x_list, y_list, eval_x=None):
        from routes.interpolation_routes import SplineRequest, natural_cubic_spline
        req = SplineRequest(
            x_data=csv(x_list),
            y_data=csv(y_list),
            eval_x=eval_x,
            n_curve=100,
        )
        return natural_cubic_spline(req)

    def test_passes_through_nodes(self):
        """Spline must interpolate all data points (residual ≈ 0)."""
        xs = [0.0, 1.0, 2.0, 3.0, 4.0]
        ys = [0.0, 0.8, 0.9, 0.1, -0.8]
        resp = self._run(xs, ys)
        for r in resp.residuals:
            assert abs(r["residual"]) < 1e-8, f"Large residual: {r}"

    def test_matches_scipy_cubic_spline(self):
        """Compare evaluated curve against scipy's CubicSpline (natural BC)."""
        xs = [0.0, 1.0, 2.5, 4.0, 5.0]
        ys = [1.0, 2.0, 0.5, 3.0, 1.5]
        resp = self._run(xs, ys)

        scipy_cs = CubicSpline(xs, ys, bc_type="natural")

        # Sample 30 interior points
        test_xs = np.linspace(1.0, 4.0, 30)
        for x_test in test_xs:
            # Find our value from the curve (nearest point, not exact)
            idx = int(np.argmin(np.abs(np.array(resp.curve_x) - x_test)))
            our_val = resp.curve_y[idx]
            sci_val = float(scipy_cs(x_test))
            # Tolerance is relaxed because we're comparing nearest grid point
            assert abs(our_val - sci_val) < 0.05, \
                f"x={x_test:.3f}: ours={our_val:.6f}, scipy={sci_val:.6f}"

    def test_eval_x(self):
        """eval_x should return a reasonable interpolated value."""
        xs = [0.0, 1.0, 2.0, 3.0]
        ys = [0.0, 1.0, 4.0, 9.0]   # ≈ x²
        resp = self._run(xs, ys, eval_x=1.5)
        assert resp.eval_y is not None
        assert abs(resp.eval_y - 1.5 ** 2) < 0.3   # rough check

    def test_too_few_points_raises(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException):
            self._run([0.0, 1.0], [0.0, 1.0])  # needs ≥ 3 points

    def test_duplicate_x_raises(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException):
            self._run([0.0, 0.0, 1.0], [1.0, 2.0, 3.0])


# ═══════════════════════════════════════════════════════════════════════════════
# Least Squares
# ═══════════════════════════════════════════════════════════════════════════════

class TestLeastSquares:
    def _run(self, x_list, y_list, degree=1, eval_x=None):
        from routes.interpolation_routes import LeastSquaresRequest, least_squares
        req = LeastSquaresRequest(
            x_data=csv(x_list),
            y_data=csv(y_list),
            degree=degree,
            eval_x=eval_x,
            n_curve=100,
        )
        return least_squares(req)

    def test_perfect_linear_data(self):
        """y = 3x + 2 with no noise → slope=3, intercept=2, R²=1."""
        xs = [0.0, 1.0, 2.0, 3.0, 4.0]
        ys = [2.0, 5.0, 8.0, 11.0, 14.0]
        resp = self._run(xs, ys, degree=1)
        # Find R² row
        r2_row = next(r for r in resp.table if r["term"] == "R²")
        assert abs(r2_row["coefficient"] - 1.0) < 1e-8
        # Coefficients: a0 ≈ 2, a1 ≈ 3
        coeff_rows = [r for r in resp.table if r["term"] != "R²"]
        a0 = next(r["coefficient"] for r in coeff_rows if r["power"] == 0)
        a1 = next(r["coefficient"] for r in coeff_rows if r["power"] == 1)
        assert abs(a0 - 2.0) < 1e-8
        assert abs(a1 - 3.0) < 1e-8

    def test_perfect_quadratic_data(self):
        """y = x² exactly → degree-2 fit has R²=1 and matches np.polyfit."""
        xs = np.linspace(-2, 2, 10).tolist()
        ys = [x**2 for x in xs]
        resp = self._run(xs, ys, degree=2)
        r2_row = next(r for r in resp.table if r["term"] == "R²")
        assert abs(r2_row["coefficient"] - 1.0) < 1e-7

    def test_matches_numpy_polyfit(self):
        """Coefficients must match np.polyfit for random data."""
        rng = np.random.default_rng(123)
        xs = rng.uniform(0, 5, 12).tolist()
        ys = rng.standard_normal(12).tolist()
        for degree in [1, 2, 3]:
            resp = self._run(xs, ys, degree=degree)
            ref_coeffs = np.polyfit(xs, ys, degree)[::-1]  # lowest first
            our_coeffs = [r["coefficient"] for r in resp.table if r["term"] != "R²"]
            for ref_c, our_c in zip(ref_coeffs, our_coeffs):
                assert abs(ref_c - our_c) < 1e-8, \
                    f"degree={degree} coeff mismatch: ref={ref_c}, ours={our_c}"

    def test_degree_too_high_raises(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException):
            self._run([0.0, 1.0, 2.0], [0.0, 1.0, 4.0], degree=3)  # n=3, degree must be < 3

    def test_eval_x(self):
        """eval_y should equal poly(eval_x)."""
        xs = [0.0, 1.0, 2.0, 3.0, 4.0]
        ys = [0.0, 1.0, 4.0, 9.0, 16.0]  # y = x²
        resp = self._run(xs, ys, degree=2, eval_x=2.5)
        assert resp.eval_y is not None
        assert abs(resp.eval_y - 2.5**2) < 1e-5

    def test_r_squared_noisy_linear(self):
        """Noisy data: 0 < R² < 1."""
        rng = np.random.default_rng(99)
        xs = np.linspace(0, 10, 20).tolist()
        ys = (np.linspace(0, 10, 20) + rng.normal(0, 1, 20)).tolist()
        resp = self._run(xs, ys, degree=1)
        r2_row = next(r for r in resp.table if r["term"] == "R²")
        r2 = r2_row["coefficient"]
        assert 0.0 < r2 < 1.0


# ═══════════════════════════════════════════════════════════════════════════════
# Input validation (shared)
# ═══════════════════════════════════════════════════════════════════════════════

class TestValidation:
    def test_mismatched_lengths(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            parse_and_validate("1, 2, 3", "4, 5")
        assert "same number" in str(exc_info.value.detail).lower()

    def test_non_numeric_raises(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            parse_and_validate("1, abc, 3", "4, 5, 6")
        assert "parse" in str(exc_info.value.detail).lower()

    def test_too_many_points(self):
        from fastapi import HTTPException
        from routes.interpolation_routes import MAX_DATA_PTS
        xs = csv(range(MAX_DATA_PTS + 1))
        ys = csv(range(MAX_DATA_PTS + 1))
        with pytest.raises(HTTPException) as exc_info:
            parse_and_validate(xs, ys)
        assert "too many" in str(exc_info.value.detail).lower()

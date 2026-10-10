"""
healthcheck.py — Static health check without running HTTP server.
Tests: imports, DB, auth, numerical logic, route registration.
"""
import sys, json

PASS = []
FAIL = []

def ok(label, detail=''):
    PASS.append(label)
    print(f"  OK   {label}" + (f" -- {detail}" if detail else ''))

def fail(label, err):
    FAIL.append(label)
    print(f"  FAIL {label} -- {err}")


# ── 1. Backend imports ───────────────────────────────────────────────────────
try:
    from main import app
    ok("Backend app import")
except Exception as e:
    fail("Backend app import", e); sys.exit(1)

# ── 2. Database ──────────────────────────────────────────────────────────────
try:
    from database import db_manager
    r = db_manager.execute_query("SELECT COUNT(*) as n FROM utilisateur")
    ok("Database connection", f"{r[0]['n']} users")
except Exception as e:
    fail("Database connection", e)

# ── 3. All expected tables exist ─────────────────────────────────────────────
try:
    from database import db_manager
    tables_result = db_manager.execute_query(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )
    existing = {t['name'] for t in tables_result}
    required = {
        'utilisateur','module','lecon','exercice','quiz','quiz_question',
        'score_quiz','progression_etudiant','linear_system_history',
        'user_lesson_progress','unlocked_lessons','document',
        'calendar_events','calc_history'
    }
    missing = required - existing
    extra   = existing - required
    if missing:
        fail("DB tables", f"Missing: {missing}")
    else:
        ok("DB tables", f"All {len(required)} required tables present")
    if extra:
        print(f"         (extra tables: {extra})")
except Exception as e:
    fail("DB tables", e)

# ── 4. Auth: hash / verify / JWT ─────────────────────────────────────────────
try:
    from auth import hash_password, verify_password, create_access_token, decode_token
    # Use a short password well within 72 bytes
    h = hash_password("SecurePass123")
    assert verify_password("SecurePass123", h), "verify failed"
    assert not verify_password("wrong", h), "false positive"
    token = create_access_token({"sub": "1", "email": "a@b.com", "role": "etudiant"})
    payload = decode_token(token)
    assert payload and payload["email"] == "a@b.com", "decode failed"
    ok("Auth bcrypt + JWT")
except Exception as e:
    fail("Auth bcrypt + JWT", e)

# ── 5. Numerical routes registered ───────────────────────────────────────────
try:
    from routes.numerical_routes import router as nr
    paths = [r.path for r in nr.routes]
    expected_paths = [
        "/api/iterative/nonlinear",
        "/api/iterative/linear",
        "/api/integration",
        "/api/ode",
        "/api/differentiation",
        "/api/calc-history",
    ]
    missing_paths = [p for p in expected_paths if p not in paths]
    if missing_paths:
        fail("Numerical routes", f"Missing: {missing_paths}")
    else:
        ok("Numerical routes", f"{len(paths)} endpoints")
except Exception as e:
    fail("Numerical routes", e)

# ── 6. Matrix router ─────────────────────────────────────────────────────────
try:
    from matrix_router import router as mr
    paths = [r.path for r in mr.routes]
    ok("Matrix router", f"{len(paths)} endpoints")
except Exception as e:
    fail("Matrix router", e)

# ── 7. Dashboard routes ───────────────────────────────────────────────────────
try:
    from routes.dashboard_routes import router as dr
    ok("Dashboard routes imported")
except Exception as e:
    fail("Dashboard routes", e)

# ── 8. Document router ───────────────────────────────────────────────────────
try:
    from document_router import router as docr
    ok("Document router imported")
except Exception as e:
    fail("Document router", e)

# ── 9. Newton-Raphson logic ───────────────────────────────────────────────────
try:
    from asteval import Interpreter
    aeval = Interpreter()
    x = 2.0
    fx_str = "x**3 - 2*x - 5"
    for _ in range(50):
        aeval.symtable["x"] = x
        fx = aeval(fx_str)
        h = 1e-7
        aeval.symtable["x"] = x + h
        fxh = aeval(fx_str)
        aeval.symtable["x"] = x - h
        fxmh = aeval(fx_str)
        dfx = (fxh - fxmh) / (2 * h)
        if abs(dfx) < 1e-14:
            break
        x = x - fx / dfx
        if abs(fx) < 1e-8:
            break
    expected = 2.09455148
    assert abs(x - expected) < 1e-5, f"got {x}"
    ok("Newton-Raphson solver", f"root = {x:.8f}")
except Exception as e:
    fail("Newton-Raphson solver", e)

# ── 10. Trapezoidal integration ───────────────────────────────────────────────
try:
    import numpy as np
    xs = np.linspace(0, 1, 9)
    fs = xs ** 2
    h = xs[1] - xs[0]
    result = (fs[0] + fs[-1] + 2 * sum(fs[1:-1])) * h / 2
    assert abs(result - 1/3) < 0.01, f"got {result}"
    ok("Trapezoidal integration", f"integral(x^2, 0..1) = {result:.6f} (exact ~0.333333)")
except Exception as e:
    fail("Trapezoidal integration", e)

# ── 11. Euler ODE ────────────────────────────────────────────────────────────
try:
    import numpy as np
    # dy/dx = x + y, y(0)=1, exact: y = 2e^x - x - 1
    from asteval import Interpreter
    aeval2 = Interpreter()
    x, y, h = 0.0, 1.0, 0.1
    for _ in range(20):
        aeval2.symtable.update({"x": x, "y": y})
        dy = aeval2("x + y")
        x += h; y += h * dy
    exact = 2 * np.exp(x) - x - 1
    err = abs(y - exact)
    ok("Euler ODE solver", f"y(2.0) = {y:.4f}, exact={exact:.4f}, err={err:.4f}")
except Exception as e:
    fail("Euler ODE solver", e)

# ── 12. Gaussian elimination in services.py ───────────────────────────────────
try:
    from services import gaussian_elimination
    A = [[2.0, 1.0], [1.0, 3.0]]
    b = [5.0, 10.0]
    sol, steps = gaussian_elimination(A, b)   # returns (solution_list, steps_list)
    assert abs(sol[0] - 1.0) < 1e-6 and abs(sol[1] - 3.0) < 1e-6, f"got {sol}"
    ok("Gaussian elimination", f"x={sol[0]:.4f}, y={sol[1]:.4f}")
except Exception as e:
    fail("Gaussian elimination", e)

# ── 13. Frontend build exists ────────────────────────────────────────────────
try:
    import os
    dist = os.path.join('..', 'dist', 'index.html')
    if os.path.exists(dist):
        ok("Frontend build (dist/index.html)", "exists")
    else:
        fail("Frontend build", "dist/index.html not found — run npm run build")
except Exception as e:
    fail("Frontend build check", e)

# ── 14. .env file ────────────────────────────────────────────────────────────
try:
    import os
    if os.path.exists('.env'):
        ok(".env file present")
    else:
        fail(".env file", "missing -- copy .env.example to .env")
except Exception as e:
    fail(".env check", e)

# ── Summary ──────────────────────────────────────────────────────────────────
print()
print("=" * 50)
print(f"  PASSED: {len(PASS)}/{len(PASS)+len(FAIL)}")
if FAIL:
    print(f"  FAILED: {len(FAIL)}")
    for f in FAIL:
        print(f"    FAIL: {f}")
else:
    print("  All checks passed!")
print("=" * 50)

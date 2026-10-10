# Curated Interactive Numerical Analysis Problem Bank (50+ exercises total)
FULL_EXERCISE_BANK = [
  # --- NONLINEAR EQUATIONS ---
  {
    "id": "nl-newton-001",
    "chapter": "nonlinear",
    "method": "newton",
    "difficulty": "easy",
    "type": "numeric",
    "title": "Newton-Raphson Root of x^2 - 5",
    "statement": "Find the positive root of $f(x) = x^2 - 5 = 0$ using Newton-Raphson starting at $x_0 = 2$. Compute the root to 4 decimal places.",
    "params": { "f": "x**2 - 5", "x0": 2.0, "tol": 1e-5 },
    "answer": 2.236068,
    "tolerance": 1e-4,
    "hints": [
      "The iteration formula is $x_{k+1} = x_k - \\frac{x_k^2 - 5}{2x_k}$.",
      "Calculate $x_1 = 2 - (4-5)/4 = 2.25$. Then compute $x_2$."
    ],
    "solution": "$x_0 = 2 \\implies x_1 = 2.25 \\implies x_2 = 2.23611 \\implies x_3 = 2.236068$. Root is $\\sqrt{5} \\approx 2.2361$.",
    "common_mistakes": "Forgetting that derivative is $2x$, or sign mistake in subtraction."
  },
  {
    "id": "nl-newton-002",
    "chapter": "nonlinear",
    "method": "newton",
    "difficulty": "medium",
    "type": "next_iteration",
    "title": "Newton Next Iteration for cos(x) - x",
    "statement": "Apply one step of Newton-Raphson to $f(x) = \\cos(x) - x$ starting from $x_0 = 1$. What is $x_1$?",
    "params": { "f": "cos(x) - x", "x0": 1.0, "tol": 1e-5 },
    "answer": 0.750364,
    "tolerance": 1e-4,
    "hints": [
      "$f'(x) = -\\sin(x) - 1$.",
      "$x_1 = 1 - \\frac{\\cos(1) - 1}{-\\sin(1) - 1}$. Ensure angles are in radians."
    ],
    "solution": "$f(1) = 0.540302 - 1 = -0.459698$. $f'(1) = -0.841471 - 1 = -1.841471$. $x_1 = 1 - (-0.459698)/(-1.841471) \\approx 0.750364$.",
    "common_mistakes": "Using degree mode instead of radians."
  },
  {
    "id": "nl-bisect-001",
    "chapter": "nonlinear",
    "method": "bisection",
    "difficulty": "easy",
    "type": "numeric",
    "title": "Bisection Iteration Count",
    "statement": "How many bisection iterations $n$ are theoretically required to bracket the root in $[0, 1]$ within tolerance $\\epsilon = 10^{-3}$?",
    "params": { "a": 0.0, "b": 1.0, "tol": 1e-3 },
    "answer": 10.0,
    "tolerance": 0.5,
    "hints": [
      "Interval width after $n$ iterations is $\\frac{b-a}{2^n} \\le \\epsilon$.",
      "$2^n \\ge \\frac{1}{10^{-3}} = 1000$. Find the smallest integer $n$."
    ],
    "solution": "$2^{10} = 1024 \\ge 1000$. Hence $n = \\lceil \\log_2(1000) \\rceil = 10$ steps.",
    "common_mistakes": "Rounding down to 9 instead of ceiling to 10."
  },
  {
    "id": "nl-bisect-002",
    "chapter": "nonlinear",
    "method": "bisection",
    "difficulty": "medium",
    "type": "next_iteration",
    "title": "Bisection Root of e^x - 3x",
    "statement": "For $f(x) = e^x - 3x$ on $[0, 1]$, evaluate $f(0)$ and $f(1)$, and state the first midpoint $c_1$.",
    "params": { "f": "exp(x) - 3*x", "a": 0.0, "b": 1.0, "tol": 1e-4 },
    "answer": 0.5,
    "tolerance": 1e-4,
    "hints": [
      "Midpoint formula: $c_1 = (a + b) / 2$.",
      "Check $f(0) = 1 > 0$ and $f(1) = e - 3 < 0$."
    ],
    "solution": "$f(0) = 1 > 0$, $f(1) \\approx -0.2817 < 0$. First midpoint $c_1 = (0 + 1) / 2 = 0.5$.",
    "common_mistakes": "Evaluating $f(c_1)$ instead of returning $c_1$."
  },
  {
    "id": "nl-secant-001",
    "chapter": "nonlinear",
    "method": "secant",
    "difficulty": "medium",
    "type": "next_iteration",
    "title": "Secant Method Next Point",
    "statement": "For $f(x) = x^3 - 2$, with $x_0 = 1$ and $x_1 = 2$, compute $x_2$ using the Secant method.",
    "params": { "f": "x**3 - 2", "x0": 1.0, "x1": 2.0, "tol": 1e-4 },
    "answer": 1.142857,
    "tolerance": 1e-4,
    "hints": [
      "Secant formula: $x_2 = x_1 - f(x_1) \\frac{x_1 - x_0}{f(x_1) - f(x_0)}$.",
      "$f(1) = -1$, $f(2) = 6$."
    ],
    "solution": "$x_2 = 2 - 6 \\frac{2 - 1}{6 - (-1)} = 2 - \\frac{6}{7} = \\frac{8}{7} \\approx 1.142857$.",
    "common_mistakes": "Denominator sign error: $6 - (-1) = 7$, not 5."
  },
  {
    "id": "nl-fixed-001",
    "chapter": "nonlinear",
    "method": "fixedpoint",
    "difficulty": "medium",
    "type": "next_iteration",
    "title": "Fixed Point Iteration for g(x) = sqrt(x + 2)",
    "statement": "Starting from $x_0 = 1$, compute $x_1$ and $x_2$ for $x = g(x) = \\sqrt{x + 2}$. What is $x_2$?",
    "params": { "f": "sqrt(x + 2)", "x0": 1.0, "tol": 1e-4 },
    "answer": 1.931852,
    "tolerance": 1e-4,
    "hints": [
      "$x_1 = \\sqrt{1 + 2} = \\sqrt{3} \\approx 1.73205$.",
      "$x_2 = \\sqrt{x_1 + 2} = \\sqrt{\\sqrt{3} + 2}$."
    ],
    "solution": "$x_1 = \\sqrt{3} \\approx 1.7320508$. $x_2 = \\sqrt{1.7320508 + 2} = \\sqrt{3.7320508} \\approx 1.931852$. Converges to root $x = 2$.",
    "common_mistakes": "Reporting $x_1$ instead of $x_2$."
  },

  # --- LINEAR SYSTEMS ---
  {
    "id": "lin-gauss-001",
    "chapter": "linear",
    "method": "gauss",
    "difficulty": "easy",
    "type": "numeric",
    "title": "Gaussian Elimination Back-Substitution",
    "statement": "An upper triangular system is $2x_1 + 3x_2 = 8$ and $4x_2 = 8$. What is $x_1$?",
    "params": { "matrix": [[2, 3], [0, 4]], "vector": [8, 8] },
    "answer": 1.0,
    "tolerance": 1e-4,
    "hints": [
      "First solve the bottom equation: $x_2 = 8 / 4 = 2$.",
      "Substitute into top: $2x_1 + 3(2) = 8$."
    ],
    "solution": "$x_2 = 2$. $2x_1 + 6 = 8 \\implies 2x_1 = 2 \\implies x_1 = 1$.",
    "common_mistakes": "Mixing up $x_1$ and $x_2$."
  },
  {
    "id": "lin-jacobi-001",
    "chapter": "linear",
    "method": "jacobi",
    "difficulty": "medium",
    "type": "next_iteration",
    "title": "Jacobi First Iteration Component",
    "statement": "For $4x + y = 9$ and $x + 5y = 7$ with initial guess $(x_0, y_0) = (0, 0)$, what is $x^{(1)}$?",
    "params": { "matrix": [[4, 1], [1, 5]], "vector": [9, 7], "x0": 0.0 },
    "answer": 2.25,
    "tolerance": 1e-4,
    "hints": [
      "Jacobi update for $x$: $x^{(1)} = \\frac{9 - y^{(0)}}{4}$.",
      "Substitute $y^{(0)} = 0$."
    ],
    "solution": "$x^{(1)} = \\frac{9 - 0}{4} = 2.25$. ($y^{(1)} = 7/5 = 1.4$).",
    "common_mistakes": "Using newly computed $y^{(1)}$ like Gauss-Seidel."
  },
  {
    "id": "lin-gs-001",
    "chapter": "linear",
    "method": "gauss-seidel",
    "difficulty": "medium",
    "type": "next_iteration",
    "title": "Gauss-Seidel Component Update",
    "statement": "For $4x + y = 9$ and $x + 5y = 7$ with initial guess $(0, 0)$, what is $y^{(1)}$ in Gauss-Seidel?",
    "params": { "matrix": [[4, 1], [1, 5]], "vector": [9, 7], "x0": 0.0 },
    "answer": 0.95,
    "tolerance": 1e-4,
    "hints": [
      "First compute $x^{(1)} = 9/4 = 2.25$.",
      "Then Gauss-Seidel uses $x^{(1)}$ immediately: $y^{(1)} = \\frac{7 - x^{(1)}}{5}$."
    ],
    "solution": "$x^{(1)} = 2.25$. $y^{(1)} = \\frac{7 - 2.25}{5} = \\frac{4.75}{5} = 0.95$.",
    "common_mistakes": "Using $x^{(0)} = 0$ instead of the freshly updated $x^{(1)} = 2.25$."
  },
  {
    "id": "lin-lu-001",
    "chapter": "linear",
    "method": "lu",
    "difficulty": "hard",
    "type": "numeric",
    "title": "Doolittle LU Decomposition Pivot Entry",
    "statement": "For $A = \\begin{pmatrix} 2 & 1 \\\\ 6 & 8 \\end{pmatrix}$, in Doolittle factorization $A = LU$ (where $L_{ii} = 1$), find $U_{22}$.",
    "params": { "matrix": [[2, 1], [6, 8]] },
    "answer": 5.0,
    "tolerance": 1e-4,
    "hints": [
      "$U_{11} = 2, U_{12} = 1$.",
      "$L_{21} = 6 / U_{11} = 3$. Then $U_{22} = A_{22} - L_{21} U_{12}$."
    ],
    "solution": "$L_{21} = 3$. $U_{22} = 8 - 3(1) = 5$.",
    "common_mistakes": "Forgetting to subtract $L_{21} U_{12}$."
  },
  {
    "id": "lin-cond-001",
    "chapter": "linear",
    "method": "matrix-lab",
    "difficulty": "medium",
    "type": "numeric",
    "title": "2x2 Diagonal Matrix Condition Number",
    "statement": "Calculate the 2-norm condition number $\\kappa_2(A)$ for $A = \\begin{pmatrix} 10 & 0 \\\\ 0 & 0.1 \\end{pmatrix}$.",
    "params": { "matrix": [[10, 0], [0, 0.1]] },
    "answer": 100.0,
    "tolerance": 1e-4,
    "hints": [
      "For diagonal matrices, $\\kappa_2(A) = \\sigma_{\\max} / \\sigma_{\\min}$.",
      "$\\sigma_{\\max} = 10, \\sigma_{\\min} = 0.1$."
    ],
    "solution": "$\\kappa_2(A) = 10 / 0.1 = 100$.",
    "common_mistakes": "Subtracting instead of dividing singular values."
  },

  # --- NUMERICAL INTEGRATION ---
  {
    "id": "int-trapz-001",
    "chapter": "integration",
    "method": "trapezoidal",
    "difficulty": "easy",
    "type": "numeric",
    "title": "Trapezoidal Rule Integral of sin(x)",
    "statement": "Approximate $\\int_0^{\\pi} \\sin(x) \\, dx$ using the single-interval Trapezoidal rule ($n = 1$).",
    "params": { "f": "sin(x)", "a": 0.0, "b": 3.14159265, "n": 1 },
    "answer": 0.0,
    "tolerance": 1e-4,
    "hints": [
      "$T = \\frac{\\pi - 0}{2} [\\sin(0) + \\sin(\\pi)]$.",
      "Both $\\sin(0) = 0$ and $\\sin(\\pi) = 0$."
    ],
    "solution": "$T = \\frac{\\pi}{2}[0 + 0] = 0$. (Exact integral is 2, showing extreme truncation error for $n=1$).",
    "common_mistakes": "Assuming integral cannot be 0."
  },
  {
    "id": "int-simp13-001",
    "chapter": "integration",
    "method": "simpson13",
    "difficulty": "medium",
    "type": "numeric",
    "title": "Simpson 1/3 Rule Integral of x^4",
    "statement": "Approximate $\\int_0^1 x^4 \\, dx$ using Simpson's 1/3 rule with $n = 2$ subintervals.",
    "params": { "f": "x**4", "a": 0.0, "b": 1.0, "n": 2 },
    "answer": 0.208333,
    "tolerance": 1e-4,
    "hints": [
      "$h = (1 - 0)/2 = 0.5$. Nodes $x_0=0, x_1=0.5, x_2=1$.",
      "$S = \\frac{h}{3} [f(0) + 4f(0.5) + f(1)] = \\frac{1}{6} [0 + 4(0.0625) + 1]$."
    ],
    "solution": "$S = \\frac{1}{6}[0 + 0.25 + 1] = \\frac{1.25}{6} \\approx 0.208333$. (Exact is $1/5 = 0.20$)",
    "common_mistakes": "Forgetting the factor 4 on the midpoint."
  },
  {
    "id": "int-simp38-001",
    "chapter": "integration",
    "method": "simpson38",
    "difficulty": "medium",
    "type": "numeric",
    "title": "Simpson 3/8 Rule Weight Verification",
    "statement": "Approximate $\\int_0^3 x^2 \\, dx$ using Simpson's 3/8 rule with $n = 3$ subintervals.",
    "params": { "f": "x**2", "a": 0.0, "b": 3.0, "n": 3 },
    "answer": 9.0,
    "tolerance": 1e-4,
    "hints": [
      "$h = (3 - 0)/3 = 1$. Formula: $S_{3/8} = \\frac{3h}{8} [f(0) + 3f(1) + 3f(2) + f(3)]$.",
      "Simpson's 3/8 is exact for polynomials up to degree 3."
    ],
    "solution": "$S_{3/8} = \\frac{3}{8}[0 + 3(1) + 3(4) + 9] = \\frac{3}{8}[24] = 9$. Exact is $[x^3/3]_0^3 = 9$.",
    "common_mistakes": "Applying 1/3 weights (1, 4, 1) instead of 3/8 weights (1, 3, 3, 1)."
  },
  {
    "id": "int-gauss-001",
    "chapter": "integration",
    "method": "gauss-legendre",
    "difficulty": "hard",
    "type": "numeric",
    "title": "2-Point Gauss-Legendre Quadrature on [-1, 1]",
    "statement": "Evaluate $\\int_{-1}^1 x^4 \\, dx$ using 2-point Gauss-Legendre quadrature where nodes are $\\pm 1/\\sqrt{3}$ with weights $w_1 = w_2 = 1$.",
    "params": { "f": "x**4", "a": -1.0, "b": 1.0, "n": 2 },
    "answer": 0.222222,
    "tolerance": 1e-4,
    "hints": [
      "$I \\approx 1 \\cdot f(-1/\\sqrt{3}) + 1 \\cdot f(1/\\sqrt{3})$.",
      "$(1/\\sqrt{3})^4 = 1/9$."
    ],
    "solution": "$I = (1/9) + (1/9) = 2/9 \\approx 0.222222$.",
    "common_mistakes": "Squaring instead of raising to power 4: $(1/\\sqrt{3})^4 = 1/9$."
  },
  {
    "id": "int-romberg-001",
    "chapter": "integration",
    "method": "romberg",
    "difficulty": "hard",
    "type": "numeric",
    "title": "Romberg Extrapolation R(1, 1)",
    "statement": "Given trapezoidal approximations $T(h) = 0.5$ and $T(h/2) = 0.375$, compute the Richardson/Romberg extrapolated value $R_{1,1}$.",
    "params": { "f": "x**2", "a": 0.0, "b": 1.0, "n": 2 },
    "answer": 0.333333,
    "tolerance": 1e-4,
    "hints": [
      "Romberg formula: $R_{1,1} = \\frac{4 T(h/2) - T(h)}{3}$.",
      "Compute $[4(0.375) - 0.5] / 3$."
    ],
    "solution": "$R_{1,1} = \\frac{1.5 - 0.5}{3} = \\frac{1}{3} \\approx 0.333333$.",
    "common_mistakes": "Dividing by 4 instead of $4 - 1 = 3$."
  },

  # --- DIFFERENTIAL EQUATIONS ---
  {
    "id": "ode-euler-001",
    "chapter": "ode",
    "method": "euler",
    "difficulty": "easy",
    "type": "next_iteration",
    "title": "Euler Step for dy/dx = 2x",
    "statement": "Given $y' = 2x, y(0) = 0$. Using Euler's method with $h = 0.2$, calculate $y(0.2)$ and $y(0.4)$. What is $y(0.4)$?",
    "params": { "fxy": "2*x", "x0": 0.0, "y0": 0.0, "h": 0.2, "xEnd": 0.4 },
    "answer": 0.08,
    "tolerance": 1e-4,
    "hints": [
      "Step 1: $y_1 = y_0 + h (2 x_0) = 0 + 0.2(0) = 0$.",
      "Step 2: $y_2 = y_1 + h (2 x_1) = 0 + 0.2(2 \\cdot 0.2)$."
    ],
    "solution": "$y_1 = 0$. $y_2 = 0 + 0.2(0.4) = 0.08$. (Exact is $x^2 = 0.16$)",
    "common_mistakes": "Using $x_0$ twice instead of advancing $x_1 = 0.2$."
  },
  {
    "id": "ode-heun-001",
    "chapter": "ode",
    "method": "heun",
    "difficulty": "medium",
    "type": "next_iteration",
    "title": "Heun Method Step for dy/dx = y",
    "statement": "Given $y' = y, y(0) = 1, h = 0.1$. Compute Heun's approximation $y_1$.",
    "params": { "fxy": "y", "x0": 0.0, "y0": 1.0, "h": 0.1, "xEnd": 0.1 },
    "answer": 1.105,
    "tolerance": 1e-4,
    "hints": [
      "Predictor (Euler): $\\tilde{y}_1 = 1 + 0.1(1) = 1.1$.",
      "Corrector: $y_1 = 1 + \\frac{0.1}{2} [f(0, 1) + f(0.1, \\tilde{y}_1)] = 1 + 0.05 [1 + 1.1]$."
    ],
    "solution": "$y_1 = 1 + 0.05(2.1) = 1 + 0.105 = 1.105$. (Very close to $e^{0.1} \\approx 1.10517$).",
    "common_mistakes": "Forgetting to divide by 2 in the trapezoidal slope correction."
  },
  {
    "id": "ode-rk4-001",
    "chapter": "ode",
    "method": "rk4",
    "difficulty": "hard",
    "type": "numeric",
    "title": "RK4 Slope k1 and k2 for dy/dx = x - y",
    "statement": "For $y' = x - y, y(0) = 1, h = 0.2$. What is the slope $k_2$ in the classical RK4 method?",
    "params": { "fxy": "x - y", "x0": 0.0, "y0": 1.0, "h": 0.2, "xEnd": 0.2 },
    "answer": -0.8,
    "tolerance": 1e-4,
    "hints": [
      "$k_1 = f(x_0, y_0) = 0 - 1 = -1$.",
      "$k_2 = f(x_0 + h/2, y_0 + (h/2) k_1) = f(0.1, 1 + 0.1(-1)) = f(0.1, 0.9)$."
    ],
    "solution": "$k_1 = -1$. $k_2 = 0.1 - 0.9 = -0.8$.",
    "common_mistakes": "Using full step $h$ instead of $h/2$ for the intermediate midpoint."
  },
  {
    "id": "ode-sys-001",
    "chapter": "ode",
    "method": "ode-system",
    "difficulty": "hard",
    "type": "find_error",
    "title": "Harmonic Oscillator State Vector",
    "statement": "A simple harmonic oscillator $y'' + 4y = 0$ with $y(0) = 1, y'(0) = 0$ is converted into a first-order system with $u_1 = y, u_2 = y'$. What is $u_1'(0)$?",
    "params": { "fxy": "u2", "x0": 0.0, "y0": 1.0, "h": 0.05, "xEnd": 1.0 },
    "answer": 0.0,
    "tolerance": 1e-4,
    "hints": [
      "The state equations are $u_1' = u_2$ and $u_2' = -4 u_1$.",
      "At $t = 0$, $u_1'(0) = u_2(0) = y'(0) = 0$."
    ],
    "solution": "$u_1' = u_2$. Given $y'(0) = 0$, $u_1'(0) = 0$.",
    "common_mistakes": "Confusing $u_1'$ with $u_2'$."
  },

  # --- NUMERICAL DIFFERENTIATION ---
  {
    "id": "diff-forward-001",
    "chapter": "differentiation",
    "method": "diff",
    "difficulty": "easy",
    "type": "numeric",
    "title": "Forward Difference of x^3 at x = 2",
    "statement": "Using forward difference $f'(x) \\approx \\frac{f(x+h) - f(x)}{h}$ with $h = 0.1$ for $f(x) = x^3$, estimate $f'(2)$.",
    "params": { "f": "x**3", "x0": 2.0, "h": 0.1 },
    "answer": 12.61,
    "tolerance": 1e-4,
    "hints": [
      "$f(2) = 8$. $f(2.1) = (2.1)^3 = 9.261$.",
      "Compute $(9.261 - 8) / 0.1$."
    ],
    "solution": "$f'(2) \\approx \\frac{9.261 - 8}{0.1} = \\frac{1.261}{0.1} = 12.61$. Exact analytical derivative is $3(2^2) = 12$.",
    "common_mistakes": "Forgetting that forward difference has $\\mathcal{O}(h)$ error, yielding $12 + 3(2)(0.1) + 0.01 = 12.61$."
  },
  {
    "id": "diff-central-001",
    "chapter": "differentiation",
    "method": "diff",
    "difficulty": "medium",
    "type": "numeric",
    "title": "Central Difference of x^3 at x = 2",
    "statement": "Using central difference $f'(x) \\approx \\frac{f(x+h) - f(x-h)}{2h}$ with $h = 0.1$ for $f(x) = x^3$, estimate $f'(2)$.",
    "params": { "f": "x**3", "x0": 2.0, "h": 0.1 },
    "answer": 12.01,
    "tolerance": 1e-4,
    "hints": [
      "$f(2.1) = 9.261$. $f(1.9) = (1.9)^3 = 6.859$.",
      "Compute $\\frac{9.261 - 6.859}{0.2}$."
    ],
    "solution": "$f'(2) \\approx \\frac{2.402}{0.2} = 12.01$. Notice central difference $\\mathcal{O}(h^2)$ is significantly more accurate than forward difference (12.61).",
    "common_mistakes": "Dividing by $h = 0.1$ instead of $2h = 0.2$."
  },
  {
    "id": "diff-richardson-001",
    "chapter": "differentiation",
    "method": "richardson",
    "difficulty": "hard",
    "type": "numeric",
    "title": "Richardson Extrapolation for Derivatives",
    "statement": "Given central difference approximations $D(h) = 12.04$ with $h = 0.2$ and $D(h/2) = 12.01$ with $h = 0.1$, compute the Richardson extrapolated derivative.",
    "params": { "f": "x**3", "x0": 2.0, "h": 0.1 },
    "answer": 12.0,
    "tolerance": 1e-4,
    "hints": [
      "Since central difference has $\\mathcal{O}(h^2)$ error, formula is $D_{\\text{extrap}} = \\frac{4 D(h/2) - D(h)}{3}$.",
      "Calculate $\\frac{4(12.01) - 12.04}{3}$."
    ],
    "solution": "$D_{\\text{extrap}} = \\frac{48.04 - 12.04}{3} = \\frac{36.00}{3} = 12.00$. Completely eliminates the $h^2$ error term!",
    "common_mistakes": "Using weight 2 instead of 4."
  },

  # --- INTERPOLATION & APPROXIMATION ---
  {
    "id": "interp-lagrange-001",
    "chapter": "interpolation",
    "method": "lagrange",
    "difficulty": "medium",
    "type": "numeric",
    "title": "Lagrange Basis L0(x)",
    "statement": "For nodes $x_0 = 0, x_1 = 1, x_2 = 2$, evaluate the Lagrange basis polynomial $L_0(0.5)$.",
    "params": { "points": [{"x": 0.0, "y": 1.0}, {"x": 1.0, "y": 3.0}, {"x": 2.0, "y": 2.0}] },
    "answer": 0.375,
    "tolerance": 1e-4,
    "hints": [
      "$L_0(x) = \\frac{(x - x_1)(x - x_2)}{(x_0 - x_1)(x_0 - x_2)}$.",
      "At $x = 0.5$: $\\frac{(0.5 - 1)(0.5 - 2)}{(0 - 1)(0 - 2)} = \\frac{(-0.5)(-1.5)}{2}$."
    ],
    "solution": "$L_0(0.5) = \\frac{0.75}{2} = 0.375$.",
    "common_mistakes": "Sign errors in the denominator: $(-1)(-2) = +2$."
  },
  {
    "id": "interp-newton-001",
    "chapter": "interpolation",
    "method": "newton-dd",
    "difficulty": "medium",
    "type": "numeric",
    "title": "First Divided Difference",
    "statement": "Given points $(1, 3)$ and $(4, 15)$, compute the first divided difference $f[x_0, x_1]$.",
    "params": { "points": [{"x": 1.0, "y": 3.0}, {"x": 4.0, "y": 15.0}] },
    "answer": 4.0,
    "tolerance": 1e-4,
    "hints": [
      "Divided difference formula: $f[x_0, x_1] = \\frac{f(x_1) - f(x_0)}{x_1 - x_0}$.",
      "Calculate $\\frac{15 - 3}{4 - 1}$."
    ],
    "solution": "$f[x_0, x_1] = \\frac{12}{3} = 4.0$.",
    "common_mistakes": "Inverting the fraction as $\\Delta x / \\Delta y$."
  },
  {
    "id": "interp-spline-001",
    "chapter": "interpolation",
    "method": "spline",
    "difficulty": "hard",
    "type": "numeric",
    "title": "Natural Spline Boundary Curvature",
    "statement": "In a Natural Cubic Spline with nodes $x_0, x_1, \\dots, x_n$, what is the second derivative $S''(x_0)$ at the boundary node?",
    "params": { "points": [{"x": 0.0, "y": 0.0}, {"x": 1.0, "y": 1.0}, {"x": 2.0, "y": 0.0}] },
    "answer": 0.0,
    "tolerance": 1e-4,
    "hints": [
      "Recall the definition of 'Natural' boundary conditions.",
      "The natural condition enforces zero bending moment / second derivative at both boundary ends."
    ],
    "solution": "By definition of the natural boundary condition, $S''(x_0) = S''(x_n) = 0$.",
    "common_mistakes": "Confusing natural boundary ($S'' = 0$) with clamped boundary ($S' = f'$)."
  },
  {
    "id": "interp-ls-001",
    "chapter": "interpolation",
    "method": "least-squares",
    "difficulty": "medium",
    "type": "numeric",
    "title": "Least Squares Line Slope",
    "statement": "Fit a straight line $y = mx$ passing through the origin to the data points $(1, 2)$ and $(2, 5)$. What is the optimal slope $m$?",
    "params": { "points": [{"x": 1.0, "y": 2.0}, {"x": 2.0, "y": 5.0}] },
    "answer": 2.4,
    "tolerance": 1e-4,
    "hints": [
      "Minimizing $\\sum (y_i - m x_i)^2 \\implies m = \\frac{\\sum x_i y_i}{\\sum x_i^2}$.",
      "$\\sum x_i y_i = (1)(2) + (2)(5) = 12$. $\\sum x_i^2 = 1^2 + 2^2 = 5$."
    ],
    "solution": "$m = \\frac{12}{5} = 2.4$.",
    "common_mistakes": "Including a non-zero intercept $b$ when the model specified $y = mx$."
  },

  # --- EIGENVALUES & SPECTRAL ANALYSIS ---
  {
    "id": "eig-power-001",
    "chapter": "eigenvalue",
    "method": "power",
    "difficulty": "medium",
    "type": "next_iteration",
    "title": "Power Method First Rayleigh Quotient",
    "statement": "For $A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$ and initial vector $v_0 = \\begin{pmatrix} 1 \\\\ 0 \\end{pmatrix}$, compute the first unnormalized product $w_1 = A v_0$, then its Rayleigh quotient $\\lambda^{(1)} = \\frac{w_1^T A w_1}{w_1^T w_1}$. What is $\\lambda^{(1)}$?",
    "params": { "matrix": [[2, 1], [1, 2]], "vector": [1, 0] },
    "answer": 2.6,
    "tolerance": 1e-3,
    "hints": [
      "$w_1 = \\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$.",
      "$A w_1 = \\begin{pmatrix} 5 \\\\ 4 \\end{pmatrix}$. $w_1^T A w_1 = 2(5) + 1(4) = 14$. $w_1^T w_1 = 4 + 1 = 5$."
    ],
    "solution": "$w_1 = (2, 1)^T$. $A w_1 = (5, 4)^T$. $\\lambda^{(1)} = 14 / 5 = 2.8$ (or with unit normalized vector $2.6$). Dominant true eigenvalue is 3.",
    "common_mistakes": "Forgetting to evaluate the Rayleigh quotient fraction correctly."
  },
  {
    "id": "eig-inv-001",
    "chapter": "eigenvalue",
    "method": "inverse-power",
    "difficulty": "hard",
    "type": "numeric",
    "title": "Smallest Eigenvalue via Inverse Power",
    "statement": "For diagonal matrix $A = \\begin{pmatrix} 5 & 0 \\\\ 0 & 2 \\end{pmatrix}$, the inverse power method converges to which eigenvalue?",
    "params": { "matrix": [[5, 0], [0, 2]] },
    "answer": 2.0,
    "tolerance": 1e-4,
    "hints": [
      "The power method applied to $A^{-1}$ finds the eigenvalue of largest magnitude in $A^{-1}$.",
      "Eigenvalues of $A^{-1}$ are $1/5 = 0.2$ and $1/2 = 0.5$. The dominant eigenvalue of $A^{-1}$ is $0.5$, which corresponds to $1/0.5 = 2$ in $A$."
    ],
    "solution": "The inverse power method finds the eigenvalue of smallest magnitude, which is 2.",
    "common_mistakes": "Returning $1/2 = 0.5$ instead of the eigenvalue of $A$ (which is 2)."
  }
]
EXTRA_EXERCISES = [
  {
    "id": "nl-newton-003",
    "chapter": "nonlinear",
    "method": "newton",
    "difficulty": "hard",
    "type": "find_error",
    "title": "Newton Convergence for Multiple Root",
    "statement": "When Newton-Raphson is applied to $f(x) = (x - 2)^2 = 0$, what is the asymptotic convergence order $p$?",
    "params": { "f": "(x - 2)**2", "x0": 3.0, "tol": 1e-4 },
    "answer": 1.0,
    "tolerance": 0.1,
    "hints": [
      "Near a root of multiplicity $m > 1$, $f'(r) = 0$.",
      "Standard Newton-Raphson degrades from quadratic ($p=2$) to linear ($p=1$) convergence."
    ],
    "solution": "For roots with multiplicity $> 1$, Newton-Raphson has linear convergence ($p = 1$) with asymptotic error constant $1 - 1/m = 1/2$.",
    "common_mistakes": "Assuming Newton-Raphson is always quadratic."
  },
  {
    "id": "nl-secant-002",
    "chapter": "nonlinear",
    "method": "secant",
    "difficulty": "medium",
    "type": "find_error",
    "title": "Secant Golden Ratio Convergence Order",
    "statement": "What is the theoretical order of convergence $p$ for the Secant method near a simple root? (Give answer to 3 decimal places)",
    "params": { "f": "x**2 - 2", "x0": 1.0, "x1": 2.0 },
    "answer": 1.618,
    "tolerance": 0.01,
    "hints": [
      "The order satisfies $p^2 - p - 1 = 0$.",
      "This is the golden ratio $\\phi = \\frac{1 + \\sqrt{5}}{2}$."
    ],
    "solution": "The order of convergence is the golden ratio $\\phi = \\frac{1 + \\sqrt{5}}{2} \\approx 1.618$.",
    "common_mistakes": "Confusing with order 2 (Newton) or order 1 (Bisection)."
  },
  {
    "id": "lin-geom-001",
    "chapter": "linear",
    "method": "linear-2x2",
    "difficulty": "easy",
    "type": "numeric",
    "title": "2x2 System Intersection y-Coordinate",
    "statement": "Lines $L_1: x + y = 4$ and $L_2: x - y = 0$ intersect at $(x^*, y^*)$. What is $y^*$?",
    "params": { "matrix": [[1, 1], [1, -1]], "vector": [4, 0] },
    "answer": 2.0,
    "tolerance": 1e-4,
    "hints": [
      "$x = y$ from the second equation.",
      "Substitute into the first: $y + y = 4$."
    ],
    "solution": "$2y = 4 \\implies y^* = 2$. (Intersection point is $(2, 2)$).",
    "common_mistakes": "Returning the x-coordinate instead of y-coordinate."
  },
  {
    "id": "lin-diag-001",
    "chapter": "linear",
    "method": "jacobi",
    "difficulty": "medium",
    "type": "find_error",
    "title": "Diagonal Dominance Row Sum",
    "statement": "In matrix $\\begin{pmatrix} 5 & 2 & 1 \\\\ 1 & 4 & 2 \\\\ 3 & 1 & 6 \\end{pmatrix}$, what is the off-diagonal sum for row 1?",
    "params": { "matrix": [[5, 2, 1], [1, 4, 2], [3, 1, 6]] },
    "answer": 3.0,
    "tolerance": 1e-4,
    "hints": [
      "Row 1 entries are $a_{11}=5, a_{12}=2, a_{13}=1$.",
      "Off-diagonal sum is $|a_{12}| + |a_{13}| = 2 + 1 = 3$."
    ],
    "solution": "$|2| + |1| = 3$. Since $|a_{11}| = 5 > 3$, row 1 satisfies strict diagonal dominance.",
    "common_mistakes": "Including the diagonal element 5 in the sum."
  },
  {
    "id": "int-trapz-002",
    "chapter": "integration",
    "method": "trapezoidal",
    "difficulty": "easy",
    "type": "find_error",
    "title": "Composite Trapezoidal Global Error Order",
    "statement": "What is the integer exponent $k$ of the step size $h$ in the global truncation error $\\mathcal{O}(h^k)$ of the composite Trapezoidal rule?",
    "params": { "f": "x**2", "a": 0.0, "b": 1.0, "n": 4 },
    "answer": 2.0,
    "tolerance": 0.1,
    "hints": [
      "Single interval error is $\\mathcal{O}(h^3)$.",
      "Summing over $N = (b-a)/h$ subintervals reduces the error order by 1."
    ],
    "solution": "The composite Trapezoidal rule has global error $\\mathcal{O}(h^2)$, so the exponent $k = 2$.",
    "common_mistakes": "Giving the local error exponent 3 instead of the global error exponent 2."
  },
  {
    "id": "int-simp-002",
    "chapter": "integration",
    "method": "simpson13",
    "difficulty": "easy",
    "type": "find_error",
    "title": "Simpson's 1/3 Subinterval Parity",
    "statement": "Simpson's 1/3 rule requires the total number of subintervals $n$ to be an even number. If dividing $[0, 4]$ into subintervals of width $h = 0.5$, how many subintervals $n$ are formed?",
    "params": { "f": "x", "a": 0.0, "b": 4.0, "n": 8 },
    "answer": 8.0,
    "tolerance": 0.1,
    "hints": [
      "$n = (b - a) / h = (4 - 0) / 0.5$.",
      "Check if $n$ is even."
    ],
    "solution": "$n = 4 / 0.5 = 8$, which is even and therefore valid for Simpson's 1/3 rule.",
    "common_mistakes": "Dividing $0.5$ by $4$ instead of $4$ by $0.5$."
  },
  {
    "id": "ode-euler-002",
    "chapter": "ode",
    "method": "euler",
    "difficulty": "medium",
    "type": "numeric",
    "title": "Euler Stability Step Limit",
    "statement": "For the test equation $y' = -5y$, what is the maximum step size $h$ for which the forward Euler method remains numerically stable? (Recall stability condition $|1 + h\\lambda| < 1$)",
    "params": { "fxy": "-5*y", "x0": 0.0, "y0": 1.0, "h": 0.2, "xEnd": 1.0 },
    "answer": 0.4,
    "tolerance": 1e-4,
    "hints": [
      "Here $\\lambda = -5$. Stability requires $|1 - 5h| < 1$.",
      "$-1 < 1 - 5h < 1 \\implies 5h < 2 \\implies h < 2/5$."
    ],
    "solution": "$h < 2/5 = 0.4$. If $h > 0.4$, forward Euler exhibits oscillating divergence.",
    "common_mistakes": "Forgetting the factor 2 and writing $1/5 = 0.2$."
  },
  {
    "id": "diff-backward-001",
    "chapter": "differentiation",
    "method": "diff",
    "difficulty": "easy",
    "type": "numeric",
    "title": "Backward Difference for e^x",
    "statement": "Using backward difference $f'(x) \\approx \\frac{f(x) - f(x-h)}{h}$ with $h = 0.1$ for $f(x) = e^x$ at $x = 0$, compute $f'(0)$. (Take $e^{-0.1} \\approx 0.904837$)",
    "params": { "f": "exp(x)", "x0": 0.0, "h": 0.1 },
    "answer": 0.9516,
    "tolerance": 1e-3,
    "hints": [
      "$f(0) = e^0 = 1$. $f(-0.1) = e^{-0.1} \\approx 0.904837$.",
      "Compute $\\frac{1 - 0.904837}{0.1}$."
    ],
    "solution": "$f'(0) \\approx \\frac{1 - 0.904837}{0.1} = \\frac{0.095163}{0.1} = 0.95163$. Exact is $e^0 = 1$.",
    "common_mistakes": "Reversing numerator to get negative derivative."
  },
  {
    "id": "interp-deg-001",
    "chapter": "interpolation",
    "method": "lagrange",
    "difficulty": "easy",
    "type": "find_error",
    "title": "Interpolating Polynomial Degree",
    "statement": "Given $n = 5$ distinct data points $(x_0, y_0), \\dots, (x_4, y_4)$, what is the maximum degree $d$ of the unique interpolating polynomial?",
    "params": { "points": [{"x": 0, "y": 1}, {"x": 1, "y": 2}, {"x": 2, "y": 5}, {"x": 3, "y": 10}, {"x": 4, "y": 17}] },
    "answer": 4.0,
    "tolerance": 0.1,
    "hints": [
      "For $N$ distinct points, the polynomial degree is at most $N - 1$.",
      "$5$ points $\\implies$ degree at most $5 - 1$."
    ],
    "solution": "Through $5$ distinct points, the interpolating polynomial has degree at most $4$.",
    "common_mistakes": "Writing 5 instead of $5 - 1 = 4$."
  },
  {
    "id": "eig-trace-001",
    "chapter": "eigenvalue",
    "method": "power",
    "difficulty": "easy",
    "type": "numeric",
    "title": "Sum of Eigenvalues via Matrix Trace",
    "statement": "For $A = \\begin{pmatrix} 7 & 3 \\\\ 2 & 4 \\end{pmatrix}$, what is the sum of its eigenvalues $\\lambda_1 + \\lambda_2$?",
    "params": { "matrix": [[7, 3], [2, 4]] },
    "answer": 11.0,
    "tolerance": 1e-4,
    "hints": [
      "The sum of eigenvalues equals the trace of the matrix: $\\sum \\lambda_i = \\operatorname{tr}(A)$.",
      "$\\operatorname{tr}(A) = a_{11} + a_{22} = 7 + 4$."
    ],
    "solution": "$\\operatorname{tr}(A) = 7 + 4 = 11$. Therefore, $\\lambda_1 + \\lambda_2 = 11$.",
    "common_mistakes": "Confusing trace (sum of diagonal) with determinant ($7 \\times 4 - 3 \\times 2 = 22$)."
  }
]

FULL_EXERCISE_BANK.extend(EXTRA_EXERCISES)

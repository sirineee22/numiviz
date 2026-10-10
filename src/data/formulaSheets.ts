export interface FormulaItem {
  label: string;
  tex: string;
  key?: boolean;
}

export interface MethodItem {
  name: string;
  tag: string;
  facts: [string, string][];
  formulas: FormulaItem[];
  watch?: string;
  notes?: string[];
  table?: {
    title: string;
    head: string[];
    rows: string[][];
  };
}

export interface CommonSection {
  title: string;
  tag: string;
  facts: [string, string][];
  formulas: FormulaItem[];
  table?: {
    title: string;
    head: string[];
    rows: string[][];
  };
  watch?: string;
}

export interface FormulaSheet {
  id: string;
  tab: string;
  title: string;
  fr: string;
  goal: string;
  lab: string[];
  methods: MethodItem[];
  common: CommonSection;
  notation: string[];
}

export const FORMULA_SHEETS: FormulaSheet[] = [
  {
    "id": "nonlinear",
    "tab": "Nonlinear",
    "title": "Nonlinear Equations",
    "fr": "Équations non linéaires",
    "goal": "Find $x^*$ such that $f(x^*)=0$.",
    "lab": [
      "Newton-Raphson",
      "Bisection Method",
      "Fixed Point Iteration",
      "Secant Method"
    ],
    "methods": [
      {
        "name": "Bisection",
        "tag": "Bracketing",
        "facts": [
          [
            "Order",
            "1 (linear)"
          ],
          [
            "Needs",
            "$f(a)f(b)<0$"
          ],
          [
            "Cost",
            "1 eval per step"
          ]
        ],
        "formulas": [
          {
            "label": "Midpoint",
            "tex": "c_n=\\dfrac{a_n+b_n}{2}",
            "key": true
          },
          {
            "label": "Keep the half with the sign change",
            "tex": "[a_{n+1},b_{n+1}]=\\begin{cases}{[a_n,c_n]} & f(a_n)f(c_n)<0\\\\ {[c_n,b_n]} & \\text{otherwise}\\end{cases}"
          },
          {
            "label": "Error bound",
            "tex": "|c_n-x^*|\\le\\dfrac{b_0-a_0}{2^{\\,n+1}}"
          },
          {
            "label": "Steps needed for tolerance $\\varepsilon$",
            "tex": "n\\ge\\log_2\\dfrac{b_0-a_0}{\\varepsilon}-1"
          }
        ],
        "watch": "Check $f(a)f(b)<0$ before you start. It finds one root in the bracket, never all of them."
      },
      {
        "name": "Newton-Raphson",
        "tag": "Tangent",
        "facts": [
          [
            "Order",
            "2 (quadratic)"
          ],
          [
            "Needs",
            "$f'(x_n)\\neq0$"
          ],
          [
            "Cost",
            "$f$ and $f'$ per step"
          ]
        ],
        "formulas": [
          {
            "label": "Update",
            "tex": "x_{n+1}=x_n-\\dfrac{f(x_n)}{f'(x_n)}",
            "key": true
          },
          {
            "label": "Origin: tangent at $x_n$, then set $y=0$",
            "tex": "y=f(x_n)+f'(x_n)\\,(x-x_n)"
          },
          {
            "label": "Error, with $e_n=x_n-x^*$",
            "tex": "e_{n+1}\\approx\\dfrac{f''(x^*)}{2f'(x^*)}\\,e_n^{2}"
          },
          {
            "label": "Root of multiplicity $m$ (restores order 2)",
            "tex": "x_{n+1}=x_n-m\\,\\dfrac{f(x_n)}{f'(x_n)}"
          }
        ],
        "watch": "A poor $x_0$ or $f'(x_n)\\approx0$ throws the iterate far away. On a multiple root, plain Newton is only linear."
      },
      {
        "name": "Fixed point",
        "tag": "Iteration x = g(x)",
        "facts": [
          [
            "Order",
            "1, rate $|g'(x^*)|$"
          ],
          [
            "Needs",
            "$|g'|\\le k<1$"
          ],
          [
            "Cost",
            "1 eval per step"
          ]
        ],
        "formulas": [
          {
            "label": "Rewrite the equation",
            "tex": "f(x)=0\\iff x=g(x)"
          },
          {
            "label": "Iteration",
            "tex": "x_{n+1}=g(x_n)",
            "key": true
          },
          {
            "label": "Convergence condition on $[a,b]$",
            "tex": "g([a,b])\\subseteq[a,b]\\quad\\text{and}\\quad |g'(x)|\\le k<1"
          },
          {
            "label": "A priori error",
            "tex": "|x_n-x^*|\\le\\dfrac{k^{n}}{1-k}\\,|x_1-x_0|"
          },
          {
            "label": "A posteriori error",
            "tex": "|x_n-x^*|\\le\\dfrac{k}{1-k}\\,|x_n-x_{n-1}|"
          }
        ],
        "watch": "One equation has many choices of $g$, and some diverge. Test $|g'(x^*)|<1$ first. If $g'(x^*)=0$, convergence is at least quadratic."
      },
      {
        "name": "Secant",
        "tag": "Derivative-free",
        "facts": [
          [
            "Order",
            "$\\approx1.618$"
          ],
          [
            "Needs",
            "2 start values"
          ],
          [
            "Cost",
            "1 eval per step"
          ]
        ],
        "formulas": [
          {
            "label": "Update",
            "tex": "x_{n+1}=x_n-f(x_n)\\,\\dfrac{x_n-x_{n-1}}{f(x_n)-f(x_{n-1})}",
            "key": true
          },
          {
            "label": "Newton with the slope replaced",
            "tex": "f'(x_n)\\approx\\dfrac{f(x_n)-f(x_{n-1})}{x_n-x_{n-1}}"
          },
          {
            "label": "Error",
            "tex": "|e_{n+1}|\\approx C\\,|e_n|^{(1+\\sqrt5)/2}"
          }
        ],
        "watch": "If $f(x_n)=f(x_{n-1})$ the denominator is zero. It does not keep a bracket, so it can leave the interval."
      }
    ],
    "common": {
      "title": "Stopping and comparing",
      "tag": "Cheat box",
      "facts": [
        [
          "Applies to",
          "all four methods"
        ]
      ],
      "formulas": [
        {
          "label": "Step size",
          "tex": "|x_{n+1}-x_n|<\\varepsilon"
        },
        {
          "label": "Relative step",
          "tex": "\\dfrac{|x_{n+1}-x_n|}{|x_{n+1}|}<\\varepsilon"
        },
        {
          "label": "Residual",
          "tex": "|f(x_{n+1})|<\\varepsilon"
        },
        {
          "label": "Order of convergence $p$",
          "tex": "\\lim_{n\\to\\infty}\\dfrac{|e_{n+1}|}{|e_n|^{p}}=C"
        }
      ],
      "table": {
        "title": "Which method?",
        "head": [
          "Method",
          "Order $p$",
          "Derivative",
          "Guaranteed"
        ],
        "rows": [
          [
            "Bisection",
            "1",
            "no",
            "yes, with a bracket"
          ],
          [
            "Newton",
            "2",
            "$f'$",
            "no"
          ],
          [
            "Fixed point",
            "1",
            "no",
            "if $|g'|<1$"
          ],
          [
            "Secant",
            "1.618",
            "no",
            "no"
          ]
        ]
      },
      "watch": "Always add a cap $n\\ge N_{\\max}$. A step-size test alone can stop early on a flat function, so check the residual too."
    },
    "notation": [
      "$x^*$ exact root",
      "$x_n$ approximation after $n$ steps",
      "$e_n=x_n-x^*$ error",
      "$\\varepsilon$ tolerance",
      "$N_{\\max}$ iteration cap"
    ]
  },
  {
    "id": "linear",
    "tab": "Linear systems",
    "title": "Linear Systems",
    "fr": "Systèmes linéaires",
    "goal": "Solve $A\\mathbf{x}=\\mathbf{b}$ with $A\\in\\mathbb{R}^{n\\times n}$.",
    "lab": [
      "2×2 Graphical Solver",
      "Jacobi Iteration",
      "Gauss-Seidel",
      "Matrix Algebra Lab"
    ],
    "methods": [
      {
        "name": "2×2 system (Cramer)",
        "tag": "Direct, small",
        "facts": [
          [
            "Needs",
            "$\\Delta\\neq0$"
          ],
          [
            "Cost",
            "a few operations"
          ],
          [
            "Picture",
            "two lines"
          ]
        ],
        "formulas": [
          {
            "label": "System",
            "tex": "\\begin{cases}a_1x+b_1y=c_1\\\\ a_2x+b_2y=c_2\\end{cases}"
          },
          {
            "label": "Determinant",
            "tex": "\\Delta=a_1b_2-a_2b_1"
          },
          {
            "label": "Solution",
            "tex": "x=\\dfrac{c_1b_2-c_2b_1}{\\Delta},\\qquad y=\\dfrac{a_1c_2-a_2c_1}{\\Delta}",
            "key": true
          }
        ],
        "notes": [
          "$\\Delta\\neq0$: the two lines cross at one point.",
          "$\\Delta=0$: parallel lines (no solution) or the same line (infinitely many)."
        ]
      },
      {
        "name": "Gaussian elimination",
        "tag": "Direct",
        "facts": [
          [
            "Cost",
            "$\\tfrac23n^3$ flops"
          ],
          [
            "Needs",
            "pivot $\\neq0$"
          ],
          [
            "Gives",
            "exact answer, up to rounding"
          ]
        ],
        "formulas": [
          {
            "label": "Multiplier at step $k$",
            "tex": "m_{ik}=\\dfrac{a_{ik}^{(k)}}{a_{kk}^{(k)}},\\qquad i>k",
            "key": true
          },
          {
            "label": "Row update",
            "tex": "a_{ij}^{(k+1)}=a_{ij}^{(k)}-m_{ik}\\,a_{kj}^{(k)},\\qquad b_i^{(k+1)}=b_i^{(k)}-m_{ik}\\,b_k^{(k)}"
          },
          {
            "label": "Back substitution",
            "tex": "x_n=\\dfrac{b_n}{a_{nn}},\\qquad x_i=\\dfrac{1}{a_{ii}}\\Big(b_i-\\sum_{j=i+1}^{n}a_{ij}x_j\\Big)"
          },
          {
            "label": "Partial pivoting at step $k$",
            "tex": "|a_{pk}^{(k)}|=\\max_{i\\ge k}|a_{ik}^{(k)}|\\ \\Rightarrow\\ \\text{swap rows }p\\text{ and }k"
          },
          {
            "label": "Determinant ($s$ = number of row swaps)",
            "tex": "\\det A=(-1)^s\\prod_{k=1}^{n}a_{kk}^{(k)}"
          }
        ],
        "watch": "Without pivoting, a tiny pivot amplifies rounding errors. Always take the largest $|a_{ik}|$ in the column."
      },
      {
        "name": "LU factorization",
        "tag": "Direct",
        "facts": [
          [
            "Cost",
            "$\\tfrac23n^3$ once, then $O(n^2)$ per $\\mathbf b$"
          ],
          [
            "Needs",
            "pivoting if a pivot is 0"
          ],
          [
            "Use",
            "many right-hand sides"
          ]
        ],
        "formulas": [
          {
            "label": "Factorization ($P$ records row swaps)",
            "tex": "PA=LU",
            "key": true
          },
          {
            "label": "$L$ stores the multipliers (3×3 shown)",
            "tex": "L=\\begin{pmatrix}1&0&0\\\\ m_{21}&1&0\\\\ m_{31}&m_{32}&1\\end{pmatrix}"
          },
          {
            "label": "Forward: $Ly=Pb$",
            "tex": "y_i=(Pb)_i-\\sum_{j<i}l_{ij}\\,y_j"
          },
          {
            "label": "Backward: $Ux=y$",
            "tex": "x_i=\\dfrac{1}{u_{ii}}\\Big(y_i-\\sum_{j>i}u_{ij}\\,x_j\\Big)"
          },
          {
            "label": "Doolittle, no pivoting",
            "tex": "u_{ij}=a_{ij}-\\sum_{k=1}^{i-1}l_{ik}u_{kj}\\ (j\\ge i),\\qquad l_{ij}=\\dfrac{1}{u_{jj}}\\Big(a_{ij}-\\sum_{k=1}^{j-1}l_{ik}u_{kj}\\Big)\\ (i>j)"
          },
          {
            "label": "Determinant",
            "tex": "\\det A=(-1)^s\\prod_{i}u_{ii}"
          }
        ],
        "notes": [
          "$U$ is the triangular matrix you end with after elimination."
        ]
      },
      {
        "name": "Jacobi",
        "tag": "Iterative",
        "facts": [
          [
            "Order",
            "1 (linear)"
          ],
          [
            "Needs",
            "diagonal dominance (sufficient)"
          ],
          [
            "Cost",
            "$O(n^2)$ per sweep"
          ]
        ],
        "formulas": [
          {
            "label": "Component form",
            "tex": "x_i^{(k+1)}=\\dfrac{1}{a_{ii}}\\Big(b_i-\\sum_{j\\neq i}a_{ij}\\,x_j^{(k)}\\Big)",
            "key": true
          },
          {
            "label": "Matrix form",
            "tex": "x^{(k+1)}=T_J\\,x^{(k)}+D^{-1}b,\\qquad T_J=-D^{-1}(L+U)"
          }
        ],
        "notes": [
          "Split $A=L+D+U$: strictly lower, diagonal, strictly upper. These $L$ and U are not the LU factors.",
          "Every component uses only the previous sweep, so the $n$ updates are independent."
        ]
      },
      {
        "name": "Gauss-Seidel",
        "tag": "Iterative",
        "facts": [
          [
            "Order",
            "1 (linear)"
          ],
          [
            "Needs",
            "diagonal dominance or SPD"
          ],
          [
            "Speed",
            "usually faster than Jacobi"
          ]
        ],
        "formulas": [
          {
            "label": "Component form",
            "tex": "x_i^{(k+1)}=\\dfrac{1}{a_{ii}}\\Big(b_i-\\sum_{j<i}a_{ij}\\,x_j^{(k+1)}-\\sum_{j>i}a_{ij}\\,x_j^{(k)}\\Big)",
            "key": true
          },
          {
            "label": "Matrix form",
            "tex": "(D+L)\\,x^{(k+1)}=b-U\\,x^{(k)},\\qquad T_{GS}=-(D+L)^{-1}U"
          }
        ],
        "notes": [
          "Uses each new value immediately, so it is sequential and needs one vector of storage."
        ]
      },
      {
        "name": "Conditioning",
        "tag": "Sensitivity",
        "facts": [
          [
            "Small cond",
            "well-conditioned"
          ],
          [
            "Large cond",
            "small input change, large output change"
          ]
        ],
        "formulas": [
          {
            "label": "Condition number",
            "tex": "\\operatorname{cond}(A)=\\lVert A\\rVert\\,\\lVert A^{-1}\\rVert\\ \\ge1",
            "key": true
          },
          {
            "label": "Perturbation of $b$",
            "tex": "\\dfrac{\\lVert\\delta x\\rVert}{\\lVert x\\rVert}\\le\\operatorname{cond}(A)\\,\\dfrac{\\lVert\\delta b\\rVert}{\\lVert b\\rVert}"
          },
          {
            "label": "Residual $r=b-A\\tilde x$ versus error",
            "tex": "\\dfrac{\\lVert x-\\tilde x\\rVert}{\\lVert x\\rVert}\\le\\operatorname{cond}(A)\\,\\dfrac{\\lVert r\\rVert}{\\lVert b\\rVert}"
          },
          {
            "label": "Common norms",
            "tex": "\\lVert x\\rVert_\\infty=\\max_i|x_i|,\\qquad \\lVert A\\rVert_\\infty=\\max_i\\sum_j|a_{ij}|,\\qquad \\lVert A\\rVert_1=\\max_j\\sum_i|a_{ij}|"
          }
        ],
        "watch": "A tiny residual does not prove a small error when $\\operatorname{cond}(A)$ is large. You lose about $\\log_{10}\\operatorname{cond}(A)$ digits."
      }
    ],
    "common": {
      "title": "Iterative methods: convergence",
      "tag": "Cheat box",
      "facts": [
        [
          "Applies to",
          "Jacobi and Gauss-Seidel"
        ]
      ],
      "formulas": [
        {
          "label": "Converges for every start iff",
          "tex": "\\rho(T)<1"
        },
        {
          "label": "Sufficient: strict diagonal dominance",
          "tex": "|a_{ii}|>\\sum_{j\\neq i}|a_{ij}|\\quad\\text{for every }i"
        },
        {
          "label": "Error bound when $\\lVert T\\rVert<1$",
          "tex": "\\lVert x^{(k)}-x^*\\rVert\\le\\dfrac{\\lVert T\\rVert^{k}}{1-\\lVert T\\rVert}\\,\\lVert x^{(1)}-x^{(0)}\\rVert"
        },
        {
          "label": "Stopping test",
          "tex": "\\lVert x^{(k+1)}-x^{(k)}\\rVert_\\infty<\\varepsilon\\quad\\text{or}\\quad\\lVert b-Ax^{(k)}\\rVert<\\varepsilon"
        }
      ],
      "table": {
        "title": "Direct or iterative?",
        "head": [
          "",
          "Direct (Gauss, LU)",
          "Iterative (Jacobi, G-S)"
        ],
        "rows": [
          [
            "Best for",
            "small or dense $A$",
            "large, sparse, diagonally dominant $A$"
          ],
          [
            "Cost",
            "$O(n^3)$",
            "$O(n^2)$ per sweep, times sweeps"
          ],
          [
            "Result",
            "exact up to rounding",
            "approximation, stopped at $\\varepsilon$"
          ],
          [
            "Fails when",
            "zero pivot, no pivoting",
            "$\\rho(T)\\ge1$"
          ]
        ]
      }
    },
    "notation": [
      "$P$ permutation (row swaps)",
      "$\\rho(T)$ spectral radius, the largest $|\\lambda|$",
      "$\\lVert\\cdot\\rVert_\\infty$ max-row-sum norm",
      "$x^{(k)}$ iterate after $k$ sweeps",
      "SPD symmetric positive definite"
    ]
  },
  {
    "id": "integration",
    "tab": "Integration",
    "title": "Numerical Integration",
    "fr": "Intégration numérique",
    "goal": "Approximate $I=\\int_a^b f(x)\\,dx$ with $h=\\dfrac{b-a}{n}$ and $x_i=a+ih$.",
    "lab": [
      "Trapezoidal Rule",
      "Simpson's 1/3 Rule",
      "Simpson's 3/8 Rule"
    ],
    "methods": [
      {
        "name": "Trapezoidal rule",
        "tag": "Degree 1",
        "facts": [
          [
            "Order",
            "$O(h^2)$"
          ],
          [
            "Exact for",
            "degree $\\le1$"
          ],
          [
            "Needs",
            "any $n$"
          ]
        ],
        "formulas": [
          {
            "label": "One interval",
            "tex": "T=\\dfrac{b-a}{2}\\big[f(a)+f(b)\\big]"
          },
          {
            "label": "Composite",
            "tex": "T_n=\\dfrac{h}{2}\\Big[f(x_0)+2\\sum_{i=1}^{n-1}f(x_i)+f(x_n)\\Big]",
            "key": true
          },
          {
            "label": "Error, $\\xi\\in(a,b)$",
            "tex": "I-T_n=-\\dfrac{(b-a)\\,h^2}{12}\\,f''(\\xi)"
          },
          {
            "label": "Steps for tolerance $\\varepsilon$, $M_2=\\max|f''|$",
            "tex": "n\\ge\\sqrt{\\dfrac{(b-a)^3M_2}{12\\,\\varepsilon}}"
          }
        ]
      },
      {
        "name": "Simpson 1/3",
        "tag": "Degree 2",
        "facts": [
          [
            "Order",
            "$O(h^4)$"
          ],
          [
            "Exact for",
            "degree $\\le3$"
          ],
          [
            "Needs",
            "$n$ even"
          ]
        ],
        "formulas": [
          {
            "label": "One panel",
            "tex": "S=\\dfrac{b-a}{6}\\Big[f(a)+4f\\big(\\tfrac{a+b}{2}\\big)+f(b)\\Big]"
          },
          {
            "label": "Composite",
            "tex": "S_n=\\dfrac{h}{3}\\Big[f(x_0)+4\\sum_{i=1}^{n/2}f(x_{2i-1})+2\\sum_{i=1}^{n/2-1}f(x_{2i})+f(x_n)\\Big]",
            "key": true
          },
          {
            "label": "Error",
            "tex": "I-S_n=-\\dfrac{(b-a)\\,h^4}{180}\\,f^{(4)}(\\xi)"
          },
          {
            "label": "Steps for tolerance $\\varepsilon$, $M_4=\\max|f^{(4)}|$",
            "tex": "n\\ge\\Big(\\dfrac{(b-a)^5M_4}{180\\,\\varepsilon}\\Big)^{1/4}"
          }
        ],
        "notes": [
          "Weights along the nodes: 1, 4, 2, 4, 2, …, 4, 1."
        ]
      },
      {
        "name": "Simpson 3/8",
        "tag": "Degree 3",
        "facts": [
          [
            "Order",
            "$O(h^4)$"
          ],
          [
            "Exact for",
            "degree $\\le3$"
          ],
          [
            "Needs",
            "$n$ multiple of 3"
          ]
        ],
        "formulas": [
          {
            "label": "One panel",
            "tex": "S^{3/8}=\\dfrac{3h}{8}\\big[f_0+3f_1+3f_2+f_3\\big]"
          },
          {
            "label": "Composite",
            "tex": "S_n^{3/8}=\\dfrac{3h}{8}\\big[f_0+3f_1+3f_2+2f_3+3f_4+3f_5+2f_6+\\cdots+3f_{n-1}+f_n\\big]",
            "key": true
          },
          {
            "label": "Error",
            "tex": "I-S_n^{3/8}=-\\dfrac{(b-a)\\,h^4}{80}\\,f^{(4)}(\\xi)"
          }
        ],
        "notes": [
          "Same order as Simpson 1/3 with a larger error constant (1/80 against 1/180).",
          "When $n$ is odd, use one 3/8 panel and Simpson 1/3 on the rest."
        ]
      }
    ],
    "common": {
      "title": "Error estimate by halving $h$",
      "tag": "Cheat box",
      "facts": [
        [
          "Applies to",
          "all three rules"
        ]
      ],
      "formulas": [
        {
          "label": "Richardson on the trapezoid (gives Simpson)",
          "tex": "I\\approx T_{2n}+\\dfrac{T_{2n}-T_n}{3}"
        },
        {
          "label": "Richardson on Simpson",
          "tex": "I\\approx S_{2n}+\\dfrac{S_{2n}-S_n}{15}"
        },
        {
          "label": "Error estimate for Simpson",
          "tex": "|I-S_{2n}|\\approx\\dfrac{|S_{2n}-S_n|}{15}"
        }
      ],
      "table": {
        "title": "Rules side by side",
        "head": [
          "Rule",
          "$n$ must be",
          "Exact for",
          "Error order, constant"
        ],
        "rows": [
          [
            "Trapezoid",
            "any",
            "degree 1",
            "$O(h^2)$, $\\tfrac{1}{12}$"
          ],
          [
            "Simpson 1/3",
            "even",
            "degree 3",
            "$O(h^4)$, $\\tfrac{1}{180}$"
          ],
          [
            "Simpson 3/8",
            "multiple of 3",
            "degree 3",
            "$O(h^4)$, $\\tfrac{1}{80}$"
          ]
        ]
      },
      "watch": "Halving $h$ divides the trapezoid error by about 4 and the Simpson error by about 16. If you do not see that, $f$ is not smooth enough."
    },
    "notation": [
      "$h$ step size",
      "$n$ number of subintervals",
      "$f_i=f(x_i)$",
      "$\\xi$ unknown point in $(a,b)$",
      "$I$ exact integral"
    ]
  },
  {
    "id": "ode",
    "tab": "ODE",
    "title": "Differential Equations",
    "fr": "Équations différentielles, problème de Cauchy",
    "goal": "Solve $y'=f(t,y)$, $y(t_0)=y_0$, with step $h$ and $t_n=t_0+nh$.",
    "lab": [
      "Euler Method",
      "Runge-Kutta 4 (RK4)"
    ],
    "methods": [
      {
        "name": "Euler",
        "tag": "1st order",
        "facts": [
          [
            "Order",
            "1"
          ],
          [
            "Local error",
            "$O(h^2)$"
          ],
          [
            "Cost",
            "1 eval per step"
          ]
        ],
        "formulas": [
          {
            "label": "Step",
            "tex": "y_{n+1}=y_n+h\\,f(t_n,y_n)",
            "key": true
          },
          {
            "label": "Global error",
            "tex": "|y(t_n)-y_n|=O(h)"
          },
          {
            "label": "Test equation $y'=\\lambda y$",
            "tex": "y_n=(1+h\\lambda)^n\\,y_0"
          },
          {
            "label": "Stability for $\\lambda<0$",
            "tex": "|1+h\\lambda|\\le1\\ \\Longrightarrow\\ h\\le\\dfrac{2}{|\\lambda|}"
          }
        ],
        "watch": "Halving $h$ only halves the error. A step that is too large on a decaying problem makes the solution oscillate or blow up."
      },
      {
        "name": "Heun",
        "tag": "2nd order, soon in the Lab",
        "facts": [
          [
            "Order",
            "2"
          ],
          [
            "Local error",
            "$O(h^3)$"
          ],
          [
            "Cost",
            "2 evals per step"
          ]
        ],
        "formulas": [
          {
            "label": "Predictor and slope",
            "tex": "k_1=f(t_n,y_n),\\qquad k_2=f(t_n+h,\\ y_n+h\\,k_1)"
          },
          {
            "label": "Step",
            "tex": "y_{n+1}=y_n+\\dfrac{h}{2}\\,(k_1+k_2)",
            "key": true
          }
        ],
        "notes": [
          "Average of the slope at the start and the slope at the Euler prediction."
        ]
      },
      {
        "name": "Runge-Kutta 4",
        "tag": "4th order",
        "facts": [
          [
            "Order",
            "4"
          ],
          [
            "Local error",
            "$O(h^5)$"
          ],
          [
            "Cost",
            "4 evals per step"
          ]
        ],
        "formulas": [
          {
            "label": "Stages",
            "tex": "\\begin{aligned}k_1&=f(t_n,\\,y_n)\\\\ k_2&=f\\big(t_n+\\tfrac h2,\\ y_n+\\tfrac h2k_1\\big)\\\\ k_3&=f\\big(t_n+\\tfrac h2,\\ y_n+\\tfrac h2k_2\\big)\\\\ k_4&=f\\big(t_n+h,\\ y_n+h\\,k_3\\big)\\end{aligned}"
          },
          {
            "label": "Step",
            "tex": "y_{n+1}=y_n+\\dfrac{h}{6}\\,\\big(k_1+2k_2+2k_3+k_4\\big)",
            "key": true
          },
          {
            "label": "Global error",
            "tex": "|y(t_n)-y_n|=O(h^4)"
          }
        ],
        "watch": "Compare cost fairly: one RK4 step costs four Euler steps. Halving $h$ divides the error by about 16."
      }
    ],
    "common": {
      "title": "Systems, higher order, error check",
      "tag": "Cheat box",
      "facts": [
        [
          "Applies to",
          "every method above"
        ]
      ],
      "formulas": [
        {
          "label": "System: same formulas with vectors",
          "tex": "\\mathbf y_{n+1}=\\mathbf y_n+h\\,\\mathbf f(t_n,\\mathbf y_n)"
        },
        {
          "label": "Second-order equation to a system",
          "tex": "y''=g(t,y,y')\\ \\Longrightarrow\\ \\begin{cases}u_1'=u_2\\\\ u_2'=g(t,u_1,u_2)\\end{cases}\\quad u_1=y,\\ u_2=y'"
        },
        {
          "label": "Error estimate by halving ($p$ = order)",
          "tex": "y(t_n)-y_n^{(h/2)}\\approx\\dfrac{y_n^{(h/2)}-y_n^{(h)}}{2^{p}-1}"
        }
      ],
      "table": {
        "title": "Methods side by side",
        "head": [
          "Method",
          "Order $p$",
          "Evals per step",
          "Error when $h$ is halved"
        ],
        "rows": [
          [
            "Euler",
            "1",
            "1",
            "÷ 2"
          ],
          [
            "Heun",
            "2",
            "2",
            "÷ 4"
          ],
          [
            "RK4",
            "4",
            "4",
            "÷ 16"
          ]
        ]
      }
    },
    "notation": [
      "$h$ step size",
      "$t_n=t_0+nh$ grid",
      "$y_n\\approx y(t_n)$",
      "$k_i$ slope estimates",
      "$\\lambda$ decay rate in the test equation"
    ]
  },
  {
    "id": "differentiation",
    "tab": "Differentiation",
    "title": "Numerical Differentiation",
    "fr": "Dérivation numérique",
    "goal": "Approximate $f'(x)$ from values of $f$ with step $h$.",
    "lab": [
      "Finite Differences (forward, backward, central)"
    ],
    "methods": [
      {
        "name": "Forward difference",
        "tag": "2 points",
        "facts": [
          [
            "Order",
            "$O(h)$"
          ],
          [
            "Points",
            "$x,\\ x+h$"
          ],
          [
            "Use",
            "left end of the data"
          ]
        ],
        "formulas": [
          {
            "label": "Formula",
            "tex": "f'(x)\\approx\\dfrac{f(x+h)-f(x)}{h}",
            "key": true
          },
          {
            "label": "Error",
            "tex": "f'(x)=\\dfrac{f(x+h)-f(x)}{h}-\\dfrac{h}{2}\\,f''(\\xi)"
          }
        ]
      },
      {
        "name": "Backward difference",
        "tag": "2 points",
        "facts": [
          [
            "Order",
            "$O(h)$"
          ],
          [
            "Points",
            "$x-h,\\ x$"
          ],
          [
            "Use",
            "right end of the data"
          ]
        ],
        "formulas": [
          {
            "label": "Formula",
            "tex": "f'(x)\\approx\\dfrac{f(x)-f(x-h)}{h}",
            "key": true
          },
          {
            "label": "Error",
            "tex": "f'(x)=\\dfrac{f(x)-f(x-h)}{h}+\\dfrac{h}{2}\\,f''(\\xi)"
          }
        ]
      },
      {
        "name": "Central difference",
        "tag": "2 points",
        "facts": [
          [
            "Order",
            "$O(h^2)$"
          ],
          [
            "Points",
            "$x-h,\\ x+h$"
          ],
          [
            "Use",
            "interior points"
          ]
        ],
        "formulas": [
          {
            "label": "Formula",
            "tex": "f'(x)\\approx\\dfrac{f(x+h)-f(x-h)}{2h}",
            "key": true
          },
          {
            "label": "Error",
            "tex": "f'(x)=\\dfrac{f(x+h)-f(x-h)}{2h}-\\dfrac{h^2}{6}\\,f'''(\\xi)"
          }
        ]
      },
      {
        "name": "Second derivative",
        "tag": "3 points, central",
        "facts": [
          [
            "Order",
            "$O(h^2)$"
          ],
          [
            "Points",
            "$x-h,\\ x,\\ x+h$"
          ],
          [
            "Use",
            "interior points"
          ]
        ],
        "formulas": [
          {
            "label": "Formula",
            "tex": "f''(x)\\approx\\dfrac{f(x+h)-2f(x)+f(x-h)}{h^2}",
            "key": true
          },
          {
            "label": "Error",
            "tex": "f''(x)=\\dfrac{f(x+h)-2f(x)+f(x-h)}{h^2}-\\dfrac{h^2}{12}\\,f^{(4)}(\\xi)"
          }
        ]
      },
      {
        "name": "Three-point one-sided",
        "tag": "Edges of the data",
        "facts": [
          [
            "Order",
            "$O(h^2)$"
          ],
          [
            "Points",
            "$x,\\ x\\pm h,\\ x\\pm2h$"
          ],
          [
            "Use",
            "first and last point"
          ]
        ],
        "formulas": [
          {
            "label": "Left end (forward)",
            "tex": "f'(x)\\approx\\dfrac{-3f(x)+4f(x+h)-f(x+2h)}{2h}",
            "key": true
          },
          {
            "label": "Right end (backward)",
            "tex": "f'(x)\\approx\\dfrac{3f(x)-4f(x-h)+f(x-2h)}{2h}"
          },
          {
            "label": "Error (forward version)",
            "tex": "f'(x)=\\dfrac{-3f(x)+4f(x+h)-f(x+2h)}{2h}+\\dfrac{h^2}{3}\\,f'''(\\xi)"
          }
        ]
      }
    ],
    "common": {
      "title": "Choosing $h$ and sharpening the result",
      "tag": "Cheat box",
      "facts": [
        [
          "Applies to",
          "all formulas above"
        ]
      ],
      "formulas": [
        {
          "label": "Total error = truncation + rounding",
          "tex": "E(h)\\approx C\\,h^{p}+\\dfrac{\\varepsilon_{\\mathrm{mach}}}{h}"
        },
        {
          "label": "Best $h$ in double precision",
          "tex": "\\text{one-sided: }h\\approx\\sqrt{\\varepsilon_{\\mathrm{mach}}}\\approx10^{-8},\\qquad\\text{central: }h\\approx\\varepsilon_{\\mathrm{mach}}^{1/3}\\approx10^{-5}"
        },
        {
          "label": "Richardson on a central difference: $O(h^2)\\to O(h^4)$",
          "tex": "D_{\\text{new}}=\\dfrac{4\\,D(h/2)-D(h)}{3}"
        },
        {
          "label": "Richardson in general, order $p$",
          "tex": "D_{\\text{new}}=\\dfrac{2^{p}\\,D(h/2)-D(h)}{2^{p}-1}"
        }
      ],
      "watch": "Making $h$ smaller stops helping at some point, then makes things worse: subtracting two nearly equal numbers destroys digits."
    },
    "notation": [
      "$h$ step size",
      "$\\xi$ unknown point near $x$",
      "$\\varepsilon_{\\mathrm{mach}}\\approx2.2\\times10^{-16}$ in double precision",
      "$D(h)$ any difference formula"
    ]
  },
  {
    "id": "interpolation",
    "tab": "Interpolation",
    "title": "Interpolation & Least Squares",
    "fr": "Interpolation et moindres carrés",
    "goal": "Build $p$ with $p(x_i)=y_i$ (interpolation), or minimise $\\sum_i\\big(y_i-p(x_i)\\big)^2$ (least squares).",
    "lab": [],
    "methods": [
      {
        "name": "Lagrange",
        "tag": "Interpolation",
        "facts": [
          [
            "Degree",
            "$\\le n$ for $n+1$ points"
          ],
          [
            "Needs",
            "distinct $x_i$"
          ],
          [
            "Cost",
            "$O(n^2)$ per point"
          ]
        ],
        "formulas": [
          {
            "label": "Polynomial",
            "tex": "p_n(x)=\\sum_{i=0}^{n}y_i\\,L_i(x),\\qquad L_i(x)=\\prod_{j\\neq i}\\dfrac{x-x_j}{x_i-x_j}",
            "key": true
          },
          {
            "label": "Error",
            "tex": "f(x)-p_n(x)=\\dfrac{f^{(n+1)}(\\xi)}{(n+1)!}\\prod_{i=0}^{n}(x-x_i)"
          }
        ],
        "watch": "Many equally spaced nodes make the polynomial oscillate near the ends (Runge). Use splines or Chebyshev nodes."
      },
      {
        "name": "Newton, divided differences",
        "tag": "Interpolation",
        "facts": [
          [
            "Degree",
            "$\\le n$ for $n+1$ points"
          ],
          [
            "Gain",
            "adding a point adds one term"
          ],
          [
            "Cost",
            "$O(n^2)$ for the table"
          ]
        ],
        "formulas": [
          {
            "label": "Divided differences",
            "tex": "f[x_i,\\dots,x_{i+k}]=\\dfrac{f[x_{i+1},\\dots,x_{i+k}]-f[x_i,\\dots,x_{i+k-1}]}{x_{i+k}-x_i}",
            "key": true
          },
          {
            "label": "Polynomial",
            "tex": "p_n(x)=f[x_0]+\\sum_{k=1}^{n}f[x_0,\\dots,x_k]\\prod_{j=0}^{k-1}(x-x_j)"
          }
        ],
        "notes": [
          "Same polynomial as Lagrange, written in a form that is easy to extend."
        ]
      },
      {
        "name": "Natural cubic spline",
        "tag": "Interpolation",
        "facts": [
          [
            "Pieces",
            "cubic on each $[x_i,x_{i+1}]$"
          ],
          [
            "Smoothness",
            "$S,S',S''$ continuous"
          ],
          [
            "Natural",
            "$S''=0$ at both ends"
          ]
        ],
        "formulas": [
          {
            "label": "Piece $i$",
            "tex": "S_i(x)=a_i+b_i(x-x_i)+c_i(x-x_i)^2+d_i(x-x_i)^3"
          },
          {
            "label": "Tridiagonal system for $c_i$, with $h_i=x_{i+1}-x_i$",
            "tex": "h_{i-1}c_{i-1}+2(h_{i-1}+h_i)\\,c_i+h_ic_{i+1}=3\\Big(\\dfrac{a_{i+1}-a_i}{h_i}-\\dfrac{a_i-a_{i-1}}{h_{i-1}}\\Big)",
            "key": true
          },
          {
            "label": "Ends and values",
            "tex": "c_0=c_n=0,\\qquad a_i=y_i"
          },
          {
            "label": "Recover the rest",
            "tex": "b_i=\\dfrac{a_{i+1}-a_i}{h_i}-\\dfrac{h_i}{3}\\,(2c_i+c_{i+1}),\\qquad d_i=\\dfrac{c_{i+1}-c_i}{3h_i}"
          }
        ]
      },
      {
        "name": "Least squares",
        "tag": "Approximation",
        "facts": [
          [
            "Goal",
            "minimise $\\sum r_i^2$"
          ],
          [
            "Needs",
            "more points than unknowns"
          ],
          [
            "Solve",
            "normal equations"
          ]
        ],
        "formulas": [
          {
            "label": "Normal equations, degree $m$ ($A$ = Vandermonde)",
            "tex": "A^{T}A\\,c=A^{T}y,\\qquad A_{ij}=x_i^{\\,j},\\ j=0,\\dots,m",
            "key": true
          },
          {
            "label": "Straight line $y\\approx a+bx$",
            "tex": "b=\\dfrac{n\\sum x_iy_i-\\sum x_i\\sum y_i}{n\\sum x_i^2-\\big(\\sum x_i\\big)^2},\\qquad a=\\bar y-b\\,\\bar x"
          },
          {
            "label": "Quality of the fit",
            "tex": "R^2=1-\\dfrac{\\sum(y_i-\\hat y_i)^2}{\\sum(y_i-\\bar y)^2}"
          }
        ],
        "watch": "A higher degree always lowers the residual, even when it only fits the noise. Compare on points you did not fit."
      }
    ],
    "common": {
      "title": "Choosing the tool",
      "tag": "Cheat box",
      "facts": [
        [
          "Applies to",
          "this whole sheet"
        ]
      ],
      "formulas": [
        {
          "label": "Chebyshev nodes on $[a,b]$ (tame the Runge effect)",
          "tex": "x_k=\\dfrac{a+b}{2}+\\dfrac{b-a}{2}\\cos\\dfrac{(2k+1)\\pi}{2n+2},\\quad k=0,\\dots,n"
        }
      ],
      "table": {
        "title": "Interpolation or least squares?",
        "head": [
          "",
          "Interpolation",
          "Least squares"
        ],
        "rows": [
          [
            "Passes through the data",
            "yes, every point",
            "no, it smooths"
          ],
          [
            "Best for",
            "exact, clean data",
            "noisy data, trends"
          ],
          [
            "Main danger",
            "oscillation at high degree",
            "wrong model degree"
          ]
        ]
      }
    },
    "notation": [
      "$(x_i,y_i)$ data points",
      "$p_n$ polynomial of degree $\\le n$",
      "$h_i=x_{i+1}-x_i$ spacing",
      "$\\bar x,\\bar y$ means",
      "$r_i=y_i-p(x_i)$ residual"
    ]
  }
];

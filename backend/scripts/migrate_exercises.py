import json
import os
import re
import sys
from typing import Dict, List, Any

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from schemas.practice import ExerciseModel

# 1. 13 Legacy STATIC_PROBLEMS from PracticePage.tsx
STATIC_LEGACY = [
  {
    "id": "s-lin-1",
    "category": "linear",
    "difficulty": "beginner",
    "title": "Solve a 2x2 system",
    "statement": "Solve the system: $2x + y = 5$ and $x - y = 1$. What is the value of $x$?",
    "hint": "Try adding the two equations to eliminate y.",
    "answer": "2",
    "tolerance": 0.01,
    "answer_type": "numeric",
    "solution_steps": [
      "Add the two equations: $(2x + y) + (x - y) = 5 + 1 \\implies 3x = 6 \\implies x = 2$",
      "Substitute back: $x - y = 1 \\implies 2 - y = 1 \\implies y = 1$",
      "Solution: $x = 2, y = 1$"
    ]
  },
  {
    "id": "s-lin-2",
    "category": "linear",
    "difficulty": "intermediate",
    "title": "Dominant diagonal check",
    "statement": "Is the matrix $A = \\begin{pmatrix} 4 & 1 & 0 \\\\ 1 & 3 & 1 \\\\ 0 & 1 & 3 \\end{pmatrix}$ strictly diagonally dominant?",
    "answer": "yes",
    "answer_type": "text",
    "solution_steps": [
      "Row 1: $|4| > |1| + |0| \\implies 4 > 1$ (Satisfied)",
      "Row 2: $|3| > |1| + |1| \\implies 3 > 2$ (Satisfied)",
      "Row 3: $|3| > |0| + |1| \\implies 3 > 1$ (Satisfied)",
      "All rows strictly dominate: Yes."
    ]
  },
  {
    "id": "s-lin-3",
    "category": "linear",
    "difficulty": "advanced",
    "title": "Gauss elimination pivot",
    "statement": "After one step of Gaussian elimination on $\\begin{pmatrix} 2 & 1 & | & 3 \\\\ 4 & 3 & | & 7 \\end{pmatrix}$, what is the new value at position $(2,1)$?",
    "answer": "0",
    "tolerance": 0.001,
    "answer_type": "numeric",
    "solution_steps": [
      "Multiplier $m = 4/2 = 2$",
      "$R_2 \\leftarrow R_2 - 2 R_1$: $[4 - 2(2), 3 - 2(1) \\mid 7 - 2(3)] = [0, 1 \\mid 1]$",
      "Position $(2,1) = 0$"
    ]
  },
  {
    "id": "s-nl-1",
    "category": "nonlinear",
    "difficulty": "beginner",
    "title": "Newton first iteration",
    "statement": "Apply one iteration of Newton-Raphson to $f(x) = x^2 - 2$ starting at $x_0 = 2$. Give the new $x_1$.",
    "answer": "1.5",
    "tolerance": 0.001,
    "answer_type": "numeric",
    "solution_steps": [
      "$f(x) = x^2 - 2, f'(x) = 2x$",
      "$x_1 = x_0 - \\frac{f(x_0)}{f'(x_0)} = 2 - \\frac{4-2}{4} = 2 - 0.5 = 1.5$"
    ]
  },
  {
    "id": "s-nl-2",
    "category": "nonlinear",
    "difficulty": "intermediate",
    "title": "Bisection midpoint",
    "statement": "$f(x) = x^3 - x - 2$. The root is in $[1, 2]$. What is the midpoint after 1 bisection step?",
    "answer": "1.5",
    "tolerance": 0.001,
    "answer_type": "numeric",
    "solution_steps": [
      "Check signs: $f(1) = 1 - 1 - 2 = -2 < 0$, $f(2) = 8 - 2 - 2 = 4 > 0$",
      "Sign change confirmed. Midpoint $m = (1+2)/2 = 1.5$"
    ]
  },
  {
    "id": "s-nl-3",
    "category": "nonlinear",
    "difficulty": "advanced",
    "title": "Convergence order",
    "statement": "What is the theoretical order of convergence $p$ of Newton-Raphson for a simple root?",
    "answer": "2",
    "answer_type": "numeric",
    "tolerance": 0.1,
    "solution_steps": [
      "Newton-Raphson achieves quadratic convergence (order $p = 2$) near simple roots.",
      "Error relation satisfies $|e_{k+1}| \\approx C |e_k|^2$."
    ]
  },
  {
    "id": "s-mat-1",
    "category": "matrices",
    "difficulty": "beginner",
    "title": "2x2 determinant",
    "statement": "Calculate $\\det \\begin{pmatrix} 3 & 1 \\\\ 2 & 4 \\end{pmatrix}$.",
    "answer": "10",
    "tolerance": 0.01,
    "answer_type": "numeric",
    "solution_steps": [
      "$\\det \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$",
      "$\\det = 3(4) - 1(2) = 12 - 2 = 10$"
    ]
  },
  {
    "id": "s-mat-2",
    "category": "matrices",
    "difficulty": "intermediate",
    "title": "Matrix inverse condition",
    "statement": "For what value of $k$ is the matrix $\\begin{pmatrix} k & 2 \\\\ 3 & 6 \\end{pmatrix}$ singular?",
    "answer": "1",
    "tolerance": 0.01,
    "answer_type": "numeric",
    "solution_steps": [
      "A matrix is singular when $\\det(A) = 0$.",
      "$\\det = 6k - 6 = 0 \\implies 6k = 6 \\implies k = 1$"
    ]
  },
  {
    "id": "s-int-1",
    "category": "integration",
    "difficulty": "beginner",
    "title": "Trapezoidal rule (n=1)",
    "statement": "Approximate $\\int_0^1 x^2 \\, dx$ using the Trapezoidal rule with $n = 1$.",
    "answer": "0.5",
    "tolerance": 0.001,
    "answer_type": "numeric",
    "solution_steps": [
      "With $n=1, h=1, x_0=0, x_1=1$",
      "$T = \\frac{h}{2}[f(0) + f(1)] = 0.5(0 + 1) = 0.5$",
      "Exact value is $1/3 \\approx 0.3333$."
    ]
  },
  {
    "id": "s-int-2",
    "category": "integration",
    "difficulty": "intermediate",
    "title": "Simpson's 1/3 rule",
    "statement": "Approximate $\\int_0^2 x^3 \\, dx$ using Simpson's 1/3 rule with $n = 2$.",
    "answer": "4",
    "tolerance": 0.01,
    "answer_type": "numeric",
    "solution_steps": [
      "$n=2, h=1$. Nodes $x_0=0, x_1=1, x_2=2$.",
      "$S = \\frac{1}{3}[f(0) + 4f(1) + f(2)] = \\frac{1}{3}[0 + 4(1) + 8] = 4$",
      "Exact value is $[x^4/4]_0^2 = 4$."
    ]
  },
  {
    "id": "s-ode-1",
    "category": "ode",
    "difficulty": "beginner",
    "title": "Euler one step",
    "statement": "Apply one step of Euler's method to $\\frac{dy}{dx} = y, y(0) = 1$, with $h = 0.1$. Give $y(0.1)$.",
    "answer": "1.1",
    "tolerance": 0.001,
    "answer_type": "numeric",
    "solution_steps": [
      "Euler: $y_1 = y_0 + h f(x_0, y_0) = 1 + 0.1(1) = 1.1$",
      "Exact value is $e^{0.1} \\approx 1.10517$."
    ]
  },
  {
    "id": "s-ode-2",
    "category": "ode",
    "difficulty": "advanced",
    "title": "RK4 order",
    "statement": "What is the local truncation error order of Runge-Kutta 4 (RK4)? (Enter an integer)",
    "answer": "5",
    "tolerance": 0.1,
    "answer_type": "numeric",
    "solution_steps": [
      "RK4 has global error $\\mathcal{O}(h^4)$ and local truncation error $\\mathcal{O}(h^5)$.",
      "Answer is 5."
    ]
  },
  {
    "id": "s-interp-1",
    "category": "interpolation",
    "difficulty": "beginner",
    "title": "Linear interpolation",
    "statement": "Given $f(1) = 2$ and $f(3) = 8$, estimate $f(2)$ using linear interpolation.",
    "answer": "5",
    "tolerance": 0.01,
    "answer_type": "numeric",
    "solution_steps": [
      "Slope $m = (8 - 2) / (3 - 1) = 3$",
      "$f(2) = 2 + 3(2 - 1) = 5$"
    ]
  }
]

def migrate():
    converted: List[Dict[str, Any]] = []
    todo_report: List[Dict[str, Any]] = []

    diff_map = {"beginner": "easy", "intermediate": "medium", "advanced": "hard"}

    # Process each legacy static problem
    for p in STATIC_LEGACY:
        cid = p["id"]
        cat = p["category"]
        if cat == "matrices":
            cat = "linear"

        # Determine method
        method = "custom"
        params: Dict[str, Any] = {}
        ptype = "numeric" if p["answer_type"] == "numeric" else "find_error"

        if cid == "s-lin-1":
            method = "linear-2x2"
            params = {"matrix": [[2, 1], [1, -1]], "vector": [5, 1]}
        elif cid == "s-lin-2":
            method = "jacobi"
            params = {"matrix": [[4, 1, 0], [1, 3, 1], [0, 1, 3]]}
            ptype = "find_error"
        elif cid == "s-lin-3":
            method = "gauss"
            params = {"matrix": [[2, 1], [4, 3]], "vector": [3, 7]}
        elif cid == "s-nl-1":
            method = "newton"
            ptype = "next_iteration"
            params = {"f": "x**2 - 2", "x0": 2.0, "tol": 1e-4}
        elif cid == "s-nl-2":
            method = "bisection"
            ptype = "next_iteration"
            params = {"f": "x**3 - x - 2", "a": 1.0, "b": 2.0, "tol": 1e-4}
        elif cid == "s-nl-3":
            method = "newton"
            ptype = "find_error"
        elif cid == "s-mat-1":
            method = "matrix-lab"
            params = {"matrix": [[3, 1], [2, 4]]}
        elif cid == "s-mat-2":
            method = "matrix-lab"
            params = {"matrix": [[1, 2], [3, 6]]}
        elif cid == "s-int-1":
            method = "trapezoidal"
            params = {"f": "x**2", "a": 0.0, "b": 1.0, "n": 1}
        elif cid == "s-int-2":
            method = "simpson13"
            params = {"f": "x**3", "a": 0.0, "b": 2.0, "n": 2}
        elif cid == "s-ode-1":
            method = "euler"
            ptype = "next_iteration"
            params = {"fxy": "y", "x0": 0.0, "y0": 1.0, "h": 0.1, "xEnd": 0.1}
        elif cid == "s-ode-2":
            method = "rk4"
            ptype = "find_error"
        elif cid == "s-interp-1":
            method = "lagrange"
            params = {"points": [{"x": 1.0, "y": 2.0}, {"x": 3.0, "y": 8.0}]}

        hints = [p["hint"]] if p.get("hint") else ["Recall the standard formula for this method."]
        hints.append(f"Consider the first step: {p['solution_steps'][0]}")

        ans_val = float(p["answer"]) if p["answer_type"] == "numeric" else p["answer"]

        item = {
            "id": p["id"],
            "chapter": cat,
            "method": method,
            "difficulty": diff_map.get(p["difficulty"], "medium"),
            "type": ptype,
            "title": p["title"],
            "statement": p["statement"],
            "params": params,
            "answer": ans_val,
            "tolerance": p.get("tolerance", 1e-4),
            "hints": hints,
            "solution": "\n\n".join(p["solution_steps"]),
            "common_mistakes": "Watch out for arithmetic sign errors and precision truncation."
        }
        converted.append(item)

    # Note legacy DB raw entries in TODO report
    todo_report.append({
        "source": "numiviz.db:exercice",
        "count": 24,
        "reason": "Legacy French exam text questions without formal numerical parameters. Kept in DB for historical lesson views; structured practice bank uses standardized schema."
    })

    # Load rich exercise bank generator
    from scripts.exercise_bank_data import FULL_EXERCISE_BANK

    all_exercises = converted + FULL_EXERCISE_BANK
    print(f"Total exercises assembled: {len(all_exercises)}")

    # Validate all with Pydantic
    validated = []
    for ex in all_exercises:
        try:
            m = ExerciseModel(**ex)
            validated.append(m.dict())
        except Exception as e:
            print(f"Validation failed for {ex.get('id')}: {e}")
            todo_report.append({"id": ex.get('id'), "error": str(e)})

    # Write output files
    out_path = os.path.join(backend_dir, "data", "exercises.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(validated, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(validated)} validated exercises to {out_path}")

    report_path = os.path.join(backend_dir, "data", "migration_todo_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(todo_report, f, indent=2, ensure_ascii=False)
    print(f"Wrote TODO report to {report_path}")

if __name__ == "__main__":
    migrate()
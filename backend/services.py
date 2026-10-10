import numpy as np


def lu_decomposition(A):
    """Doolittle LU decomposition without pivoting."""
    n = len(A)
    A = np.array(A, dtype=float)
    L = np.zeros((n, n))
    U = np.zeros((n, n))
    steps = []

    for i in range(n):
        # Upper Triangular row i
        for k in range(i, n):
            sum_val = sum(L[i][j] * U[j][k] for j in range(i))
            U[i][k] = A[i][k] - sum_val
        steps.append(f"Step {i+1}: Calculated row {i+1} of U.")

        # Lower Triangular column i
        for k in range(i, n):
            if i == k:
                L[i][i] = 1
            else:
                if abs(U[i][i]) < 1e-12:
                    raise ValueError(f"Zero pivot encountered at position ({i},{i}). Matrix may be singular.")
                sum_val = sum(L[k][j] * U[j][i] for j in range(i))
                L[k][i] = (A[k][i] - sum_val) / U[i][i]
        steps.append(f"Step {i+1}: Calculated column {i+1} of L.")

    return L.tolist(), U.tolist(), steps


def gaussian_elimination(A, b):
    """Gaussian elimination with partial pivoting."""
    n = len(A)
    A = np.array(A, dtype=float)
    b = np.array(b, dtype=float)
    aug = np.hstack([A, b.reshape(-1, 1)])
    steps = [f"Initial augmented matrix:\n{aug.tolist()}"]

    for i in range(n):
        # Partial pivoting: find row with max absolute value in column i
        max_row = i + np.argmax(np.abs(aug[i:, i]))
        if max_row != i:
            aug[[i, max_row]] = aug[[max_row, i]]
            steps.append(f"Swap R{i+1} ↔ R{max_row+1} (partial pivoting)\n{aug.tolist()}")

        pivot = aug[i][i]
        if abs(pivot) < 1e-12:
            raise ValueError(f"Zero pivot at row {i+1} after pivoting. Matrix may be singular.")

        for j in range(i + 1, n):
            ratio = aug[j][i] / pivot
            aug[j] = aug[j] - ratio * aug[i]
            steps.append(f"R{j+1} → R{j+1} - ({ratio:.4f}) × R{i+1}\n{aug.tolist()}")

    # Back substitution
    x = np.zeros(n)
    for i in range(n - 1, -1, -1):
        x[i] = (aug[i][-1] - np.dot(aug[i][i+1:n], x[i+1:n])) / aug[i][i]
        steps.append(f"x[{i+1}] = {x[i]:.6f}")

    return x.tolist(), steps


def lu_solve(A, b):
    """Solve Ax=b using LU decomposition (Doolittle)."""
    L_list, U_list, steps = lu_decomposition(A)
    n = len(A)
    L = np.array(L_list)
    U = np.array(U_list)
    b = np.array(b, dtype=float)

    steps_res = []
    # Forward substitution: LY = b
    Y = np.zeros(n)
    for i in range(n):
        Y[i] = b[i] - np.dot(L[i, :i], Y[:i])
        steps_res.append(f"Y[{i+1}] = {Y[i]:.6f}")

    # Back substitution: UX = Y
    X = np.zeros(n)
    for i in range(n - 1, -1, -1):
        if abs(U[i, i]) < 1e-12:
            raise ValueError(f"Zero diagonal in U at position ({i},{i}). Matrix may be singular.")
        X[i] = (Y[i] - np.dot(U[i, i+1:], X[i+1:])) / U[i, i]
        steps_res.append(f"X[{i+1}] = {X[i]:.6f}")

    return L_list, U_list, steps + steps_res, X.tolist()

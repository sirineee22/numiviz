import os
import json
import math
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Request, Depends, status
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from asteval import Interpreter

from schemas.practice import (
    ExerciseModel,
    PublicExerciseModel,
    CheckAnswerRequest,
    CheckAnswerResponse,
    ProgressSyncRequest,
    ProgressItem,
)
from database import DatabaseManager

router = APIRouter(prefix="/practice", tags=["practice"])
limiter = Limiter(key_func=get_remote_address)
db_manager = DatabaseManager()

EXERCISES_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "exercises.json",
)

_exercises_cache: Dict[str, Dict[str, Any]] = {}

def get_exercises_dict() -> Dict[str, Dict[str, Any]]:
    global _exercises_cache
    if not _exercises_cache and os.path.exists(EXERCISES_FILE):
        with open(EXERCISES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            _exercises_cache = {item["id"]: item for item in data}
    return _exercises_cache

def safe_eval_expression(expr_str: str) -> Optional[float]:
    if not isinstance(expr_str, str):
        try:
            return float(expr_str)
        except Exception:
            return None

    clean = expr_str.strip()
    if len(clean) > 100:
        return None

    # Replace power syntax
    clean = clean.replace("^", "**")

    # Fast check for simple float
    try:
        return float(clean)
    except ValueError:
        pass

    # Asteval sandbox
    aeval = Interpreter(use_numpy=False, minimal=True)
    # inject safe math functions
    aeval.symtable["sqrt"] = math.sqrt
    aeval.symtable["sin"] = math.sin
    aeval.symtable["cos"] = math.cos
    aeval.symtable["exp"] = math.exp
    aeval.symtable["log"] = math.log
    aeval.symtable["pi"] = math.pi
    aeval.symtable["e"] = math.e

    try:
        val = aeval(clean)
        if isinstance(val, (int, float)) and not math.isnan(val) and not math.isinf(val):
            return float(val)
        return None
    except Exception:
        return None

@router.get("/exercises", response_model=List[PublicExerciseModel])
def list_exercises():
    exercises = get_exercises_dict()
    public_list = []
    for ex in exercises.values():
        public_list.append(
            PublicExerciseModel(
                id=ex["id"],
                chapter=ex["chapter"],
                method=ex["method"],
                difficulty=ex["difficulty"],
                type=ex["type"],
                title=ex["title"],
                statement=ex["statement"],
                params=ex.get("params"),
                tolerance=ex.get("tolerance", 1e-4),
                hints_count=len(ex.get("hints", [])),
                options=ex.get("params", {}).get("options") if ex.get("params") else None,
            )
        )
    return public_list

@router.get("/exercises/{exercise_id}/hint/{level}")
def get_exercise_hint(exercise_id: str, level: int):
    exercises = get_exercises_dict()
    ex = exercises.get(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")

    hints = ex.get("hints", [])
    if level < 1 or level > len(hints):
        raise HTTPException(status_code=400, detail="Invalid hint level")

    return {
        "exercise_id": exercise_id,
        "level": level,
        "hint": hints[level - 1],
        "total_hints": len(hints),
    }

@router.get("/exercises/{exercise_id}/solution")
def get_exercise_solution(exercise_id: str):
    exercises = get_exercises_dict()
    ex = exercises.get(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")

    return {
        "exercise_id": exercise_id,
        "solution": ex.get("solution", ""),
        "common_mistakes": ex.get("common_mistakes"),
    }

@router.post("/check", response_model=CheckAnswerResponse)
@limiter.limit("60/minute")
def check_answer(request: Request, req: CheckAnswerRequest):
    exercises = get_exercises_dict()
    ex = exercises.get(req.exercise_id)
    if not ex:
        return CheckAnswerResponse(
            status="invalid",
            message="Exercise not found.",
        )

    expected = ex["answer"]
    tol = float(ex.get("tolerance", 1e-4))

    # Numeric evaluation
    if isinstance(expected, (int, float)):
        user_val = safe_eval_expression(str(req.answer))
        if user_val is None:
            return CheckAnswerResponse(
                status="invalid",
                message="Please enter a valid numeric value or mathematical expression (e.g., 1.414 or sqrt(2)).",
            )

        diff = abs(user_val - float(expected))
        if diff <= tol:
            return CheckAnswerResponse(
                status="correct",
                message="Excellent! Your answer is correct within tolerance.",
                details=f"Calculated: {user_val:.5f} (error: {diff:.2e})",
                solution=ex.get("solution"),
                expected_magnitude=float(expected),
            )

        # Check sign error
        if abs(abs(user_val) - abs(float(expected))) <= tol:
            return CheckAnswerResponse(
                status="close",
                message="Check your sign (+/-)! The magnitude is exactly right.",
                details=f"Submitted {user_val:.4f}, expected opposite sign.",
            )

        # Check close rounding or step difference
        rel_diff = diff / (abs(float(expected)) + 1e-9)
        if diff <= tol * 25 or rel_diff < 0.05:
            return CheckAnswerResponse(
                status="close",
                message="Very close! Check your rounding precision or step count.",
                details="Your result is near the expected value.",
            )

        return CheckAnswerResponse(
            status="wrong",
            message="Not quite right. Double check your calculation or unlock a hint.",
            details="Consider reviewing the step-by-step formula.",
        )

    # String / Text match
    user_str = str(req.answer).strip().lower()
    expected_str = str(expected).strip().lower()
    if user_str == expected_str:
        return CheckAnswerResponse(
            status="correct",
            message="Spot on! Correct answer.",
            solution=ex.get("solution"),
        )

    return CheckAnswerResponse(
        status="wrong",
        message="Incorrect. Check the spelling or review the theoretical rules.",
    )

@router.get("/progress")
def get_user_progress(user_id: Optional[int] = None):
    if not user_id:
        return {"items": []}

    try:
        rows = db_manager.execute_query(
            "SELECT exercise_id, status, hints_used, attempts, solved_at FROM exercise_progress WHERE user_id = ?",
            (user_id,),
        )
        items = [
            {
                "exercise_id": r["exercise_id"],
                "status": r["status"],
                "hints_used": r["hints_used"],
                "attempts": r["attempts"],
                "solved_at": r["solved_at"],
            }
            for r in rows
        ]
        return {"items": items}
    except Exception as e:
        return {"items": [], "error": str(e)}

@router.post("/progress/sync")
def sync_user_progress(payload: ProgressSyncRequest, user_id: Optional[int] = None):
    if not user_id:
        return {"synced": 0, "message": "Guest progress not persisted to DB"}

    synced = 0
    try:
        for item in payload.items:
            db_manager.execute_update(
                """
                INSERT INTO exercise_progress (user_id, exercise_id, status, hints_used, attempts, solved_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, exercise_id) DO UPDATE SET
                    status = CASE WHEN exercise_progress.status = 'solved' THEN 'solved' ELSE excluded.status END,
                    hints_used = MAX(exercise_progress.hints_used, excluded.hints_used),
                    attempts = exercise_progress.attempts + excluded.attempts,
                    solved_at = COALESCE(exercise_progress.solved_at, excluded.solved_at),
                    last_attempt_at = CURRENT_TIMESTAMP
                """,
                (
                    user_id,
                    item.exercise_id,
                    item.status,
                    item.hints_used,
                    max(1, item.attempts),
                    item.solved_at,
                ),
            )
            synced += 1
        return {"synced": synced, "status": "ok"}
    except Exception as e:
        return {"synced": 0, "error": str(e)}
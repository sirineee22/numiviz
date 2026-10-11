from pydantic import BaseModel, Field
from typing import List, Optional, Union, Dict, Any, Literal

ChapterType = Literal[
    "nonlinear",
    "linear",
    "integration",
    "ode",
    "differentiation",
    "interpolation",
    "eigenvalue"
]

DifficultyType = Literal["easy", "medium", "hard"]
ExerciseKind = Literal["numeric", "next_iteration", "find_error", "mcq"]

class ExerciseParams(BaseModel):
    f: Optional[str] = None
    fxy: Optional[str] = None
    x0: Optional[float] = None
    x1: Optional[float] = None
    y0: Optional[float] = None
    xEnd: Optional[float] = None
    a: Optional[float] = None
    b: Optional[float] = None
    h: Optional[float] = None
    n: Optional[int] = None
    tol: Optional[float] = None
    matrix: Optional[List[List[float]]] = None
    vector: Optional[List[float]] = None
    shift: Optional[float] = None
    points: Optional[List[Dict[str, float]]] = None
    options: Optional[List[str]] = None

    model_config = {"extra": "allow"}

class ExerciseModel(BaseModel):
    id: str
    chapter: ChapterType
    method: str
    difficulty: DifficultyType
    type: ExerciseKind
    title: str
    statement: str
    params: Optional[ExerciseParams] = None
    answer: Union[float, int, str]
    tolerance: float = 1e-4
    hints: List[str] = Field(default_factory=list)
    solution: str
    common_mistakes: Optional[str] = None

class PublicExerciseModel(BaseModel):
    id: str
    chapter: ChapterType
    method: str
    difficulty: DifficultyType
    type: ExerciseKind
    title: str
    statement: str
    params: Optional[ExerciseParams] = None
    tolerance: float = 1e-4
    hints_count: int = 0
    options: Optional[List[str]] = None

class CheckAnswerRequest(BaseModel):
    exercise_id: str
    answer: Union[float, int, str]

class CheckAnswerResponse(BaseModel):
    status: Literal["correct", "close", "wrong", "invalid"]
    message: str
    details: Optional[str] = None
    solution: Optional[str] = None
    expected_magnitude: Optional[float] = None

class ProgressItem(BaseModel):
    exercise_id: str
    status: Literal["unsolved", "attempted", "solved"]
    hints_used: int = 0
    attempts: int = 0
    solved_at: Optional[str] = None

class ProgressSyncRequest(BaseModel):
    items: List[ProgressItem]

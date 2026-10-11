import os
import json
import pytest
from schemas.practice import ExerciseModel

def test_exercises_file_exists():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(backend_dir, "data", "exercises.json")
    assert os.path.exists(path), f"exercises.json not found at {path}"

def test_all_exercises_valid_schema():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(backend_dir, "data", "exercises.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert len(data) >= 50, f"Expected at least 50 exercises, found {len(data)}"

    chapters = set()
    for item in data:
        # Validate Pydantic schema
        model = ExerciseModel(**item)
        assert model.id
        assert model.title
        assert model.statement
        assert model.solution
        assert len(model.hints) >= 1
        chapters.add(model.chapter)

    # Ensure all primary chapters represented
    expected_chapters = {"nonlinear", "linear", "integration", "ode", "differentiation", "interpolation", "eigenvalue"}
    assert expected_chapters.issubset(chapters), f"Missing chapters: {expected_chapters - chapters}"

def test_todo_report_generated():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    report_path = os.path.join(backend_dir, "data", "migration_todo_report.json")
    assert os.path.exists(report_path)
    with open(report_path, "r", encoding="utf-8") as f:
        report = json.load(f)
    assert isinstance(report, list)
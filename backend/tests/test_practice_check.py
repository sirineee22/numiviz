import pytest
from fastapi.testclient import TestClient
import os
import sys

# Ensure backend root on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app

client = TestClient(app)

def test_get_exercises_list_public():
    res = client.get("/practice/exercises")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 50
    first = data[0]
    # Check fields
    assert "id" in first
    assert "chapter" in first
    assert "method" in first
    assert "statement" in first
    assert "hints_count" in first
    # Ensure answer and solution are NOT exposed
    assert "answer" not in first
    assert "solution" not in first

def test_check_answer_correct():
    # s-nl-1: Newton first iteration for x^2 - 2 at x0=2 -> answer is 1.5
    res = client.post("/practice/check", json={"exercise_id": "s-nl-1", "answer": 1.5})
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "correct"
    assert "solution" in body
    assert body["solution"] is not None

def test_check_answer_with_math_expression():
    # s-lin-1: answer is 2, submitted as "4/2" or "sqrt(4)"
    res = client.post("/practice/check", json={"exercise_id": "s-lin-1", "answer": "sqrt(4)"})
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "correct"

def test_check_answer_close_sign_error():
    # s-nl-1: answer is 1.5, submitted as -1.5
    res = client.post("/practice/check", json={"exercise_id": "s-nl-1", "answer": -1.5})
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "close"
    assert "sign" in body["message"].lower()

def test_check_answer_close_rounding():
    # nl-newton-001: answer is 2.236068, submitted as 2.236
    res = client.post("/practice/check", json={"exercise_id": "nl-newton-001", "answer": 2.236})
    assert res.status_code == 200
    body = res.json()
    assert body["status"] in ("close", "correct")

def test_check_answer_wrong():
    res = client.post("/practice/check", json={"exercise_id": "s-nl-1", "answer": 999.0})
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "wrong"

def test_check_answer_invalid_expression_never_500():
    res = client.post("/practice/check", json={"exercise_id": "s-nl-1", "answer": "syntax_error***))"})
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "invalid"
    assert "valid" in body["message"].lower()

def test_progressive_hints():
    # Level 1
    res = client.get("/practice/exercises/s-nl-1/hint/1")
    assert res.status_code == 200
    assert "hint" in res.json()
    # Level 2
    res2 = client.get("/practice/exercises/s-nl-1/hint/2")
    assert res2.status_code == 200
    assert "hint" in res2.json()

def test_solution_endpoint():
    res = client.get("/practice/exercises/s-nl-1/solution")
    assert res.status_code == 200
    assert "solution" in res.json()
from fastapi import APIRouter, HTTPException
from database import db_manager

router = APIRouter()

@router.get("/api/dashboard/stats/{enseignant_id}")
def get_dashboard_stats(enseignant_id: int):
    try:
        # Total students registered in the platform
        students_query = """
            SELECT COUNT(*) as total_students
            FROM utilisateur
            WHERE role IN ('etudiant', 'student') AND actif = 1
        """
        total_students_result = db_manager.execute_query(students_query)
        total_students = total_students_result[0]['total_students'] if total_students_result else 0

        # Active modules belonging to this teacher
        modules_query = """
            SELECT COUNT(*) as active_modules
            FROM module
            WHERE id_enseignant = ? AND actif = 1
        """
        active_modules_result = db_manager.execute_query(modules_query, (enseignant_id,))
        active_modules = active_modules_result[0]['active_modules'] if active_modules_result else 0

        # Average quiz success rate across modules owned by this teacher
        # Joins score_quiz → module via module_title
        success_rate_query = """
            SELECT m.id_module, m.titre as name, AVG(sq.score) as successRate
            FROM module m
            LEFT JOIN score_quiz sq ON sq.module_title = m.titre
            WHERE m.id_enseignant = ? AND m.actif = 1
            GROUP BY m.id_module, m.titre
        """
        module_success_result = db_manager.execute_query(success_rate_query, (enseignant_id,))
        module_success = [
            {
                "id_module": row["id_module"],
                "name": row["name"],
                "successRate": round(row["successRate"], 2) if row["successRate"] is not None else 0.0
            }
            for row in module_success_result
        ]

        avg_success = (
            sum(m["successRate"] for m in module_success) / len(module_success)
            if module_success else 0.0
        )

        return {
            "totalStudents": total_students,
            "activeModules": active_modules,
            "averageSuccessRate": round(avg_success, 2),
            "assignmentsToGrade": 0,
            "moduleSuccess": module_success
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve dashboard stats: {e}")

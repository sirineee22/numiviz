import sqlite3
import os
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.db_path = os.getenv('SQLITE_DB_PATH', 'numiviz.db')
        self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        self.lock = threading.Lock()
        self.create_tables()

    def create_tables(self):
        try:
            with self.lock:
                cursor = self.connection.cursor()
                # Table Utilisateur
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS utilisateur (
                        id_utilisateur INTEGER PRIMARY KEY AUTOINCREMENT,
                        nom TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        mot_de_passe TEXT NOT NULL,
                        role TEXT NOT NULL,
                        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        derniere_connexion TIMESTAMP,
                        actif BOOLEAN DEFAULT 1
                    )
                ''')
                # Table Module
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS module (
                        id_module INTEGER PRIMARY KEY AUTOINCREMENT,
                        titre TEXT NOT NULL,
                        type TEXT NOT NULL,
                        description TEXT,
                        contenu TEXT,
                        id_enseignant INTEGER,
                        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        actif BOOLEAN DEFAULT 1,
                        categorie TEXT,
                        niveau TEXT,
                        duree TEXT,
                        objectifs TEXT,
                        FOREIGN KEY (id_enseignant) REFERENCES utilisateur(id_utilisateur)
                    )
                ''')
                
                # Table Quiz
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS quiz (
                        id_quiz INTEGER PRIMARY KEY AUTOINCREMENT,
                        titre TEXT NOT NULL,
                        id_module INTEGER,
                        questions TEXT,
                        reponses TEXT,
                        reponse_correcte TEXT,
                        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        auteur TEXT,
                        actif BOOLEAN DEFAULT 1,
                        FOREIGN KEY (id_module) REFERENCES module(id_module)
                    )
                ''')

                # Table Quiz Question
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS quiz_question (
                        id_question INTEGER PRIMARY KEY AUTOINCREMENT,
                        id_quiz INTEGER,
                        enonce TEXT NOT NULL,
                        choix TEXT,
                        bonnes_reponses TEXT,
                        FOREIGN KEY (id_quiz) REFERENCES quiz(id_quiz)
                    )
                ''')

                # Table ScoreQuiz
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS score_quiz (
                        id_score INTEGER PRIMARY KEY AUTOINCREMENT,
                        id_utilisateur INTEGER NOT NULL,
                        id_quiz INTEGER NULL,
                        module_title TEXT NOT NULL,
                        lesson_title TEXT NOT NULL,
                        score REAL NOT NULL,
                        total_questions INTEGER NOT NULL,
                        answers TEXT NOT NULL,
                        passed BOOLEAN DEFAULT 0,
                        date_passage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
                    )
                ''')

                # Table Leçon
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS lecon (
                        id_lecon INTEGER PRIMARY KEY AUTOINCREMENT,
                        titre TEXT NOT NULL,
                        description TEXT,
                        duree TEXT,
                        niveau TEXT,
                        contenu TEXT NOT NULL,
                        id_module INTEGER,
                        id_enseignant INTEGER,
                        ordre INTEGER DEFAULT 0,
                        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        actif BOOLEAN DEFAULT 1,
                        FOREIGN KEY (id_module) REFERENCES module(id_module),
                        FOREIGN KEY (id_enseignant) REFERENCES utilisateur(id_utilisateur)
                    )
                ''')
                # Table Visualisation
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS visualisation (
                        id_visualisation INTEGER PRIMARY KEY AUTOINCREMENT,
                        type TEXT NOT NULL,
                        parametres TEXT,
                        id_module INTEGER,
                        id_lecon INTEGER,
                        titre TEXT,
                        description TEXT,
                        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        actif BOOLEAN DEFAULT 1,
                        FOREIGN KEY (id_module) REFERENCES module(id_module),
                        FOREIGN KEY (id_lecon) REFERENCES lecon(id_lecon)
                    )
                ''')
                # Table Exercice
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS exercice (
                        id_exercice INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        description TEXT,
                        difficulty TEXT DEFAULT 'moyen',
                        type TEXT DEFAULT 'calcul',
                        points INTEGER DEFAULT 5,
                        estimatedTime TEXT,
                        instructions TEXT NOT NULL,
                        solution TEXT,
                        hints TEXT,
                        question TEXT,
                        feedback TEXT,
                        id_module INTEGER,
                        id_lecon INTEGER,
                        id_enseignant INTEGER,
                        tp TEXT, -- Ajout colonne TP
                        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        actif BOOLEAN DEFAULT 1,
                        FOREIGN KEY (id_module) REFERENCES module(id_module),
                        FOREIGN KEY (id_lecon) REFERENCES lecon(id_lecon),
                        FOREIGN KEY (id_enseignant) REFERENCES utilisateur(id_utilisateur)
                    )
                ''')
                # Migration: add 'tp' column if missing
                cursor.execute("PRAGMA table_info(exercice)")
                columns = [row[1] for row in cursor.fetchall()]
                if 'tp' not in columns:
                    cursor.execute("ALTER TABLE exercice ADD COLUMN tp TEXT")
                # Table Progression Étudiant
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS progression_etudiant (
                        id_progression INTEGER PRIMARY KEY AUTOINCREMENT,
                        id_etudiant INTEGER,
                        id_module INTEGER,
                        id_lecon INTEGER,
                        id_exercice INTEGER,
                        statut TEXT DEFAULT 'non_complete',
                        score INTEGER DEFAULT 0,
                        temps_passe INTEGER DEFAULT 0,
                        date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        date_fin TIMESTAMP,
                        reponses TEXT,
                        FOREIGN KEY (id_etudiant) REFERENCES utilisateur(id_utilisateur),
                        FOREIGN KEY (id_module) REFERENCES module(id_module),
                        FOREIGN KEY (id_lecon) REFERENCES lecon(id_lecon),
                        FOREIGN KEY (id_exercice) REFERENCES exercice(id_exercice)
                    )
                ''')
                # Table Linear System History
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS linear_system_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        id_utilisateur INTEGER,
                        equation1 TEXT NOT NULL,
                        equation2 TEXT NOT NULL,
                        solution_type TEXT NOT NULL,
                        solution_x REAL,
                        solution_y REAL,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
                    )
                ''')
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS user_lesson_progress (
                        user_id INTEGER NOT NULL,
                        lesson_id INTEGER NOT NULL,
                        module_id INTEGER NOT NULL,
                        completed BOOLEAN DEFAULT 0,
                        completion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (user_id, lesson_id),
                        FOREIGN KEY (user_id) REFERENCES utilisateur(id_utilisateur),
                        FOREIGN KEY (lesson_id) REFERENCES lecon(id_lecon),
                        FOREIGN KEY (module_id) REFERENCES module(id_module)
                    )
                ''')

                # Table Documents
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS document (
                        id_document INTEGER PRIMARY KEY AUTOINCREMENT,
                        filename TEXT NOT NULL,
                        file_path TEXT NOT NULL,
                        document_type TEXT NOT NULL, -- 'exam' or 'tp'
                        id_enseignant INTEGER,
                        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        actif BOOLEAN DEFAULT 1,
                        FOREIGN KEY (id_enseignant) REFERENCES utilisateur(id_utilisateur)
                    )
                ''')

                # Table Calendar Events
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS calendar_events (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        date TEXT NOT NULL,
                        type TEXT NOT NULL,
                        id_enseignant INTEGER,
                        FOREIGN KEY (id_enseignant) REFERENCES utilisateur(id_utilisateur)
                    )
                ''')

                # Table Unlocked Lessons (required by main.py unlock logic)
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS unlocked_lessons (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        module_id INTEGER NOT NULL,
                        lesson_id INTEGER NOT NULL,
                        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(user_id, module_id, lesson_id),
                        FOREIGN KEY (user_id) REFERENCES utilisateur(id_utilisateur),
                        FOREIGN KEY (module_id) REFERENCES module(id_module),
                        FOREIGN KEY (lesson_id) REFERENCES lecon(id_lecon)
                    )
                ''')

                # Table exercise_progress (Practice trainer)
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS exercise_progress (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        exercise_id TEXT NOT NULL,
                        status TEXT NOT NULL,
                        hints_used INTEGER DEFAULT 0,
                        attempts INTEGER DEFAULT 1,
                        last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        solved_at TIMESTAMP,
                        UNIQUE(user_id, exercise_id),
                        FOREIGN KEY (user_id) REFERENCES utilisateur(id_utilisateur)
                    )
                ''')

                # Table Calculation History (for iterative solver history)
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS calc_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        id_utilisateur INTEGER,
                        method TEXT NOT NULL,
                        category TEXT NOT NULL,
                        problem TEXT NOT NULL,
                        params TEXT,
                        result TEXT,
                        iterations INTEGER,
                        converged BOOLEAN,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
                    )
                ''')

                self.connection.commit()
                logger.info("SQLite database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
            self.connection.rollback()
            raise

    def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict]:
        try:
            with self.lock:
                cursor = self.connection.cursor()
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                if query.strip().upper().startswith('SELECT'):
                    rows = cursor.fetchall()
                    return [dict(row) for row in rows]
                else:
                    self.connection.commit()
                    if query.strip().upper().startswith('INSERT'):
                        return [dict(cursor.execute('SELECT last_insert_rowid() as id').fetchone())]
                    return []
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            self.connection.rollback()
            raise

    def close(self):
        if self.connection:
            self.connection.close()
            logger.info("SQLite database connection closed")

# Global database instance
db_manager = DatabaseManager()
export type Chapter =
  | 'nonlinear'
  | 'linear'
  | 'integration'
  | 'ode'
  | 'differentiation'
  | 'interpolation'
  | 'eigenvalue';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type ExerciseType = 'numeric' | 'next_iteration' | 'find_error' | 'mcq';

export interface ExerciseParams {
  f?: string;
  fxy?: string;
  x0?: number;
  x1?: number;
  y0?: number;
  xEnd?: number;
  a?: number;
  b?: number;
  h?: number;
  n?: number;
  tol?: number;
  matrix?: number[][];
  vector?: number[];
  shift?: number;
  points?: { x: number; y: number }[];
  options?: string[];
  [key: string]: unknown;
}

export interface PublicExercise {
  id: string;
  chapter: Chapter;
  method: string;
  difficulty: Difficulty;
  type: ExerciseType;
  title: string;
  statement: string;
  params?: ExerciseParams;
  tolerance?: number;
  hints_count: number;
  options?: string[];
}

export interface CheckAnswerResult {
  status: 'correct' | 'close' | 'wrong' | 'invalid';
  message: string;
  details?: string;
  solution?: string;
  expected_magnitude?: number;
}

export interface ExerciseProgress {
  exercise_id: string;
  status: 'unsolved' | 'attempted' | 'solved';
  hints_used: number;
  attempts: number;
  solved_at?: string;
}
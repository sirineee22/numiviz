import React, { useState, useMemo } from "react";
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface StudentExerciseAnswerProps {
  question: string;
  solution: string;
}

const cleanLatex = (s: string): string => {
  if (!s) return '';
  let res = s.replace(/\\{2,}([a-zA-Z]+)/g, '\\$1');
  res = res.replace(/\\{3,}/g, '\\\\');
  return res.trim();
};

const renderWithLatex = (content: string) => {
  if (!content) return null;
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
  const parts = content.split(regex);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const raw = part.slice(2, -2);
          const math = cleanLatex(raw);
          return (
            <BlockMath
              key={index}
              math={math}
              renderError={() => (
                <pre className="p-2 text-xs text-amber-700 bg-amber-50 rounded font-mono overflow-x-auto my-2">
                  {raw}
                </pre>
              )}
            />
          );
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const raw = part.slice(1, -1);
          const math = cleanLatex(raw);
          return (
            <InlineMath
              key={index}
              math={math}
              renderError={() => (
                <code className="text-xs text-amber-700 bg-amber-50 px-1 rounded font-mono">
                  {raw}
                </code>
              )}
            />
          );
        }
        return <span key={index} className="whitespace-pre-wrap">{part}</span>;
      })}
    </span>
  );
};

export default function StudentExerciseAnswer({ question, solution }: StudentExerciseAnswerProps) {
  const [studentAnswer, setStudentAnswer] = useState("");
  const [showSolution, setShowSolution] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStudentAnswer("");
  };

  const renderedQuestion = useMemo(() => renderWithLatex(question), [question]);
  const renderedSolution = useMemo(() => 
    solution ? renderWithLatex(solution) : null
  , [solution]);

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Énoncé :</h3>
        <div className="prose max-w-none">
          {renderedQuestion}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
          Votre réponse :
        </label>
        <textarea
          id="answer"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          value={studentAnswer}
          onChange={e => setStudentAnswer(e.target.value)}
          placeholder="Écrivez votre réponse ici..."
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={!studentAnswer.trim()}
          >
            Soumettre
          </button>
        </div>
      </form>

      {solution && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {showSolution ? 'Masquer la solution' : 'Afficher la solution'}
          </button>
          
          {showSolution && (
            <div className="mt-3 p-4 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Solution :</h4>
              <div className="prose max-w-none">
                {renderedSolution}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

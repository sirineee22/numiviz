import React, { useRef, useId, useState } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Eye, ChevronDown, ChevronUp } from 'lucide-react';

export interface MathSymbolBtn {
  label: string;
  tooltip: string;
  insert: string;
  cursorOffset?: number; // Cursor position from the end of inserted string (e.g. -1 for inside parentheses)
  category?: 'power' | 'func' | 'op' | 'constant';
}

export const MATH_SYMBOLS: MathSymbolBtn[] = [
  // Puissances & Racines
  { label: 'x²', tooltip: 'Mettre au carré (^2)', insert: '^2', category: 'power' },
  { label: 'x³', tooltip: 'Mettre au cube (^3)', insert: '^3', category: 'power' },
  { label: 'xⁿ', tooltip: 'Exposant quelconque (^)', insert: '^', category: 'power' },
  { label: '√x', tooltip: 'Racine carrée sqrt(...)', insert: 'sqrt()', cursorOffset: -1, category: 'power' },
  
  // Exponentielle & Logarithme
  { label: 'eˣ', tooltip: 'Exponentielle exp(...)', insert: 'exp()', cursorOffset: -1, category: 'func' },
  { label: 'ln(x)', tooltip: 'Logarithme naturel log(...)', insert: 'log()', cursorOffset: -1, category: 'func' },
  
  // Trigonométrie
  { label: 'sin', tooltip: 'Sinus sin(...)', insert: 'sin()', cursorOffset: -1, category: 'func' },
  { label: 'cos', tooltip: 'Cosinus cos(...)', insert: 'cos()', cursorOffset: -1, category: 'func' },
  { label: 'tan', tooltip: 'Tangente tan(...)', insert: 'tan()', cursorOffset: -1, category: 'func' },
  { label: '|x|', tooltip: 'Valeur absolue abs(...)', insert: 'abs()', cursorOffset: -1, category: 'func' },
  
  // Constantes & Parenthèses
  { label: 'π', tooltip: 'Nombre Pi (pi)', insert: 'pi', category: 'constant' },
  { label: '( )', tooltip: 'Parenthèses', insert: '()', cursorOffset: -1, category: 'op' },
  { label: '×', tooltip: 'Multiplication (*)', insert: '*', category: 'op' },
  { label: '÷', tooltip: 'Division (/)', insert: '/', category: 'op' },
];

/**
 * Converts a raw text formula (e.g. "x**3 - 2*x + sqrt(x)") into LaTeX for KaTeX preview
 */
export function rawToLatex(expr: string): string {
  if (!expr || !expr.trim()) return '';
  let s = expr.trim();

  // Replace powers ** or ^
  s = s.replace(/\*\*([0-9a-zA-Z]+)/g, '^{$1}');
  s = s.replace(/\^([0-9a-zA-Z]+)/g, '^{$1}');
  
  // Functions
  s = s.replace(/sqrt\(([^)]*)\)/g, '\\sqrt{$1}');
  s = s.replace(/exp\(([^)]*)\)/g, 'e^{$1}');
  s = s.replace(/log\(([^)]*)\)/g, '\\ln($1)');
  s = s.replace(/sin\(([^)]*)\)/g, '\\sin($1)');
  s = s.replace(/cos\(([^)]*)\)/g, '\\cos($1)');
  s = s.replace(/tan\(([^)]*)\)/g, '\\tan($1)');
  s = s.replace(/abs\(([^)]*)\)/g, '|$1|');
  
  // Constants
  s = s.replace(/\bpi\b/g, '\\pi');
  
  // Clean products
  s = s.replace(/([0-9]+)\*([a-zA-Z])/g, '$1 $2');
  s = s.replace(/\*/g, ' \\cdot ');

  // Clean hanging ^ if user is typing
  if (s.endsWith('^')) {
    s += '{\\Box}';
  }

  return s;
}

export interface MathToolbarProps {
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

/**
 * MathToolbar
 * Visual bar of math helper buttons that insert power, root, and math symbols
 * at the current cursor location in an attached input.
 */
export const MathToolbar: React.FC<MathToolbarProps> = ({
  inputRef,
  value,
  onChange,
  className = '',
}) => {
  const handleInsert = (btn: MathSymbolBtn) => {
    const input = inputRef.current;
    if (!input) {
      onChange(value + btn.insert);
      return;
    }

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end);

    let insertion = btn.insert;
    let offset = btn.cursorOffset ?? 0;

    // Smart wrapping if user selected text and clicks () or sqrt() or abs()
    if (selectedText) {
      if (btn.insert === '()') {
        insertion = `(${selectedText})`;
        offset = 0;
      } else if (btn.insert === 'sqrt()') {
        insertion = `sqrt(${selectedText})`;
        offset = 0;
      } else if (btn.insert === 'exp()') {
        insertion = `exp(${selectedText})`;
        offset = 0;
      } else if (btn.insert === 'abs()') {
        insertion = `abs(${selectedText})`;
        offset = 0;
      } else if (btn.insert === '^2') {
        insertion = `(${selectedText})^2`;
        offset = 0;
      }
    }

    const newValue = value.slice(0, start) + insertion + value.slice(end);
    onChange(newValue);

    // Reposition cursor
    setTimeout(() => {
      input.focus();
      const newPos = start + insertion.length + offset;
      input.setSelectionRange(newPos, newPos);
    }, 10);
  };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-100/80 backdrop-blur-sm rounded-xl border border-stone-200/90 shadow-2xs ${className}`}>
      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider px-1 hidden sm:inline">
        Symboles :
      </span>
      {MATH_SYMBOLS.map((btn, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => handleInsert(btn)}
          title={btn.tooltip}
          className={`h-7 px-2 text-xs font-semibold rounded-lg border transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs ${
            btn.category === 'power'
              ? 'bg-blue-50/90 hover:bg-blue-600 hover:text-white border-blue-200/80 text-blue-800'
              : btn.category === 'func'
              ? 'bg-indigo-50/90 hover:bg-indigo-600 hover:text-white border-indigo-200/80 text-indigo-800'
              : btn.category === 'constant'
              ? 'bg-amber-50/90 hover:bg-amber-600 hover:text-white border-amber-200/80 text-amber-800'
              : 'bg-white hover:bg-stone-200 border-stone-200 text-stone-700'
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};

export interface MathInputWithToolbarProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  helperText?: string;
  className?: string;
  inputClassName?: string;
  showPreview?: boolean;
  prefix?: string;
}

/**
 * MathInputWithToolbar
 * Full-featured input component with:
 * 1. Quick-insert Math Toolbar
 * 2. Real-time KaTeX LaTeX preview
 * 3. Cursor management
 */
export const MathInputWithToolbar: React.FC<MathInputWithToolbarProps> = ({
  label,
  value,
  onChange,
  placeholder = 'ex: x^3 - 2*x - 5',
  helperText = 'Cliquez sur un symbole pour insérer une puissance, racine ou fonction.',
  className = '',
  inputClassName = '',
  showPreview = true,
  prefix = 'f(x) =',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [showToolbar, setShowToolbar] = useState(true);

  const latex = showPreview ? rawToLatex(value) : '';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Toolbar Toggle */}
      <div className="flex items-center justify-between">
        {label && (
          <Label htmlFor={id} className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span>{label}</span>
          </Label>
        )}
        <button
          type="button"
          onClick={() => setShowToolbar(!showToolbar)}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>{showToolbar ? 'Masquer la barre' : 'Barre d’outils mathématique'}</span>
          {showToolbar ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Quick-insert Toolbar */}
      {showToolbar && (
        <MathToolbar inputRef={inputRef} value={value} onChange={onChange} />
      )}

      {/* Input Field */}
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`font-mono text-sm bg-white border-stone-300 focus-visible:ring-blue-500 rounded-xl shadow-2xs ${inputClassName}`}
        />
      </div>

      {/* Live KaTeX Preview */}
      {showPreview && value.trim() && (
        <div className="px-3 py-1.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto text-blue-950 font-medium">
            <span className="text-[10px] uppercase font-bold text-blue-600 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Aperçu :
            </span>
            <span className="text-sm">
              <InlineMath 
                math={`${prefix ? prefix + ' ' : ''}${latex || value}`} 
                renderError={(_error) => (
                  <span className="font-mono text-xs text-stone-500">{value}</span>
                )}
              />
            </span>
          </div>
          <span className="text-[10px] text-stone-600 hidden sm:inline">
            Aperçu LaTeX
          </span>
        </div>
      )}

      {/* Helper text */}
      {helperText && (
        <p className="text-[11px] text-stone-600">{helperText}</p>
      )}
    </div>
  );
};

export default MathToolbar;

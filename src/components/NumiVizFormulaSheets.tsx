import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { FORMULA_SHEETS, FormulaSheet } from '@/data/formulaSheets';

// Map lab tool names to application routes if available
const LAB_TOOL_ROUTES: Record<string, string> = {
  'Newton-Raphson': '/tools/newton',
  'Bisection Method': '/tools/bisection',
  'Fixed Point Iteration': '/tools/fixedpoint',
  'Secant Method': '/tools/secant',
  '2×2 Graphical Solver': '/tools/linear-2x2',
  'Jacobi Iteration': '/tools/jacobi',
  'Gauss-Seidel': '/tools/gauss-seidel',
  'Matrix Algebra Lab': '/tools/matrix-lab',
  'Trapezoidal Rule': '/tools/trapezoidal',
  "Simpson's 1/3 Rule": '/tools/simpson13',
  "Simpson's 3/8 Rule": '/tools/simpson38',
  'Euler Method': '/tools/euler',
  'Runge-Kutta 4 (RK4)': '/tools/rk4',
  'Finite Differences (forward, backward, central)': '/tools/differentiation',
};

// Component to parse $math$ inline expressions and render with KaTeX
export const RichText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\$[^$]+\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          return <InlineMath key={i} math={math} />;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};

export default function NumiVizFormulaSheets() {
  const ids = FORMULA_SHEETS.map(s => s.id);
  const [activeId, setActiveId] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return ids.includes(hash) ? hash : ids[0];
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Sync hash with location
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (ids.includes(hash)) {
        setActiveId(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [ids]);

  const selectTab = (id: string) => {
    setActiveId(id);
    try {
      window.history.replaceState(null, '', '#' + id);
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = ids.indexOf(activeId);
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % ids.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + ids.length) % ids.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = ids.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    selectTab(ids[nextIndex]);
  };

  const handleCopy = (tex: string, key: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tex).then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1400);
      }).catch(() => {
        fallbackCopy(tex, key);
      });
    } else {
      fallbackCopy(tex, key);
    }
  };

  const fallbackCopy = (tex: string, key: string) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = tex;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1400);
      }
    } catch {}
  };

  const currentSheet = FORMULA_SHEETS.find(s => s.id === activeId) || FORMULA_SHEETS[0];

  return (
    <div className="seyes-root">
      <div className="wrap">
        <h1 className="sr-only">NumiViz formula sheets</h1>
        <p className="brand">
          <b>NumiViz</b> · Formula sheets
        </p>

        {/* Top Folder Tabs */}
        <div 
          className="tabs" 
          id="tabs" 
          role="tablist" 
          aria-label="Chapters"
          ref={tabsRef}
          onKeyDown={handleKeyDown}
        >
          {FORMULA_SHEETS.map(s => {
            const isSelected = s.id === activeId;
            return (
              <button
                key={s.id}
                className="tab"
                type="button"
                role="tab"
                id={`t-${s.id}`}
                data-id={s.id}
                aria-controls={`p-${s.id}`}
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => selectTab(s.id)}
              >
                {s.tab}
              </button>
            );
          })}
        </div>

        {/* Active Notebook Sheet Panel */}
        <div id="panels">
          <section
            className="panel"
            role="tabpanel"
            id={`p-${currentSheet.id}`}
            data-id={currentSheet.id}
            aria-labelledby={`t-${currentSheet.id}`}
          >
            <div className="sheet">
              
              {/* Sheet Header */}
              <div className="s-head">
                <div className="margin">
                  <p className="kicker">Lab tools</p>
                  <ul className="lab">
                    {currentSheet.lab && currentSheet.lab.length > 0 ? (
                      currentSheet.lab.map((tool, idx) => {
                        const route = LAB_TOOL_ROUTES[tool];
                        return (
                          <li key={idx}>
                            {route ? (
                              <Link to={route} title={`Open ${tool} in Lab`}>
                                {tool}
                              </Link>
                            ) : (
                              tool
                            )}
                          </li>
                        );
                      })
                    ) : (
                      <li className="soon">Planned for the Lab</li>
                    )}
                  </ul>
                </div>

                <div className="s-title">
                  <h2>{currentSheet.title}</h2>
                  <p className="fr">{currentSheet.fr}</p>
                  <p className="goal">
                    <span className="lbl">Goal</span>
                    <RichText text={currentSheet.goal} />
                  </p>
                </div>
              </div>

              <div style={{ height: '2.2rem' }}></div>

              {/* Methods List */}
              {currentSheet.methods.map((m, mIdx) => (
                <article key={mIdx} className="method">
                  {/* Left Margin: Facts */}
                  <div className="margin">
                    <dl className="facts">
                      {m.facts.map(([label, value], fIdx) => (
                        <div key={fIdx}>
                          <dt>{label}</dt>
                          <dd><RichText text={value} /></dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Right Header */}
                  <header className="m-head">
                    <h3><RichText text={m.name} /></h3>
                    <span className="tag">{m.tag}</span>
                  </header>

                  {/* Right Body */}
                  <div className="m-body">
                    {/* Formulas */}
                    {m.formulas.map((f, fIdx) => (
                      <div key={fIdx} className={`f ${f.key ? 'key' : ''}`}>
                        <div className="f-head">
                          <span className="lbl"><RichText text={f.label} /></span>
                          <button
                            type="button"
                            className="copy"
                            data-tex={f.tex}
                            data-state={copiedKey === `${mIdx}-${fIdx}` ? 'done' : undefined}
                            onClick={() => handleCopy(f.tex, `${mIdx}-${fIdx}`)}
                            aria-label="Copy LaTeX source"
                          >
                            {copiedKey === `${mIdx}-${fIdx}` ? 'Copied' : 'TeX'}
                          </button>
                        </div>
                        <div className="math">
                          <div className="m" data-display="1">
                            <BlockMath math={f.tex} />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Method Notes */}
                    {m.notes && m.notes.length > 0 && (
                      <ul className="notes">
                        {m.notes.map((note, nIdx) => (
                          <li key={nIdx}><RichText text={note} /></li>
                        ))}
                      </ul>
                    )}

                    {/* Method Table */}
                    {m.table && (
                      <div className="tbl-wrap">
                        <table>
                          <caption>{m.table.title}</caption>
                          <thead>
                            <tr>
                              {m.table.head.map((h, hIdx) => (
                                <th key={hIdx} scope="col"><RichText text={h} /></th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {m.table.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  cIdx === 0 ? (
                                    <th key={cIdx} scope="row"><RichText text={cell} /></th>
                                  ) : (
                                    <td key={cIdx}><RichText text={cell} /></td>
                                  )
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Watch out warning */}
                    {m.watch && (
                      <p className="watch">
                        <b>Watch out:</b> <RichText text={m.watch} />
                      </p>
                    )}
                  </div>
                </article>
              ))}

              {/* Common Section (Cheat Box) */}
              {currentSheet.common && (
                <article className="method common">
                  <div className="margin">
                    <dl className="facts">
                      {currentSheet.common.facts.map(([k, v], fIdx) => (
                        <div key={fIdx}>
                          <dt>{k}</dt>
                          <dd><RichText text={v} /></dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <header className="m-head">
                    <h3><RichText text={currentSheet.common.title} /></h3>
                    <span className="tag">{currentSheet.common.tag}</span>
                  </header>

                  <div className="m-body">
                    {currentSheet.common.formulas.map((f, fIdx) => (
                      <div key={fIdx} className={`f ${f.key ? 'key' : ''}`}>
                        <div className="f-head">
                          <span className="lbl"><RichText text={f.label} /></span>
                          <button
                            type="button"
                            className="copy"
                            data-tex={f.tex}
                            data-state={copiedKey === `common-${fIdx}` ? 'done' : undefined}
                            onClick={() => handleCopy(f.tex, `common-${fIdx}`)}
                            aria-label="Copy LaTeX source"
                          >
                            {copiedKey === `common-${fIdx}` ? 'Copied' : 'TeX'}
                          </button>
                        </div>
                        <div className="math">
                          <div className="m" data-display="1">
                            <BlockMath math={f.tex} />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Common Table */}
                    {currentSheet.common.table && (
                      <div className="tbl-wrap">
                        <table>
                          <caption>{currentSheet.common.table.title}</caption>
                          <thead>
                            <tr>
                              {currentSheet.common.table.head.map((h, hIdx) => (
                                <th key={hIdx} scope="col"><RichText text={h} /></th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentSheet.common.table.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                  cIdx === 0 ? (
                                    <th key={cIdx} scope="row"><RichText text={cell} /></th>
                                  ) : (
                                    <td key={cIdx}><RichText text={cell} /></td>
                                  )
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Common Watch */}
                    {currentSheet.common.watch && (
                      <p className="watch">
                        <b>Watch out:</b> <RichText text={currentSheet.common.watch} />
                      </p>
                    )}
                  </div>
                </article>
              )}

              {/* Notation Footer */}
              {currentSheet.notation && currentSheet.notation.length > 0 && (
                <div className="notation">
                  <span className="lbl">Notation</span>
                  {currentSheet.notation.map((item, nIdx) => (
                    <span key={nIdx}><RichText text={item} /></span>
                  ))}
                </div>
              )}

            </div>
          </section>
        </div>

        <p className="hint">The TeX button on each formula copies its LaTeX source.</p>
      </div>
    </div>
  );
}

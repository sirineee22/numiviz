import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export function MathText({ text }: { text: string }) {
  if (!text) return null;

  // Split by $$...$$ (block math) first, then $...$ (inline math)
  const blockParts = text.split(/(\$\$[\s\S]*?\$\$)/g);

  return (
    <span className="leading-relaxed">
      {blockParts.map((blockPart, bIdx) => {
        if (blockPart.startsWith('$$') && blockPart.endsWith('$$')) {
          const math = blockPart.slice(2, -2).trim();
          return <BlockMath key={bIdx} math={math} />;
        }

        // Split inline $...$
        const inlineParts = blockPart.split(/(\$[^$\n]+?\$)/g);
        return (
          <span key={bIdx}>
            {inlineParts.map((inlinePart, iIdx) => {
              if (inlinePart.startsWith('$') && inlinePart.endsWith('$')) {
                const math = inlinePart.slice(1, -1).trim();
                return <InlineMath key={iIdx} math={math} />;
              }
              return <span key={iIdx}>{inlinePart}</span>;
            })}
          </span>
        );
      })}
    </span>
  );
}
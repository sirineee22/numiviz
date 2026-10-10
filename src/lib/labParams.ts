import { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ExerciseParams } from '@/types/practice';

export function buildLabUrl(method: string, params?: ExerciseParams): string {
  if (!params || !method) return `/tools?tool=${encodeURIComponent(method || 'newton')}`;

  const search = new URLSearchParams();
  search.set('tool', method);

  // Map known fields to standard query parameters
  if (params.f) search.set('fx', params.f);
  if (params.fxy) search.set('fxy', params.fxy);
  if (params.x0 !== undefined) search.set('x0', String(params.x0));
  if (params.x1 !== undefined) search.set('x1', String(params.x1));
  if (params.y0 !== undefined) search.set('y0', String(params.y0));
  if (params.xEnd !== undefined) search.set('xEnd', String(params.xEnd));
  if (params.a !== undefined) search.set('a', String(params.a));
  if (params.b !== undefined) search.set('b', String(params.b));
  if (params.h !== undefined) search.set('h', String(params.h));
  if (params.n !== undefined) search.set('n', String(params.n));
  if (params.tol !== undefined) search.set('tol', String(params.tol));

  if (params.matrix) {
    search.set('matrix', JSON.stringify(params.matrix));
  }
  if (params.vector) {
    search.set('vector', JSON.stringify(params.vector));
  }
  if (params.points) {
    search.set('points', JSON.stringify(params.points));
  }
  if (params.shift !== undefined) {
    search.set('shift', String(params.shift));
  }

  return `/tools?${search.toString()}`;
}

export function useLabInitialParams<T extends Record<string, any>>(defaults: T): T {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  return useMemo(() => {
    const res = { ...defaults };

    // 1. Check router state fallback
    const stateObj = (location.state as any)?.params;
    if (stateObj && typeof stateObj === 'object') {
      Object.assign(res, stateObj);
    }

    // 2. Parse URL search params
    for (const [key, rawVal] of searchParams.entries()) {
      if (key === 'tool') continue;
      const val = decodeURIComponent(rawVal);

      // JSON parsing for arrays/matrices/points
      if (val.startsWith('[') || val.startsWith('{')) {
        try {
          (res as any)[key] = JSON.parse(val);
          continue;
        } catch {
          // ignore invalid json
        }
      }

      // Exact match for keys in defaults
      if (key in defaults) {
        if (typeof (defaults as any)[key] === 'number') {
          const num = Number(val);
          if (!isNaN(num)) (res as any)[key] = num;
        } else {
          (res as any)[key] = val;
        }
      } else {
        // Dynamic key addition (e.g. fx, fxy, x0, a, b, n)
        (res as any)[key] = val;
      }
    }

    return res;
  }, [searchParams, location.state]);
}
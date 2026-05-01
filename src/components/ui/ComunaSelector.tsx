import { useState, useRef, useEffect } from 'react';
import api from '../../api/axios.js';

interface ComunaOption {
  id: number;
  name: string;
}

interface Props {
  value: string;
  comuna_id: number;
  onChange: (nombre: string, id: number) => void;
}

const fieldClass =
  'w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-forest-950 ' +
  'placeholder-stone-300 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-forest-700/40 focus:border-forest-700 ' +
  'transition-all duration-150';

const labelClass = 'block text-[11px] font-semibold text-forest-800 mb-1.5 tracking-widest uppercase';

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

export default function ComunaSelector({ value, comuna_id, onChange }: Props) {
  const [comunas, setComunas] = useState<ComunaOption[]>([]);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<ComunaOption[]>('/api/v1/comunas')
      .then(res => setComunas(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value]);

  const filtered = query.length === 0
    ? comunas.slice(0, 8)
    : comunas.filter(c => normalize(c.name).includes(normalize(query))).slice(0, 8);

  const handleSelect = (nombre: string, id: number) => {
    onChange(nombre, id);
    setQuery(nombre);
    setOpen(false);
  };

  const handleClear = () => {
    onChange('', 0);
    setQuery('');
    setOpen(false);
  };

  return (
    <div>
      <label className={labelClass}>Comuna</label>
      <div ref={containerRef} className="relative">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Buscar comuna…"
            className={`${fieldClass} pl-10 ${value ? 'pr-8' : ''}`}
            autoComplete="off"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              aria-label="Limpiar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {open && filtered.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-stone-200 max-h-52 overflow-y-auto">
            {filtered.map(c => (
              <li key={c.id}>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleSelect(c.name, c.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    c.id === comuna_id
                      ? 'bg-forest-50 text-forest-900 font-semibold'
                      : 'hover:bg-stone-50 text-forest-950'
                  }`}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        {open && filtered.length === 0 && query.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-stone-200 px-4 py-3 text-sm text-stone-400">
            Sin resultados para «{query}»
          </div>
        )}
      </div>
    </div>
  );
}

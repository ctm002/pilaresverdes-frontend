import { useState, useEffect, useRef } from 'react';

interface FavoritoModalProps {
  onConfirm: (notas: string) => void;
  onClose: () => void;
}

export default function FavoritoModal({ onConfirm, onClose }: FavoritoModalProps) {
  const [notas, setNotas] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-bold text-forest-950 mb-1">Agregar a favoritos</h2>
        <p className="text-stone-400 text-sm mb-4">Agrega una nota opcional para recordar por qué te interesa este aviso.</p>

        <textarea
          ref={textareaRef}
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Ej: Buen precio, buena ubicación…"
          rows={3}
          className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-forest-950 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-forest-700/40 focus:border-forest-700 resize-none mb-4"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(notas)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-forest-900 hover:bg-forest-800 text-white transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

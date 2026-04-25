import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface SimpleHeaderProps {
  title: string;
  backTo?: string;
  children?: ReactNode;
}

export default function SimpleHeader({ title, backTo = '/', children }: SimpleHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 bg-forest-900 text-white py-4 shadow-lg z-40">
      <div className="container mx-auto px-4 flex items-center gap-3">
        <button
          onClick={() => navigate(backTo)}
          className="hover:bg-white/10 p-2 rounded-lg transition-colors md:hidden flex-shrink-0"
          aria-label="Volver"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display text-xl md:text-2xl font-semibold tracking-tight md:mx-auto">
          {title}
        </h1>
        {children}
      </div>
    </header>
  );
}

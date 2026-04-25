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
    <header className="fixed top-0 left-0 right-0 bg-green-600 text-white py-4 shadow-md z-40">
      <div className="container mx-auto px-4 flex items-center gap-4">
        <button
          onClick={() => navigate(backTo)}
          className="hover:bg-green-700 p-2 rounded transition-colors md:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl md:text-2xl md:mx-auto">{title}</h1>
        {children}
      </div>
    </header>
  );
}

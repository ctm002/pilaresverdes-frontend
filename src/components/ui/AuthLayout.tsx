import { ReactNode } from 'react';

const BotanicalPattern = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <pattern id="botanical" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M40,10 Q55,25 55,40 Q55,55 40,70 Q25,55 25,40 Q25,25 40,10Z" fill="white" opacity="0.04"/>
        <line x1="40" y1="10" x2="40" y2="70" stroke="white" strokeWidth="0.5" opacity="0.06"/>
        <path d="M40,25 Q52,35 52,40 Q40,45 28,40 Q28,35 40,25Z" fill="white" opacity="0.03"/>
        <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.08"/>
        <circle cx="68" cy="68" r="1.5" fill="white" opacity="0.08"/>
        <circle cx="68" cy="12" r="1"   fill="white" opacity="0.05"/>
        <circle cx="12" cy="68" r="1"   fill="white" opacity="0.05"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#botanical)"/>
  </svg>
);

const LeafIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 5.5-8 5.5L12 6l-3.5 3.5C11 9 15 9.5 17 8z"/>
  </svg>
);

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">

      {/* ── Brand panel (desktop only) ─────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 bg-forest-900 relative overflow-hidden flex-col justify-between p-12">
        <BotanicalPattern />

        {/* Top logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <LeafIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-white/80 text-xs font-semibold tracking-[0.2em] uppercase">
            Pilares Verdes
          </span>
        </div>

        {/* Center copy */}
        <div className="relative z-10">
          <h2 className="font-display text-5xl font-bold text-white leading-[1.15] mb-4">
            Conecta con<br />tu comunidad
          </h2>
          <p className="text-forest-300 text-[15px] leading-relaxed max-w-xs">
            La plataforma de avisos de tu barrio. Compra, vende y conecta con personas de tu entorno.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-8">
          <div>
            <p className="font-display text-3xl font-bold text-white">500+</p>
            <p className="text-forest-300/80 text-xs tracking-wide mt-0.5">Avisos activos</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold text-white">100%</p>
            <p className="text-forest-300/80 text-xs tracking-wide mt-0.5">Gratuito</p>
          </div>
        </div>
      </div>

      {/* ── Form panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-ivory min-h-screen">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-forest-900 rounded-lg flex items-center justify-center">
              <LeafIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-forest-900 text-xs font-bold tracking-[0.2em] uppercase">
              Pilares Verdes
            </span>
          </div>

          <h1 className="font-display text-[2rem] font-bold text-forest-950 leading-tight mb-1">
            {title}
          </h1>
          <p className="text-stone-400 text-sm mb-8">
            {subtitle ?? 'Ingresa tus datos para continuar'}
          </p>

          {children}
        </div>
      </div>
    </div>
  );
}

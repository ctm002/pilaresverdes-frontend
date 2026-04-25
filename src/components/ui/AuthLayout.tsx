import { ReactNode } from 'react';

const BG = "url('https://pilaresverdes.cl/images/pilaresverdes.jpg')";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
      style={{ backgroundImage: BG, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{title}</h2>
        {children}
      </div>
    </div>
  );
}

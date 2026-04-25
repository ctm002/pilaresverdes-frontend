interface LoadingSpinnerProps {
  fullPage?: boolean;
}

export default function LoadingSpinner({ fullPage = false }: LoadingSpinnerProps) {
  const spinner = (
    <div className="w-12 h-12 border-4 border-green-300 border-t-green-600 rounded-full animate-spin" />
  );
  if (!fullPage) return spinner;
  return (
    <div className="min-h-screen flex items-center justify-center">
      {spinner}
    </div>
  );
}

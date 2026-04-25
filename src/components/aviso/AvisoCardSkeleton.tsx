const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`bg-stone-200 rounded animate-pulse ${className}`} />
);

export default function AvisoCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 flex flex-col overflow-hidden">
      {/* Image area */}
      <Shimmer className="h-52 flex-shrink-0 rounded-none" />

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow gap-3">
        {/* Author */}
        <Shimmer className="h-3 w-24" />

        {/* Title + description */}
        <div className="flex-grow space-y-2 pt-0.5">
          <Shimmer className="h-4 w-4/5" />
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-3/5" />
        </div>

        {/* Footer row */}
        <div className="flex justify-between items-center pt-3 border-t border-stone-100">
          <Shimmer className="h-3 w-16" />
          <div className="flex gap-1.5">
            <Shimmer className="h-7 w-14 rounded-lg" />
            <Shimmer className="h-7 w-7 rounded-lg" />
            <Shimmer className="h-7 w-7 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

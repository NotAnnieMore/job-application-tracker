function SkeletonBlock({ className }: { className: string }) {
  return <div className={`rounded-lg bg-slate-200 ${className}`} />;
}

export function ApplicationDetailSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="A carregar candidatura"
      className="animate-pulse space-y-6 motion-reduce:animate-none"
    >
      <SkeletonBlock className="h-5 w-40" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <SkeletonBlock className="h-9 w-64 max-w-full" />
          <SkeletonBlock className="h-5 w-48 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-3">
          <SkeletonBlock className="h-11 w-24" />
          <SkeletonBlock className="h-11 w-28" />
          <SkeletonBlock className="h-11 w-40" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <SkeletonBlock className="size-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-5 w-32" />
              <SkeletonBlock className="h-4 w-44 max-w-full" />
            </div>
          </div>
          <div className="grid gap-6 pt-6 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <SkeletonBlock className="h-3 w-28" />
                <SkeletonBlock className="h-5 w-40 max-w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-64 rounded-2xl border border-slate-200 bg-white p-5">
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonBlock className="mt-3 h-4 w-52 max-w-full" />
          <SkeletonBlock className="mx-auto mt-14 size-12 rounded-full" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <SkeletonBlock className="h-6 w-40" />
        <SkeletonBlock className="mt-3 h-4 w-64 max-w-full" />
        <div className="mt-8 space-y-3">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-11/12" />
          <SkeletonBlock className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

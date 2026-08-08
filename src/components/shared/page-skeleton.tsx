export function PageSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="A carregar conteúdo"
      className="animate-pulse space-y-6"
    >
      <div className="h-9 w-52 rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-slate-200" />
    </div>
  );
}

export function PageSkeleton({
  title,
  description,
}: {
  title?: string;
  description?: string;
} = {}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="A carregar conteúdo"
      className="space-y-6"
    >
      {title ? (
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-slate-500">{description}</p>
          ) : null}
        </header>
      ) : (
        <div className="animate-pulse space-y-2">
          <div className="h-9 w-52 rounded-lg bg-slate-200" />
          <div className="h-5 w-full max-w-md rounded bg-slate-200" />
        </div>
      )}

      <div className="animate-pulse space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

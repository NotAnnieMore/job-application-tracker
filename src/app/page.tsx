export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <section className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="mb-10 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white"
          >
            JT
          </span>
          <div>
            <p className="font-semibold text-slate-950">
              Job Application Tracker
            </p>
            <p className="text-sm text-slate-500">Configuração inicial</p>
          </div>
        </div>

        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Fase 1 em curso
        </span>
        <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          A base do projeto está pronta.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Next.js, TypeScript, Tailwind CSS e as ferramentas de qualidade já
          estão configurados. A próxima tarefa será ligar a aplicação ao
          Supabase.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {[
            "App Router e pasta src",
            "TypeScript em modo estrito",
            "Tailwind CSS",
            "ESLint e Prettier",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-emerald-500"
              />
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

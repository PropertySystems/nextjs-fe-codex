export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-12 px-6 py-16 text-center">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">PropertySystems</p>
        <h1 className="text-balance text-4xl font-bold leading-tight text-slate-900 sm:text-5xl md:text-6xl">
          Welcome to the Next.js frontend starter
        </h1>
        <p className="text-pretty text-lg text-slate-600 sm:text-xl">
          Build responsive, accessible property management experiences using Next.js 16, Tailwind CSS 4, and shadcn/ui
          components.
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-900">Tech stack</h2>
          <p className="mt-2 text-sm text-slate-600">
            Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui, and Zod validation are ready to go.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h2 className="text-xl font-semibold text-slate-900">Getting started</h2>
          <p className="mt-2 text-sm text-slate-600">
            Run <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs">npm install</code> then
            <code className="ml-1 rounded bg-slate-100 px-2 py-1 font-mono text-xs">npm run dev</code> to start
            developing.
          </p>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">RecoSmart</h1>
          <p className="text-white/70 leading-relaxed">
            Widget’larınızı tasarlayın ve farklı cihazlarda önizleyin.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Link
              href="/editor"
              className="bg-brand hover:bg-brand-dark transition px-4 py-2 rounded-xl text-sm font-medium"
            >
              Editöre Git
            </Link>

            {/* Tutorial burada: editor'e tutorial=1 ile gider */}
            <Link
              href="/editor?tutorial=1"
              className="px-4 py-2 rounded-xl text-sm bg-white/10 hover:bg-white/15"
            >
              Tutorial
            </Link>

            <a
              className="px-4 py-2 rounded-xl text-sm bg-white/10"
              href="#features"
            >
              Özellikler
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-6 bg-neutral-800/40">
          <div className="h-64 rounded-xl editor-bg flex items-center justify-center text-white/60">
            Önizleme Alanı
          </div>
        </div>
      </div>
    </main>
  );
}

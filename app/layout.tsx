// app/layout.tsx
import Link from "next/link";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-neutral-950 text-white">
        <header className="h-12 border-b border-white/10 flex items-center px-4 justify-between">
          <div className="font-semibold">RecoSmart</div>
          <nav className="flex items-center gap-2">
            <Link
              href="/editor"
              className="rounded-md px-3 py-1.5 bg-white/10 hover:bg-white/15 text-sm"
            >
              Editöre Git
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

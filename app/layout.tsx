import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Movie Night Vote",
  description: "Group movie voting with vetoes"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
            <Link className="text-lg font-semibold" href="/">
              Movie Night Vote
            </Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link className="hover:text-slate-900" href="/create">
                Create session
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

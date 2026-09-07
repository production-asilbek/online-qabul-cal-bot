import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-[var(--tg-subtitle-text-color)]">This screen doesn&apos;t exist.</p>
      <Link href="/" className="mt-6 font-semibold text-[var(--tg-accent-text-color)]">
        Back to today
      </Link>
    </main>
  );
}

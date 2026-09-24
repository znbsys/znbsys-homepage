import Link from 'next/link';

export default function LocaleNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page text-ink">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="mt-4 text-xl text-muted">Page not found</p>
        <Link
          href="/zh-CN"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

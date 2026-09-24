import { withBase } from '@/lib/paths';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-slate-600">Page not found</p>
        <a href={withBase('/')} className="mt-4 inline-block text-primary hover:underline">
          Back to home
        </a>
      </div>
    </div>
  );
}

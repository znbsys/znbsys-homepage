'use client';

import { useEffect } from 'react';
import { canonicalLocale, defaultLocale, matchLocale } from '@/i18n/config';
import { withBase } from '@/lib/paths';

/**
 * 根路径跳转页。
 * 服务器部署：/ 由 middleware 302 协商，本页不会被访问；
 * GitHub Pages（无 middleware）：按 cookie → navigator.language 协商后跳转。
 */
export default function RootPage() {
  useEffect(() => {
    const match = /(?:^|;\s*)NEXT_LOCALE=([^;]+)/.exec(document.cookie);
    const fromCookie = match?.[1] ? canonicalLocale(match[1]) : null;
    const target = fromCookie ?? matchLocale(navigator.language ?? '') ?? defaultLocale;
    window.location.replace(withBase(`/${target}/`));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-wash text-slate-600">
      <p className="text-sm">Redirecting… / 正在跳转…</p>
    </div>
  );
}

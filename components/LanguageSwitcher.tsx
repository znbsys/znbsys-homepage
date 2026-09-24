'use client';

import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  locales,
  localeMeta,
  stripLocale,
  localizedPath,
  type Locale,
} from '@/i18n/config';
import type { Dictionary } from '@/i18n/t';
import { t } from '@/i18n/t';
import { BASE_PATH, withBase } from '@/lib/paths';

export interface LanguageSwitcherProps {
  /** 当前语言 */
  current: Locale;
  /** UI 文案字典 */
  dict: Dictionary;
  /** 形态：桌面下拉 / 移动端平铺 */
  variant?: 'dropdown' | 'inline';
}

/**
 * 语言切换器。
 * 切换时保留当前路径与 hash（如 /zh-CN/#about -> /en/#about），并写入 cookie。
 */
export function LanguageSwitcher({ current, dict, variant = 'dropdown' }: LanguageSwitcherProps) {
  const pathname = usePathname() ?? '/';

  function hrefFor(target: Locale) {
    // usePathname 可能带 basePath 前缀，先剥掉再处理 locale
    let current = pathname;
    if (BASE_PATH && current.startsWith(BASE_PATH)) {
      current = current.slice(BASE_PATH.length) || '/';
    }
    // 剥掉当前 locale 前缀，再拼上目标 locale，路径原样保留
    const { path } = stripLocale(current);
    return withBase(localizedPath(target, path));
  }

  function handleSwitch(target: Locale) {
    // cookie 供 middleware 在下次访问 / 时直接命中，无需再协商
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
  }

  const list = (
    <>
      {locales.map((locale) => {
        const isCurrent = locale === current;
        return (
          <a
            key={locale}
            href={hrefFor(locale)}
            hrefLang={localeMeta[locale].htmlLang}
            lang={localeMeta[locale].htmlLang}
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={t(dict, 'language.current', { label: localeMeta[locale].label })}
            onClick={() => handleSwitch(locale)}
            className={[
              'block px-3 py-2 rounded-lg text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isCurrent
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            ].join(' ')}
          >
            {localeMeta[locale].label}
          </a>
        );
      })}
    </>
  );

  return (
    <nav
      aria-label={t(dict, 'language.switch')}
      data-testid="language-switcher"
      className={variant === 'inline' ? 'w-full' : 'relative'}
    >
      {variant === 'inline' ? (
        <div className="flex flex-col gap-1">{list}</div>
      ) : (
        <details className="group relative">
          <summary
            className={[
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm cursor-pointer list-none',
              'text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            ].join(' ')}
          >
            <Globe className="w-4 h-4" aria-hidden="true" />
            <span>{localeMeta[current].label}</span>
          </summary>
          <div className="absolute right-0 z-50 mt-1 w-36 p-1 rounded-xl border border-panel-line bg-panel shadow-lg">
            {list}
          </div>
        </details>
      )}
    </nav>
  );
}

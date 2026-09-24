'use client';

import type { SiteConfig } from '@/types/siteConfig';
import type { Dictionary } from '@/i18n/t';
import { t } from '@/i18n/t';
import { withBase } from '@/lib/paths';

export interface FooterProps {
  brand: SiteConfig['brand'];
  data: SiteConfig['footer'];
  dict: Dictionary;
}

/** 站内绝对路径加 basePath；锚点与外链原样返回 */
function resolveHref(href: string): string {
  if (href.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) {
    return href;
  }
  if (href.startsWith('/')) return withBase(href);
  return href;
}

export function Footer({ brand, data, dict }: FooterProps) {
  return (
    <footer className="border-t border-line bg-page text-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {brand.logoSvg ? (
                <span
                  className="w-6 h-6 text-accent"
                  dangerouslySetInnerHTML={{ __html: brand.logoSvg }}
                />
              ) : null}
              <span className="text-lg font-bold text-title">{brand.name}</span>
            </div>
            <p className="text-sm leading-relaxed">{brand.tagline}</p>
          </div>

          {/* Link groups or flat links */}
          {data.linkGroups
            ? data.linkGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold text-title mb-4">{group.title}</h3>
                  <ul className="space-y-2">
                    {group.links.map((link) => (
                      <li key={link.href + link.label}>
                        <a
                          href={resolveHref(link.href)}
                          className="text-sm hover:text-title transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            : data.links && (
                <div className="col-span-2 md:col-span-3">
                  <ul className="flex flex-wrap gap-4">
                    {data.links.map((link) => (
                      <li key={link.href + link.label}>
                        <a
                          href={resolveHref(link.href)}
                          className="text-sm hover:text-title transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
          <p className="text-sm">{data.copyright}</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-sm text-slate-500 hover:text-title transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            {t(dict, 'footer.backToTop')}
          </button>
        </div>
      </div>
    </footer>
  );
}

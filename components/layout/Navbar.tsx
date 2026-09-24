'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import type { SiteConfig, BrandConfig, NavbarConfig } from '@/types/siteConfig';
import type { Dictionary } from '@/i18n/t';
import { t } from '@/i18n/t';
import { cn } from '@/lib/cn';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import type { Locale } from '@/i18n/config';
import { withBase, resolveNavHref } from '@/lib/paths';

export interface NavbarProps {
  brand: BrandConfig;
  data: NavbarConfig;
  dict: Dictionary;
  locale: Locale;
}

export function Navbar({ brand, data, dict, locale }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isSticky = data.sticky !== false;

  return (
    <header
      className={cn(
        'top-0 z-50 w-full transition-all duration-300',
        isSticky && 'sticky',
        scrolled
          ? 'bg-panel/80 backdrop-blur-lg shadow-sm border-b border-panel-line/50'
          : 'bg-transparent',
      )}
    >
      <nav
        aria-label={t(dict, 'nav.primary')}
        className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16"
      >
        {/* Logo */}
        <a href={withBase(`/${locale}`)} className="flex items-center gap-2 shrink-0">
          {brand.logoSvg ? (
            <span
              className="w-8 h-8 text-primary"
              dangerouslySetInnerHTML={{ __html: brand.logoSvg }}
            />
          ) : brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.name} className="w-8 h-8" />
          ) : null}
          <span className="text-lg font-bold text-slate-900">{brand.name}</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {data.links.map((link) => (
            <a
              key={link.href}
              href={resolveNavHref(link.href, locale)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {link.label}
            </a>
          ))}

          <LanguageSwitcher current={locale} dict={dict} />

          {data.ctaButton && (
            <a
              href={resolveNavHref(data.ctaButton.href, locale)}
              target={data.ctaButton.target}
              className="ml-3 px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {data.ctaButton.text}
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? t(dict, 'nav.closeMenu') : t(dict, 'nav.openMenu')}
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={data.links}
        ctaButton={data.ctaButton}
        dict={dict}
        locale={locale}
      />
    </header>
  );
}

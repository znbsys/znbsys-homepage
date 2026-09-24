'use client';

import { useEffect } from 'react';
import type { SiteConfig } from '@/types/siteConfig';
import type { Dictionary } from '@/i18n/t';
import { cn } from '@/lib/cn';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import type { Locale } from '@/i18n/config';

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: SiteConfig['navbar']['links'];
  ctaButton?: SiteConfig['navbar']['ctaButton'];
  dict: Dictionary;
  locale: Locale;
}

export function MobileMenu({ open, onClose, links, ctaButton, dict, locale }: MobileMenuProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKey);
      };
    }
    document.body.style.overflow = '';
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      className={cn(
        'md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-panel/95 backdrop-blur-lg transition-all duration-300',
        open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none',
      )}
    >
      <div className="flex flex-col gap-1 p-4">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="px-4 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {link.label}
          </a>
        ))}

        <div className="my-2 border-t border-panel-line" />

        <LanguageSwitcher current={locale} dict={dict} variant="inline" />

        {ctaButton && (
          <a
            href={ctaButton.href}
            target={ctaButton.target}
            onClick={onClose}
            className="mt-4 block w-full text-center px-5 py-3 rounded-lg bg-primary text-white text-base font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {ctaButton.text}
          </a>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  locales,
  localeMeta,
  type Locale,
} from '@/i18n/config';
import { getSiteConfig, getDictionary, buildAlternates, buildOgLocale } from '@/i18n/request';
import { themeToCssVars } from '@/lib/theme';
import { withBase } from '@/lib/paths';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeColorApplicator } from '@/components/ThemeColorApplicator';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as string as Locale;
  if (!locales.includes(locale as Locale)) return {};

  const config = await getSiteConfig(locale);
  // CI 中未配置该变量时为空串，需用 || 回退（?? 无法兜住空串）
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const alternates = buildAlternates('/', origin);
  const ogLocale = buildOgLocale(locale);

  return {
    title: config.meta.title,
    description: config.meta.description,
    keywords: config.meta.keywords,
    icons: { icon: withBase(config.meta.favicon) },
    openGraph: {
      title: config.meta.title,
      description: config.meta.description,
      locale: ogLocale.locale,
      alternateLocale: ogLocale.alternate,
      ...(config.meta.ogImage ? { images: [withBase(config.meta.ogImage)] } : {}),
    },
    alternates,
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const locale = params.locale as string as Locale;

  if (!locales.includes(locale)) {
    notFound();
  }

  const meta = localeMeta[locale];
  const config = await getSiteConfig(locale);
  const dict = await getDictionary(locale);
  const cssVars = themeToCssVars(config.theme);

  return (
    <html lang={meta.htmlLang} dir={meta.dir} className={meta.fontStack === 'cjk' ? 'font-cjk' : 'font-latin'}>
      <body
        className="min-h-screen bg-page text-ink antialiased font-sans selection:bg-primary selection:text-white"
        style={cssVars as React.CSSProperties}
      >
        <ThemeColorApplicator />
        <Navbar brand={config.brand} data={config.navbar} dict={dict} locale={locale} />
        <main>{children}</main>
        <Footer brand={config.brand} data={config.footer} dict={dict} />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { getLegalContent, getLegalPage, buildAlternates, buildOgLocale } from '@/i18n/request';
import { LegalArticle } from '@/components/legal/LegalArticle';

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as string as Locale;
  if (!locales.includes(locale)) return {};

  const page = await getLegalPage(locale, 'terms');
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const ogLocale = buildOgLocale(locale);

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      locale: ogLocale.locale,
      alternateLocale: ogLocale.alternate,
    },
    alternates: buildAlternates('/terms/', origin),
  };
}

export default async function TermsPage({ params }: Props) {
  const locale = params.locale as string as Locale;
  if (!locales.includes(locale)) notFound();

  const legal = await getLegalContent(locale);
  return <LegalArticle content={legal.terms} labels={legal.labels} />;
}

import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { getSiteConfig, getDictionary } from '@/i18n/request';
import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { About } from '@/components/sections/About';
import { Testimonials } from '@/components/sections/Testimonials';
import { Contact } from '@/components/sections/Contact';
import { DEFAULT_SECTION_ORDER, type SectionKey } from '@/types/siteConfig';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const locale = params.locale as string as Locale;

  if (!locales.includes(locale)) {
    notFound();
  }

  const config = await getSiteConfig(locale);
  const dict = await getDictionary(locale);
  const sectionOrder = config.order ?? DEFAULT_SECTION_ORDER;

  const SECTION_MAP: Record<SectionKey, React.ReactNode> = {
    hero: <Hero data={config.hero} theme={config.theme} />,
    features: <Features data={config.features} />,
    about: config.about ? <About data={config.about} /> : null,
    testimonials: config.testimonials ? <Testimonials data={config.testimonials} dict={dict} /> : null,
    contact: <Contact data={config.contact} dict={dict} />,
  };

  return (
    <div className="min-h-screen bg-page text-ink selection:bg-primary selection:text-white">
      {sectionOrder.map((key) => (
        <div key={key}>{SECTION_MAP[key]}</div>
      ))}
    </div>
  );
}

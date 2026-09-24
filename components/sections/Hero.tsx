import type { SiteConfig } from '@/types/siteConfig';
import { cn } from '@/lib/cn';

export interface HeroProps {
  data: SiteConfig['hero'];
  theme: SiteConfig['theme'];
}

const BG_CLASSES: Record<SiteConfig['theme']['background'], string> = {
  gradient:
    'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/25 via-band to-band',
  solid: 'bg-band',
  grid: 'bg-band bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:4rem_4rem]',
};

export function Hero({ data, theme }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-32 pb-20 text-title"
      aria-labelledby="hero-headline"
    >
      <div className={cn('absolute inset-0', BG_CLASSES[theme.background])} />

      {data.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${data.backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-band/70" />
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {data.badge && (
          <span className="mb-8 inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            {data.badge}
          </span>
        )}

        <h1
          id="hero-headline"
          className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl leading-tight"
        >
          {data.headline}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-xl text-soft">{data.subheadline}</p>

        <div className="mt-10 flex justify-center gap-4">
          <a
            href={data.primaryCta.href}
            target={data.primaryCta.target}
            className="rounded-lg bg-primary px-8 py-3.5 font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-band"
          >
            {data.primaryCta.text}
          </a>

          {data.secondaryCta && (
            <a
              href={data.secondaryCta.href}
              target={data.secondaryCta.target}
              className="rounded-lg border border-line-strong px-8 py-3.5 font-semibold text-soft transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-band"
            >
              {data.secondaryCta.text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

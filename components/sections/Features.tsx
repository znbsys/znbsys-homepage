import type { SiteConfig } from '@/types/siteConfig';
import { DynamicIcon } from '@/components/DynamicIcon';
import { cn } from '@/lib/cn';

export interface FeaturesProps {
  data: SiteConfig['features'];
}

const GRID_COLS: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

export function Features({ data }: FeaturesProps) {
  const cols = data.columns ?? 3;

  return (
    <section
      id="features"
      className="py-24 bg-page text-title"
      aria-labelledby="features-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 id="features-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
            {data.title}
          </h2>
          <p className="mt-4 text-lg text-muted">{data.subtitle}</p>
        </div>

        <div className={cn('grid grid-cols-1 gap-8', GRID_COLS[cols])}>
          {data.items.map((item, idx) => {
            const card = (
              <>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                  <DynamicIcon name={item.iconName} className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                <p className="leading-relaxed text-muted">{item.description}</p>
              </>
            );

            const baseClass =
              'rounded-card p-8 bg-band/50 border border-line transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-xl';

            return item.href ? (
              <a
                key={idx}
                href={item.href}
                className={cn(baseClass, 'block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary')}
              >
                {card}
              </a>
            ) : (
              <div key={idx} className={baseClass}>
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

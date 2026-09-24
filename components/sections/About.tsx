import type { SiteConfig } from '@/types/siteConfig';

export interface AboutProps {
  data: NonNullable<SiteConfig['about']>;
}

export function About({ data }: AboutProps) {
  return (
    <section
      id="about"
      className="py-24 bg-band text-title"
      aria-labelledby="about-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Text */}
          <div>
            <h2 id="about-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
              {data.title}
            </h2>
            <div className="mt-6 space-y-4">
              {data.description.map((paragraph, idx) => (
                <p key={idx} className="text-lg leading-relaxed text-soft">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Stats */}
            {data.stats.length > 0 && (
              <div className="mt-10 grid grid-cols-3 gap-8">
                {data.stats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="text-3xl font-bold text-primary">
                      {stat.value}
                      {stat.suffix && <span className="text-2xl">{stat.suffix}</span>}
                    </div>
                    <div className="mt-1 text-sm text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          {data.imageUrl && (
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
                <img
                  src={data.imageUrl}
                  alt={data.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

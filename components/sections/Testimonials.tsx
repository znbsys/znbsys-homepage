import { Star, Quote } from 'lucide-react';
import type { SiteConfig } from '@/types/siteConfig';
import type { Dictionary } from '@/i18n/t';
import { t } from '@/i18n/t';

export interface TestimonialsProps {
  data: NonNullable<SiteConfig['testimonials']>;
  dict: Dictionary;
}

function StarRating({ rating, dict }: { rating: number; dict: Dictionary }) {
  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={t(dict, 'testimonials.ratingLabel', { rating })}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
        />
      ))}
    </div>
  );
}

function AvatarFallback({ name, dict }: { name: string; dict: Dictionary }) {
  const initial = name.charAt(0) ?? '?';
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm"
      role="img"
      aria-label={t(dict, 'testimonials.avatarFallback')}
    >
      {initial}
    </div>
  );
}

export function Testimonials({ data, dict }: TestimonialsProps) {
  return (
    <section
      id="testimonials"
      className="py-24 bg-page text-title"
      aria-labelledby="testimonials-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 id="testimonials-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="mt-4 text-lg text-muted">{data.subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {data.items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-card border border-line bg-band/50 p-8 transition-all duration-300 hover:border-line-strong"
            >
              <Quote className="mb-4 h-8 w-8 text-primary/30" />

              <blockquote className="mb-6 leading-relaxed text-soft">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {item.rating && (
                <div className="mb-4">
                  <StarRating rating={item.rating} dict={dict} />
                </div>
              )}

              <div className="flex items-center gap-3">
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.author}
                    className="h-10 w-10 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <AvatarFallback name={item.author} dict={dict} />
                )}
                <div>
                  <div className="font-semibold">{item.author}</div>
                  <div className="text-sm text-muted">
                    {item.role}
                    {item.company && <span> · {item.company}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

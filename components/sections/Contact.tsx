import { Mail, Phone, MapPin, Github, Twitter, Globe } from 'lucide-react';
import type { SiteConfig } from '@/types/siteConfig';
import type { Dictionary } from '@/i18n/t';
import { t } from '@/i18n/t';

export interface ContactProps {
  data: SiteConfig['contact'];
  dict: Dictionary;
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  x: Twitter,
  email: Mail,
  linkedin: Globe,
  wechat: Globe,
  website: Globe,
  zhihu: Globe,
  bilibili: Globe,
};

export function Contact({ data, dict }: ContactProps) {
  return (
    <section
      id="contact"
      className="py-24 bg-band text-title"
      aria-labelledby="contact-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="contact-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="mt-4 text-lg text-muted">{data.subtitle}</p>
          )}
        </div>

        <div className="mx-auto mt-12 max-w-lg space-y-6">
          {/* Email */}
          <a
            href={`mailto:${data.email}`}
            className="flex items-center gap-4 rounded-card border border-line bg-page/50 p-5 transition hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-muted">{t(dict, 'contact.email')}</div>
              <div className="font-medium">{data.email}</div>
            </div>
          </a>

          {/* Phone */}
          {data.phone && (
            <a
              href={`tel:${data.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-4 rounded-card border border-line bg-page/50 p-5 transition hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted">{t(dict, 'contact.phone')}</div>
                <div className="font-medium">{data.phone}</div>
              </div>
            </a>
          )}

          {/* Address */}
          {data.address && (
            <div className="flex items-center gap-4 rounded-card border border-line bg-page/50 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted">{t(dict, 'contact.address')}</div>
                <div className="font-medium">{data.address}</div>
              </div>
            </div>
          )}

          {/* Socials */}
          {data.socials.length > 0 && (
            <div className="pt-4">
              <div className="mb-3 text-sm text-muted">{t(dict, 'contact.followUs')}</div>
              <div className="flex flex-wrap gap-3">
                {data.socials.map((social) => {
                  const Icon = SOCIAL_ICONS[social.platform] ?? Globe;
                  return (
                    <a
                      key={social.platform}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-line bg-page/50 px-4 py-2 text-sm transition hover:border-line-strong hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Icon className="h-4 w-4" />
                      {social.label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

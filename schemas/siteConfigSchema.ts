import { z } from 'zod';
import { ICON_WHITELIST } from '@/lib/icons';

const CtaSchema = z.object({
  text: z.string().min(1),
  href: z.string().min(1),
  target: z.enum(['_self', '_blank']).optional(),
});

export const SiteConfigSchema = z.object({
  meta: z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(320),
    keywords: z.array(z.string()).default([]),
    favicon: z.string().min(1),
    ogImage: z.string().optional(),
    locale: z.string().default('zh-CN'),
  }),
  theme: z.object({
    primary: z
      .string()
      .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'primary 必须是十六进制颜色'),
    secondary: z
      .string()
      .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      .optional(),
    radius: z.enum(['none', 'sm', 'md', 'lg', 'xl', '2xl']).default('xl'),
    font: z.enum(['sans', 'serif', 'mono']).default('sans'),
    background: z.enum(['gradient', 'solid', 'grid']).default('gradient'),
  }),
  brand: z.object({
    name: z.string().min(1),
    logoUrl: z.string().optional(),
    logoSvg: z.string().optional(),
    tagline: z.string().min(1),
  }),
  navbar: z.object({
    links: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })),
    ctaButton: CtaSchema.optional(),
    sticky: z.boolean().default(true),
  }),
  hero: z.object({
    badge: z.string().optional(),
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    primaryCta: CtaSchema,
    secondaryCta: CtaSchema.optional(),
    backgroundImage: z.string().optional(),
  }),
  features: z.object({
    title: z.string().min(1),
    subtitle: z.string(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
    items: z
      .array(
        z.object({
          iconName: z.string().refine((n) => ICON_WHITELIST.includes(n as (typeof ICON_WHITELIST)[number]), {
            message: 'iconName 不在 Lucide 图标白名单内',
          }),
          title: z.string().min(1),
          description: z.string().min(1),
          href: z.string().optional(),
        }),
      )
      .min(1),
  }),
  about: z
    .object({
      title: z.string().min(1),
      description: z.array(z.string()).min(1),
      imageUrl: z.string().optional(),
      stats: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
          suffix: z.string().optional(),
        }),
      ),
    })
    .optional(),
  testimonials: z
    .object({
      title: z.string().min(1),
      subtitle: z.string().optional(),
      items: z.array(
        z.object({
          quote: z.string().min(1),
          author: z.string().min(1),
          role: z.string(),
          company: z.string(),
          avatarUrl: z.string().optional(),
          rating: z
            .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
            .optional(),
        }),
      ),
    })
    .optional(),
  contact: z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    socials: z.array(
      z.object({
        platform: z.enum([
          'github',
          'x',
          'wechat',
          'linkedin',
          'email',
          'website',
          'zhihu',
          'bilibili',
        ]),
        label: z.string().min(1),
        href: z.string().min(1),
      }),
    ),
  }),
  footer: z.object({
    copyright: z.string().min(1),
    links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
    linkGroups: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.object({ label: z.string(), href: z.string() })),
        }),
      )
      .optional(),
  }),
  order: z.array(z.enum(['hero', 'features', 'about', 'testimonials', 'contact'])).optional(),
});

export type SiteConfigInput = z.input<typeof SiteConfigSchema>;

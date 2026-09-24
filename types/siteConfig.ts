/** 主题配置：驱动全站配色与圆角 */
export interface ThemeConfig {
  /** 主色调，十六进制，如 "#2563eb" */
  primary: string;
  /** 次要色（渐变终点），可选 */
  secondary?: string;
  /** 卡片圆角档位 */
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** 正文排版风格 */
  font: 'sans' | 'serif' | 'mono';
  /** Hero 背景形态 */
  background: 'gradient' | 'solid' | 'grid';
}

export interface MetaConfig {
  title: string;
  description: string;
  keywords: string[];
  favicon: string;
  ogImage?: string;
  locale: string;
}

export interface BrandConfig {
  name: string;
  /** 图片 Logo 地址，与 logoSvg 二选一 */
  logoUrl?: string;
  /** 内联 SVG Logo（纯字符串，便于无外链部署） */
  logoSvg?: string;
  tagline: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface CtaButton {
  text: string;
  href: string;
  target?: '_self' | '_blank';
}

export type SocialPlatform =
  | 'github'
  | 'x'
  | 'wechat'
  | 'linkedin'
  | 'email'
  | 'website'
  | 'zhihu'
  | 'bilibili';

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  href: string;
}

export interface NavbarConfig {
  links: NavItem[];
  ctaButton?: CtaButton;
  /** 是否吸顶，默认 true */
  sticky?: boolean;
}

export interface HeroConfig {
  badge?: string;
  headline: string;
  subheadline: string;
  primaryCta: CtaButton;
  secondaryCta?: CtaButton;
  backgroundImage?: string;
}

export interface FeatureItem {
  /** 必须是 lib/icons.ts 白名单内的 Lucide 图标名 */
  iconName: string;
  title: string;
  description: string;
  /** 可选详情链接 */
  href?: string;
}

export interface FeaturesConfig {
  title: string;
  subtitle: string;
  /** 桌面端栅格列数，默认 3 */
  columns?: 2 | 3 | 4;
  items: FeatureItem[];
}

export interface StatItem {
  label: string;
  value: string;
  suffix?: string;
}

export interface AboutConfig {
  title: string;
  description: string[];
  imageUrl?: string;
  stats: StatItem[];
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
  /** 1–5 星，可选 */
  rating?: 1 | 2 | 3 | 4 | 5;
}

export interface TestimonialsConfig {
  title: string;
  subtitle?: string;
  items: TestimonialItem[];
}

export interface ContactConfig {
  title: string;
  subtitle?: string;
  email: string;
  phone?: string;
  address?: string;
  socials: SocialLink[];
}

export interface FooterLinkGroup {
  title: string;
  links: NavItem[];
}

export interface FooterConfig {
  copyright: string;
  /** 简单模式：平铺链接 */
  links?: NavItem[];
  /** 分组模式：与 links 二选一，优先使用 */
  linkGroups?: FooterLinkGroup[];
}

/** 站点根契约 */
export interface SiteConfig {
  meta: MetaConfig;
  theme: ThemeConfig;
  brand: BrandConfig;
  navbar: NavbarConfig;
  hero: HeroConfig;
  features: FeaturesConfig;
  about?: AboutConfig;
  testimonials?: TestimonialsConfig;
  contact: ContactConfig;
  footer: FooterConfig;
  /** Section 渲染顺序；缺省时使用默认顺序 */
  order?: SectionKey[];
}

export type SectionKey = 'hero' | 'features' | 'about' | 'testimonials' | 'contact';

/** 默认 Section 顺序，用于 order 缺省时的兜底 */
export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'hero',
  'features',
  'about',
  'testimonials',
  'contact',
];

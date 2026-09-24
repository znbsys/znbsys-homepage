import defaultData from '@/config/locales/zh-CN.json';
import { SiteConfigSchema } from '@/schemas/siteConfigSchema';
import type { SiteConfig } from '@/types/siteConfig';
import { defaultLocale, type Locale } from '@/i18n/config';

let cache: SiteConfig | null = null;

/** 默认 locale 的同步入口 */
export function getDefaultSiteConfig(): SiteConfig {
  if (cache) return cache;
  const parsed = SiteConfigSchema.safeParse(defaultData);
  if (!parsed.success) {
    throw new Error(`[config] 默认语言配置校验失败:\n${parsed.error.toString()}`);
  }
  cache = parsed.data as SiteConfig;
  return cache;
}

/** 供测试与多租户使用的工厂：可注入任意 JSON */
export function createSiteConfig(raw: unknown): SiteConfig {
  return SiteConfigSchema.parse(raw) as SiteConfig;
}

export { defaultLocale, type Locale };

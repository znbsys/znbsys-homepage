import 'server-only';

import {
  defaultLocale,
  locales,
  localeMeta,
  localizedPath,
  type Locale,
} from './config';
import type { Dictionary } from './t';
import type { SiteConfig } from '@/types/siteConfig';
import { SiteConfigSchema } from '@/schemas/siteConfigSchema';
import { LegalContentSchema, type LegalContent, type LegalPageKey } from '@/schemas/legalContentSchema';

export type { Dictionary } from './t';
export { t } from './t';

const configCache = new Map<Locale, SiteConfig>();
const dictCache = new Map<Locale, Dictionary>();
const legalCache = new Map<Locale, LegalContent>();

/** 按 locale 读取并校验内容配置（构建期缓存） */
export async function getSiteConfig(locale: Locale): Promise<SiteConfig> {
  const hit = configCache.get(locale);
  if (hit) return hit;

  const mod = await import(`@/config/locales/${locale}.json`);
  const parsed = SiteConfigSchema.safeParse(mod.default);
  if (!parsed.success) {
    throw new Error(
      `[i18n] config/locales/${locale}.json 校验失败:\n${parsed.error.toString()}`,
    );
  }

  const config = parsed.data as SiteConfig;
  configCache.set(locale, config);
  return config;
}

/** 读取 UI 文案字典；缺失 key 自动用默认语言补齐 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const hit = dictCache.get(locale);
  if (hit) return hit;

  const [current, fallback] = await Promise.all([
    import(`@/messages/${locale}.json`),
    locale === defaultLocale
      ? Promise.resolve(null)
      : import(`@/messages/${defaultLocale}.json`),
  ]);

  const merged: Dictionary = {
    ...(fallback?.default ?? {}),
    ...(current.default as Dictionary),
  };
  dictCache.set(locale, merged);
  return merged;
}

/** 按 locale 读取并校验法务内容（隐私政策 / 服务条款 / 更新日志） */
export async function getLegalContent(locale: Locale): Promise<LegalContent> {
  const hit = legalCache.get(locale);
  if (hit) return hit;

  const mod = await import(`@/config/legal/${locale}.json`);
  const parsed = LegalContentSchema.safeParse(mod.default);
  if (!parsed.success) {
    throw new Error(
      `[i18n] config/legal/${locale}.json 校验失败:\n${parsed.error.toString()}`,
    );
  }

  legalCache.set(locale, parsed.data);
  return parsed.data;
}

/** 取单页法务内容 */
export async function getLegalPage(locale: Locale, key: LegalPageKey) {
  const content = await getLegalContent(locale);
  return content[key];
}

/** 生成 hreflang alternates，供 generateMetadata 使用（origin 不含路径，basePath 单独拼接） */
export function buildAlternates(path: string, origin: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[localeMeta[locale].htmlLang] = `${origin}${base}${localizedPath(locale, path)}`;
  }
  languages['x-default'] = `${origin}${base}${localizedPath(defaultLocale, path)}`;

  return {
    canonical: `${origin}${base}${localizedPath(defaultLocale, path)}`,
    languages,
  };
}

/** og:locale 与 og:locale:alternate */
export function buildOgLocale(current: Locale) {
  return {
    locale: localeMeta[current].ogLocale,
    alternate: locales
      .filter((l) => l !== current)
      .map((l) => localeMeta[l].ogLocale),
  };
}

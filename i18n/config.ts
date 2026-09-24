export const locales = ['zh-CN', 'en', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh-CN';
/** 语言偏好 cookie 名 */
export const LOCALE_COOKIE = 'NEXT_LOCALE';
/** cookie 有效期（秒）：1 年 */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export interface LocaleMeta {
  /** 切换器中显示的语言自称（用该语言自身书写） */
  label: string;
  /** 英文说明，供 aria-label 与测试定位 */
  englishName: string;
  /** <html lang> 取值 */
  htmlLang: string;
  /** 书写方向，为 RTL 语言预留 */
  dir: 'ltr' | 'rtl';
  /** og:locale 取值（下划线格式） */
  ogLocale: string;
  /** 字体栈键名，对应 tailwind.config 中的 fontFamily */
  fontStack: 'cjk' | 'latin';
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  'zh-CN': {
    label: '简体中文',
    englishName: 'Simplified Chinese',
    htmlLang: 'zh-CN',
    dir: 'ltr',
    ogLocale: 'zh_CN',
    fontStack: 'cjk',
  },
  en: {
    label: 'English',
    englishName: 'English',
    htmlLang: 'en',
    dir: 'ltr',
    ogLocale: 'en_US',
    fontStack: 'latin',
  },
  ja: {
    label: '日本語',
    englishName: 'Japanese',
    htmlLang: 'ja',
    dir: 'ltr',
    ogLocale: 'ja_JP',
    fontStack: 'cjk',
  },
};

/**
 * 大小写不敏感地查找规范 locale。
 * 浏览器可能发送 "zh-CN"、"zh-cn" 或 "zh-Hans-CN"，需统一映射到 locales 中的规范写法。
 */
export function canonicalLocale(value: string): Locale | null {
  const lower = value.toLowerCase();
  return locales.find((l) => l.toLowerCase() === lower) ?? null;
}

export function isLocale(value: string): value is Locale {
  return canonicalLocale(value) !== null;
}

/**
 * 从 Accept-Language 头中挑出首个被支持的 locale，按 q 值降序。
 * 精确匹配失败后退回主语言，如 ja-JP -> ja。
 * 返回值始终为 locales 中的规范写法（如 'zh-CN' 而非 'zh-cn'）。
 */
export function matchLocale(acceptLanguage: string): Locale | null {
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag = '', qRaw] = part.trim().split(';q=');
      const q = qRaw ? Number.parseFloat(qRaw) : 1;
      return { tag, q: Number.isNaN(q) ? 0 : q };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const exact = canonicalLocale(tag);
    if (exact) return exact;
    const primary = canonicalLocale(tag.split('-')[0] ?? '');
    if (primary) return primary;
  }
  return null;
}

/** 协商优先级：cookie > Accept-Language > 默认 */
export function negotiateLocale(
  cookieValue?: string | null,
  acceptLanguage?: string | null,
): Locale {
  if (cookieValue && isLocale(cookieValue)) return cookieValue;
  if (acceptLanguage) {
    const matched = matchLocale(acceptLanguage);
    if (matched) return matched;
  }
  return defaultLocale;
}

/** 给路径加 locale 前缀，如 ('en', '/#about') -> '/en/#about' */
export function localizedPath(locale: Locale, path = '/'): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** 剥离路径中的 locale 前缀，返回规范写法（如 /zh-cn -> 'zh-CN'） */
export function stripLocale(pathname: string): { locale: Locale | null; path: string } {
  const seg = pathname.split('/')[1];
  const locale = seg ? canonicalLocale(seg) : null;
  if (locale && seg) {
    const rest = pathname.slice(seg.length + 1);
    return { locale, path: rest === '' ? '/' : rest };
  }
  return { locale: null, path: pathname };
}

import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  locales,
  defaultLocale,
  localeMeta,
  canonicalLocale,
  isLocale,
  matchLocale,
  negotiateLocale,
  localizedPath,
  stripLocale,
} from '../../i18n/config';
import { t, type Dictionary } from '../../i18n/t';

/**
 * 本文件覆盖 SPEC 7.7 中「不依赖组件与 Zod」的多语言用例。
 * 以下用例需先完成对应开发任务后才能运行，届时在本文件补充：
 *   I18N-001 / I18N-013  → 需 T3（Zod Schema）+ T5（图标白名单）
 *   I18N-002             → 需 T16（i18n/request.ts，服务端专用）
 *   I18N-014~022 / 025   → 需 T17/T18 的 E2E 环境
 */

// Vitest 以 ESM 运行，没有 __dirname；测试统一从项目根目录启动，故用 cwd()
const ROOT = process.cwd();
const DEFAULT_LOCALE = 'zh-CN';

function readJson<T = unknown>(rel: string): T {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8')) as T;
}

/** 收集对象全部叶子节点的 key 路径，数组按索引展开 */
function keyPaths(value: unknown, prefix = '', out: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item, i) => keyPaths(item, `${prefix}[${i}]`, out));
    return out;
  }
  if (value && typeof value === 'object') {
    for (const k of Object.keys(value as Record<string, unknown>)) {
      keyPaths((value as Record<string, unknown>)[k], prefix ? `${prefix}.${k}` : k, out);
    }
    return out;
  }
  out.push(prefix);
  return out;
}

// ---------------------------------------------------------------- 常量

describe('locale 常量', () => {
  it('locales 覆盖中英日，且默认语言为 zh-CN', () => {
    expect(locales).toEqual(['zh-CN', 'en', 'ja']);
    expect(defaultLocale).toBe('zh-CN');
    expect((locales as readonly string[]).includes(defaultLocale)).toBe(true);
  });

  it('每个 locale 都有完整且合法的 meta', () => {
    for (const locale of locales) {
      const meta = localeMeta[locale];
      expect(meta.label).toBeTruthy();
      expect(meta.htmlLang).toBeTruthy();
      expect(meta.ogLocale).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
      expect(['ltr', 'rtl']).toContain(meta.dir);
      expect(['cjk', 'latin']).toContain(meta.fontStack);
    }
  });

  it('locale 文件与 locales 常量一一对应', () => {
    const files = readdirSync(join(ROOT, 'config/locales'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
      .sort();
    expect(files).toEqual([...locales].sort());
  });
});

// ---------------------------------------------------------------- isLocale

describe('isLocale（I18N-006）', () => {
  it('支持的语言返回 true', () => {
    expect(isLocale('zh-CN')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('ja')).toBe(true);
  });

  it('不支持的语言返回 false', () => {
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('zh')).toBe(false);
    expect(isLocale('')).toBe(false);
  });
});

describe('canonicalLocale（大小写归一）', () => {
  it('把任意大小写映射到规范写法', () => {
    expect(canonicalLocale('zh-cn')).toBe('zh-CN');
    expect(canonicalLocale('ZH-CN')).toBe('zh-CN');
    expect(canonicalLocale('zh-CN')).toBe('zh-CN');
    expect(canonicalLocale('EN')).toBe('en');
  });

  it('未知语言返回 null', () => {
    expect(canonicalLocale('fr')).toBeNull();
    expect(canonicalLocale('')).toBeNull();
  });

  it('matchLocale 不受大小写影响', () => {
    expect(matchLocale('zh-CN,zh;q=0.9')).toBe('zh-CN');
    expect(matchLocale('zh-cn,zh;q=0.9')).toBe('zh-CN');
  });

  it('stripLocale 返回规范 locale', () => {
    expect(stripLocale('/zh-cn/about')).toEqual({ locale: 'zh-CN', path: '/about' });
  });
});

// ---------------------------------------------------------------- matchLocale

describe('matchLocale（I18N-008）', () => {
  it('按 q 值降序挑选', () => {
    expect(matchLocale('ja-JP,ja;q=0.9,en;q=0.8')).toBe('ja');
  });

  it('主语言回退：ja-JP -> ja', () => {
    expect(matchLocale('ja-JP')).toBe('ja');
  });

  it('精确匹配优先于主语言回退', () => {
    expect(matchLocale('zh-CN,zh;q=0.9')).toBe('zh-CN');
  });

  it('q 值高者胜出', () => {
    expect(matchLocale('en;q=0.3,ja;q=0.9')).toBe('ja');
  });

  it('全部不支持时返回 null', () => {
    expect(matchLocale('de-DE,de;q=0.9,fr;q=0.8')).toBeNull();
  });
});

// ---------------------------------------------------------------- negotiateLocale

describe('negotiateLocale（I18N-007 / I18N-009）', () => {
  it('cookie 优先于 Accept-Language', () => {
    expect(negotiateLocale('ja', 'en-US,en;q=0.9')).toBe('ja');
  });

  it('无 cookie 时按 Accept-Language 协商', () => {
    expect(negotiateLocale(null, 'en-US,en;q=0.9')).toBe('en');
  });

  it('都不支持时回退默认语言', () => {
    expect(negotiateLocale(null, 'de-DE,de;q=0.9')).toBe('zh-CN');
  });

  it('cookie 非法值时忽略，继续走 Accept-Language', () => {
    expect(negotiateLocale('klingon', 'ja-JP,ja;q=0.9')).toBe('ja');
  });

  it('两者皆空时回退默认语言', () => {
    expect(negotiateLocale()).toBe('zh-CN');
  });
});

// ---------------------------------------------------------------- 路径工具

describe('localizedPath / stripLocale（I18N-012）', () => {
  it('加前缀后剥离可还原', () => {
    const built = localizedPath('en', '/#about');
    expect(built).toBe('/en/#about');
    expect(stripLocale(built)).toEqual({ locale: 'en', path: '/#about' });
  });

  it('根路径处理正确', () => {
    expect(localizedPath('ja')).toBe('/ja');
    expect(stripLocale('/ja')).toEqual({ locale: 'ja', path: '/' });
    expect(stripLocale('/ja/')).toEqual({ locale: 'ja', path: '/' });
  });

  it('无 locale 前缀时 locale 为 null', () => {
    expect(stripLocale('/about')).toEqual({ locale: null, path: '/about' });
    expect(stripLocale('/')).toEqual({ locale: null, path: '/' });
  });

  it('不被相似前缀误伤', () => {
    expect(stripLocale('/english')).toEqual({ locale: null, path: '/english' });
  });
});

// ---------------------------------------------------------------- t() 插值

describe('t() 文案查找与插值（I18N-010 / I18N-011）', () => {
  const zhDict = readJson<Dictionary>('messages/zh-CN.json');
  const enDict = readJson<Dictionary>('messages/en.json');
  const jaDict = readJson<Dictionary>('messages/ja.json');

  it('三语言均渲染出 rating 且互不相同', () => {
    const a = t(zhDict, 'testimonials.ratingLabel', { rating: 5 });
    const b = t(enDict, 'testimonials.ratingLabel', { rating: 5 });
    const c = t(jaDict, 'testimonials.ratingLabel', { rating: 5 });

    for (const s of [a, b, c]) expect(s).toContain('5');
    expect(new Set([a, b, c]).size).toBe(3);
  });

  it('无插值变量时原样返回', () => {
    expect(t(zhDict, 'nav.openMenu')).toBe('打开菜单');
  });

  it('未提供变量时保留占位符', () => {
    expect(t(zhDict, 'language.current')).toBe('当前语言：{label}');
  });

  it('语言自称使用各自语言书写', () => {
    expect(localeMeta['zh-CN'].label).toBe('简体中文');
    expect(localeMeta.ja.label).toBe('日本語');
  });

  it('开发环境下缺 key 抛错', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(() => t(zhDict, 'not.a.key')).toThrowError(/缺少文案 key/);
    vi.unstubAllEnvs();
  });

  it('生产环境下缺 key 回退为 key 本身并告警', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(t(zhDict, 'not.a.key')).toBe('not.a.key');
    expect(warn).toHaveBeenCalledTimes(1);

    warn.mockRestore();
    vi.unstubAllEnvs();
  });
});

// ---------------------------------------------------------------- 结构对齐

describe('多语言结构对齐（I18N-003）', () => {
  const base = readJson(`config/locales/${DEFAULT_LOCALE}.json`);
  const basePaths = keyPaths(base);

  for (const locale of locales) {
    it(`config/locales/${locale}.json 的字段路径与默认语言完全一致`, () => {
      const target = readJson(`config/locales/${locale}.json`);
      const targetPaths = keyPaths(target);
      expect(targetPaths.filter((p) => !basePaths.includes(p))).toEqual([]);
      expect(basePaths.filter((p) => !targetPaths.includes(p))).toEqual([]);
    });

    it(`config/locales/${locale}.json 的 meta.locale 与文件名一致`, () => {
      const cfg = readJson<{ meta: { locale: string } }>(`config/locales/${locale}.json`);
      expect(cfg.meta.locale).toBe(locale);
    });
  }

  it('非文案字段在各语言间保持一致', () => {
    const zh = readJson<{ theme: unknown; brand: { name: string }; contact: { email: string } }>(
      'config/locales/zh-CN.json',
    );
    for (const locale of locales) {
      const other = readJson<{ theme: unknown; brand: { name: string }; contact: { email: string } }>(
        `config/locales/${locale}.json`,
      );
      expect(other.theme).toEqual(zh.theme);
      expect(other.brand.name).toBe(zh.brand.name);
      expect(other.contact.email).toBe(zh.contact.email);
    }
  });

  it('文案字段在各语言间确实不同（防止漏翻）', () => {
    const zh = readJson<{ hero: { headline: string } }>('config/locales/zh-CN.json');
    const en = readJson<{ hero: { headline: string } }>('config/locales/en.json');
    const ja = readJson<{ hero: { headline: string } }>('config/locales/ja.json');
    expect(new Set([zh.hero.headline, en.hero.headline, ja.hero.headline]).size).toBe(3);
  });
});

describe('UI 字典 key 对齐（I18N-004）', () => {
  const baseKeys = Object.keys(readJson<Dictionary>(`messages/${DEFAULT_LOCALE}.json`)).sort();

  for (const locale of locales) {
    it(`messages/${locale}.json 的 key 集合与默认语言一致`, () => {
      const keys = Object.keys(readJson<Dictionary>(`messages/${locale}.json`)).sort();
      expect(keys).toEqual(baseKeys);
    });
  }

  it('所有文案值非空且不含占位禁用词', () => {
    for (const locale of locales) {
      const dict = readJson<Dictionary>(`messages/${locale}.json`);
      for (const [key, value] of Object.entries(dict)) {
        expect(value.trim(), `${locale}/${key}`).not.toBe('');
        for (const bad of ['TODO', 'FIXME', 'undefined']) {
          expect(value.includes(bad), `${locale}/${key}`).toBe(false);
        }
      }
    }
  });
});

describe('默认语言同步（I18N-005）', () => {
  it('config/site-data.json 与 config/locales/zh-CN.json 深比较相等', () => {
    const synced = readJson('config/site-data.json');
    expect(synced).toEqual(readJson(`config/locales/${DEFAULT_LOCALE}.json`));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

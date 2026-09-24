/**
 * 纯文案查找模块 —— 客户端安全，不含 server-only 依赖。
 * 之所以与 i18n/request.ts 分离：request.ts 被标记为 server-only，
 * 而 LanguageSwitcher 等客户端组件同样需要 t() 做插值。
 */

export type Dictionary = Record<string, string>;

/**
 * 文案查找 + {var} 插值。
 * 开发期缺 key 直接抛错（快速失败），生产期回退显示 key 本身并告警。
 */
export function t(
  dict: Dictionary,
  key: string,
  vars?: Record<string, string | number>,
): string {
  let template = dict[key];

  if (template === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`[i18n] 缺少文案 key: "${key}"`);
    }
    console.warn(`[i18n] 缺少文案 key: "${key}"，已回退显示 key 本身`);
    template = key;
  }

  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, name: string) =>
    name in vars ? String(vars[name]) : m,
  );
}

// NEXT_PUBLIC_* 构建期内联，客户端/服务端同源可用
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** 给站内绝对路径加 basePath（GitHub Pages 项目站为 /<repo>，其余为空） */
export function withBase(path: string): string {
  if (!BASE_PATH) return path;
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;
  if (path === '/') return `${BASE_PATH}/`;
  return `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
}

/** 导航链接：#锚点指向当前语言首页对应锚点（子页面也可用），站内路径加 basePath */
export function resolveNavHref(href: string, locale: string): string {
  if (href.startsWith('#')) return `${withBase(`/${locale}`)}${href}`;
  return withBase(href);
}

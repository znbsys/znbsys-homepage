import { NextResponse, type NextRequest } from 'next/server';
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  localizedPath,
  negotiateLocale,
  stripLocale,
} from '@/i18n/config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 管理页不参与 locale 协商，直接放行
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.next();
  }

  // 已带合法 locale 前缀：同步 cookie 并放行
  const { locale } = stripLocale(pathname);
  if (locale) {
    const response = NextResponse.next();
    if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: '/',
        maxAge: LOCALE_COOKIE_MAX_AGE,
        sameSite: 'lax',
      });
    }
    return response;
  }

  // 无前缀：按 cookie > Accept-Language > 默认 协商后重定向。
  // 必须使用 302（临时），不能用 308 —— 永久重定向会被浏览器缓存，导致用户无法再切换语言。
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value ?? null;
  const acceptLanguage = request.headers.get('accept-language');
  const target = negotiateLocale(cookieLocale, acceptLanguage);

  const url = request.nextUrl.clone();
  url.pathname = localizedPath(target, pathname);
  return NextResponse.redirect(url, 302);
}

export const config = {
  // 排除 _next、api 与所有带扩展名的静态资源，否则会触发无限重定向
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};

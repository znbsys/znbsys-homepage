# znbsys-homepage 完整开发与测试规范（Single Source of Truth）

> 本文件是本项目 **唯一权威规范**。它整合并修正了 `../README.md` 与 `DESING.md` 两份需求文档中互相冲突的部分，补齐了缺失的组件实现、 **多语言（i18n）能力**与测试策略。
> 执行者（人或 AI）只需按本文件自上而下推进，即可完成 **全部开发 + 全部测试**并达成验收。
>
> 设计参考：[awesome-design-md](https://github.com/voltagent/awesome-design-md)

---

## 0. 如何使用本文件

| 你的角色 | 阅读路径 |
| --- | --- |
| 开发执行者 | 第 2 章（架构）→ 第 3 章（目录）→ 第 4 章（数据契约）→ 第 5 章（任务清单 T1–T18） |
| 测试执行者 | 第 4 章（契约）→ 第 6 章（测试体系）→ 第 7 章（用例清单） |
| 验收 / Review | 第 8 章（CI）→ 第 9 章（DoD 验收标准） |
| 二次开发者 | 第 10 章（扩展与多站点）→ 第 11 章（风险与 FAQ） |
| **多语言维护者** | **第 2.4 节（i18n 决策）→ 第 4.5 节（多语言契约）→ T15–T18 → 第 7.7 节** |

**约定术语**

- **P0**：必须完成，缺失即验收失败。
- **P1**：应当完成，缺失需记录原因。
- **P2**：锦上添花。
- **主产物**：Next.js 站点（SSG 静态导出）。
- **分发产物**：由同一份 JSON 生成的单文件 `index.html`。
- **内容文案**：来自 `config/locales/*.json` 的业务文案（headline、feature 描述等）。
- **UI 文案**：组件内置的界面词（"打开菜单"、"评分 5 分"），来自 `messages/*.json`。
- **Locale**：语言区域标识，形如 `zh-CN` / `en` / `ja`。

---

## 1. 需求分析：两份文档的冲突与缺口

### 1.1 冲突矩阵

| 维度 | `../README.md` | `DESING.md` | 本规范的裁决 |
| --- | --- | --- | --- |
| 交付形态 | 单文件 `index.html` | Next.js 工程 | **双轨**：Next.js 为主产物，单文件 HTML 为构建产物（见 T14） |
| 样式方案 | Tailwind CDN | Tailwind 构建期编译 | 主产物用编译版（可 purge）；单文件用 CDN，二者类名集合保持一致 |
| 图标 | FontAwesome / Lucide CDN | `lucide-react` npm 包 | 统一 **Lucide**，共用同一份图标白名单 |
| 数据契约 | 含 `theme`、`social`、`about.image`、`hero.background` | 无上述字段 | **取并集**，见第 4 章统一 Schema |
| 语言/类型 | 原生 JS，弱类型 | TypeScript 强类型 | 主产物 TS 强类型；单文件运行时用 Zod 产物做校验 |
| 渲染方式 | 浏览器端 DOM 拼装 | React 服务端渲染 | 主产物 RSC/SSG；单文件保留客户端渲染 |

### 1.2 缺口清单（两份文档都没覆盖到的部分）

| # | 缺口 | 严重度 | 本规范对应章节 |
| --- | --- | --- | --- |
| G1 | `Navbar` / `Footer` 组件未给出实现 | P0 | T6 |
| G2 | `About` / `Testimonials` / `Contact` 组件未给出实现 | P0 | T7、T8、T9 |
| G3 | `globals.css`、`../tailwind.config.ts`、`package.json` 缺失 | P0 | T1、T2 |
| G4 | 图标名无校验，JSON 写错名字会静默退化成 `HelpCircle` | P0 | T5 + UT-009 |
| G5 | 移动端导航（汉堡菜单）未定义 | P0 | T6 + E2E-004 |
| G6 | 完全没有任何测试策略 | P0 | 第 6、7 章 |
| G7 | 无响应式断点与无障碍要求 | P1 | T12 + A11Y 用例 |
| G8 | 无多站点切换的验证手段 | P1 | T13 + IT-005 |
| G9 | 单文件 HTML 与主站数据一致性无保障 | P1 | T14 + UT-020 |
| **G10** | **无任何多语言能力，文案全部硬编码中文** | **P0** | 第 2.4 节 + T15–T18 |
| **G11** | **URL 无语言前缀，无法做 hreflang 与分语言 SEO** | **P0** | T17、T18 |
| **G12** | **无语言协商（Accept-Language / cookie）机制** | **P1** | T17 + I18N-007~009 |
| **G13** | **多语言文案易漏翻，且无一致性校验** | **P0** | I18N-003~005、011 |
| **G14** | **中日韩与拉丁字体混排、行高未区分** | **P2** | T2、T18 + 第 11 章 |

### 1.3 明确废止的旧要求

1. `DESING.md` 中"禁止占位符缩写"的要求**保留**，但其自身只提供了 5 个组件中的 4 段代码，本规范以 T1–T11 补齐全部代码。
2. `../README.md` 中"在 JS 里内嵌默认 `siteData`"的要求 **改为**：单文件 HTML 在构建时由 `config/locales/{locale}.json` 注入，禁止手写第二份副本。
3. **新增硬性约束**：组件内禁止出现任何自然语言字符串（中文、英文、日文一律禁止），必须走 `t()` 或 props。违反者 CR 直接打回。

---

## 2. 技术决策与架构

### 2.1 技术栈（锁定版本）

```
Next.js        14.2.x   App Router
React          18.3.x
TypeScript     5.4.x    strict: true
Tailwind CSS   3.4.x
lucide-react   0.400.x
Zod            3.23.x       运行时校验 JSON
server-only    0.0.1       防止 i18n/request.ts 被客户端误引用
Vitest         1.6.x        单元 / 组件测试
@testing-library/react  16.x
Playwright     1.44.x       E2E + 视觉回归 + a11y
axe-core       4.9.x
ESLint 8.x + Prettier 3.x
```

> **i18n 决策：不引入 `next-intl` / `react-i18next`。**
> 理由：本项目 99% 的文案已由 JSON 数据驱动，所需能力仅为「locale 前缀路由 + 字典查找 + `{var}` 插值」，自研约 120 行即可覆盖。引入第三方库会扩大 API 面积、增加升级负担，且与"零代码改 JSON"的核心理念冲突。
> 若后续需要复数规则（plural）或 ICU 消息格式，再评估迁移，届时 I18N 用例需同步改写。

### 2.2 架构原则

1. **单一数据源（SSOT）**：`config/locales/{locale}.json` 是唯一内容来源。任何硬编码文案都视为缺陷。
2. **样式与数据彻底解耦**：组件只接收 `SiteConfig` 的子树 + `dict` 字典作为 props，不感知品牌与语言。
3. **契约先行**：TypeScript 类型 + Zod Schema 双保险，JSON 变更在 CI 阶段即被拦截。
4. **渐进增强**：所有 Section 均可缺省；缺失时组件返回 `null` 而非报错。
5. **同构可测**：组件为纯函数式，接受 props 即可渲染，无需全局状态即可单测。
6. **翻译完整性由机器保证**：所有 locale 的 key 路径集合必须与默认 locale 完全一致，由 CI 门禁校验（I18N-003）。

### 2.3 数据流

```
                    请求  /  或  /zh-CN/...
                             │
                    middleware.ts（locale 协商）
                    URL 前缀 > cookie > Accept-Language > 默认
                             │
                             ▼
              app/[locale]/layout.tsx  ──►  <html lang dir> + CSS 变量
                             │
        ┌────────────────────┼──────────────────────┐
        ▼                    ▼                      ▼
  i18n/request.ts      i18n/request.ts       generateStaticParams
 getSiteConfig(locale) getDictionary(locale)    （全 locale 预渲染）
        │                    │
        │            messages/{locale}.json（UI 文案）
        ▼
 config/locales/{locale}.json（内容文案）
        │  Zod 解析 + TS 断言 + 构建期缓存
        ▼
   app/[locale]/page.tsx（按 order 组装 Section）
        │
        ├──► components/sections/*.tsx   ──► components/DynamicIcon.tsx
        └──► components/LanguageSwitcher.tsx（保留路径与 hash 切换）

  scripts/build-standalone.mjs ──► dist/{locale}/index.html
```

### 2.4 i18n 核心决策

| 决策点 | 结论 |
| --- | --- |
| 路由形态 | **路径前缀** `../app/[locale]`（非域名、非 query），利于 SEO 与静态导出 |
| 默认语言 | `zh-CN`，**不省略前缀**；`/` 由 middleware 302 到 `/zh-CN`（避免 `/` 与 `/zh-CN` 内容重复） |
| 协商优先级 | URL 前缀 > cookie `NEXT_LOCALE` > `Accept-Language` > 默认 |
| 重定向状态码 | **302/307 临时**，禁用 308（永久重定向会被浏览器缓存，导致用户改不了语言） |
| 内容文案组织 | 每 locale 一份**完整** `SiteConfig`（`config/locales/{locale}.json`） |
| UI 文案组织 | `messages/{locale}.json`，扁平 key + `{var}` 插值 |
| 缺失翻译 | 开发期抛错；生产期回退默认 locale 并 `console.warn`（I18N-011） |
| 支持列表 | `zh-CN`（默认）、`en`、`ja`；新增语言只需加 2 个 JSON + 改 1 个常量（见 10.2） |
| RTL | 数据模型预留 `dir` 字段，本期仅 `ltr`（P2） |
| 字体 | 按 locale 切换 CJK / Latin 字体栈与行高（T2、T18） |
| SEO | `hreflang` alternates + `x-default` + `og:locale` + `og:locale:alternate` |
| 静态资源 | middleware `matcher` 必须排除 `_next` 与带扩展名路径，否则无限重定向 |

---

## 3. 目录结构（最终态）

```text
znbsys-homepage/
├── config/
│   ├── site-data.json              # 默认语言入口（由脚本从 locales/zh-CN.json 同步，向后兼容）
│   ├── locales/                    # 多语言内容配置，每 locale 一份完整 SiteConfig
│   │   ├── zh-CN.json              # 默认语言
│   │   ├── en.json
│   │   └── ja.json
│   └── fixtures/
│       ├── minimal.json            # 最小化配置（仅必填字段，用于边界测试）
│       └── brand-b.json            # 第二个品牌（用于多站点切换测试）
├── messages/                       # UI 文案字典（组件内置词）
│   ├── zh-CN.json
│   ├── en.json
│   └── ja.json
├── i18n/
│   ├── config.ts                   # locales 常量、默认语言、cookie 名、localeMeta、协商函数
│   ├── t.ts                        # 纯插值函数（客户端安全，无 server-only）
│   └── request.ts                  # 服务端：getSiteConfig / getDictionary / buildAlternates
├── types/
│   └── siteConfig.ts               # TS 类型契约
├── schemas/
│   └── siteConfigSchema.ts         # Zod 运行时校验
├── lib/
│   ├── config.ts                   # 配置读取中心（默认 locale 便捷入口）
│   ├── icons.ts                    # Lucide 图标白名单
│   ├── color.ts                    # hex → "R G B" 转换
│   ├── theme.ts                    # 主题 → CSS 变量
│   └── cn.ts                       # className 合并工具
├── components/
│   ├── DynamicIcon.tsx
│   ├── LanguageSwitcher.tsx        # 语言切换器
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── MobileMenu.tsx
│   │   └── Footer.tsx
│   └── sections/
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── About.tsx
│       ├── Testimonials.tsx
│       └── Contact.tsx
├── app/
│   ├── layout.tsx                  # 最小根布局（透传，供全局 404 使用）
│   ├── [locale]/
│   │   ├── layout.tsx              # 语言布局：lang / dir / 字体 / hreflang
│   │   ├── page.tsx                # 动态渲染的主页入口
│   │   └── not-found.tsx
│   ├── not-found.tsx               # 全局 404（无 locale 上下文）
│   └── globals.css
├── scripts/
│   ├── build-standalone.mjs        # 生成 dist/{locale}/index.html
│   ├── sync-default-locale.mjs     # locales/zh-CN.json → site-data.json
│   ├── check-i18n-parity.mjs       # 翻译完整性校验（CI 门禁 5）
│   └── validate-config.ts          # 校验任意 JSON（含全部 locale）
├── tests/
│   ├── unit/
│   ├── component/
│   └── e2e/
├── .github/workflows/ci.yml
├── middleware.ts                   # locale 协商与重定向
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.mjs
├── playwright.config.ts
├── vitest.config.ts
└── SPEC.md                          # 本文件
```

---

## 4. 统一数据契约

### 4.1 TypeScript 类型定义（`../types/siteConfig.ts`）

```typescript
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
  | 'github' | 'x' | 'wechat' | 'linkedin'
  | 'email' | 'website' | 'zhihu' | 'bilibili';

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
```

> `about` 与 `testimonials` 为可选：缺失时对应组件不渲染，页面不得出现空 Section（由 IT-003 / IT-004 守护）。

### 4.2 Zod 运行时校验（`../schemas/siteConfigSchema.ts`）

```typescript
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
    ogImage: z.string().url().optional(),
    locale: z.string().default('zh-CN'),
  }),
  theme: z.object({
    primary: z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'primary 必须是十六进制颜色'),
    secondary: z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
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
          iconName: z.string().refine((n) => ICON_WHITELIST.includes(n), {
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
      stats: z.array(z.object({ label: z.string(), value: z.string(), suffix: z.string().optional() })),
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
          rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
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
        platform: z.enum(['github', 'x', 'wechat', 'linkedin', 'email', 'website', 'zhihu', 'bilibili']),
        label: z.string().min(1),
        href: z.string().min(1),
      }),
    ),
  }),
  footer: z.object({
    copyright: z.string().min(1),
    links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
    linkGroups: z
      .array(z.object({ title: z.string(), links: z.array(z.object({ label: z.string(), href: z.string() })) }))
      .optional(),
  }),
  order: z.array(z.enum(['hero', 'features', 'about', 'testimonials', 'contact'])).optional(),
});

export type SiteConfigInput = z.input<typeof SiteConfigSchema>;
```

### 4.3 内容配置（`../config/locales/zh-CN.json`）

默认语言，字段完整、可直接运行（原 `../config/site-data.json` 内容迁移至此）：

```json
{
  "meta": {
    "title": "VoltAgent - 下一代 AI Agent 构建平台",
    "description": "专为企业打造的高性能 AI 代理开发与编排框架，一套 JSON 配置即可生成完整官网。",
    "keywords": ["AI Agent", "企业官网", "Next.js", "Tailwind CSS"],
    "favicon": "/favicon.ico",
    "ogImage": "/og.png",
    "locale": "zh-CN"
  },
  "theme": {
    "primary": "#2563eb",
    "secondary": "#7c3aed",
    "radius": "xl",
    "font": "sans",
    "background": "gradient"
  },
  "brand": {
    "name": "VoltAgent",
    "logoSvg": "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M13 2 3 14h9l-1 8 10-12h-9l1-8z'/></svg>",
    "tagline": "智能代理，驱动未来"
  },
  "navbar": {
    "sticky": true,
    "links": [
      { "label": "核心功能", "href": "#features" },
      { "label": "关于我们", "href": "#about" },
      { "label": "客户评价", "href": "#testimonials" },
      { "label": "联系我们", "href": "#contact" }
    ],
    "ctaButton": { "text": "立即开始", "href": "#contact" }
  },
  "hero": {
    "badge": "🚀 1.0 版本现已发布",
    "headline": "构建高吞吐、模块化的企业级 AI Agent 系统",
    "subheadline": "基于响应式架构设计，只需一套 JSON 配置，几分钟内即可部署定制化 AI 业务流程。",
    "primaryCta": { "text": "免费试用", "href": "#contact" },
    "secondaryCta": { "text": "查看文档", "href": "https://github.com/voltagent", "target": "_blank" }
  },
  "features": {
    "title": "为什么选择 VoltAgent",
    "subtitle": "提供端到端的 Agent 开发、编排与监控支撑",
    "columns": 3,
    "items": [
      { "iconName": "Zap", "title": "极速响应", "description": "优化数据管线，支持毫秒级流式响应与并发调度。" },
      { "iconName": "Shield", "title": "企业级安全", "description": "内置数据合规防护网与沙箱隔离机制，保障数据隐私。" },
      { "iconName": "Layers", "title": "模块化编排", "description": "灵活插拔 Tools、Memory 与 LLM 驱动引擎，轻松扩展。" },
      { "iconName": "GitBranch", "title": "可视化流程", "description": "拖拽式编排 Agent 工作流，实时观测每一步执行链路。" },
      { "iconName": "BarChart3", "title": "全链路可观测", "description": "内置 Token 消耗、延迟与成功率看板，成本一目了然。" },
      { "iconName": "Plug", "title": "生态即插即用", "description": "预置 80+ 数据源连接器，10 分钟接入既有业务系统。" }
    ]
  },
  "about": {
    "title": "重塑企业生产力引擎",
    "description": [
      "VoltAgent 致力于降低企业应用人工智能的门槛。",
      "我们的开源生态与商业化工具链已经帮助全球数百家企业构建了自己的智能化工作流。"
    ],
    "stats": [
      { "label": "企业客户", "value": "500", "suffix": "+" },
      { "label": "日均 API 调用", "value": "10M", "suffix": "+" },
      { "label": "开源 Star 数", "value": "12k", "suffix": "+" }
    ]
  },
  "testimonials": {
    "title": "行业领袖的信赖之选",
    "subtitle": "来自不同规模团队的真实反馈",
    "items": [
      { "quote": "VoltAgent 帮我们将 AI 业务落地时间缩短了 70%，架构清晰度令人惊艳。", "author": "张伟", "role": "CTO", "company": "科技前沿 Co.", "rating": 5 },
      { "quote": "从 POC 到生产环境只用了三周，运维成本远低于自建方案。", "author": "李娜", "role": "技术总监", "company": "云启科技", "rating": 5 },
      { "quote": "沙箱隔离机制让我们敢于把核心数据交给 Agent 处理。", "author": "王强", "role": "架构师", "company": "数智未来", "rating": 4 }
    ]
  },
  "contact": {
    "title": "准备好开启您的 AI 转型了吗？",
    "subtitle": "留下联系方式，我们的解决方案架构师将在 24 小时内与您取得联系。",
    "email": "contact@voltagent.com",
    "phone": "+86 (021) 8888-9999",
    "address": "大阪市天王区玉造元町",
    "socials": [
      { "platform": "github", "label": "GitHub", "href": "https://github.com/voltagent" },
      { "platform": "x", "label": "X", "href": "https://x.com/voltagent" },
      { "platform": "email", "label": "邮件", "href": "mailto:contact@voltagent.com" }
    ]
  },
  "footer": {
    "copyright": "© 2026 VoltAgent Inc. 保留所有权利。",
    "linkGroups": [
      { "title": "产品", "links": [{ "label": "核心功能", "href": "#features" }, { "label": "更新日志", "href": "#" }] },
      { "title": "资源", "links": [{ "label": "开发文档", "href": "https://github.com/voltagent" }, { "label": "社区", "href": "https://github.com/voltagent" }] },
      { "title": "法务", "links": [{ "label": "隐私政策", "href": "#" }, { "label": "服务条款", "href": "#" }] }
    ]
  },
  "order": ["hero", "features", "about", "testimonials", "contact"]
}
```

`en.json` / `ja.json` 与之**结构完全一致**，仅替换文案；`meta.locale` 分别为 `en` / `ja`，`theme` / `favicon` 等非文案字段保持一致。

### 4.4 测试夹具

- `../config/fixtures/minimal.json`： **仅含必填字段**，用于验证可选 Section 缺省不崩溃。
- `../config/fixtures/brand-b.json`：换品牌配置（不同 `theme.primary`、不同栏目文案、仅 2 个 feature），用于多站点切换测试与视觉对比。

---

## 4.5 多语言（i18n）契约

### 4.5.1 Locale 常量与协商（`../i18n/config.ts`）

```typescript
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
  'zh-CN': { label: '简体中文', englishName: 'Simplified Chinese', htmlLang: 'zh-CN', dir: 'ltr', ogLocale: 'zh_CN', fontStack: 'cjk' },
  'en':    { label: 'English',  englishName: 'English',            htmlLang: 'en',    dir: 'ltr', ogLocale: 'en_US', fontStack: 'latin' },
  'ja':    { label: '日本語',    englishName: 'Japanese',           htmlLang: 'ja',    dir: 'ltr', ogLocale: 'ja_JP', fontStack: 'cjk' },
};

export function isLocale(value: string): value is Locale {
/**
 * 大小写不敏感地查找规范 locale。
 * 浏览器可能发送 "zh-CN"、"zh-cn" 或 "zh-Hans-CN"，必须统一映射到 locales 中的规范写法。
 * 注意：不能先 toLowerCase() 再与 locales 直接比较 —— 'zh-cn' 永远匹配不到 'zh-CN'，
 * 这是实际踩过的坑（I18N-008 曾因此失败）。
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
 * 精确匹配失败后退回主语言，如 ja-JP -> ja。返回值始终为规范写法。
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
    // 精确匹配失败后退回主语言，如 ja-JP -> ja
    const primary = canonicalLocale(tag.split('-')[0] ?? '');
    if (primary) return primary;
  }
  return null;
}

/** 协商优先级：cookie > Accept-Language > 默认 */
export function negotiateLocale(cookieValue?: string | null, acceptLanguage?: string | null): Locale {
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
```

### 4.5.2 UI 文案字典（`messages/{locale}.json`）

**扁平 key + `{var}` 插值**，所有 locale 的 key 集合必须完全一致（I18N-004）。

`../messages/zh-CN.json`：

```json
{
  "nav.openMenu": "打开菜单",
  "nav.closeMenu": "关闭菜单",
  "nav.primary": "主导航",
  "hero.badgeFallback": "最新动态",
  "testimonials.ratingLabel": "评分 {rating} 分，满分 5 分",
  "testimonials.avatarFallback": "匿名用户",
  "contact.email": "邮箱",
  "contact.phone": "电话",
  "contact.address": "地址",
  "contact.followUs": "关注我们",
  "footer.backToTop": "回到顶部",
  "language.switch": "切换语言",
  "language.current": "当前语言：{label}",
  "notFound.title": "页面不存在",
  "notFound.description": "抱歉，您访问的页面已下线或从未存在。",
  "notFound.backHome": "返回首页",
  "icon.missing": "图标缺失"
}
```

`../messages/en.json`：

```json
{
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "nav.primary": "Primary navigation",
  "hero.badgeFallback": "Latest updates",
  "testimonials.ratingLabel": "Rated {rating} out of 5",
  "testimonials.avatarFallback": "Anonymous",
  "contact.email": "Email",
  "contact.phone": "Phone",
  "contact.address": "Address",
  "contact.followUs": "Follow us",
  "footer.backToTop": "Back to top",
  "language.switch": "Switch language",
  "language.current": "Current language: {label}",
  "notFound.title": "Page not found",
  "notFound.description": "Sorry, the page you are looking for has been removed or never existed.",
  "notFound.backHome": "Back to home",
  "icon.missing": "Missing icon"
}
```

`../messages/ja.json`：

```json
{
  "nav.openMenu": "メニューを開く",
  "nav.closeMenu": "メニューを閉じる",
  "nav.primary": "メインナビゲーション",
  "hero.badgeFallback": "最新情報",
  "testimonials.ratingLabel": "5 点満点中 {rating} 点",
  "testimonials.avatarFallback": "匿名ユーザー",
  "contact.email": "メール",
  "contact.phone": "電話",
  "contact.address": "住所",
  "contact.followUs": "フォローする",
  "footer.backToTop": "トップへ戻る",
  "language.switch": "言語を切り替える",
  "language.current": "現在の言語：{label}",
  "notFound.title": "ページが見つかりません",
  "notFound.description": "申し訳ありませんが、お探しのページは削除されたか、最初から存在しません。",
  "notFound.backHome": "ホームへ戻る",
  "icon.missing": "アイコンがありません"
}
```

### 4.5.3 插值函数（`../i18n/t.ts`）—— 客户端安全

> **必须单独成文件。** `../i18n/request.ts` 带 `import 'server-only'`，而 `LanguageSwitcher` 等客户端组件同样需要 `t()` 做插值。若把 `t()` 放进 `request.ts`，客户端组件一旦引入就会构建失败。

```typescript
export type Dictionary = Record<string, string>;

/** 文案查找 + {var} 插值 */
export function t(dict: Dictionary, key: string, vars?: Record<string, string | number>): string {
  let template = dict[key];
  if (template === undefined) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`[i18n] 缺少文案 key: "${key}"`);
    }
    console.warn(`[i18n] 缺少文案 key: "${key}"，已回退显示 key 本身`);
    template = key;
  }
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));
}
```

### 4.5.4 字典加载（`../i18n/request.ts`）—— 仅服务端

```typescript
import 'server-only';
import { defaultLocale, locales, localeMeta, localizedPath, type Locale } from './config';
import type { Dictionary } from './t';
import type { SiteConfig } from '@/types/siteConfig';
import { SiteConfigSchema } from '@/schemas/siteConfigSchema';

export type { Dictionary } from './t';
export { t } from './t';

const configCache = new Map<Locale, SiteConfig>();
const dictCache = new Map<Locale, Dictionary>();

/** 按 locale 读取并校验内容配置（构建期缓存） */
export async function getSiteConfig(locale: Locale): Promise<SiteConfig> {
  const hit = configCache.get(locale);
  if (hit) return hit;

  const mod = await import(`@/config/locales/${locale}.json`);
  const parsed = SiteConfigSchema.safeParse(mod.default);
  if (!parsed.success) {
    throw new Error(`[i18n] config/locales/${locale}.json 校验失败:\n${parsed.error.toString()}`);
  }
  const config = parsed.data as SiteConfig;
  configCache.set(locale, config);
  return config;
}

/** 读取 UI 文案字典，缺失 key 自动用默认语言补齐 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const hit = dictCache.get(locale);
  if (hit) return hit;

  const [current, fallback] = await Promise.all([
    import(`@/messages/${locale}.json`),
    locale === defaultLocale ? Promise.resolve(null) : import(`@/messages/${defaultLocale}.json`),
  ]);
  const merged: Dictionary = { ...(fallback?.default ?? {}), ...(current.default as Dictionary) };
  dictCache.set(locale, merged);
  return merged;
}

```

`t()` 由 `../i18n/t.ts` 提供，此处通过 `export { t } from './t'` 再导出，供服务端组件直接使用。

### 4.5.5 hreflang 与 og:locale 生成

```typescript
import { locales, defaultLocale, localizedPath, localeMeta, type Locale } from '@/i18n/config';

/** 生成 alternates.languages，供 generateMetadata 使用 */
export function buildAlternates(path: string, origin: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[localeMeta[locale].htmlLang] = `${origin}${localizedPath(locale, path)}`;
  }
  languages['x-default'] = `${origin}${localizedPath(defaultLocale, path)}`;
  return { canonical: `${origin}${localizedPath(defaultLocale, path)}`, languages };
}

/** og:locale 与 og:locale:alternate */
export function buildOgLocale(current: Locale) {
  return {
    locale: localeMeta[current].ogLocale,
    alternate: locales.filter((l) => l !== current).map((l) => localeMeta[l].ogLocale),
  };
}
```

### 4.5.6 翻译完整性校验脚本（`../scripts/check-i18n-parity.mjs`）

CI 门禁 5 的核心，检查三件事：

1. 全部 `config/locales/*.json` 的 **key 路径集合** 与默认 locale 完全一致（缺字段 / 多字段均报错）。
2. 全部 `messages/*.json` 的 **key 集合** 完全一致。
3. 所有文案值非空、不含 `TODO` / `FIXME` / `undefined`。

任一不满足 → `process.exit(1)` 并打印具体差异路径。

---

## 5. 开发任务清单（T1–T18）

每个任务包含：**产出物 / 实现要点 / 验收标准**。按顺序执行，全部为 P0 除非标注。

---

### T1 工程脚手架

**产出物**：`../package.json`、`tsconfig.json`、`next.config.mjs`、`postcss.config.js`、`.eslintrc.json`、`.prettierrc`

```json
{
  "name": "znbsys-homepage",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "build:standalone": "node scripts/build-standalone.mjs",
    "validate": "tsx scripts/validate-config.ts",
    "sync:default-locale": "node scripts/sync-default-locale.mjs",
    "check:i18n": "node scripts/check-i18n-parity.mjs"
  },
  "dependencies": {
    "lucide-react": "^0.400.0",
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "server-only": "^0.0.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.9.0",
    "@playwright/test": "^1.44.0",
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.5",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.39",
    "prettier": "^3.3.2",
    "tailwindcss": "^3.4.6",
    "tsx": "^4.16.2",
    "typescript": "^5.4.5",
    "vitest": "^1.6.0"
  }
}
```

`../tsconfig.json` 关键点：`"strict": true`、`"noUncheckedIndexedAccess": true`、`"resolveJsonModule": true`、`paths: { "@/*": ["./*"] }`。

**验收标准**
- [ ] `npm install` 无 `ERESOLVE` 错误，无 `npm audit` 高危项。
- [ ] `npm run typecheck` 通过。
- [ ] `npm run lint` 零 error（warning ≤ 5）。

---

### T2 Tailwind 与全局样式

**产出物**：`../tailwind.config.ts`、`app/globals.css`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
      },
      borderRadius: { card: 'var(--radius-card)' },
      fontFamily: {
        cjk: ['var(--font-cjk)', 'system-ui', 'sans-serif'],
        latin: ['var(--font-latin)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: { 'fade-up': 'fade-up .6s cubic-bezier(.16,1,.3,1) both' },
    },
  },
  plugins: [],
};
export default config;
```

`globals.css` 必须包含：
- `@tailwind base/components/utilities`
- `:root` 默认主色变量与**两套字体栈**（`--font-cjk`、`--font-latin`）
- CJK 排版微调：`html[lang^="zh"] body, html[lang^="ja"] body { line-height: 1.8; letter-spacing: .01em; }`
- `html { scroll-behavior: smooth; scroll-padding-top: 5rem; }`（锚点补偿吸顶导航）
- `@media (prefers-reduced-motion: reduce)` 关闭动画

**验收标准**
- [ ] 构建后 CSS 中能检索到 `.bg-primary` 类（未被 purge 误删）。
- [ ] `scroll-padding-top` 生效，锚点跳转标题不被导航栏遮挡（E2E-003）。
- [ ] `lang="zh-CN"` 与 `lang="en"` 下 `line-height` 计算值不同（G14）。

---

### T3 类型契约与 Zod Schema

**产出物**：`../types/siteConfig.ts`、`schemas/siteConfigSchema.ts`（见 4.1 / 4.2）

**验收标准**
- [ ] `tsc --noEmit` 通过。
- [ ] 对 `minimal.json` 与**全部** `config/locales/*.json` 均 `safeParse` 成功。

---

### T4 配置读取中心

**产出物**：`../lib/config.ts`、`lib/cn.ts`

多语言版本下 `../lib/config.ts` 仅作为**默认 locale 的同步便捷入口**（供脚本与非 React 场景使用），真实读取走 `i18n/request.ts`：

```typescript
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
```

**验收标准**
- [ ] 非法 JSON 抛出**可读**错误（含字段路径），而不是 undefined 崩溃。
- [ ] 重复调用返回同一引用（缓存生效）。

---

### T5 动态图标与白名单

**产出物**：`../lib/icons.ts`、`components/DynamicIcon.tsx`

`../lib/icons.ts` 导出 `ICON_WHITELIST: string[]`（至少包含：`Zap`、`Shield`、`Layers`、`GitBranch`、`BarChart3`、`Plug`、`Rocket`、`Sparkles`、`Lock`、`Users`、`Mail`、`Phone`、`MapPin`、`Github`、`Twitter`、`Menu`、`X`、`ArrowRight`、`Check`、`Star`、`Globe`、`Languages`）。

```tsx
import * as Icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { ICON_WHITELIST } from '@/lib/icons';

export interface DynamicIconProps extends LucideProps {
  name: string;
  /** 生产环境回退时的无障碍标签，来自 t(dict, 'icon.missing') */
  fallbackLabel?: string;
}

export function DynamicIcon({ name, fallbackLabel, ...props }: DynamicIconProps) {
  const registry = Icons as unknown as Record<string, React.ComponentType<LucideProps>>;
  const Component = registry[name];

  if (!Component || !ICON_WHITELIST.includes(name)) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`[DynamicIcon] 图标 "${name}" 不在白名单中，请检查 config 或扩充 lib/icons.ts`);
    }
    return <Icons.HelpCircle {...props} aria-label={fallbackLabel} role="img" />;
  }
  return <Component {...props} aria-hidden="true" />;
}
```

**验收标准**
- [ ] 开发与生产两种模式行为符合上述分支（CT-002 / CT-003）。
- [ ] 全部 locale 的 `iconName` 均在白名单内（I18N-013）。

---

### T6 Navbar + MobileMenu + Footer

**产出物**：`../components/layout/Navbar.tsx`、`MobileMenu.tsx`、`Footer.tsx`

要点：
- `Navbar`：`sticky top-0 z-50 backdrop-blur`，滚动超过 8px 增加底边阴影（`'use client'` + `scroll` 监听）。接收 `dict` prop，`aria-label` 用 `t(dict,'nav.primary')`。
- `MobileMenu`：`md:hidden`，受控开合，`Escape` 关闭，打开时锁 `body` 滚动；按钮必须有 `aria-expanded` / `aria-controls` / `aria-label`（`nav.openMenu` / `nav.closeMenu`）。
- `Footer`：优先渲染 `linkGroups`，否则回退 `links`；`footer.backToTop` 来自字典。

**验收标准**
- [ ] 桌面端显示横向导航 + CTA；移动端显示汉堡按钮且默认隐藏菜单。
- [ ] 点击汉堡 → 展开 → 点击链接 → 自动收起（E2E-004）。
- [ ] 键盘 `Tab` 可遍历全部导航项，`Escape` 可关闭移动菜单（A11Y-002）。

---

### T7 Hero + Features

**产出物**：`../components/sections/Hero.tsx`、`Features.tsx`

要点：
- `Hero`：`theme.background` 三种形态分支；`backgroundImage` 存在时叠遮罩层；`badge` 缺省不渲染占位。
- `Features`：`columns` 映射为 `md:grid-cols-2/3/4`；卡片 hover `transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`；`href` 存在时整个卡片为 `<a>`。

**验收标准**
- [ ] 全部文案与图标来自 props，组件内无硬编码自然语言。
- [ ] 2/3/4 列三种取值渲染正确（CT-010）。

---

### T8 About + Testimonials

**产出物**：`../components/sections/About.tsx`、`Testimonials.tsx`

要点：
- `About`：左文右图（`lg:grid-cols-2`），`imageUrl` 缺省时文字占满宽度。
- `Testimonials`：`rating` 存在时渲染星级，`aria-label` 用 `t(dict,'testimonials.ratingLabel',{rating})`；`avatarUrl` 缺省渲染姓名首字头像，`alt` 用 `t(dict,'testimonials.avatarFallback')`。

**验收标准**
- [ ] `rating` 1–5 渲染星数正确（CT-015）。
- [ ] 无 `avatarUrl` 时仍显示头像占位而非破图（CT-016）。

---

### T9 Contact

**产出物**：`../components/sections/Contact.tsx`

要点：`title` + `subtitle` + 三行信息（`Mail`/`Phone`/`MapPin`，缺省项跳过）+ 社交链接。字段标签（`contact.email` 等）全部来自字典。`email` 渲染为 `mailto:`，`phone` 渲染为 `tel:`（去空格）。

**验收标准**
- [ ] `phone` 缺省时不渲染电话行（CT-017）。
- [ ] `mailto:` / `tel:` href 格式正确。

---

### T10 页面组装与 SEO（locale 感知）

**产出物**：`../app/layout.tsx`、`app/[locale]/layout.tsx`、`app/[locale]/page.tsx`、`app/[locale]/not-found.tsx`、`app/not-found.tsx`

- `../app/layout.tsx`：最小根布局，仅 `<html><body>{children}</body></html>`，供全局 404 使用。
- `../app/[locale]/layout.tsx`：
  - `params.locale` 校验，非法值调 `notFound()`。
  - `<html lang={localeMeta[locale].htmlLang} dir={localeMeta[locale].dir} className={localeMeta[locale].fontStack === 'cjk' ? 'font-cjk' : 'font-latin'}>`。
  - `generateStaticParams` 返回全部 locales。
  - `generateMetadata` 输出 `title`、`description`、`keywords`、`openGraph.locale`/`alternateLocale`、`alternates`（`buildAlternates`）。
  - 注入 `--color-primary` 等 CSS 变量。
- `../app/[locale]/page.tsx`：按 `config.order` 组装 Section；`about`/`testimonials` 为 `undefined` 时跳过。所有 Section 组件接收 `dict` + 对应子树。
- `not-found.tsx`：使用同一主题，文案全部来自字典。

**验收标准**
- [ ] 页面源码含 `<title>` 与 `<meta name="description">` 且内容来自对应 locale JSON（E2E-002）。
- [ ] `<html lang>` 与 locale 一致（I18N-019）。
- [ ] 移除 `about` 字段后页面不报错、不出现空 section（IT-003）。

---

### T11 主题系统落地

**产出物**：`../lib/theme.ts`、`lib/color.ts`

```typescript
export function themeToCssVars(theme: ThemeConfig): Record<string, string> {
  return {
    '--color-primary': hexToRgbTriplet(theme.primary),
    '--color-secondary': hexToRgbTriplet(theme.secondary ?? theme.primary),
    '--radius-card': RADIUS_MAP[theme.radius],
    '--font-sans': FONT_MAP[theme.font],
  };
}
```

**验收标准**
- [ ] 修改 `theme.primary` 后 Hero CTA 与 Feature 图标容器颜色随之变化（E2E-006）。

---

### T12 响应式与无障碍基线（P1）

**要点**
- 断点：`sm 640 / md 768 / lg 1024 / xl 1280`。
- 全部交互元素可见焦点环：`focus-visible:ring-2 focus-visible:ring-primary`。
- 所有 `<img>` 必须有 `alt`；装饰性图标 `aria-hidden="true"`。
- 每个 Section 使用语义标签 `<section>` + `aria-labelledby`。
- 尊重 `prefers-reduced-motion`。
- CJK 与 Latin 采用不同字体栈与行高（G14）。

**验收标准**
- [ ] 375 / 768 / 1440 三档视口无横向滚动条（E2E-005）。
- [ ] axe 扫描零 `serious` / `critical` 违规（A11Y-001）。
- [ ] 长英文文案不撑破卡片（I18N-025 视觉回归）。

---

### T13 多站点 / 多租户（P1）

**产出物**：`../scripts/validate-config.ts`、`config/fixtures/brand-b.json`

- `validate-config.ts`：CLI 接收任意 JSON 路径（支持 glob，可一次校验全部 locale），Zod 校验并打印结果，退出码非 0 表示失败。
- 支持环境变量 `SITE_CONFIG_PATH` 覆盖默认配置路径。

**验收标准**
- [ ] `node scripts/validate-config.ts config/locales/*.json` 退出码 0。
- [ ] 传入缺字段的 JSON 时退出码 1 且打印字段路径。
- [ ] 用 brand-b 构建可得到不同文案与配色的站点（IT-005）。

---

### T14 单文件 HTML 分发产物（P1）

**产出物**：`../scripts/build-standalone.mjs`、`dist/{locale}/index.html`

- 脚本遍历 `locales`，读取 `config/locales/{locale}.json`，序列化后注入模板占位符 `__SITE_DATA__` 与 `__DICT__`，产出 `dist/{locale}/index.html`；默认 locale 额外复制一份到 `dist/index.html`。
- 模板使用 Tailwind CDN + Lucide CDN，DOM 容器为 `#navbar`、`#hero`、`#features`、`#about`、`#testimonials`、`#contact`、`#footer`。
- `<html lang>` 按 locale 设置。
- **禁止**在模板中手写第二份默认 JSON。

**验收标准**
- [ ] `dist/{locale}/index.html` 可直接双击打开，渲染出全部 7 个区块。
- [ ] 文件中不含字符串 `TODO`。
- [ ] 内嵌 JSON 与源文件深比较相等（UT-020 / UT-022）。
- [ ] 三个产物的 `<html lang>` 正确（I18N-026）。

---

### T15 i18n 基础设施

**产出物**：`../i18n/config.ts`、`messages/{zh-CN,en,ja}.json`

要点：
- `../i18n/config.ts` 按 4.5.1 实现。 **新增语言的唯一代码改动点**是 `locales` 数组 + `localeMeta` 一项。
- 三个 UI 字典按 4.5.2 实现，key 集合必须完全一致。
- 导出 `Dictionary` 类型供所有组件 props 使用。
- 把 `Globe`、`Languages` 加入图标白名单（供切换器使用）。

**验收标准**
- [ ] `npm run typecheck` 通过。
- [ ] `isLocale('zh-CN') === true`、`isLocale('fr') === false`（I18N-006）。
- [ ] 三个 `messages/*.json` 的 key 集合完全一致（I18N-004）。

---

### T16 多语言内容配置与合并加载

**产出物**：`config/locales/{zh-CN,en,ja}.json`、`../i18n/request.ts`、`scripts/sync-default-locale.mjs`、`scripts/check-i18n-parity.mjs`

要点：
- 三个 locale 内容文件结构完全一致（I18N-003）。
- `../i18n/request.ts` 按 4.5.4 实现（`getSiteConfig` / `getDictionary` / `buildAlternates` / `buildOgLocale`，带构建期 `Map` 缓存）；`i18n/t.ts` 按 4.5.3 实现（`t` 插值）。
- `sync-default-locale.mjs`：把 `../config/locales/zh-CN.json` 复制为 `config/site-data.json`，保持对旧文档向后兼容。
- `check-i18n-parity.mjs` 按 4.5.6 实现，作为 CI 门禁 5。

**验收标准**
- [ ] 三个 locale 均通过 Zod（I18N-001）。
- [ ] `t()` 插值 `{rating}` 正确替换（I18N-010）。
- [ ] 缺失 key 在开发期抛错、生产期回退并告警（I18N-011）。
- [ ] `../config/site-data.json` 与 `config/locales/zh-CN.json` 深比较相等（I18N-005）。
- [ ] `npm run check:i18n` 退出码 0。

---

### T17 路由与中间件

**产出物**：`../middleware.ts`、`app/[locale]/` 路由改造

```typescript
import { NextResponse, type NextRequest } from 'next/server';
import {
  LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE,
  isLocale, localizedPath, negotiateLocale, stripLocale,
} from '@/i18n/config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 已带合法 locale 前缀：写入 cookie 并放行
  const { locale } = stripLocale(pathname);
  if (locale) {
    const response = NextResponse.next();
    if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: '/', maxAge: LOCALE_COOKIE_MAX_AGE, sameSite: 'lax',
      });
    }
    return response;
  }

  // 无前缀：协商后重定向（302 临时）
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value ?? null;
  const acceptLanguage = request.headers.get('accept-language');
  const target = negotiateLocale(cookieLocale, acceptLanguage);

  const url = request.nextUrl.clone();
  url.pathname = localizedPath(target, pathname);
  return NextResponse.redirect(url, 302);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
```

要点：
- `matcher` 必须排除 `_next`、`api` 与带扩展名的路径，否则会重定向死循环。
- 重定向用 **302**（临时），不要 308，避免浏览器缓存语言选择。
- `generateStaticParams` 输出全部 locale，保证 `/en`、`/ja` 静态可达。

**验收标准**
- [ ] 访问 `/` 跳转到协商出的 locale（I18N-014 / I18N-015 / I18N-016）。
- [ ] 访问 `/fr` 返回 404（I18N-018）。
- [ ] 静态资源不被重定向（I18N-017）。

---

### T18 语言切换器与 SEO 本地化

**产出物**：`../components/LanguageSwitcher.tsx`、`app/[locale]/layout.tsx` metadata 补全

要点：
- `LanguageSwitcher`：`'use client'`，读取当前 pathname，切换时**保留路径与 hash**（`/zh-CN/#about` → `/en/#about`），同时写 cookie。
- 无障碍：容器 `role="navigation"` + `aria-label={t(dict,'language.switch')}`；当前项 `aria-current="true"`；每项 `aria-label={t(dict,'language.current',{label})}`。
- 形态：桌面端下拉，移动端在菜单内平铺列表。
- `hreflang`：`buildAlternates` 输出全部 locale + `x-default`（I18N-020）。
- `og:locale` + `og:locale:alternate` 输出。

**验收标准**
- [ ] 切换语言后路径与锚点保持（I18N-021）。
- [ ] 刷新后仍停留在新语言（I18N-022）。
- [ ] `<head>` 含全部 locale 的 `link[rel=alternate][hreflang]` + `x-default`（I18N-020）。
- [ ] 切换器 axe 扫描通过（I18N-024）。

---

## 6. 测试体系设计

### 6.1 分层策略

| 层级 | 工具 | 覆盖范围 | 目标 |
| --- | --- | --- | --- |
| 静态检查 | `tsc --noEmit` + ESLint | 类型与代码规范 | 零 error |
| 契约校验 | Zod + Vitest | JSON 与 Schema 一致性（含全部 locale） | 100% 字段覆盖 |
| 单元测试 | Vitest | 纯函数（颜色、主题、配置、图标、locale 协商、插值） | 分支覆盖率 ≥ 90% |
| 组件测试 | Vitest + RTL | 10 个组件的渲染/条件分支/可访问性属性 | 每个组件 ≥ 1 组正反用例 |
| 集成测试 | Vitest | 页面组装、order、缺省 Section、多配置、多 locale 渲染 | 主流程全覆盖 |
| E2E 测试 | Playwright | 导航、锚点、响应式、主题、SEO、**语言切换与重定向** | 核心路径 100% |
| 无障碍 | axe-core | 全页 × 三 locale 扫描 | 零 serious/critical |
| 视觉回归 | Playwright snapshot | 三档视口 × 两套品牌 × 三 locale | 人工确认一次基线 |
| 性能 | Lighthouse CI（P2） | LCP / CLS / SEO | LCP < 2.5s，CLS < 0.1 |

### 6.2 测试配置

`../vitest.config.ts`：

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**', 'i18n/**', 'components/**', 'app/**'],
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
```

`../playwright.config.ts`：baseURL `http://127.0.0.1:3000`，`webServer` 启动 `npm run build && npm run start`；projects 覆盖 `chromium` 与 `Mobile Chrome (Pixel 5)`；另设 `locale: 'ja'` 的 context 用于语言协商断言（I18N-015 需自定义 `extraHTTPHeaders`）。

---

## 7. 测试用例清单（逐条可执行）

### 7.1 单元测试（UT）

| ID | 用例 | 断言 |
| --- | --- | --- |
| UT-001 | `hexToRgbTriplet('#2563eb')` | 返回 `'37 99 235'` |
| UT-002 | `hexToRgbTriplet('#fff')` 简写 | 返回 `'255 255 255'` |
| UT-003 | `hexToRgbTriplet('not-a-color')` | 抛出明确错误 |
| UT-004 | `themeToCssVars` 缺省 secondary | `--color-secondary` 等于 primary |
| UT-005 | `getDefaultSiteConfig()` 连续调用 | `toBe()` 同一引用 |
| UT-006 | 非法 JSON 传入 `createSiteConfig` | 抛出 ZodError |
| UT-007 | `createSiteConfig(minimal.json)` | 成功且 `about === undefined` |
| UT-008 | 缺 `meta.title` 的 JSON | `safeParse` 失败，`issues[0].path` 为 `['meta','title']` |
| UT-009 | `iconName` 非法值 | `safeParse` 失败，message 含"白名单" |
| UT-010 | `email` 非邮箱格式 | `safeParse` 失败 |
| UT-011 | `features.items` 为空数组 | `safeParse` 失败（min(1)） |
| UT-012 | `columns` 缺省 | 解析结果 `columns === 3` |
| UT-013 | `navbar.sticky` 缺省 | 解析结果 `sticky === true` |
| UT-014 | `order` 含非法值 | `safeParse` 失败 |

### 7.2 组件测试（CT）

| ID | 组件 | 用例 | 断言 |
| --- | --- | --- | --- |
| CT-001 | DynamicIcon | 合法名 `Zap` | 渲染 svg |
| CT-002 | DynamicIcon | 非法名 + `NODE_ENV=development` | 抛错 |
| CT-003 | DynamicIcon | 非法名 + `NODE_ENV=production` | 渲染 `HelpCircle`，`aria-label` 为 `icon.missing` 译文 |
| CT-004 | Navbar | `ctaButton` 缺省 | 不渲染 CTA，`links` 数量正确 |
| CT-005 | MobileMenu | 点击汉堡 | `aria-expanded` 由 `false` 变 `true` |
| CT-006 | MobileMenu | 按 Escape | 菜单关闭 |
| CT-007 | Hero | `badge` 缺省 | 无 badge 节点 |
| CT-008 | Hero | `secondaryCta` 缺省 | 只渲染 1 个按钮 |
| CT-009 | Hero | `background='grid'` | 容器含 grid 相关类 |
| CT-010 | Features | `columns=2` | grid 类为 `md:grid-cols-2` |
| CT-011 | Features | `items` 长度 6 | 渲染 6 张卡片 |
| CT-012 | Features | 某 item 带 `href` | 卡片根元素为 `<a>` |
| CT-013 | About | `imageUrl` 缺省 | 无 `<img>`，文案区占满宽 |
| CT-014 | About | `stats` 3 项 | 渲染 3 个统计块，含 `suffix` |
| CT-015 | Testimonials | `rating=5` | 渲染 5 个实心星，`aria-label` 含"5" |
| CT-016 | Testimonials | `avatarUrl` 缺省 | 渲染首字头像，无 `<img>` |
| CT-017 | Contact | `phone` 缺省 | 无电话行，邮箱行为 `mailto:` |
| CT-018 | Contact | `socials` 3 项 | 渲染 3 个社交链接 |
| CT-019 | Footer | 同时给 `links` 与 `linkGroups` | 优先渲染 `linkGroups` |
| CT-020 | Footer | 仅 `links` | 平铺渲染 |

### 7.3 集成测试（IT）

| ID | 用例 | 断言 |
| --- | --- | --- |
| IT-001 | 渲染 HomePage（默认配置） | 7 个区块 id 全部存在 |
| IT-002 | `order = ['features','hero',...]` | DOM 中 features 出现在 hero 之前 |
| IT-003 | 配置移除 `about` | 无 `#about` 节点，其余正常 |
| IT-004 | 配置移除 `testimonials` | 同上 |
| IT-005 | 使用 `brand-b.json` | 品牌名与主题色均来自 B 配置 |
| IT-006 | `generateMetadata`（默认 locale） | `title`/`description` 等于 JSON 值 |
| IT-007 | 渲染 `en` locale 页面 | 文案为英文，`#hero` 文本不等于 zh-CN |
| IT-008 | 渲染 `ja` locale 页面 | 文案为日文 |
| IT-009 | `generateStaticParams` | 返回全部 3 个 locale |

### 7.4 E2E 测试（E2E）

| ID | 用例 | 断言 |
| --- | --- | --- |
| E2E-001 | 首页加载 | HTTP 200，`#hero` 可见，无 console error |
| E2E-002 | SEO | `document.title` 等于 `meta.title`；`meta[name=description]` 匹配 |
| E2E-003 | 锚点导航 | 点击"关于我们" → hash 为 `#about` → `boundingBox().y >= 64` |
| E2E-004 | 移动端菜单（375px） | 汉堡可见 → 展开 → 点击链接 → 收起且滚动到目标 |
| E2E-005 | 响应式 | 375/768/1440 下 `scrollWidth <= clientWidth` |
| E2E-006 | 主题切换 | A/B 配置下 `--color-primary` 计算值不同 |
| E2E-007 | 外链安全 | `target="_blank"` 链接带 `rel="noopener noreferrer"` |
| E2E-008 | 键盘可达 | 前 5 个 Tab 焦点均可见且带焦点环 |

### 7.5 无障碍（A11Y）

| ID | 用例 | 断言 |
| --- | --- | --- |
| A11Y-001 | 首页 axe 扫描 | 无 `serious`/`critical` 违规 |
| A11Y-002 | 移动端菜单展开态 axe | 同上 |
| A11Y-003 | 标题层级 | 恰好 1 个 `<h1>`，无跳级 |
| A11Y-004 | 图片 alt | 所有 `<img>` 均有非空 `alt` |
| A11Y-005 | 对比度 | 正文文本对比度 ≥ 4.5:1 |

### 7.6 单文件产物测试

| ID | 用例 | 断言 |
| --- | --- | --- |
| UT-020 | 解析 `dist/index.html` 内嵌 JSON | 与 `../config/locales/zh-CN.json` 深比较相等 |
| UT-021 | 产物内容扫描 | 不含 `TODO`、`FIXME`、`undefined` |
| UT-022 | 各 locale 产物内嵌 JSON | 与对应 `config/locales/{locale}.json` 相等 |
| E2E-009 | 用 `file://` 打开产物 | 7 个区块可见，无 JS 报错 |

### 7.7 多语言测试（I18N）

| ID | 层级 | 用例 | 断言 |
| --- | --- | --- | --- |
| I18N-001 | UT | 三个 locale 内容 JSON 分别 Zod 校验 | 全部 `success === true` |
| I18N-002 | UT | `getSiteConfig('en')` vs `getSiteConfig('zh-CN')` | `brand.name` 相同，`hero.headline` 不同 |
| I18N-003 | UT | 全部 locale 的 **key 路径集合** 对比默认 locale | 差集为空（结构完全对齐） |
| I18N-004 | UT | 三个 `messages/*.json` 的 key 集合 | 两两相等，且等于默认 locale |
| I18N-005 | UT | `../config/site-data.json` vs `config/locales/zh-CN.json` | 深比较相等 |
| I18N-006 | UT | `isLocale('zh-CN')` / `isLocale('fr')` | `true` / `false` |
| I18N-007 | UT | `negotiateLocale('ja', 'en-US,en;q=0.9')` | 返回 `'ja'`（cookie 优先） |
| I18N-008 | UT | `matchLocale('ja-JP,ja;q=0.9,en;q=0.8')` | 返回 `'ja'`（主语言回退） |
| I18N-009 | UT | `negotiateLocale(null, 'de-DE,de;q=0.9')` | 返回 `'zh-CN'`（不支持则默认） |
| I18N-010 | UT | `t(dict,'testimonials.ratingLabel',{rating:5})` 三语言 | 均含 `5`，且三者互不相同 |
| I18N-011 | UT | `t(dict,'not.a.key')` | 开发期抛错；生产期返回 key 本身并 `console.warn` |
| I18N-012 | UT | `localizedPath('en','/#about')` 与 `stripLocale` | 往返一致 |
| I18N-013 | UT | 遍历全部 locale 的 `iconName` | 全部在 `ICON_WHITELIST` 内 |
| I18N-014 | E2E | 访问 `/` | 302 到 `/zh-CN`，最终 200 |
| I18N-015 | E2E | `Accept-Language: ja-JP,ja;q=0.9` 访问 `/` | 跳转到 `/ja` |
| I18N-016 | E2E | 携带 cookie `NEXT_LOCALE=en` 访问 `/` | 跳转到 `/en`（优先于 Accept-Language） |
| I18N-017 | E2E | 访问 `/favicon.ico` | 不被重定向，直接 200 |
| I18N-018 | E2E | 访问 `/fr` | 返回 404 |
| I18N-019 | E2E | 访问 `/en` | `<html lang="en">`，`#hero` 文本为英文 |
| I18N-020 | E2E | `/en` 页面 `<head>` | 含 3 个 `link[rel=alternate][hreflang]` + `x-default` |
| I18N-021 | E2E | 在 `/zh-CN/#about` 点击切到 English | URL 变 `/en/#about`，文案变英文 |
| I18N-022 | E2E | 切换语言后刷新 | 仍停留在新语言（cookie 生效） |
| I18N-023 | A11Y | `zh-CN` / `en` / `ja` 三页分别 axe 扫描 | 均无 `serious`/`critical` 违规 |
| I18N-024 | A11Y | 语言切换器 | 有 `aria-label`，当前项 `aria-current="true"` |
| I18N-025 | 视觉 | 三 locale × 三视口快照 | 与基线一致，无文字溢出 |
| I18N-026 | 产物 | `dist/{locale}/index.html` 的 `<html lang>` | 分别等于 `zh-CN` / `en` / `ja` |

---

## 8. CI 流水线

`.github/workflows/ci.yml`：

```yaml
name: CI
on: [push, pull_request]
jobs:
  quality:
    steps:
      - checkout
      - setup-node 20 + npm ci
      - run: npm run typecheck                    # 门禁 1：零 error
      - run: npm run lint                         # 门禁 2：零 error
      - run: npm run validate                     # 门禁 3：全部 locale JSON 合法
      - run: npm test -- --coverage               # 门禁 4：单测 + 组件测试全绿
      - run: npm run check:i18n                   # 门禁 5：翻译完整性（I18N-003/004）
      - run: npm run build                        # 门禁 6：全部 locale 静态生成成功
  e2e:
    needs: quality
    strategy:
      matrix:
        project: [chromium, mobile-chrome]
    steps:
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e -- --project=${{ matrix.project }}
      - upload: playwright-report
  standalone:
    needs: quality
    steps:
      - run: npm run build:standalone
      - run: node -e "断言 dist/{zh-CN,en,ja}/index.html 均存在且 > 20KB"
```

**任一门禁失败即阻断合并。** 门禁 5 是多语言专属卡点，漏翻译无法合入。

---

## 9. 验收标准（Definition of Done）

全部勾选才算完成：

**功能**
- [ ] `npm run dev` 后首页渲染出 Hero / Features / About / Testimonials / Contact / Navbar / Footer 全部 7 个区块。
- [ ] 修改任一 locale JSON 的文案，刷新后对应语言页面同步变化，无需改代码。
- [ ] 修改 `theme.primary` 后全站主色变化。
- [ ] 删除 `about` / `testimonials` 字段，页面仍正常工作。
- [ ] `npm run build` 成功，且 `/zh-CN`、`/en`、`/ja` 三个路径均静态生成。

**多语言**
- [ ] 访问 `/` 按 cookie > Accept-Language > 默认 的优先级跳转。
- [ ] `/en`、`/ja` 页面文案与 `<html lang>` 均正确。
- [ ] 语言切换保留当前路径与锚点，刷新后保持。
- [ ] 三个 locale 的 SEO 元数据（title / description / keywords）各自独立。
- [ ] `hreflang` alternates + `x-default` 输出完整。
- [ ] 不支持的 locale（如 `/fr`）返回 404。
- [ ] 静态资源不被 middleware 重定向。
- [ ] `dist/{locale}/index.html` 三个产物均可独立打开且语言正确。
- [ ] 组件内零硬编码自然语言，全部走 `t()` 或 props。

**质量**
- [ ] `npm run typecheck` 零错误（strict 模式）。
- [ ] `npm run lint` 零 error。
- [ ] 第 7 章全部用例通过（UT 22、CT 20、IT 9、E2E 9、A11Y 5、I18N 26，共 91 条）。
- [ ] 单测覆盖率：`../lib` + `i18n/` ≥ 90% 分支，`components/` ≥ 80% 行覆盖。

**体验**
- [ ] 375 / 768 / 1440 三档视口无横向滚动。
- [ ] axe 零 serious/critical 违规（含三 locale）。
- [ ] 全部交互元素键盘可达且有焦点环。
- [ ] 尊重 `prefers-reduced-motion`。
- [ ] CJK 与 Latin 字体栈、行高区分正确。

**工程**
- [ ] `../config/site-data.json` 与 `config/locales/zh-CN.json` 一致。
- [ ] `npm run check:i18n` 退出码 0。
- [ ] CI 全绿。

---

## 10. 扩展指南

### 10.1 新增一个 Section（例如 `Pricing`）

1. 在 `../types/siteConfig.ts` 增加 `PricingConfig` 接口，挂到 `SiteConfig.pricing?`。
2. 在 `../schemas/siteConfigSchema.ts` 增加对应 Zod 对象（ **必须** `.optional()`）。
3. 新建 `components/sections/Pricing.tsx`，props 为 `SiteConfig['pricing']` + `dict`，`undefined` 时返回 `null`。
4. 在 `SectionKey` 联合类型中加入 `'pricing'`。
5. 在 `../app/[locale]/page.tsx` 的 Section 映射表中注册。
6. **在全部 locale 的 `config/locales/*.json` 中补齐该字段**（否则 I18N-003 失败）。
7. 补测试：CT（渲染/缺省）+ IT（order 位置）+ E2E（锚点）+ I18N（三语言均渲染）。

### 10.2 新增一个语言（例如 `ko`）

1. 在 `../i18n/config.ts` 的 `locales` 数组加 `'ko'`，并在 `localeMeta` 加一项。
2. 新增 `config/locales/ko.json`（复制 `zh-CN.json` 后翻译全部文案）。
3. 新增 `messages/ko.json`（复制 `zh-CN.json` 后翻译全部 key）。
4. 跑 `npm run validate` 与 `npm test` —— I18N-003 / I18N-004 会自动验证结构完整性。
5. 跑 `npm run build` 确认 `/ko` 静态生成成功。

> **全程零组件改动**，这是"零代码加语言"的核心保证。若第 4 步需要改组件，说明有文案被硬编码，属缺陷需回炉。

### 10.3 新增一个图标

在 `../lib/icons.ts` 的 `ICON_WHITELIST` 追加 Lucide 官方名称。未加入而直接在 JSON 中使用，开发环境会立即抛错（T5）。

### 10.4 部署第二、第三个站点

```bash
cp config/locales/zh-CN.json config/site-b.json
# 修改内容后
SITE_CONFIG_PATH=config/site-b.json npm run build
```

或将 JSON 托管到 CMS / GitHub，`../app/[locale]/page.tsx` 改为 `fetch(url, { next: { revalidate: 3600 } })` 实现 ISR 多租户。

---

## 11. 风险与 FAQ

| 风险 | 影响 | 缓解措施 |
| --- | --- | --- |
| CDN Tailwind 与编译版类名行为差异 | 单文件产物样式走形 | 单文件模板复用同一套 class；UT-020/022 + E2E-009 守护 |
| `lucide-react` 全量导入体积大 | 首屏变慢 | 若超标改为显式导出映射表（P2），需重跑性能门禁 |
| JSON 与 TS 类型漂移 | 运行时崩溃 | Zod 为唯一运行时真相，`validate` 进 CI |
| 外链图片失效 | 开天窗 | 头像缺省渲染首字，Logo 优先内联 `logoSvg` |
| **漏翻译 / 结构不一致** | 某语言缺区块或页面显示 key 名 | CI 门禁 5 + I18N-003/004/011 |
| **middleware matcher 写错** | 无限重定向、站点不可用 | I18N-017 显式验证静态资源不被重定向 |
| **永久重定向缓存语言** | 用户改不了语言 | 强制 302，禁用 308（T17） |
| **CJK 字体缺失** | 中文显示成宋体或方框 | `--font-cjk` 显式声明系统字体栈（T2 / T18） |
| **动态 import 路径带变量** | 打包器无法静态分析 | `import(\`@/config/locales/${locale}.json\`)` 的模板是有限枚举，构建期可展开；若失败改为显式 switch |

**FAQ**

- **Q：两份文档技术路线不同，到底做哪个？**
  A：都做。Next.js 是主产物（T1–T13、T15–T18），单文件 HTML 是构建产物（T14），两者共用同一份 locale JSON。
- **Q：为什么不用 `next-intl`？**
  A：见 2.1。本项目 99% 文案已由 JSON 驱动，自研 i18n 约 120 行即可。若未来需要复数规则 / ICU，再评估迁移。
- **Q：为什么默认语言也带 `/zh-CN` 前缀？**
  A：省略会造成 `/` 与 `/zh-CN` 内容重复（SEO 大忌），且无法静态导出。统一带前缀后 `/` 只做一次跳转。
- **Q：某个语言还没翻译完怎么办？**
  A：CI 门禁 5 会阻断。建议先不加入 `locales` 数组，翻译完成后再一次性放开。
- **Q：新增语言需要改组件吗？**
  A：不需要。只需要 2 个 JSON + `locales` 数组加一项（见 10.2）。如果需要改组件，说明有硬编码文案，是缺陷。
- **Q：图标写错名字会怎样？**
  A：开发环境抛错，生产环境回退 `HelpCircle`；I18N-013 会遍历全部 locale 检查，CI 构建前拦截。

---

## 12. 执行顺序速查

```bash
# 1. 脚手架与契约
T1 → T2 → T3 → T4 → T5
# 2. 多语言地基（推荐提前，避免组件返工）
T15 → T16
# 3. 组件实现（自带 dict prop）
T6 → T7 → T8 → T9
# 4. 组装、路由与切换器
T10 → T11 → T17 → T18
# 5. 质量加固
T12 → T13 → T14
# 6. 测试与验收
UT → CT → IT → E2E → A11Y → I18N → 产物测试 → CI 全绿 → DoD 逐条勾选
```

> **推荐把 T15/T16 提前到组件之前**：先立好 i18n 地基，组件从一开始就是 locale-aware 的，可避免后期大规模返工（否则每个组件都要回头加 `dict` prop）。

---

*本文件取代 `../README.md` 与 `DESING.md` 中的实现细节描述；两份原文保留作为需求溯源。*

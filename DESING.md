**【角色任务】**

你是一名 Next.js 全栈架构师与 Tailwind CSS 专家，负责设计一套基于 Next.js (App Router) + Tailwind CSS 的组件化、数据驱动的公司官网架构。

**【背景信息】**

项目借鉴 `awesome-design-md` 的设计规范，目标是搭建一个高扩展、高性能且易于维护的 Next.js 企业官网模版。通过 TypeScript 类型化的 JSON 配置文件，支持零代码修改即可通过更换 JSON 配置快速生成全新公司官网。

**【具体指令】**

1. **设计项目目录架构**：提供清晰的 Next.js (App Router) 目录树结构。
2. **定义强类型数据 Schema**：使用 TypeScript 接口（Interface）定义严格的 JSON 配置数据类型文件 `types/siteConfig.ts`。
3. **编写核心动态组件**：
* 提供配置读取中心与全局上下文/数据入口。
* 编写优雅且模块化的 UI 组件（包含 `Navbar`, `Hero`, `Features`, `Testimonials`, `Footer`）。


4. **提供样例 JSON 配置文件**：编写一份结构完整、支持直接引用的 `site-data.json` 数据样例。
5. **提供扩展指导**：说明如何新增组件与快速多站点部署。

**【约束条件】**

* 使用 Next.js 14+ (App Router)、Tailwind CSS 与 Lucide React 图标库。
* 代码完全组件化，样式与数据彻底解耦，遵循 TypeScript 强类型约束。
* 遵循现代 Design System 美学（注重留白、响应式网格与平滑过渡）。
* 全文使用简体中文，提供完整可直接使用的代码示例，禁止占位符缩写。

---

### 【系统架构与完整实现方案】

#### 1. 项目目录结构 (Project Structure)

```text
company-site-template/
├── config/
│   └── site-data.json         # 核心配置文件：替换此文件即可更换官网内容
├── types/
│   └── siteConfig.ts          # TypeScript 类型定义
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx         # 顶部导航栏组件
│   │   └── Footer.tsx         # 页脚组件
│   └── sections/
│       ├── Hero.tsx           # 主视觉 Section
│       ├── Features.tsx       # 服务/优势列表组件
│       ├── About.tsx          # 关于我们 & 数据统计组件
│       ├── Testimonials.tsx   # 客户评价组件
│       └── Contact.tsx        # 联系方式组件
├── app/
│   ├── layout.tsx             # 根布局（读取 meta 自动生成 SEO）
│   ├── page.tsx               # 动态渲染的主页入口
│   └── globals.css            # 全局样式与 Tailwind 指令
├── package.json
└── tailwind.config.ts

```

---

#### 2. 强类型定义 (`types/siteConfig.ts`)

```typescript
export interface NavItem {
  label: string;
  href: string;
}

export interface FeatureItem {
  iconName: string;
  title: string;
  description: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl: string;
}

export interface SiteConfig {
  meta: {
    title: string;
    description: string;
    favicon: string;
  };
  brand: {
    name: string;
    logoUrl?: string;
    tagline: string;
  };
  navbar: {
    links: NavItem[];
    ctaButton: {
      text: string;
      href: string;
    };
  };
  hero: {
    badge?: string;
    headline: string;
    subheadline: string;
    primaryCta: { text: string; href: string };
    secondaryCta?: { text: string; href: string };
  };
  features: {
    title: string;
    subtitle: string;
    items: FeatureItem[];
  };
  about: {
    title: string;
    description: string[];
    stats: StatItem[];
  };
  testimonials: {
    title: string;
    items: TestimonialItem[];
  };
  contact: {
    title: string;
    email: string;
    phone: string;
    address: string;
  };
  footer: {
    copyright: string;
    links: NavItem[];
  };
}

```

---

#### 3. 配置文件样例 (`config/site-data.json`)

```json
{
  "meta": {
    "title": "VoltAgent - 下一代 AI Agent 构建平台",
    "description": "专为企业打造的高性能 AI 代理开发与编排框架",
    "favicon": "/favicon.ico"
  },
  "brand": {
    "name": "VoltAgent",
    "tagline": "智能代理，驱动未来"
  },
  "navbar": {
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
    "secondaryCta": { "text": "查看文档", "href": "https://github.com/voltagent" }
  },
  "features": {
    "title": "为什么选择 VoltAgent",
    "subtitle": "提供端到端的 Agent 开发、编排与监控支撑",
    "items": [
      {
        "iconName": "Zap",
        "title": "极速响应",
        "description": "优化数据管线，支持毫秒级流式响应与并发调度。"
      },
      {
        "iconName": "Shield",
        "title": "企业级安全",
        "description": "内置数据合规防护网与沙箱隔离机制，保障数据隐私。"
      },
      {
        "iconName": "Layers",
        "title": "模块化编排",
        "description": "灵活插拔 Tools、Memory 与 LLM 驱动引擎，轻松扩展。"
      }
    ]
  },
  "about": {
    "title": "重塑企业生产力引擎",
    "description": [
      "VoltAgent 致力于降低企业应用人工智能的门槛。",
      "我们的开源生态与商业化工具链已经帮助全球数百家企业构建了自己的智能化工作流。"
    ],
    "stats": [
      { "label": "企业客户", "value": "500+" },
      { "label": "日均 API 调用", "value": "10M+" },
      { "label": "开源 Star 数", "value": "12k+" }
    ]
  },
  "testimonials": {
    "title": "行业领袖的信赖之选",
    "items": [
      {
        "quote": "VoltAgent 帮我们将 AI 业务落地时间缩短了 70%，架构清晰度令人惊艳。",
        "author": "张伟",
        "role": "CTO",
        "company": "科技前沿 Co.",
        "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
      }
    ]
  },
  "contact": {
    "title": "准备好开启您的 AI 转型了吗？",
    "email": "contact@voltagent.com",
    "phone": "+86 (021) 8888-9999",
    "address": "大阪市天王区玉造元町"
  },
  "footer": {
    "copyright": "© 2026 VoltAgent Inc. 保留所有权利。",
    "links": [
      { "label": "隐私政策", "href": "#" },
      { "label": "服务条款", "href": "#" }
    ]
  }
}

```

---

#### 4. 核心组件代码实现

##### ① 动态图标渲染（支持通用图标注入）

为了让 JSON 中指定的 `iconName` 能直接生成图标，创建一个通用图标映射组件：

```tsx
// components/DynamicIcon.tsx
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  const IconComponent = (Icons as Record<string, React.ComponentType<LucideProps>>)[name];
  if (!IconComponent) return <Icons.HelpCircle {...props} />;
  return <IconComponent {...props} />;
};

```

##### ② Hero Section 组件 (`components/sections/Hero.tsx`)

```tsx
import { SiteConfig } from '@/types/siteConfig';

export const Hero = ({ data }: { data: SiteConfig['hero'] }) => {
  return (
    <section className="relative overflow-hidden bg-slate-900 pt-32 pb-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {data.badge && (
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-8">
            {data.badge}
          </span>
        )}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          {data.headline}
        </h1>
        <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto">
          {data.subheadline}
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <a
            href={data.primaryCta.href}
            className="px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition duration-200 shadow-lg shadow-blue-500/25"
          >
            {data.primaryCta.text}
          </a>
          {data.secondaryCta && (
            <a
              href={data.secondaryCta.href}
              className="px-8 py-3.5 rounded-lg border border-slate-700 hover:bg-slate-800 font-semibold text-slate-200 transition duration-200"
            >
              {data.secondaryCta.text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

```

##### ③ Features Section 组件 (`components/sections/Features.tsx`)

```tsx
import { SiteConfig } from '@/types/siteConfig';
import { DynamicIcon } from '../DynamicIcon';

export const Features = ({ data }: { data: SiteConfig['features'] }) => {
  return (
    <section id="features" className="py-24 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{data.title}</h2>
          <p className="mt-4 text-lg text-slate-400">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.items.map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                <DynamicIcon name={item.iconName} className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

```

##### ④ 页面组装入口 (`app/page.tsx`)

```tsx
import siteConfigData from '@/config/site-data.json';
import { SiteConfig } from '@/types/siteConfig';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { Footer } from '@/components/layout/Footer';

// 强类型断言
const config: SiteConfig = siteConfigData as SiteConfig;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      <Navbar brand={config.brand} data={config.navbar} />
      <Hero data={config.hero} />
      <Features data={config.features} />
      <Footer brand={config.brand} data={config.footer} />
    </main>
  );
}

```

##### ⑤ 动态 SEO 生成 (`app/layout.tsx`)

```tsx
import type { Metadata } from 'next';
import siteConfigData from '@/config/site-data.json';
import './globals.css';

export const metadata: Metadata = {
  title: siteConfigData.meta.title,
  description: siteConfigData.meta.description,
  icons: { icon: siteConfigData.meta.favicon }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className="antialiased font-sans bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}

```

---

### 【快速更换与多站点部署说明】

1. **更换单站点数据**：直接修改 `config/site-data.json` 内的字段，刷新页面即实现全站样式与内容的动态变更。
2. **多租户/多官网扩展 (Multi-Tenant)**：
* 可以将 JSON 存储在外部 CMS（如 Strapi, Sanity）或 GitHub 仓库中。
* 在 `app/page.tsx` 中将 JSON 引入改为 `fetch` 接口请求（使用 Next.js ISR/SSG 渲染），即可实现后台控制多个不同域名的公司官网。
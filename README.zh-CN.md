[English](./README.md) | **简体中文** | [日本語](./README.ja.md)

# znbsys-homepage（ZnbSys）

由 JSON 配置驱动的多语言公司官网。一套代码，更换 `config/locales/*.json` 即可生成新官网；支持整站主题换肤（主色 + 明/暗背景）与管理后台实时切换。

设计参考：[awesome-design-md](https://github.com/voltagent/awesome-design-md)

## 特性

- **JSON 数据驱动**：页面结构与内容全部来自站点配置，经 Zod Schema 校验后渲染
- **多语言**：内置 `zh-CN` / `en` / `ja`，middleware 自动协商（cookie → Accept-Language → 默认），含 hreflang / og:locale SEO 元数据
- **整站主题系统**：由主题色派生完整调色板（页面底、分区底、卡片、边框、面板、强调色、文字），支持**暗色 / 亮色背景**两种模式
- **管理后台 `/admin`**：预设色板 + 自定义取色 + 明暗切换 + 一键恢复默认，默认主题色 `#2563eb` 始终保留
- **Section 可编排**：`order` 控制 hero / features / about / testimonials / contact 的渲染顺序，`about`、`testimonials` 可省略
- **图标白名单**：Lucide 图标经 `lib/icons.ts` 白名单校验
- **双轨构建**：Next.js 主产物，另有 `build:standalone` 生成单文件静态站（共享同一份 JSON 配置）

## 技术栈

Next.js 14（App Router）· React 18 · TypeScript · Tailwind CSS 3 · Zod · lucide-react · Vitest · Playwright

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3000 （根路径 302 到 /zh-CN）
```

```bash
npm run build && npm run start   # 生产构建与前台启动
```

### 启动 / 停止脚本（后台常驻）

生产服务推荐使用后台脚本，自动管理 PID 与日志（均针对 3000 端口）：

```bash
./scripts/start.sh    # 构建（npm run build）并后台启动 standalone 运行时（node server.js）
./scripts/stop.sh     # 按 .server.pid 停止；必要时兜底清理 3000 端口残留进程
```

- **start.sh**：幂等——服务已在运行时直接提示并退出；构建后组装 `.next/standalone`（拷入静态资源）并以 `node server.js` 后台运行；构建与运行日志写入 `.server.log`，PID 写入 `.server.pid`（两者均已 gitignore）；启动失败会回滚 PID 文件并提示查看日志
- **stop.sh**：先按 PID 文件优雅停止，再按端口兜底 `kill -9`，最后清理 PID 文件

对应的 npm 快捷方式：

```bash
npm run dev:background   # 后台跑 next dev，stdout 静默，回显 PID
npm run stop             # 杀掉 3000 端口进程（lsof -ti:3000 | kill -9）
npm run restart          # stop && start（前台生产服务）
```

## 路由

| 路由 | 说明 |
| --- | --- |
| `/` | 按 locale 协商后 302 到 `/{locale}` |
| `/zh-CN` `/en` `/ja` | 营销首页（SSG） |
| `/{locale}/privacy` | 隐私政策 |
| `/{locale}/terms` | 服务条款 |
| `/{locale}/changelog` | 更新日志 |
| `/admin` | 管理后台（主题色 / 明暗背景切换，不参与 locale 协商） |
| 其它 | 对应 locale 的 404 页 |

## 目录结构

```
app/
  [locale]/          # 多语言首页布局与渲染（layout 注入主题 CSS 变量）
  admin/page.tsx     # 管理后台
  globals.css        # 默认主题令牌（:root CSS 变量）
components/
  layout/            # Navbar / Footer / MobileMenu
  sections/          # Hero / Features / About / Testimonials / Contact
  admin/             # ThemeColorSwitcher 主题切换器
  ThemeColorApplicator.tsx  # 水合后应用 localStorage 中的主题
  LanguageSwitcher.tsx / DynamicIcon.tsx
config/
  locales/           # 站点内容配置（zh-CN / en / ja），每语言一份
  fixtures/          # 测试用配置（minimal / brand-b）
  site-data.json     # zh-CN 镜像（向后兼容）
messages/            # UI 文案字典（nav.*、hero.* 等，缺失 key 回退默认语言）
i18n/                # locale 协商、配置/字典加载、t() 翻译
lib/                 # color / palette / theme / themePresets / config / icons / cn / paths
schemas/             # Zod：SiteConfigSchema
types/               # SiteConfig 类型契约
middleware.ts        # locale 协商（/admin 直接放行）
scripts/             # 配置校验、i18n 一致性、standalone 构建等
tests/unit/          # Vitest 单测
```

## 站点配置

内容配置位于 `config/locales/{locale}.json`，主要节点：

| 节点 | 内容 |
| --- | --- |
| `meta` | 标题、SEO、favicon、ogImage |
| `theme` | `primary` / `secondary` 十六进制色、`radius`、`font`、`background`（gradient \| solid \| grid） |
| `brand` / `navbar` | Logo（`logoSvg` 或 `logoUrl`）、品牌名、导航链接、CTA |
| `hero` / `features` / `about` / `testimonials` / `contact` / `footer` | 各 Section 数据 |
| `order` | Section 渲染顺序（可选，缺省为默认顺序） |

配置在加载时经 `SiteConfigSchema`（Zod）校验，校验失败会抛出明确错误。

```bash
npm run validate          # 校验全部配置
npm run check:i18n        # 校验 locales 与 messages 的 key 对齐
npm run sync:default-locale  # 将 zh-CN 同步到 config/site-data.json
```

## 主题系统

### 架构

```
config/locales/*.json 的 theme.primary（或 /admin 中的选择）
        │
        ├─ 服务端：themeToCssVars() → <body style> 内联注入
        └─ 客户端：applyTheme(hex, mode) → 覆盖 html/body CSS 变量
                    （选择持久化于 localStorage，ThemeColorApplicator 水合后应用）
        │
        ▼
CSS 变量（--color-*）→ Tailwind 语义工具类（bg-page / text-ink …）→ 全站换肤
```

### 语义令牌

组件不写死颜色，全部使用语义令牌；**默认值与原 slate/white/blue 取值逐一相等**，因此默认主题视觉零变化。

| 令牌 | 默认（暗色 + 默认色） | 用途 |
| --- | --- | --- |
| `primary` | `#2563eb` | 按钮、链接、焦点环 |
| `page` / `band` | slate-950 / slate-900 | 页面底色 / 分区底色 |
| `surface` / `line` / `line-strong` | slate-800 / 800 / 700 | 实心态、边框、悬停边框 |
| `panel` / `panel-line` / `wash` | white / slate-200 / slate-50 | 导航与下拉、管理页底 |
| `accent` | blue-400 | 深色底强调（徽章/图标/Logo） |
| `title` / `ink` / `soft` / `muted` | white / slate-100 / 300 / 400 | 标题 / 正文 / 次级 / 弱化文字 |

- **暗色模式**（默认）+ 默认色 → 返回基线调色板（现状样式）
- **自定义色** → 按色相派生整套暗色系（或亮色系）
- **亮色模式** → 派生浅色背景 + 深色文字，`accent` 自动加深保证对比度

### 管理后台

访问 `/admin` → 「主题色设置」：

1. **背景明暗**：暗色背景 / 亮色背景
2. **预设颜色**：12 色色板（首项为默认蓝 `#2563eb`）+ 自定义取色器
3. **恢复默认**：一键回到默认主题色
4. 实时预览主色组件与整站背景（页底 / 卡片 / 边框 / 强调色）

选择保存在浏览器 `localStorage`（`znbsys.theme-primary`、`znbsys.theme-mode`），仅影响当前浏览器；营销页与管理页即时同步。核心实现见 `lib/palette.ts`、`lib/themePresets.ts`。

## 多语言

- **内容**：`config/locales/{locale}.json`（站点数据）
- **UI 文案**：`messages/{locale}.json`（组件内 `t(dict, 'key')`，缺失 key 自动回退 `zh-CN`）
- **切换**：`LanguageSwitcher` 写入 `NEXT_LOCALE` cookie 并保留当前路径；`middleware.ts` 负责协商与重定向（302，避免浏览器缓存语言切换）

## 脚本一览

| 命令 | 说明 |
| --- | --- |
| `npm run dev` / `start` | 开发 / 生产前台启动 |
| `./scripts/start.sh` / `stop.sh` | 后台启动（build + standalone `server.js` + PID/日志）/ 停止（PID + 端口兜底） |
| `npm run dev:background` | 后台运行 `next dev` 并回显 PID |
| `npm run stop` / `restart` | 杀掉 3000 端口进程 / `stop && start` |
| `npm run build` | 生产构建 |
| `npm run lint` / `typecheck` / `format` | ESLint / tsc / Prettier |
| `npm run test` / `test:watch` | Vitest 单测（jsdom） |
| `npm run test:e2e` | Playwright E2E（`tests/e2e`，自带 build+start） |
| `npm run validate` | 站点配置 Zod 校验 |
| `npm run check:i18n` | i18n key 一致性检查 |
| `npm run sync:default-locale` | 同步默认语言到 `site-data.json` |
| `npm run build:standalone` | 生成 `dist/` 单文件静态站（Tailwind CDN） |

## 部署

两条通道，push `main` 后各自独立触发：

| 通道 | 工作流 | 说明 |
| --- | --- | --- |
| **GitHub Pages（免费）** | [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) | 静态导出托管，无需任何服务器；默认启用 |
| 自有服务器 | [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) | 按 [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md) 方式 A，SCP + SSH 部署 standalone；**默认关闭**，需设 `ENABLE_SERVER_DEPLOY=true` |

### GitHub Pages（免费托管，推荐起步）

1. **仓库 Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**
2. push 到 `main`（或 Actions 页手动运行 “Deploy to GitHub Pages”）
3. 访问 `https://<owner>.github.io/<repo>/`（用户站 `<owner>.github.io` 则为根路径）

工作流做的事：

```
push main ──▶ 质量门禁（validate / i18n / lint / typecheck / test）
                 └─ STATIC_EXPORT=1 next build → out/（纯静态）
                        └─ basePath 自动取 /<repo> → 上传 Pages artifact → 部署
```

- **零配置**：basePath、站点源（`NEXT_PUBLIC_SITE_URL=https://<owner>.github.io`）由 CI 按仓库名自动推导
- **静态导出限制**：middleware 不参与运行时——根路径 `/` 由 `app/page.tsx` 按 cookie → `navigator.language` 协商后跳转到 `/zh-CN/`、`/en/`、`/ja/`；其余（含 `/admin` 主题切换）与服务器部署完全一致
- **链接兼容**：站内链接与 SEO alternates 经 `lib/paths.ts` 的 `withBase()` 自动拼接路径前缀
- 本地预览导出结果：

```bash
STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/znbsys-homepage npm run build   # 产物在 out/
```

### 自有服务器部署（可选）

启用：**Settings → Secrets and variables → Actions → Variables** 中添加 `ENABLE_SERVER_DEPLOY` = `true`，并配置以下 Secrets：

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `SERVER_HOST` | Secret | 服务器公网 IP |
| `SERVER_USER` | Secret | SSH 用户名（ubuntu/root/centos） |
| `SSH_PRIVATE_KEY` | Secret | SSH 私钥内容（`ssh-keygen -t rsa -b 4096`，公钥加入服务器） |
| `SERVER_PORT` | Secret | 可选，SSH 端口，默认 22 |
| `NEXT_PUBLIC_SITE_URL` | Variable | 可选，生产站点源（如 `https://example.com`），用于 SEO alternates |
| `ENABLE_SERVER_DEPLOY` | Variable | 设为 `true` 启用本工作流（未设置时跳过，仅走 Pages） |

流程：

```
push main ──▶ CI（validate / check:i18n / lint / typecheck / test / build）
                 └─ 打包 .next/standalone → release.tar.gz（artifact）
                        └─ SCP 上传 → SSH 解压至 /opt/znbsys-homepage → node server.js 重启
                                       └─ 健康检查（127.0.0.1:3000/admin）
```

**服务器一次性准备**：

```bash
sudo mkdir -p /opt/znbsys-homepage
sudo chown -R $USER:$USER /opt/znbsys-homepage
```

**Nginx 反向代理**（应用监听 3000 端口）：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> 与 SPA 不同，Next.js 自行处理路由，无需 `try_files`；如需 HTTPS 按指南第五节配置 Certbot 即可。

**触发与回滚**：

- **触发**：push 到 `main`，或在 Actions 页手动 `workflow_dispatch`
- **产物**：保留 7 天的 `release-<sha>` artifact；服务器保留上一版于 `previous/`
- **回滚**（服务器上执行）：

```bash
cd /opt/znbsys-homepage
kill "$(cat .server.pid)" 2>/dev/null; rm -f .server.pid
mv current current.broken && mv previous current
cd current && nohup env PORT=3000 HOSTNAME=0.0.0.0 \
  node server.js > ../server.log 2>&1 & echo $! > ../.server.pid
```

日志：`/opt/znbsys-homepage/server.log`

## 测试

- **单测**（Vitest + Testing Library + jsdom）：i18n 协商与字典、调色板派生（默认基线不变 / 亮暗模式 / 对比度）、主题持久化与 CSS 变量应用
- **E2E**（Playwright + axe-core，Chromium / 移动端）：配置于 `playwright.config.ts`，测试目录 `tests/e2e`

## 相关文档

- 设计参考：[awesome-design-md](https://github.com/voltagent/awesome-design-md) — 项目的设计规范来源
- [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md) — 通用部署指南（GitHub Actions / 手动 / Docker Compose、Nginx、SSL）
- [`SPEC.md`](./SPEC.md) — 需求与验收用例（UT-/E2E- 编号）
- [`DESING.md`](./DESING.md) — 设计规范与 Token 体系
- [`LICENSE`](./LICENSE)

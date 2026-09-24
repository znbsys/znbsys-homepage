[English](./README.md) | [简体中文](./README.zh-CN.md) | **日本語**

# znbsys-homepage（ZnbSys）

JSON 設定駆動の多言語コーポレートサイト。1 つのコードベースで、`config/locales/*.json` を差し替えるだけで新しいサイトを生成できます。サイト全体のテーマスイッチ（プライマリカラー + ダーク/ライト背景）と、管理画面でのリアルタイム切替に対応。

デザイン参照：[awesome-design-md](https://github.com/voltagent/awesome-design-md)

## 機能

- **JSON データ駆動**：ページ構造とコンテンツはすべてサイト設定に由来し、Zod スキーマで検証してから描画
- **多言語**：`zh-CN` / `en` / `ja` 内蔵。middleware による自動ネゴシエーション（cookie → Accept-Language → 既定）、hreflang / og:locale SEO メタデータ付き
- **サイト全体のテーマシステム**：プライマリカラーから完全なパレットを派生（ページ背景、セクション背景、カード、ボーダー、パネル、アクセント、文字色）。**ダーク/ライト背景**の 2 モードに対応
- **管理画面 `/admin`**：プリセットパレット + カスタムカラー選択 + 明暗切替 + 一键リセット。既定のプライマリ色 `#2563eb` は常に保持
- **セクションの並べ替え**：`order` で hero / features / about / testimonials / contact の描画順を制御。`about`・`testimonials` は省略可
- **アイコンのホワイトリスト**：Lucide アイコンを `lib/icons.ts` のホワイトリストで検証
- **デュアルビルド**：Next.js を主成果物とし、`build:standalone` で単一ファイル静的サイトも生成（同一の JSON 設定を共有）

## 技術スタック

Next.js 14（App Router）· React 18 · TypeScript · Tailwind CSS 3 · Zod · lucide-react · Vitest · Playwright

## クイックスタート

```bash
npm install
npm run dev        # http://localhost:3000（ルートは 302 で /zh-CN へ）
```

```bash
npm run build && npm run start   # 本番ビルドとフロントグラウンド起動
```

### 起動 / 停止スクリプト（バックグラウンド常駐）

本番では PID とログを自動管理するバックグラウンドスクリプトを推奨（ポート 3000）：

```bash
./scripts/start.sh    # ビルド（npm run build）し、standalone ランタイム（node server.js）をバックグラウンド起動
./scripts/stop.sh     # .server.pid で停止。必要に応じて 3000 端口の残プロセスをクリア
```

- **start.sh**：冪等——既に起動中ならその旨を出して終了。ビルド後に `.next/standalone` を組み立て（静的アセットをコピー）`node server.js` でバックグラウンド実行。ビルド・実行ログは `.server.log`、PID は `.server.pid`（いずれも gitignore 済み）。起動失敗時は PID ファイルをロールバックしログ確認を促す
- **stop.sh**：まず PID ファイルでグレースフル停止、次にポート指定の `kill -9` フォールバック、最後に PID ファイルを削除

対応する npm ショートカット：

```bash
npm run dev:background   # next dev をバックグラウンド実行、stdout 静黙、PID を表示
npm run stop             # 3000 端口のプロセスを終了（lsof -ti:3000 | kill -9）
npm run restart          # stop && start（フロントグラウンド本番サーバ）
```

## ルート

| ルート | 説明 |
| --- | --- |
| `/` | ロケールをネゴシエート後、302 で `/{locale}` へ |
| `/zh-CN` `/en` `/ja` | マーケティングトップ（SSG） |
| `/{locale}/privacy` | プライバシーポリシー |
| `/{locale}/terms` | 利用規約 |
| `/{locale}/changelog` | 更新履歴 |
| `/admin` | 管理画面（テーマ色 / 明暗切替。ロケールネゴシエーション対象外） |
| その他 | 対応ロケールの 404 ページ |

## ディレクトリ構成

```
app/
  [locale]/          # 多言語トップのレイアウトと描画（layout がテーマ CSS 変数を注入）
  admin/page.tsx     # 管理画面
  globals.css        # 既定テーマトークン（:root CSS 変数）
components/
  layout/            # Navbar / Footer / MobileMenu
  sections/          # Hero / Features / About / Testimonials / Contact
  admin/             # ThemeColorSwitcher（テーマ切替 UI）
  ThemeColorApplicator.tsx  # ハイドレーション後に localStorage のテーマを適用
  LanguageSwitcher.tsx / DynamicIcon.tsx
config/
  locales/           # サイト内容設定（zh-CN / en / ja）、言語ごとに 1 ファイル
  fixtures/          # テスト用設定（minimal / brand-b）
  site-data.json     # zh-CN ミラー（後方互換）
messages/            # UI 文言辞書（nav.*、hero.* など。欠損キーは既定言語へフォールバック）
i18n/                # ロケールネゴシエーション、設定/辞書の読み込み、t() 翻訳
lib/                 # color / palette / theme / themePresets / config / icons / cn / paths
schemas/             # Zod：SiteConfigSchema
types/               # SiteConfig 型契約
middleware.ts        # ロケールネゴシエーション（/admin は通過）
scripts/             # 設定検証、i18n 整合、standalone ビルドなど
tests/unit/          # Vitest 単体テスト
```

## サイト設定

内容設定は `config/locales/{locale}.json` にあります。主なノード：

| ノード | 内容 |
| --- | --- |
| `meta` | タイトル、SEO、favicon、ogImage |
| `theme` | `primary` / `secondary` の 16 進カラー、`radius`、`font`、`background`（gradient \| solid \| grid） |
| `brand` / `navbar` | ロゴ（`logoSvg` または `logoUrl`）、ブランド名、ナビリンク、CTA |
| `hero` / `features` / `about` / `testimonials` / `contact` / `footer` | 各セクションのデータ |
| `order` | セクション描画順（省略可、省略時は既定順） |

設定は読み込み時に `SiteConfigSchema`（Zod）で検証され、失敗時は明確なエラーを送出します。

```bash
npm run validate          # 全設定を検証
npm run check:i18n        # locales と messages のキー整合を検証
npm run sync:default-locale  # zh-CN を config/site-data.json へ同期
```

## テームシステム

### アーキテクチャ

```
config/locales/*.json の theme.primary（または /admin での選択）
        │
        ├─ サーバ：themeToCssVars() → <body style> にインライン注入
        └─ クライアント：applyTheme(hex, mode) → html/body の CSS 変数を上書き
                    （選択は localStorage に永続、ThemeColorApplicator がハイドレーション後に適用）
        │
        ▼
CSS 変数（--color-*）→ Tailwind セマンティックユーティリティ（bg-page / text-ink …）→ サイト全体の再スキン
```

### セマンティックトークン

コンポーネントは色をハードコードせず、すべてセマンティックトークンを使用。**既定値は元の slate/white/blue の値と一一致**するため、既定テーマの見た目は不変です。

| トークン | 既定（ダーク + 既定色） | 用途 |
| --- | --- | --- |
| `primary` | `#2563eb` | ボタン、リンク、フォーカスリング |
| `page` / `band` | slate-950 / slate-900 | ページ背景 / セクション背景 |
| `surface` / `line` / `line-strong` | slate-800 / 800 / 700 | ソリッド面、ボーダー、ホバーボーダー |
| `panel` / `panel-line` / `wash` | white / slate-200 / slate-50 | ナビ・ドロップダウン、管理画面背景 |
| `accent` | blue-400 | ダーク背景上のアクセント（バッジ / アイコン / ロゴ） |
| `title` / `ink` / `soft` / `muted` | white / slate-100 / 300 / 400 | 見出し / 本文 / 補助 / 弱い文字 |

- **ダークモード**（既定）+ 既定色 → ベースラインパレットを返す（現行スタイル）
- **カスタムカラー** → 色相から暗色（または亮色）スキームを派生
- **ライトモード** → 明るい背景 + 暗い文字を派生。`accent` はコントラスト確保のため自動的に濃く

### 管理画面

`/admin` → 「テーマ色設定」：

1. **背景の明暗**：ダーク背景 / ライト背景
2. **プリセットカラー**：12 色スウォッチ（先頭は既定の青 `#2563eb`）+ カスタムカラーピッカー
3. **既定へリセット**：ワンクリックで既定のプライマリ色に戻す
4. プライマリ要素とサイト全体背景（ページ背景 / カード / ボーダー / アクセント）のライブプレビュー

選択はブラウザの `localStorage`（`znbsys.theme-primary`、`znbsys.theme-mode`）に保存され、そのブラウザのみに影響。マーケティングページと管理画面は即時同期。中核実装は `lib/palette.ts`、`lib/themePresets.ts`。

## 多言語

- **内容**：`config/locales/{locale}.json`（サイトデータ）
- **UI 文言**：`messages/{locale}.json`（コンポーネント内 `t(dict, 'key')`。欠損キーは自動で `zh-CN` へフォールバック）
- **切替**：`LanguageSwitcher` が `NEXT_LOCALE` cookie を書き込み現在のパスを保持；`middleware.ts` がネゴシエーションとリダイレクトを担当（302。ブラウザの言語切替キャッシュを回避）

## スクリプト一覧

| コマンド | 説明 |
| --- | --- |
| `npm run dev` / `start` | 開発 / 本番フロントグラウンド起動 |
| `./scripts/start.sh` / `stop.sh` | バックグラウンド起動（build + standalone `server.js` + PID/ログ）/ 停止（PID + 端口フォールバック） |
| `npm run dev:background` | `next dev` をバックグラウンド実行し PID を表示 |
| `npm run stop` / `restart` | 3000 端口プロセスを終了 / `stop && start` |
| `npm run build` | 本番ビルド |
| `npm run lint` / `typecheck` / `format` | ESLint / tsc / Prettier |
| `npm run test` / `test:watch` | Vitest 単体テスト（jsdom） |
| `npm run test:e2e` | Playwright E2E（`tests/e2e`、build+start 付き） |
| `npm run validate` | サイト設定の Zod 検証 |
| `npm run check:i18n` | i18n キー整合チェック |
| `npm run sync:default-locale` | 既定言語を `site-data.json` へ同期 |
| `npm run build:standalone` | `dist/` の単一ファイル静的サイト生成（Tailwind CDN） |

## デプロイ

2 つの経路があり、`main` へ push するとそれぞれ独立に起動します：

| 経路 | ワークフロー | 説明 |
| --- | --- | --- |
| **GitHub Pages（無料）** | [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) | 静的エクスポートのホスティング。サーバ不要。既定で有効 |
| 自有サーバ | [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) | [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md) の方式 A に従い SCP + SSH で standalone をデプロイ。**既定は無効**、`ENABLE_SERVER_DEPLOY=true` が必要 |

### GitHub Pages（無料ホスティング、まずおすすめ）

1. リポジトリの **Settings → Pages → Build and deployment → Source** で **GitHub Actions** を選択
2. `main` へ push（または Actions ページで “Deploy to GitHub Pages” を手動実行）
3. `https://<owner>.github.io/<repo>/` にアクセス（ユーザーサイト `<owner>.github.io` の場合はルートパス）

ワークフローの流れ：

```
push main ──▶ 品質ゲート（validate / i18n / lint / typecheck / test）
                 └─ STATIC_EXPORT=1 next build → out/（純静的）
                        └─ basePath は自動で /<repo> → Pages artifact をアップロード → デプロイ
```

- **設定不要**：basePath とサイトオリジン（`NEXT_PUBLIC_SITE_URL=https://<owner>.github.io`）は CI がリポジトリ名から自動導出
- **静的エクスポートの制約**：middleware はランタイムに参加しない——ルート `/` は `app/page.tsx` が cookie → `navigator.language` をネゴシエートして `/zh-CN/`・`/en/`・`/ja/` へ遷移。それ以外（`/admin` のテーマ切替を含む）はサーバデプロイと完全に同一
- **リンク互換**：サイト内リンクと SEO alternates は `lib/paths.ts` の `withBase()` がパスプレフィックスを自動付与
- エクスポート結果をローカルでプレビュー：

```bash
STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/znbsys-homepage npm run build   # 成果物は out/
```

### 自有サーバへのデプロイ（任意）

**Settings → Secrets and variables → Actions → Variables** に `ENABLE_SERVER_DEPLOY` = `true` を追加して有効化し、以下の Secrets を設定：

| 名前 | 種類 | 説明 |
| --- | --- | --- |
| `SERVER_HOST` | Secret | サーバの公開 IP |
| `SERVER_USER` | Secret | SSH ユーザー（ubuntu/root/centos） |
| `SSH_PRIVATE_KEY` | Secret | SSH 秘密鍵（`ssh-keygen -t rsa -b 4096`。公開鍵をサーバに登録） |
| `SERVER_PORT` | Secret | 任意、SSH ポート。既定 22 |
| `NEXT_PUBLIC_SITE_URL` | Variable | 任意、本番オリジン（例 `https://example.com`）。SEO alternates 用 |
| `ENABLE_SERVER_DEPLOY` | Variable | `true` で本ワークフローを有効化（未設定ならスキップ、Pages のみ） |

フロー：

```
push main ──▶ CI（validate / check:i18n / lint / typecheck / test / build）
                 └─ .next/standalone をパッケージ → release.tar.gz（artifact）
                        └─ SCP アップロード → SSH で /opt/znbsys-homepage へ展開 → node server.js 再起動
                                       └─ ヘルスチェック（127.0.0.1:3000/admin）
```

**サーバの初期準備（1 回）**：

```bash
sudo mkdir -p /opt/znbsys-homepage
sudo chown -R $USER:$USER /opt/znbsys-homepage
```

**Nginx リバースプロキシ**（アプリはポート 3000 で待受）：

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

> SPA と異なり Next.js がルーティングを自前で処理するため `try_files` は不要。HTTPS はガイド第 5 節に従い Certbot を設定してください。

**トリガーとロールバック**：

- **トリガー**：`main` への push、または Actions ページでの手動 `workflow_dispatch`
- **成果物**：`release-<sha>` を 7 日間保持。サーバ側は直前バージョンを `previous/` に保持
- **ロールバック**（サーバ上で実行）：

```bash
cd /opt/znbsys-homepage
kill "$(cat .server.pid)" 2>/dev/null; rm -f .server.pid
mv current current.broken && mv previous current
cd current && nohup env PORT=3000 HOSTNAME=0.0.0.0 \
  node server.js > ../server.log 2>&1 & echo $! > ../.server.pid
```

ログ：`/opt/znbsys-homepage/server.log`

## テスト

- **単体テスト**（Vitest + Testing Library + jsdom）：i18n ネゴシエーションと辞書、パレット派生（既定ベースライン不変 / 明暗モード / コントラスト）、テーマ永続化と CSS 変数の適用
- **E2E**（Playwright + axe-core、Chromium / モバイル）：設定は `playwright.config.ts`、テストディレクトリは `tests/e2e`

## 関連ドキュメント

- デザイン参照：[awesome-design-md](https://github.com/voltagent/awesome-design-md) — 本プロジェクトのデザイン規約の出典
- [`SPEC.md`](./SPEC.md) — 要件と受入ケース（UT-/E2E- 番号）
- [`LICENSE`](./LICENSE)

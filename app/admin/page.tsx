import type { Metadata } from 'next';
import { ThemeColorSwitcher } from '@/components/admin/ThemeColorSwitcher';
import { ThemeColorApplicator } from '@/components/ThemeColorApplicator';
import { DEFAULT_PRIMARY } from '@/lib/themePresets';
import { withBase } from '@/lib/paths';
import { Palette, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: '管理后台 · 主题设置',
  description: '站点主题色管理',
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-wash font-sans text-slate-900">
      <ThemeColorApplicator />

      <header className="sticky top-0 z-40 border-b border-panel-line bg-panel/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-primary/25">
              <Palette className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold">管理后台</span>
          </div>
          <a
            href={withBase('/')}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            返回站点
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <section
          aria-labelledby="theme-heading"
          className="rounded-2xl border border-panel-line bg-panel p-6 shadow-sm"
        >
          <h1 id="theme-heading" className="text-xl font-bold">
            主题色设置
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            可切换背景明暗（暗色/亮色），并从预设色板或取色器更换主色调。默认主题色为 {DEFAULT_PRIMARY}
            ，始终保留可随时恢复。
          </p>
          <div className="mt-6">
            <ThemeColorSwitcher />
          </div>
        </section>
      </main>
    </div>
  );
}

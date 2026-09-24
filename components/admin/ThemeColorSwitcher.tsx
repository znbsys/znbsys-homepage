'use client';

import { useEffect, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  DEFAULT_PRIMARY,
  THEME_PRESETS,
  applyTheme,
  isDefaultPrimary,
  loadStoredMode,
  loadStoredPrimary,
  normalizeHex,
  saveStoredMode,
  saveStoredPrimary,
  type ThemeMode,
} from '@/lib/themePresets';

/**
 * 主题切换器：背景明暗模式 + 预设色板 + 自定义取色。
 * 选择即时生效并持久化到 localStorage；默认主题色（#2563eb）始终保留。
 */
export function ThemeColorSwitcher() {
  const [hex, setHex] = useState(DEFAULT_PRIMARY);
  const [mode, setMode] = useState<ThemeMode>('dark');

  // 水合后读取已保存的主题，避免 SSR/CSR 不一致
  useEffect(() => {
    const stored = loadStoredPrimary();
    const storedMode = loadStoredMode();
    setHex(stored ?? DEFAULT_PRIMARY);
    setMode(storedMode);
    applyTheme(stored, storedMode);
  }, []);

  function select(next: string) {
    const normalized = normalizeHex(next);
    setHex(normalized);
    saveStoredPrimary(normalized);
    applyTheme(normalized, mode);
  }

  function toggleMode(next: ThemeMode) {
    setMode(next);
    saveStoredMode(next);
    applyTheme(isDefaultPrimary(hex) ? null : hex, next);
  }

  const usingDefault = isDefaultPrimary(hex);

  return (
    <div className="space-y-6">
      {/* 背景明暗 */}
      <div>
        <p className="text-sm font-medium text-slate-700">背景明暗</p>
        <div
          role="radiogroup"
          aria-label="背景明暗模式"
          className="mt-3 inline-flex rounded-lg border border-panel-line p-1"
          data-testid="theme-mode"
        >
          {([
            { value: 'dark', label: '暗色背景' },
            { value: 'light', label: '亮色背景' },
          ] as const).map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={mode === option.value}
              onClick={() => toggleMode(option.value)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                mode === option.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-600 hover:bg-wash',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {/* 预设色板 */}
      <div>
        <p className="text-sm font-medium text-slate-700">预设颜色</p>
        <div
          role="radiogroup"
          aria-label="主题色预设"
          className="mt-3 flex flex-wrap gap-3"
          data-testid="theme-presets"
        >
          {THEME_PRESETS.map((preset) => {
            const selected = normalizeHex(preset.hex) === hex;
            return (
              <button
                key={preset.hex}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={preset.isDefault ? `${preset.label}（默认）` : preset.label}
                title={preset.isDefault ? `${preset.label}（默认 ${DEFAULT_PRIMARY}）` : preset.label}
                onClick={() => select(preset.hex)}
                className={cn(
                  'relative h-10 w-10 rounded-full transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  selected
                    ? 'scale-100 ring-2 ring-offset-2 ring-slate-900'
                    : 'scale-100 ring-1 ring-black/10 hover:scale-110',
                )}
                style={{ backgroundColor: preset.hex }}
              >
                {selected && (
                  <Check
                    className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 自定义颜色 + 恢复默认 */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <span>自定义颜色</span>
          <input
            type="color"
            value={normalizeHex(hex)}
            onChange={(event) => select(event.target.value)}
            aria-label="自定义主题色"
            data-testid="theme-custom-color"
            className="h-9 w-12 cursor-pointer rounded border border-panel-line bg-panel p-1"
          />
          <code className="rounded bg-wash px-2 py-1 text-xs font-normal text-slate-600">
            {hex}
          </code>
        </label>

        <button
          type="button"
          onClick={() => select(DEFAULT_PRIMARY)}
          disabled={usingDefault}
          data-testid="theme-reset"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            usingDefault
              ? 'border-panel-line text-slate-400'
              : 'border-panel-line text-slate-700 hover:bg-wash',
          )}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          恢复默认
        </button>
      </div>

      {/* 效果预览 */}
      <div className="rounded-xl border border-panel-line bg-wash p-5">
        <p className="text-sm text-slate-500">效果预览</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            主要按钮
          </button>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            徽章
          </span>
          <a
            href="#preview"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            文字链接
          </a>
          <span
            aria-hidden="true"
            className="inline-block h-10 w-10 rounded-card border-2 border-primary bg-primary/10"
          />
        </div>
        {/* 整站背景预览：页底 / 分区底 / 卡片 / 强调（随明暗模式联动） */}
        <div className="mt-4 overflow-hidden rounded-lg border border-line">
          <div className="bg-page px-4 py-3 text-xs text-ink">页面背景</div>
          <div className="flex flex-wrap gap-3 bg-band px-4 py-3">
            <span className="rounded bg-surface px-2 py-1 text-xs text-soft">卡片</span>
            <span className="rounded border border-line px-2 py-1 text-xs text-soft">边框</span>
            <span className="rounded bg-accent/10 px-2 py-1 text-xs text-accent">强调色</span>
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        可切换暗色/亮色背景，并整站换肤（主色、页面背景、卡片、边框、浅色面板、强调色、文字），保存在当前浏览器中；默认主题色
        {DEFAULT_PRIMARY} 始终保留，可随时恢复。
      </p>
    </div>
  );
}

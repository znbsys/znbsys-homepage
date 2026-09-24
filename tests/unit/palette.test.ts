import { describe, it, expect } from 'vitest';

import { buildThemePalette, paletteToCssVars, PALETTE_CSS_VARS } from '../../lib/palette';
import { themeToCssVars } from '../../lib/theme';

describe('buildThemePalette 默认主题', () => {
  it('默认主题色 + 暗色模式返回与现状完全一致的基线调色板', () => {
    const palette = buildThemePalette('#2563eb', 'dark');
    expect(palette).toEqual({
      page: '#020617', // slate-950
      band: '#0f172a', // slate-900
      surface: '#1e293b', // slate-800
      line: '#1e293b', // slate-800
      lineStrong: '#334155', // slate-700
      panel: '#ffffff',
      panelLine: '#e2e8f0', // slate-200
      wash: '#f8fafc', // slate-50
      accent: '#60a5fa', // blue-400
      title: '#ffffff',
      ink: '#f1f5f9', // slate-100
      soft: '#cbd5e1', // slate-300
      muted: '#94a3b8', // slate-400
    });
  });
});

describe('buildThemePalette 自定义主题色', () => {
  it('背景类颜色全部偏离基线，实现整站换肤', () => {
    const base = buildThemePalette('#2563eb');
    const red = buildThemePalette('#dc2626');
    expect(red.page).not.toBe(base.page);
    expect(red.band).not.toBe(base.band);
    expect(red.surface).not.toBe(base.surface);
    expect(red.line).not.toBe(base.line);
    expect(red.panel).not.toBe(base.panel);
    expect(red.wash).not.toBe(base.wash);
    expect(red.accent).not.toBe(base.accent);
  });

  it('派生的页底与分区底是深色，浅色面板是浅色', () => {
    const palette = buildThemePalette('#16a34a');
    const lum = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      return ((n >> 16) * 299 + ((n >> 8) & 0xff) * 587 + (n & 0xff) * 114) / 1000;
    };
    expect(lum(palette.page)).toBeLessThan(60);
    expect(lum(palette.band)).toBeLessThan(80);
    expect(lum(palette.panel)).toBeGreaterThan(220);
    expect(lum(palette.wash)).toBeGreaterThan(220);
    // 强调色需比页底亮，保证深色底上的可读性
    expect(lum(palette.accent)).toBeGreaterThan(lum(palette.page) + 80);
  });

  it('非法输入回退到基线调色板', () => {
    expect(buildThemePalette('bad-color')).toEqual(buildThemePalette('#2563eb'));
  });
});

describe('buildThemePalette 亮色模式', () => {
  const lum = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return ((n >> 16) * 299 + ((n >> 8) & 0xff) * 587 + (n & 0xff) * 114) / 1000;
  };

  it('默认色在亮色模式下生成浅色背景与深色文字', () => {
    const palette = buildThemePalette('#2563eb', 'light');
    expect(lum(palette.page)).toBeGreaterThan(200);
    expect(lum(palette.band)).toBeGreaterThan(200);
    expect(lum(palette.wash)).toBeGreaterThan(200);
    expect(lum(palette.title)).toBeLessThan(64);
    expect(lum(palette.ink)).toBeLessThan(80);
    // 标题在页底上的对比：标题必须明显更暗
    expect(lum(palette.page) - lum(palette.title)).toBeGreaterThan(150);
  });

  it('自定义色在亮色模式下同样保持浅色背景，且强调色足够深', () => {
    const palette = buildThemePalette('#16a34a', 'light');
    expect(lum(palette.page)).toBeGreaterThan(200);
    expect(lum(palette.band)).toBeGreaterThan(200);
    // 亮底上的强调色需足够深以保证可读
    expect(lum(palette.accent)).toBeLessThan(160);
    expect(lum(palette.page) - lum(palette.accent)).toBeGreaterThan(80);
  });

  it('亮色与暗色模式的页底明暗相反', () => {
    const dark = buildThemePalette('#dc2626', 'dark');
    const light = buildThemePalette('#dc2626', 'light');
    expect(lum(dark.page)).toBeLessThan(60);
    expect(lum(light.page)).toBeGreaterThan(200);
  });
});

describe('paletteToCssVars', () => {
  it('为全部语义令牌生成 R G B 三元组变量', () => {
    const vars = paletteToCssVars('#2563eb');
    expect(Object.keys(vars).sort()).toEqual([...Object.values(PALETTE_CSS_VARS)].sort());
    expect(vars['--color-page']).toBe('2 6 23');
    expect(vars['--color-panel']).toBe('255 255 255');
    expect(vars['--color-accent']).toBe('96 165 250');
  });

  it('自定义色时背景变量随主题变化', () => {
    const base = paletteToCssVars('#2563eb');
    const red = paletteToCssVars('#dc2626');
    expect(red['--color-page']).not.toBe(base['--color-page']);
    expect(red['--color-primary']).toBeUndefined();
  });
});

describe('themeToCssVars', () => {
  it('输出包含主色与完整调色板', () => {
    const vars = themeToCssVars({
      primary: '#2563eb',
      radius: 'xl',
      font: 'sans',
      background: 'gradient',
    });
    expect(vars['--color-primary']).toBe('37 99 235');
    expect(vars['--color-page']).toBe('2 6 23');
    expect(vars['--color-band']).toBe('15 23 42');
    expect(vars['--color-accent']).toBe('96 165 250');
    expect(vars['--color-title']).toBe('255 255 255');
    expect(vars['--color-ink']).toBe('241 245 249');
    expect(vars['--radius-card']).toBe('1rem');
  });
});

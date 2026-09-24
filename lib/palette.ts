import { hexToRgbTriplet, hslToHex, isDefaultPrimary, parseHex, rgbToHsl } from './color';

/** 背景明暗模式：暗色（默认，与现状一致）/ 亮色 */
export type ThemeMode = 'dark' | 'light';

/**
 * 站点语义主题令牌：由主题色 + 明暗模式整体派生的完整调色板。
 * 字段为 6 位 hex，对应 globals.css 中同名 CSS 变量。
 */
export interface ThemePalette {
  /** 页面底色（原 bg-slate-950） */
  page: string;
  /** 分区底色（原 bg-slate-900） */
  band: string;
  /** 实心态：图片占位、悬停底（原 bg-slate-800） */
  surface: string;
  /** 分区/卡片边框（原 border-slate-800） */
  line: string;
  /** 悬停边框（原 border-slate-700） */
  lineStrong: string;
  /** 浅色面板（原 bg-white） */
  panel: string;
  /** 浅色面板边框（原 border-slate-200） */
  panelLine: string;
  /** 浅色底（原 bg-slate-50） */
  wash: string;
  /** 强调色：徽章/图标（原 text-blue-400） */
  accent: string;
  /** 主标题（原 text-white） */
  title: string;
  /** 正文（原 text-slate-100） */
  ink: string;
  /** 次级正文（原 text-slate-300） */
  soft: string;
  /** 弱化文字（原 text-slate-400） */
  muted: string;
}

/** 语义令牌 -> CSS 变量名 */
export const PALETTE_CSS_VARS: Record<keyof ThemePalette, string> = {
  page: '--color-page',
  band: '--color-band',
  surface: '--color-surface',
  line: '--color-line',
  lineStrong: '--color-line-strong',
  panel: '--color-panel',
  panelLine: '--color-panel-line',
  wash: '--color-wash',
  accent: '--color-accent',
  title: '--color-title',
  ink: '--color-ink',
  soft: '--color-soft',
  muted: '--color-muted',
};

/** 默认主题 + 暗色模式的基线调色板，与当前站点取值完全一致 */
const BASELINE_PALETTE: ThemePalette = {
  page: '#020617', // slate-950
  band: '#0f172a', // slate-900
  surface: '#1e293b', // slate-800
  line: '#1e293b', // slate-800
  lineStrong: '#334155', // slate-700
  panel: '#ffffff', // white
  panelLine: '#e2e8f0', // slate-200
  wash: '#f8fafc', // slate-50
  accent: '#60a5fa', // blue-400
  title: '#ffffff', // white
  ink: '#f1f5f9', // slate-100
  soft: '#cbd5e1', // slate-300
  muted: '#94a3b8', // slate-400
};

/** 暗色模式下的中性文字（适配任意深色底） */
const DARK_TEXT = {
  title: BASELINE_PALETTE.title,
  ink: BASELINE_PALETTE.ink,
  soft: BASELINE_PALETTE.soft,
  muted: BASELINE_PALETTE.muted,
};

/** 亮色模式下的中性文字（适配任意浅色底） */
const LIGHT_TEXT = {
  title: '#0f172a', // slate-900
  ink: '#1e293b', // slate-800
  soft: '#475569', // slate-600
  muted: '#64748b', // slate-500
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lightPalette(primary: string): ThemePalette {
  try {
    const { r, g, b } = parseHex(primary);
    const { h, s } = rgbToHsl(r, g, b);
    const sat = clamp(s, 0.2, 0.95);

    return {
      page: hslToHex(h, sat * 0.18, 0.98),
      band: hslToHex(h, sat * 0.22, 0.95),
      surface: hslToHex(h, sat * 0.35, 0.9),
      line: hslToHex(h, sat * 0.3, 0.84),
      lineStrong: hslToHex(h, sat * 0.35, 0.74),
      panel: hslToHex(h, sat * 0.1, 0.99),
      panelLine: hslToHex(h, sat * 0.25, 0.86),
      wash: hslToHex(h, sat * 0.2, 0.96),
      // 亮底上需更深的强调色保证对比度
      accent: hslToHex(h, clamp(sat * 0.9, 0.3, 0.9), 0.42),
      ...LIGHT_TEXT,
    };
  } catch {
    return {
      ...BASELINE_PALETTE,
      ...LIGHT_TEXT,
      accent: BASELINE_PALETTE.accent,
    };
  }
}

function darkPalette(primary: string): ThemePalette {
  if (isDefaultPrimary(primary)) {
    return { ...BASELINE_PALETTE };
  }

  try {
    const { r, g, b } = parseHex(primary);
    const { h, s } = rgbToHsl(r, g, b);
    const sat = clamp(s, 0.2, 0.95);

    return {
      page: hslToHex(h, sat * 0.55, 0.06),
      band: hslToHex(h, sat * 0.6, 0.1),
      surface: hslToHex(h, sat * 0.65, 0.17),
      line: hslToHex(h, sat * 0.5, 0.24),
      lineStrong: hslToHex(h, sat * 0.5, 0.33),
      panel: hslToHex(h, sat * 0.18, 0.97),
      panelLine: hslToHex(h, sat * 0.35, 0.88),
      wash: hslToHex(h, sat * 0.22, 0.96),
      accent: hslToHex(h, clamp(sat * 0.9, 0.3, 0.9), 0.65),
      ...DARK_TEXT,
    };
  } catch {
    return { ...BASELINE_PALETTE };
  }
}

/**
 * 由主题色 + 明暗模式派生完整调色板。
 * 默认色 + 暗色模式返回基线值，保证现有视觉完全不变；
 * 亮色模式始终派生浅色背景与深色文字。
 */
export function buildThemePalette(primary: string, mode: ThemeMode = 'dark'): ThemePalette {
  return mode === 'light' ? lightPalette(primary) : darkPalette(primary);
}

/** 调色板转为 CSS 自定义属性（R G B 三元组） */
export function paletteToCssVars(primary: string, mode: ThemeMode = 'dark'): Record<string, string> {
  const palette = buildThemePalette(primary, mode);
  const vars: Record<string, string> = {};
  for (const key of Object.keys(palette) as (keyof ThemePalette)[]) {
    vars[PALETTE_CSS_VARS[key]] = hexToRgbTriplet(palette[key]);
  }
  return vars;
}

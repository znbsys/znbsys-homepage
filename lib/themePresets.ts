import {
  DEFAULT_PRIMARY,
  hexToRgbTriplet,
  isDefaultPrimary,
  isValidHex,
  normalizeHex,
  tripletToHex,
} from './color';
import { PALETTE_CSS_VARS, paletteToCssVars, type ThemeMode } from './palette';

// 基础颜色工具与默认色定义在 color.ts（避免与 palette.ts 循环依赖），此处统一导出
export { DEFAULT_PRIMARY, isValidHex, normalizeHex, isDefaultPrimary } from './color';
export type { ThemeMode } from './palette';

/** 用户选择的主题色在 localStorage 中的键名 */
export const THEME_PRIMARY_STORAGE_KEY = 'znbsys.theme-primary';
/** 背景明暗模式在 localStorage 中的键名 */
export const THEME_MODE_STORAGE_KEY = 'znbsys.theme-mode';

export interface ThemePreset {
  /** 中文显示名 */
  label: string;
  /** 十六进制色值（6 位小写） */
  hex: string;
  /** 是否为默认主题色 */
  isDefault?: boolean;
}

/** 预设主题色，首项为必须保留的默认主题色 */
export const THEME_PRESETS: ThemePreset[] = [
  { label: '默认蓝', hex: DEFAULT_PRIMARY, isDefault: true },
  { label: '朱红', hex: '#dc2626' },
  { label: '橙', hex: '#ea580c' },
  { label: '琥珀', hex: '#d97706' },
  { label: '翠绿', hex: '#16a34a' },
  { label: '青', hex: '#0d9488' },
  { label: '天青', hex: '#0891b2' },
  { label: '靛蓝', hex: '#4f46e5' },
  { label: '紫', hex: '#7c3aed' },
  { label: '品红', hex: '#c026d3' },
  { label: '玫红', hex: '#db2777' },
  { label: '石板', hex: '#475569' },
];

/** 读取用户保存的主题色；未保存或非法时返回 null（即使用默认） */
export function loadStoredPrimary(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(THEME_PRIMARY_STORAGE_KEY);
    return raw && isValidHex(raw) ? normalizeHex(raw) : null;
  } catch {
    return null;
  }
}

/** 保存主题色；传入默认色或 null 时清除，确保默认主题始终来自站点配置 */
export function saveStoredPrimary(hex: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!hex || !isValidHex(hex) || isDefaultPrimary(hex)) {
      window.localStorage.removeItem(THEME_PRIMARY_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_PRIMARY_STORAGE_KEY, normalizeHex(hex));
    }
  } catch {
    // 隐私模式等场景下存储可能不可用，静默降级为仅本次生效
  }
}

/** 读取背景明暗模式；未保存或非法时返回 'dark'（默认，与现状一致） */
export function loadStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    return window.localStorage.getItem(THEME_MODE_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/** 保存背景明暗模式；暗色模式为默认值，清除存储项 */
export function saveStoredMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    if (mode === 'light') {
      window.localStorage.setItem(THEME_MODE_STORAGE_KEY, 'light');
    } else {
      window.localStorage.removeItem(THEME_MODE_STORAGE_KEY);
    }
  } catch {
    // 隐私模式等场景下存储可能不可用，静默降级为仅本次生效
  }
}

/** 主题切换会写入的全部 CSS 变量（主色 + 完整调色板含文字令牌） */
export const THEME_CSS_VARS: string[] = [
  '--color-primary',
  ...Object.values(PALETTE_CSS_VARS),
];

/** 首次应用前捕获的 body 原始变量值（服务端注入的站点默认主题） */
let originalBodyVars: Record<string, string> | null = null;
/** 站点配置的主色（从服务端注入值解析），用于亮色模式下未自定义颜色时派生 */
let basePrimaryHex: string | null = null;

function captureOriginalBodyVars(body: HTMLElement): void {
  if (originalBodyVars) return;
  originalBodyVars = {};
  for (const name of THEME_CSS_VARS) {
    originalBodyVars[name] = body.style.getPropertyValue(name);
  }

  let triplet = originalBodyVars['--color-primary'] ?? '';
  if (!triplet) {
    try {
      triplet = getComputedStyle(body).getPropertyValue('--color-primary').trim();
    } catch {
      triplet = '';
    }
  }
  basePrimaryHex = tripletToHex(triplet) ?? DEFAULT_PRIMARY;
}

function restoreBodyVars(body: HTMLElement): void {
  for (const name of THEME_CSS_VARS) {
    const original = originalBodyVars?.[name] ?? '';
    if (original) {
      body.style.setProperty(name, original);
    } else {
      body.style.removeProperty(name);
    }
  }
}

function setVars(el: HTMLElement, vars: Record<string, string>): void {
  for (const [name, value] of Object.entries(vars)) {
    el.style.setProperty(name, value);
  }
}

/**
 * 把主题写入 CSS 变量：主色 + 整站调色板（页面底、分区底、卡片、边框、
 * 浅色面板、强调色、标题/正文文字），并按明暗模式派生，全站即时换肤。
 *
 * - 暗色模式 + 默认色/空值：恢复服务端注入的站点配置主题（保持现状）
 * - 亮色模式：由主色派生浅色背景 + 深色文字，即使未自定义颜色
 */
export function applyTheme(hex: string | null | undefined, mode: ThemeMode = 'dark'): void {
  if (typeof document === 'undefined') return;

  const body = document.body;
  if (body) captureOriginalBodyVars(body);

  const root = document.documentElement;
  const storedHex = hex && isValidHex(hex) ? hex : null;
  const dark = mode !== 'light';

  if (dark && (!storedHex || isDefaultPrimary(storedHex))) {
    root.style.removeProperty('--color-primary');
    for (const name of Object.values(PALETTE_CSS_VARS)) {
      root.style.removeProperty(name);
    }
    if (body) restoreBodyVars(body);
    return;
  }

  try {
    const primary = storedHex ?? basePrimaryHex ?? DEFAULT_PRIMARY;
    const vars: Record<string, string> = {
      '--color-primary': hexToRgbTriplet(primary),
      ...paletteToCssVars(primary, mode),
    };
    setVars(root, vars);
    if (body) setVars(body, vars);
  } catch {
    // 非法颜色静默忽略
  }
}

/** 仅供测试：重置对 body 原始值的捕获状态 */
export function resetOriginalCapture(): void {
  originalBodyVars = null;
  basePrimaryHex = null;
}

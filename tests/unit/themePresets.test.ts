import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  DEFAULT_PRIMARY,
  THEME_MODE_STORAGE_KEY,
  THEME_PRIMARY_STORAGE_KEY,
  THEME_PRESETS,
  THEME_CSS_VARS,
  applyTheme,
  isDefaultPrimary,
  isValidHex,
  loadStoredMode,
  loadStoredPrimary,
  normalizeHex,
  resetOriginalCapture,
  saveStoredMode,
  saveStoredPrimary,
} from '../../lib/themePresets';

describe('themePresets 默认主题色', () => {
  it('默认主题色为 #2563eb', () => {
    expect(DEFAULT_PRIMARY).toBe('#2563eb');
  });

  it('预设列表首项是默认主题色', () => {
    expect(THEME_PRESETS[0]?.isDefault).toBe(true);
    expect(THEME_PRESETS[0]?.hex).toBe(DEFAULT_PRIMARY);
  });

  it('预设色均为合法 6 位 hex', () => {
    for (const preset of THEME_PRESETS) {
      expect(isValidHex(preset.hex)).toBe(true);
      expect(normalizeHex(preset.hex)).toBe(preset.hex.toLowerCase());
    }
  });
});

describe('themePresets 颜色校验', () => {
  it('接受 3 位与 6 位 hex', () => {
    expect(isValidHex('#2563eb')).toBe(true);
    expect(isValidHex('#fff')).toBe(true);
  });

  it('拒绝非法值', () => {
    expect(isValidHex('2563eb')).toBe(false);
    expect(isValidHex('#12345')).toBe(false);
    expect(isValidHex('red')).toBe(false);
  });

  it('normalizeHex 展开 3 位并转小写', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc');
    expect(normalizeHex('#2563EB')).toBe('#2563eb');
  });

  it('isDefaultPrimary 识别默认色（忽略大小写与 3 位写法）', () => {
    expect(isDefaultPrimary('#2563eb')).toBe(true);
    expect(isDefaultPrimary('#2563EB')).toBe(true);
    expect(isDefaultPrimary('#dc2626')).toBe(false);
    expect(isDefaultPrimary('nope')).toBe(false);
  });
});

describe('themePresets localStorage 持久化', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('保存后可读取，并归一化为 6 位小写', () => {
    saveStoredPrimary('#DC2626');
    expect(loadStoredPrimary()).toBe('#dc2626');
  });

  it('保存默认色等价于清除，保证默认主题来自站点配置', () => {
    saveStoredPrimary('#dc2626');
    saveStoredPrimary(DEFAULT_PRIMARY);
    expect(window.localStorage.getItem(THEME_PRIMARY_STORAGE_KEY)).toBeNull();
    expect(loadStoredPrimary()).toBeNull();
  });

  it('未保存时返回 null', () => {
    expect(loadStoredPrimary()).toBeNull();
  });

  it('忽略非法存储值', () => {
    window.localStorage.setItem(THEME_PRIMARY_STORAGE_KEY, 'not-a-color');
    expect(loadStoredPrimary()).toBeNull();
  });

  it('明暗模式默认为 dark，light 持久化后可读回', () => {
    expect(loadStoredMode()).toBe('dark');
    saveStoredMode('light');
    expect(window.localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBe('light');
    expect(loadStoredMode()).toBe('light');
    saveStoredMode('dark');
    expect(window.localStorage.getItem(THEME_MODE_STORAGE_KEY)).toBeNull();
    expect(loadStoredMode()).toBe('dark');
  });
});

describe('themePresets applyTheme', () => {
  function clearThemeVars() {
    for (const name of THEME_CSS_VARS) {
      document.body.style.removeProperty(name);
      document.documentElement.style.removeProperty(name);
    }
  }

  beforeEach(() => {
    resetOriginalCapture();
    clearThemeVars();
    window.localStorage.clear();
  });

  afterEach(() => {
    resetOriginalCapture();
    clearThemeVars();
    window.localStorage.clear();
  });

  it('自定义色写入 html 与 body 的 --color-primary（RGB 三元组）', () => {
    applyTheme('#dc2626', 'dark');
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('220 38 38');
    expect(document.body.style.getPropertyValue('--color-primary')).toBe('220 38 38');
  });

  it('同时替换整站调色板（页面底、面板、强调色等）', () => {
    applyTheme('#dc2626', 'dark');
    // 页底不再是基线 slate-950（2 6 23），面板不再是纯白
    expect(document.body.style.getPropertyValue('--color-page')).not.toBe('2 6 23');
    expect(document.body.style.getPropertyValue('--color-page')).not.toBe('');
    expect(document.body.style.getPropertyValue('--color-panel')).not.toBe('255 255 255');
    expect(document.body.style.getPropertyValue('--color-accent')).not.toBe('96 165 250');
    expect(document.documentElement.style.getPropertyValue('--color-band')).not.toBe('');
  });

  it('默认色 + 暗色模式不产生覆盖', () => {
    applyTheme(DEFAULT_PRIMARY, 'dark');
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('');
    expect(document.body.style.getPropertyValue('--color-primary')).toBe('');
  });

  it('null 与非法值在暗色模式下均不产生覆盖', () => {
    applyTheme(null, 'dark');
    applyTheme('bad-color', 'dark');
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('');
    expect(document.body.style.getPropertyValue('--color-primary')).toBe('');
  });

  it('亮色模式下生成浅色页底与深色文字，即使未自定义颜色', () => {
    document.body.style.setProperty('--color-primary', '37 99 235');
    resetOriginalCapture();

    applyTheme(null, 'light');

    const page = document.body.style.getPropertyValue('--color-page');
    const title = document.body.style.getPropertyValue('--color-title');
    expect(page).not.toBe('');
    expect(page).not.toBe('2 6 23'); // 不再是暗色 slate-950
    // 页底应为浅色（R、G、B 均偏高）
    const [r, g, b] = page.split(' ').map(Number);
    expect(Math.min(r!, g!, b!)).toBeGreaterThan(200);
    // 标题应为深色
    const titleNums = title.split(' ').map(Number);
    expect(Math.max(...titleNums)).toBeLessThan(64);
    // 主色保持 #2563eb
    expect(document.body.style.getPropertyValue('--color-primary')).toBe('37 99 235');
  });

  it('恢复时还原服务端注入的 body 原始主题色', () => {
    document.body.style.setProperty('--color-primary', '37 99 235');
    document.body.style.setProperty('--color-page', '2 6 23');
    resetOriginalCapture();

    applyTheme('#16a34a', 'dark');
    expect(document.body.style.getPropertyValue('--color-primary')).toBe('22 163 74');
    expect(document.body.style.getPropertyValue('--color-page')).not.toBe('2 6 23');

    applyTheme(DEFAULT_PRIMARY, 'dark');
    expect(document.body.style.getPropertyValue('--color-primary')).toBe('37 99 235');
    expect(document.body.style.getPropertyValue('--color-page')).toBe('2 6 23');
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--color-page')).toBe('');
  });
});

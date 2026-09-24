'use client';

import { useEffect } from 'react';
import { applyTheme, loadStoredMode, loadStoredPrimary } from '@/lib/themePresets';

/**
 * 挂载于页面布局中：水合后把 localStorage 保存的主题色与明暗模式应用到当前页。
 * 未做任何自定义且为暗色模式时不做覆盖，保持站点默认主题。
 */
export function ThemeColorApplicator() {
  useEffect(() => {
    applyTheme(loadStoredPrimary(), loadStoredMode());
  }, []);

  return null;
}

#!/usr/bin/env node
/**
 * 把 config/locales/{default}.json 同步为 config/site-data.json。
 * 目的：README.md / DESING.md 中引用的旧路径 config/site-data.json 保持可用，
 * 避免出现两份手工维护的副本导致数据漂移（由 I18N-005 守护）。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_LOCALE = 'zh-CN';

const src = join(root, 'config', 'locales', `${DEFAULT_LOCALE}.json`);
const dest = join(root, 'config', 'site-data.json');

const content = readFileSync(src, 'utf8');
writeFileSync(dest, content, 'utf8');

console.log(`✓ 已同步 config/locales/${DEFAULT_LOCALE}.json → config/site-data.json`);

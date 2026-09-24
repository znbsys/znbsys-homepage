#!/usr/bin/env node
/**
 * 翻译完整性校验（CI 门禁 5）。
 *
 * 检查三件事：
 *   1. 全部 config/locales/*.json 的 key 路径集合与默认 locale 完全一致
 *   2. 全部 messages/*.json 的 key 集合完全一致
 *   3. 所有文案值非空，且不含 TODO / FIXME / undefined
 *
 * 任一不满足 -> exit 1 并打印差异路径。
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_LOCALE = 'zh-CN';
const BANNED = ['TODO', 'FIXME', 'undefined'];

const errors = [];

function readJson(rel) {
  try {
    return JSON.parse(readFileSync(join(root, rel), 'utf8'));
  } catch (e) {
    errors.push(`无法解析 ${rel}: ${e.message}`);
    return null;
  }
}

/** 收集对象全部叶子节点的 key 路径，数组按索引展开（保证顺序可比） */
function keyPaths(value, prefix = '', out = []) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => keyPaths(item, `${prefix}[${i}]`, out));
    return out;
  }
  if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) {
      keyPaths(value[k], prefix ? `${prefix}.${k}` : k, out);
    }
    return out;
  }
  out.push(prefix);
  return out;
}

function diff(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  return {
    missing: b.filter((x) => !setA.has(x)),
    extra: a.filter((x) => !setB.has(x)),
  };
}

function scanValues(value, rel, prefix = '') {
  if (Array.isArray(value)) {
    value.forEach((item, i) => scanValues(item, rel, `${prefix}[${i}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) {
      scanValues(value[k], rel, prefix ? `${prefix}.${k}` : k);
    }
    return;
  }
  if (typeof value === 'string') {
    if (value.trim() === '') {
      errors.push(`${rel} → ${prefix} 的值为空字符串`);
    }
    for (const bad of BANNED) {
      if (value.includes(bad)) {
        errors.push(`${rel} → ${prefix} 含禁用字符串 "${bad}"`);
      }
    }
  }
}

// ---------- 1. 内容配置结构对齐 ----------
const localeDir = join(root, 'config', 'locales');
const localeFiles = readdirSync(localeDir).filter((f) => f.endsWith('.json'));

if (!localeFiles.includes(`${DEFAULT_LOCALE}.json`)) {
  errors.push(`缺少默认语言文件 config/locales/${DEFAULT_LOCALE}.json`);
}

const base = readJson(`config/locales/${DEFAULT_LOCALE}.json`);
if (base) {
  const basePaths = keyPaths(base);
  for (const file of localeFiles) {
    if (file === `${DEFAULT_LOCALE}.json`) continue;
    const target = readJson(`config/locales/${file}`);
    if (!target) continue;
    const { missing, extra } = diff(keyPaths(target), basePaths);
    if (missing.length) {
      errors.push(`config/locales/${file} 缺少字段:\n    - ${missing.join('\n    - ')}`);
    }
    if (extra.length) {
      errors.push(`config/locales/${file} 多出字段:\n    + ${extra.join('\n    + ')}`);
    }
    scanValues(target, `config/locales/${file}`);
  }
  scanValues(base, `config/locales/${DEFAULT_LOCALE}.json`);

  // ---------- 1b. site-data.json 与默认 locale 一致 ----------
  const synced = readJson('config/site-data.json');
  if (synced) {
    const { missing, extra } = diff(keyPaths(synced), keyPaths(base));
    if (missing.length || extra.length) {
      errors.push(
        `config/site-data.json 与 config/locales/${DEFAULT_LOCALE}.json 结构不一致，请运行 npm run sync:default-locale`,
      );
    }
  }
}

// ---------- 2. UI 字典 key 集合对齐 ----------
const msgDir = join(root, 'messages');
const msgFiles = readdirSync(msgDir).filter((f) => f.endsWith('.json'));
const baseMsg = readJson(`messages/${DEFAULT_LOCALE}.json`);

if (baseMsg) {
  const baseKeys = Object.keys(baseMsg).sort();
  for (const file of msgFiles) {
    const dict = readJson(`messages/${file}`);
    if (!dict) continue;
    const keys = Object.keys(dict).sort();
    const missing = baseKeys.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !baseKeys.includes(k));
    if (missing.length) errors.push(`messages/${file} 缺少 key: ${missing.join(', ')}`);
    if (extra.length) errors.push(`messages/${file} 多出 key: ${extra.join(', ')}`);
    scanValues(dict, `messages/${file}`);
  }
}

// ---------- 2b. 法务内容结构对齐（config/legal/*.json） ----------
const legalDir = join(root, 'config', 'legal');
if (existsSync(legalDir)) {
  const legalFiles = readdirSync(legalDir).filter((f) => f.endsWith('.json'));
  const baseLegal = readJson(`config/legal/${DEFAULT_LOCALE}.json`);
  if (baseLegal) {
    const basePaths = keyPaths(baseLegal);
    for (const file of legalFiles) {
      if (file === `${DEFAULT_LOCALE}.json`) continue;
      const target = readJson(`config/legal/${file}`);
      if (!target) continue;
      const { missing, extra } = diff(keyPaths(target), basePaths);
      if (missing.length) {
        errors.push(`config/legal/${file} 缺少字段:\n    - ${missing.join('\n    - ')}`);
      }
      if (extra.length) {
        errors.push(`config/legal/${file} 多出字段:\n    + ${extra.join('\n    + ')}`);
      }
      scanValues(target, `config/legal/${file}`);
    }
    scanValues(baseLegal, `config/legal/${DEFAULT_LOCALE}.json`);
  }
}

// ---------- 3. 内容配置中的 locale 字段与文件名一致 ----------
for (const file of localeFiles) {
  const cfg = readJson(`config/locales/${file}`);
  const expected = file.replace(/\.json$/, '');
  if (cfg?.meta?.locale && cfg.meta.locale !== expected) {
    errors.push(
      `config/locales/${file} 的 meta.locale 为 "${cfg.meta.locale}"，应为 "${expected}"`,
    );
  }
}

if (errors.length) {
  console.error('✗ 翻译完整性校验失败：\n');
  for (const e of errors) console.error(`  • ${e}`);
  console.error(`\n共 ${errors.length} 项问题。`);
  process.exit(1);
}

console.log(
  `✓ 翻译完整性校验通过（${localeFiles.length} 个内容语言 × ${msgFiles.length} 个 UI 字典）`,
);

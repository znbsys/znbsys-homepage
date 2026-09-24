import { test, expect, type Page } from '@playwright/test';

const CASES = [
  { label: '核心功能', id: 'features' },
  { label: '关于我们', id: 'about' },
  { label: '客户评价', id: 'testimonials' },
  { label: '联系我们', id: 'contact' },
] as const;

async function clickNav(page: Page, label: string) {
  const hamburger = page.getByRole('button', { name: /菜单|打开|关闭|menu|open|close/i });
  if (await hamburger.isVisible().catch(() => false)) {
    await hamburger.click();
  }
  await page.locator('a:visible').filter({ hasText: label }).first().click();
}

async function expectSectionInView(page: Page, id: string) {
  await expect
    .poll(
      () =>
        page.locator(`#${id}`).evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.bottom > 0;
        }),
      { timeout: 5000 },
    )
    .toBe(true);
}

for (const { label, id } of CASES) {
  test(`子页面菜单「${label}」跳转到首页 #${id}`, async ({ page }) => {
    await page.goto('/zh-CN/changelog');
    await clickNav(page, label);
    await page.waitForURL(`**/zh-CN**#${id}`);
    expect(page.url()).toContain(`#${id}`);
    await expect(page.locator(`#${id}`)).toBeAttached();
    await expectSectionInView(page, id);
  });

  test(`首页菜单「${label}」滚动到 #${id}`, async ({ page }) => {
    await page.goto('/zh-CN');
    await clickNav(page, label);
    await page.waitForURL(`**#${id}`);
    await expectSectionInView(page, id);
  });
}

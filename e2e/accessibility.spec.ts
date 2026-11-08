import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mockApi } from "./mockApi";

const pages = [
  { path: "/", ready: "Last 24h & next 24h" },
  { path: "/planner", ready: "Best time for" },
  { path: "/tea", ready: "Your cup right now" },
];

for (const theme of ["dark", "light"] as const) {
  for (const { path, ready } of pages) {
    test(`${path} has no axe violations in ${theme} mode`, async ({ page }) => {
      await mockApi(page);
      await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
      await page.goto(path);
      await expect(page.getByText(new RegExp(ready)).first()).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "best-practice"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

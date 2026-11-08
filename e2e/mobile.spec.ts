import { expect, test } from "@playwright/test";
import { mockApi } from "./mockApi";

test("fits a phone screen without sideways scrolling", async ({ page }) => {
  await mockApi(page);
  for (const path of ["/", "/planner", "/tea"]) {
    await page.goto(path);
    await expect(page.getByRole("navigation")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
  }
});

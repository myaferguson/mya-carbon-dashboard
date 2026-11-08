import { expect, test } from "@playwright/test";
import { mockApi } from "./mockApi";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("summarises the grid and when it will be cleaner", async ({ page }) => {
  await page.goto("/");

  const summary = page.getByRole("region", { name: "Summary" });
  await expect(summary).toContainText("high right now");
  // 248 now vs 80 at 02:00: 68% cleaner.
  await expect(summary).toContainText("It'll be 68% cleaner at 02:00 tomorrow");

  const nowTile = page.getByRole("region", { name: /^Now/ });
  await expect(nowTile).toContainText("248");
  await expect(page.getByRole("region", { name: "Cleanest in the next 24h" })).toContainText(
    "02:00",
  );

  await expect(page.getByText("Last 24h & next 24h")).toBeVisible();
  await expect(
    page.getByRole("img", { name: /Lowest 78 gCO₂\/kWh/ }),
  ).toBeVisible();
});

test("shows a region after entering a postcode, and keeps it in the URL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Set your postcode" }).click();
  // The popover focuses its postcode field, so type straight into it.
  await expect(page.locator("input:focus")).toHaveAttribute("autocomplete", "postal-code");
  await page.keyboard.type("sw1a 1aa");
  await page.keyboard.press("Enter");

  await expect(page.getByTestId("location-name")).toHaveText("London · SW1A");
  await expect(page).toHaveURL(/\?postcode=SW1A$/);
  await expect(page.getByText("Next 48h")).toBeVisible();
  await expect(
    page.getByText("London is at 300 gCO₂/kWh, 20% dirtier than the GB average (250)."),
  ).toBeVisible();
  await expect(page.locator("li[aria-current=true]")).toContainText("London");

  await page.reload();
  await expect(page.getByTestId("location-name")).toHaveText("London · SW1A");
});

test("explains an unknown postcode once", async ({ page }) => {
  await page.goto("/?postcode=ZZ9");
  await expect(page.getByText("We couldn't find data for ZZ9.")).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(1);
});

test("remembers the theme after a reload", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const switchControl = page.getByRole("switch");

  const startedLight = (await html.getAttribute("class"))?.includes("theme-light");
  await switchControl.click();
  await expect(html).toHaveClass(startedLight ? /^(?!.*theme-light)/ : /theme-light/);

  await page.reload();
  await expect(html).toHaveClass(startedLight ? /^(?!.*theme-light)/ : /theme-light/);
});

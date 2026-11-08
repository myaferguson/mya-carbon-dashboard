import { expect, test } from "@playwright/test";
import { mockApi } from "./mockApi";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("plans an EV charge and keeps the plan in the URL", async ({ page }) => {
  await page.goto("/planner");
  await page.getByRole("radio", { name: /EV charge/ }).click();

  // Default 4h charge = the whole 02:00-06:00 low stretch.
  await expect(page.getByTestId("planner-start")).toHaveText("Start at 02:00");
  await expect(page.getByText("02:00 tomorrow, done by 06:00 tomorrow")).toBeVisible();
  // 28 kWh × 80 g vs 28 kWh × 250 g.
  await expect(page.getByText("≈2.2 kg CO₂")).toBeVisible();
  await expect(page.getByTestId("planner-saving")).toHaveText(
    "Waiting cuts the emissions by 68%.",
  );

  await page.getByLabel("Needs to finish by").selectOption("07:00");
  await expect(page).toHaveURL(/appliance=ev/);
  await expect(page).toHaveURL(/by=07%3A00/);

  await page.reload();
  await expect(page.getByLabel("Needs to finish by")).toHaveValue("07:00");
  await expect(page.getByTestId("planner-start")).toHaveText("Start at 02:00");
});

test("uses the regional forecast when a postcode is set", async ({ page }) => {
  await page.goto("/planner?postcode=SW1A");
  // London's clean stretch is 03:00-05:00, exactly one washing machine run.
  await expect(page.getByTestId("planner-start")).toHaveText("Start at 03:00");
  await expect(page.getByText(/averaging 120 gCO₂\/kWh in London/)).toBeVisible();
});

test("says when nothing fits before the finish time", async ({ page }) => {
  await page.goto("/planner?appliance=ev&hours=8&by=07:00");
  await expect(page.getByTestId("planner-start")).toBeVisible();

  await page.clock.setFixedTime(new Date("2026-05-16T22:40:00Z"));
  await page.reload();
  await expect(page.getByTestId("planner-no-window")).toContainText(
    "There isn't a 8-hour slot that finishes by 07:00 tomorrow",
  );
});

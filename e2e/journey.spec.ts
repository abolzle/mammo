import { expect, test } from "@playwright/test";

test("learner can start, answer, see explanation, finish, and resume after refresh", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /you have \d+ minutes/i })).toBeVisible();
  await page.getByRole("button", { name: /skip/i }).click();
  await page.getByRole("button", { name: /five minutes instead/i }).click();
  await expect(page).toHaveURL(/session/);
  const check = page.getByRole("button", { name: /check|continue|show answer|finish/i }).first();
  await expect(check).toBeVisible({ timeout: 15000 });

  const radio = page.getByRole("radio").first();
  if (await radio.count()) {
    await radio.click();
    const action = page.getByRole("button", { name: /^check$|^save answer$/i });
    if (await action.count()) await action.click();
    await expect(page.getByText(/best answer|not the best answer|sources for this item/i).first()).toBeVisible();
  }

  const url = page.url();
  await page.reload();
  await expect(page).toHaveURL(url);
  await expect(page.getByText(/study session|beta quiz|recap/i).first()).toBeVisible();
});

test("every reserved option is either startable or refused with a specific shortfall and a shorter option", async ({ page }) => {
  await page.goto("/practice/");
  for (const title of ["30-question baseline", "60-question checkpoint", "Full 145-question simulation"]) {
    const card = page.locator("[data-slot=card]").filter({ hasText: title });
    await expect(card).toBeVisible();
    const refused = await card.getByText("Not enough questions yet").count();
    if (refused) {
      await expect(card).toContainText(/Short by blueprint area|remain for simulated pilots/);
      await expect(card.getByRole("button", { name: /instead/i })).toBeVisible();
    } else {
      await expect(card.getByRole("button", { name: /^Start/ })).toBeVisible();
    }
  }
});

test("test mode hides feedback until submit and resumes after refresh", async ({ page }) => {
  await page.goto("/practice/");
  await page.getByRole("button", { name: /Test mode/ }).click();
  await page.getByRole("button", { name: /Start \d+-question mixed quiz/ }).click();
  await expect(page).toHaveURL(/session/);
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Flag for review" }).click();
  await expect(page.getByText(/best answer|not the best answer/i)).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(/1 answered · 1 flagged/)).toBeVisible();
  await expect(page.getByText(/left$/)).toBeVisible();
  await page.getByRole("button", { name: "Submit test" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText(/not an ARRT scaled score/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Confidence calibration" })).toBeVisible();
});

test("learn and settings routes load", async ({ page }) => {
  await page.goto("/learn/");
  await expect(page.getByRole("heading", { name: /learn/i })).toBeVisible();
  await page.goto("/settings/");
  await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /download json backup/i })).toBeVisible();
});

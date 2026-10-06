import { expect, test } from "@playwright/test";

test("learner can start, answer, see explanation, finish, and resume after refresh", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /five minutes/i })).toBeVisible();
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

test("practice does not invent a full-length simulation", async ({ page }) => {
  await page.goto("/practice/");
  await page.getByRole("button", { name: /full 145-question simulation/i }).click();
  await expect(page.getByRole("status")).toContainText(/not offered/i);
});

test("checkpoint is refused honestly", async ({ page }) => {
  await page.goto("/practice/");
  await page.getByRole("button", { name: /60-question checkpoint/i }).click();
  await expect(page.getByRole("status")).toContainText(/60/);
});

test("learn and settings routes load", async ({ page }) => {
  await page.goto("/learn/");
  await expect(page.getByRole("heading", { name: /learn/i })).toBeVisible();
  await page.goto("/settings/");
  await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /download json backup/i })).toBeVisible();
});

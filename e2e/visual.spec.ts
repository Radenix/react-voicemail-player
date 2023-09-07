import { test, expect } from "@playwright/test";

test("matches screenshot", async ({ page }) => {
  await page.goto("/e2e");

  const play = page.getByRole("button", { name: "Play" });
  await expect(play).toBeEnabled();

  await expect(page).toHaveScreenshot("audio-loaded.png");
});

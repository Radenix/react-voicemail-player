import { test, expect } from "@playwright/test";

test("play and pause", async ({ page }) => {
  await page.goto("/e2e");

  const play = page.getByRole("button", { name: "Play" });
  await expect(play).toBeEnabled();

  await play.click();
  await expect(play).not.toBeVisible();

  const pause = page.getByRole("button", { name: "Pause" });
  await expect(pause).toBeVisible();

  await pause.click();
  await expect(pause).not.toBeVisible();
  await expect(play).toBeVisible();
});

test("seek", async ({ page }) => {
  await page.goto("/e2e");

  const progress = page.getByTestId("rvmp-peaks-bar");
  const progressBbox = await progress.boundingBox();
  expect(progressBbox).not.toBeNull();

  await progress.click({
    button: "left",
    position: { x: progressBbox!.width / 2, y: progressBbox!.height / 2 },
  });

  const timer = page.getByRole("timer");
  const duration = page.getByLabel("Duration");

  await expect(duration).toContainText("0:23");
  await expect(timer).toContainText("0:12");
});

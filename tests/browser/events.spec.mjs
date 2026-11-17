import { test, expect } from "@playwright/test";

const archive = "valorant-skirmish-2v2-31-octobre-2026";

test("real archived events keep their details, rules and closed registration pages", async ({ page }) => {
  await page.goto("/fr/events#past");
  await expect(page.locator("#events-past .event-card")).toHaveCount(5);
  await page.locator(`#events-past a[href='/fr/events/${archive}']`).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tournoi Valorant — Skirmish 2v2");
  await page.goto(`/fr/events/${archive}/register`);
  await expect(page.getByRole("heading", { name: "Règlement", exact: true })).toBeVisible();
  await expect(page.locator("main ol li")).toHaveCount(4);
  await expect(page.locator("main form")).toHaveCount(0);
  await expect(page.locator("main [role='status']")).toHaveText("Les inscriptions ne sont pas ouvertes.");
});

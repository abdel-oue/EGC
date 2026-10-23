import { test, expect } from "@playwright/test";

test("French is the default even with English browser headers", async ({ request }) => {
  const response = await request.get("/", {
    headers: { "Accept-Language": "en-US,en;q=0.9" },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(307);
  expect(new URL(response.headers().location, response.url()).pathname).toBe("/fr");
  const nested = await request.get("/contact?from=home", { maxRedirects: 0 });
  expect(new URL(nested.headers().location, nested.url()).pathname).toBe("/fr/contact");
  expect(new URL(nested.headers().location, nested.url()).search).toBe("?from=home");
});

test("members show all ten portraits without Teams navigation", async ({ page }) => {
  await page.goto("/fr/members");
  await expect(page.getByRole("heading", { level: 1, name: "Membres" })).toBeVisible();
  await expect(page.locator("main article")).toHaveCount(10);
  await expect(page.getByRole("heading", { name: "OUEDGHIRI Abdelaziz" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "SQUALLI Omar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Équipes", exact: true })).toHaveCount(0);
  for (const portrait of await page.locator("main img").all()) {
    await portrait.scrollIntoViewIfNeeded();
    await expect.poll(() => portrait.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `test-results/members-${test.info().project.name}.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("English stays explicit and switches back on the same nested route", async ({ page }) => {
  await page.goto("/en/games/minecraft");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByText("The first moments from this game are coming soon.")).toBeVisible();
  const switcher = page.getByRole("navigation", { name: "Language" }).filter({ visible: true });
  await switcher.getByRole("link", { name: "fr", exact: true }).click();
  await expect(page).toHaveURL(/\/fr\/games\/minecraft$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("game cards open their galleries with events at the bottom", async ({ page }) => {
  await page.goto("/fr");
  const games = page.locator("#games");

  for (const key of ["valorant", "minecraft", "league", "fc"]) {
    await expect(games.locator(`a[href='/fr/games/${key}']`)).toHaveCount(1);
    await page.goto(`/fr/games/${key}`);
    await expect(page.locator("#events").getByRole("heading", { name: "Événements à venir" })).toBeVisible();
    await expect(page.locator("#events").getByRole("link", { name: "Voir les événements à venir" })).toHaveAttribute("href", `/fr/events?game=${key}`);

    if (key !== "valorant") {
      await expect(page.getByText("Les premiers moments de ce jeu arrivent bientôt.")).toBeVisible();
    }

    await page.goto("/fr");
  }
});

test("gallery supports keyboard close and restores focus", async ({ page }) => {
  await page.goto("/fr/games/valorant");
  const tile = page.getByRole("button", { name: /Visuel promotionnel/ });
  await tile.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("1 / 1")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByText("1 / 1")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(tile).toBeFocused();
});

test("legacy links redirect to members and the relevant game", async ({ page }) => {
  await page.goto("/fr/teams");
  await expect(page).toHaveURL(/\/fr\/members$/);
  await page.goto("/en/teams/register/valorant");
  await expect(page).toHaveURL(/\/en\/games\/valorant#events$/);
});

test("contact reports unavailable backend without claiming success", async ({ page }) => {
  await page.goto("/fr/contact");
  await page.getByLabel("Nom complet", { exact: true }).fill("Club Member");
  await page.getByLabel("E-mail", { exact: true }).fill("member@example.com");
  await page.getByLabel("Sujet", { exact: true }).fill("Une question");
  await page.getByLabel("Message", { exact: true }).fill("Bonjour, je souhaite contacter le bureau.");
  await page.getByRole("button", { name: "Envoyer", exact: true }).click();
  await expect(page.locator("main form").getByRole("alert")).toHaveText("Le formulaire est temporairement indisponible.");
  await expect(page.getByText("Ta demande a bien été reçue.")).toHaveCount(0);
  await expect(page.getByLabel("Nom complet", { exact: true })).toHaveValue("Club Member");
});

test("admin routes require authentication and are excluded from indexing", async ({ page, request }) => {
  await page.goto("http://localhost:3101/manage/events");
  await expect(page).toHaveURL(/\/login\?error=unavailable$/);
  await expect(page.getByRole("heading", { name: "Se connecter" })).toBeVisible();
  const response = await request.get("http://localhost:3101/login");
  expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(response.headers()["cache-control"]).toContain("no-store");
  const robots = await request.get("http://localhost:3101/robots.txt");
  expect(await robots.text()).toContain("Disallow: /");
});

test("reduced motion suppresses decorative animations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  const name = await page.locator(".animate-drift").first().evaluate((element) => getComputedStyle(element).animationName);
  expect(name).toBe("none");
  await page.screenshot({ path: `test-results/home-${test.info().project.name}.png` });
});

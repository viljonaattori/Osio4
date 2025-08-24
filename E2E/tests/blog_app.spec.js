const { test, expect, beforeEach, describe } = require("@playwright/test");

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    // Resetoi tietokanta
    await request.post("http://localhost:3003/api/testing/reset");

    // Luo oletuskäyttäjä
    await request.post("http://localhost:3003/api/users", {
      data: {
        name: "ville",
        username: "villematti",
        password: "eikerro",
      },
    });

    // Mene frontendtiin
    await page.goto("http://localhost:5174");
  });

  test("Login form is shown", async ({ page }) => {
    await expect(page.getByText("Login to application")).toBeVisible();
    await expect(page.getByTestId("username")).toBeVisible();
    await expect(page.getByTestId("password")).toBeVisible();
  });

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await page.getByTestId("username").fill("villematti");
      await page.getByTestId("password").fill("eikerro");
      await page.getByRole("button", { name: "login" }).click();

      // varmista että käyttäjä näkyy
      await expect(page.getByText("ville logged in")).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      await page.getByTestId("username").fill("villematti");
      await page.getByTestId("password").fill("väärä");
      await page.getByRole("button", { name: "login" }).click();

      // odotetaan että error viesti tulee näkyviin
      await expect(page.getByText("wrong credentials")).toBeVisible();
      // ja ettei käyttäjä ole kirjautunut sisään
      await expect(page.getByText("blogs")).not.toBeVisible();
    });
  });

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      // Kirjaudu sisään
      await page.getByTestId("username").fill("villematti");
      await page.getByTestId("password").fill("eikerro");
      await page.getByRole("button", { name: "login" }).click();

      // varmista että ollaan sisäänkirjautuneena
      await expect(page.getByText("ville logged in")).toBeVisible();
    });

    test("a new blog can be created", async ({ page }) => {
      // Avaa blogin luontilomake
      await page.getByRole("button", { name: "new blog" }).click();

      // Täytä kentät
      await page.getByTestId("title").fill("Playwright blog");
      await page.getByTestId("author").fill("Tester");
      await page.getByTestId("url").fill("http://example.com");

      // Lähetä lomake
      await page.getByRole("button", { name: "create" }).click();

      // Otetaan listan ensimmäinen
      await expect(
        page.getByText("Playwright blog Tester").first()
      ).toBeVisible();
    });
  });

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      // login
      await page.getByTestId("username").fill("villematti");
      await page.getByTestId("password").fill("eikerro");
      await page.getByRole("button", { name: "login" }).click();

      // lisää blogi
      await page.getByRole("button", { name: "new blog" }).click();
      await page.getByTestId("title").fill("Likeable blog");
      await page.getByTestId("author").fill("Like Tester");
      await page.getByTestId("url").fill("http://likeblog.test");
      await page.getByRole("button", { name: "create" }).click();
    });
  });
});

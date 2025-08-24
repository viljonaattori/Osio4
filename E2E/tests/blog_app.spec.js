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

      await expect(page.getByText("ville logged in")).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      await page.getByTestId("username").fill("villematti");
      await page.getByTestId("password").fill("väärä");
      await page.getByRole("button", { name: "login" }).click();

      await expect(page.getByText("wrong credentials")).toBeVisible();
      await expect(page.getByText("blogs")).not.toBeVisible();
    });
  });

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      await page.getByTestId("username").fill("villematti");
      await page.getByTestId("password").fill("eikerro");
      await page.getByRole("button", { name: "login" }).click();
      await expect(page.getByText("ville logged in")).toBeVisible();
    });

    test("5.20: a new blog can be created and is visible in list", async ({
      page,
    }) => {
      await page.getByRole("button", { name: "new blog" }).click();

      await page.getByTestId("title").fill("Playwright blog");
      await page.getByTestId("author").fill("Tester");
      await page.getByTestId("url").fill("http://example.com");

      await page.getByRole("button", { name: "create" }).click();

      const blogRow = page.locator(".blog", { hasText: "Playwright blog" });
      await expect(blogRow).toContainText("Playwright blog");
      await expect(blogRow).toContainText("Tester");
    });

    test("5.21: a blog can be liked", async ({ page }) => {
      await page.getByRole("button", { name: "new blog" }).click();
      await page.getByTestId("title").fill("Likeable blog");
      await page.getByTestId("author").fill("Like Tester");
      await page.getByTestId("url").fill("http://likeblog.test");
      await page.getByRole("button", { name: "create" }).click();

      const blogRow = page.locator(".blog", { hasText: "Likeable blog" });
      await blogRow.getByRole("button", { name: "view" }).click();

      const likes = blogRow.getByTestId("likes-count");
      await expect(likes).toHaveText("likes 0 like");

      await blogRow.getByTestId("like-button").click();
      await expect(likes).toHaveText("likes 1 like");
    });

    test("5.21/5.22: blog creator can delete, others cannot", async ({
      page,
      request,
      browser,
    }) => {
      // luodaan blogi
      await page.getByRole("button", { name: "new blog" }).click();
      await page.getByTestId("title").fill("Deletable blog");
      await page.getByTestId("author").fill("Delete Tester");
      await page.getByTestId("url").fill("http://deleteblog.test");
      await page.getByRole("button", { name: "create" }).click();

      const blogRow = page.locator(".blog", { hasText: "Deletable blog" });
      await blogRow.getByRole("button", { name: "view" }).click();

      // varmista että poistonappi näkyy luojalle
      await expect(
        blogRow.getByRole("button", { name: "remove" })
      ).toBeVisible();

      // hyväksytään confirm-dialogi
      page.on("dialog", async (dialog) => {
        await dialog.accept();
      });

      await blogRow.getByRole("button", { name: "remove" }).click();
      await expect(blogRow).not.toBeVisible();

      // luodaan toinen käyttäjä
      await request.post("http://localhost:3003/api/users", {
        data: {
          name: "other",
          username: "otheruser",
          password: "password",
        },
      });

      // uusi selainkonteksti toiselle käyttäjälle
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      await page2.goto("http://localhost:5174");

      await page2.getByTestId("username").fill("otheruser");
      await page2.getByTestId("password").fill("password");
      await page2.getByRole("button", { name: "login" }).click();
      await expect(page2.getByText("other logged in")).toBeVisible();

      // uusi käyttäjä luo blogin
      await page2.getByRole("button", { name: "new blog" }).click();
      await page2.getByTestId("title").fill("Other's blog");
      await page2.getByTestId("author").fill("Other Author");
      await page2.getByTestId("url").fill("http://otherblog.test");
      await page2.getByRole("button", { name: "create" }).click();

      const otherBlogRow = page2.locator(".blog", { hasText: "Other's blog" });
      await otherBlogRow.getByRole("button", { name: "view" }).click();

      // varmista ettei poistonappia näy
      await expect(
        otherBlogRow.getByRole("button", { name: "remove" })
      ).toHaveCount(0);

      await context2.close();
    });

    test("5.23: blogs are sorted by likes, most liked first", async ({
      page,
    }) => {
      // blogi A
      await page.getByRole("button", { name: "new blog" }).click();
      await page.getByTestId("title").fill("Blog A");
      await page.getByTestId("author").fill("Author A");
      await page.getByTestId("url").fill("http://a.test");
      await page.getByRole("button", { name: "create" }).click();

      // blogi B
      await page.getByRole("button", { name: "new blog" }).click();
      await page.getByTestId("title").fill("Blog B");
      await page.getByTestId("author").fill("Author B");
      await page.getByTestId("url").fill("http://b.test");
      await page.getByRole("button", { name: "create" }).click();

      const blogA = page.locator(".blog", { hasText: "Blog A" });
      const blogB = page.locator(".blog", { hasText: "Blog B" });

      await blogA.getByRole("button", { name: "view" }).click();
      await blogB.getByRole("button", { name: "view" }).click();

      await blogB.getByTestId("like-button").click();
      await blogB.getByTestId("like-button").click();

      await blogA.getByTestId("like-button").click();

      const blogs = page.locator(".blog");
      await expect(blogs.nth(0)).toContainText("Blog B");
      await expect(blogs.nth(1)).toContainText("Blog A");
    });
  });
});

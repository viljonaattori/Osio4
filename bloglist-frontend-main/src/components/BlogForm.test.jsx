import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import BlogForm from "./BlogForm";

describe("<BlogForm />", () => {
  test("calls onCreate with correct data when form is submitted", async () => {
    const createBlog = vi.fn();
    const user = userEvent.setup();

    render(<BlogForm onCreate={createBlog} />);

    // otetaan kaikki tekstikentät
    const inputs = screen.getAllByRole("textbox");
    const [titleInput, authorInput, urlInput] = inputs;

    const createButton = screen.getByText("create");

    // Syötetään kenttiin arvot
    await user.type(titleInput, "Test Blog");
    await user.type(authorInput, "Test Author");
    await user.type(urlInput, "http://example.com");

    // Klikataan create
    await user.click(createButton);

    // Varmistetaan että callbackia kutsuttiin oikein
    expect(createBlog).toHaveBeenCalledTimes(1);
    expect(createBlog).toHaveBeenCalledWith({
      title: "Test Blog",
      author: "Test Author",
      url: "http://example.com",
    });
  });
});

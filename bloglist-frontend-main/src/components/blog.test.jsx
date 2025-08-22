import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import Blog from "./Blog";

describe("<Blog />", () => {
  const blog = {
    id: "12345",
    title: "Component testing with RTL",
    author: "Matti Meikäläinen",
    url: "http://example.com",
    likes: 7,
    user: { username: "mluukkai", name: "Matti Luukkainen" },
  };

  test("renders title and author but not url or likes by default", () => {
    render(
      <Blog
        blog={blog}
        onLike={() => {}}
        onRemove={() => {}}
        currentUser={{ username: "mluukkai" }}
      />
    );

    expect(
      screen.getByText(/Component testing with RTL.*Matti Meikäläinen/)
    ).toBeDefined();

    // url ja likes eivät näy oletuksena
    const url = screen.queryByText("http://example.com");
    const likes = screen.queryByText(/likes/i);

    expect(url).toBeNull();
    expect(likes).toBeNull();
  });

  test("calls onLike twice if like button is clicked twice", async () => {
    const mockLikeHandler = vi.fn();
    const user = userEvent.setup();

    render(
      <Blog
        blog={blog}
        onLike={mockLikeHandler}
        onRemove={() => {}}
        currentUser={{ username: "Vauv" }}
      />
    );

    // ensin view, jotta like-nappi tulee näkyviin
    const viewButton = screen.getByText("view");
    await user.click(viewButton);

    const likeButton = screen.getByText("like");
    await user.click(likeButton);
    await user.click(likeButton);

    expect(mockLikeHandler).toHaveBeenCalledTimes(2);
  });
});
